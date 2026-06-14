import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const blockedBotPatterns = [
  /ahrefs/i,
  /amazonbot/i,
  /bytespider/i,
  /ccbot/i,
  /claudebot/i,
  /dataforseo/i,
  /dotbot/i,
  /gptbot/i,
  /mj12bot/i,
  /petalbot/i,
  /semrush/i,
  /serpstat/i,
  /scrapy/i,
  /wget/i
];

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const PUBLIC_RATE_LIMIT = 180;
const ADMIN_RATE_LIMIT = 60;
const API_WRITE_RATE_LIMIT = 40;
const ADMIN_COOKIE_NAME = "mfhp_admin_session";
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isProtectedPath(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return false;
  if (pathname === "/api/admin/login") return false;
  if (pathname.startsWith("/admin")) return true;
  if (pathname === "/api/admin/logout") return true;
  if (pathname === "/api/messages" && request.method !== "POST") return true;
  if (pathname === "/api/plans" && request.method !== "GET") return true;
  if (pathname.startsWith("/api/upload")) return true;
  return false;
}

function unauthorizedResponse(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Unauthorized. Sign in to the admin panel and try again." },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow"
        }
      }
    );
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

function forbiddenResponse(message = "Forbidden.") {
  return new NextResponse(message, {
    status: 403,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
}

function tooManyRequestsResponse() {
  return new NextResponse("Too many requests. Please slow down.", {
    status: 429,
    headers: {
      "Cache-Control": "no-store",
      "Retry-After": String(RATE_LIMIT_WINDOW_MS / 1000),
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
}

function getAdminSecret() {
  const password = process.env.ADMIN_PASSWORD;
  return process.env.ADMIN_SESSION_SECRET || password;
}

async function signAdminSession(expiresAt: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`admin:${expiresAt}`));
  let binary = "";
  const bytes = new Uint8Array(signature);
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function isValidSessionCookie(request: NextRequest) {
  const secret = getAdminSecret();
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!secret || !cookie) return false;

  const [expiresAt, signature] = cookie.split(".");
  if (!expiresAt || !signature || Number(expiresAt) < Date.now()) return false;

  const expectedSignature = await signAdminSession(expiresAt, secret);
  return signature === expectedSignature;
}

async function isAuthorized(request: NextRequest) {
  if (await isValidSessionCookie(request)) return true;

  const password = process.env.ADMIN_PASSWORD;
  const username = process.env.ADMIN_USERNAME || "admin";
  if (!password) return false;

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return false;

  try {
    const decoded = atob(authorization.slice("Basic ".length));
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex === -1) return false;
    const providedUsername = decoded.slice(0, separatorIndex);
    const providedPassword = decoded.slice(separatorIndex + 1);
    return providedUsername === username && providedPassword === password;
  } catch {
    return false;
  }
}

function getClientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

function passesRateLimit(key: string, limit: number) {
  const now = Date.now();
  const current = rateLimitBuckets.get(key);

  if (!current || current.resetAt < now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

function isBlockedBot(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  return blockedBotPatterns.some((pattern) => pattern.test(userAgent));
}

function isSameOriginWrite(request: NextRequest) {
  if (!UNSAFE_METHODS.has(request.method)) return true;
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

function shouldSkipSecurityHeaders(pathname: string) {
  return pathname.startsWith("/_next") || pathname.startsWith("/images") || pathname === "/favicon.ico";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!shouldSkipSecurityHeaders(pathname)) {
    if (isBlockedBot(request)) return forbiddenResponse("Crawler blocked.");
    if (!isSameOriginWrite(request)) return forbiddenResponse("Cross-origin write blocked.");

    const area = pathname.startsWith("/admin") || pathname.startsWith("/api/admin")
      ? "admin"
      : pathname.startsWith("/api/") && UNSAFE_METHODS.has(request.method)
        ? "api-write"
        : "public";
    const key = `${getClientKey(request)}:${area}`;
    const limit = area === "admin" ? ADMIN_RATE_LIMIT : area === "api-write" ? API_WRITE_RATE_LIMIT : PUBLIC_RATE_LIMIT;
    if (!passesRateLimit(key, limit)) return tooManyRequestsResponse();
  }

  if (isProtectedPath(request)) {
    if (process.env.NODE_ENV === "production" && !process.env.ADMIN_PASSWORD) {
      return new NextResponse("ADMIN_PASSWORD is required in production.", {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow"
        }
      });
    }

    if (!(await isAuthorized(request))) return unauthorizedResponse(request);
  }

  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("X-DNS-Prefetch-Control", "off");

  if (isProtectedPath(request)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "no-store");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};
