import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminConfigIssue, getAdminConfigMessage } from "@/lib/adminConfig";

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
  /curl/i,
  /dirbuster/i,
  /gobuster/i,
  /go-http-client/i,
  /libwww-perl/i,
  /masscan/i,
  /nikto/i,
  /nmap/i,
  /nuclei/i,
  /python-requests/i,
  /scrapy/i,
  /sqlmap/i,
  /zgrab/i,
  /wget/i
];

const scannerPathPatterns = [
  /(^|\/)\.env([./]|$)/i,
  /(^|\/)\.git([/]|$)/i,
  /(^|\/)\.svn([/]|$)/i,
  /(^|\/)phpmyadmin([/]|$)/i,
  /(^|\/)wp-admin([/]|$)/i,
  /(^|\/)wp-login\.php$/i,
  /(^|\/)xmlrpc\.php$/i,
  /\.(asp|aspx|cgi|env|ini|log|php|sh|sql)$/i
];

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const PUBLIC_RATE_LIMIT = 180;
const ADMIN_RATE_LIMIT = 60;
const API_WRITE_RATE_LIMIT = 40;
const MAX_RATE_LIMIT_BUCKETS = 10_000;
const ADMIN_COOKIE_NAME = "mfhp_admin_session";
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const ALLOWED_METHODS = new Set(["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]);

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
  return NextResponse.rewrite(loginUrl);
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

function notFoundResponse() {
  return new NextResponse("Not found.", {
    status: 404,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
}

function methodNotAllowedResponse() {
  return new NextResponse("Method not allowed.", {
    status: 405,
    headers: {
      "Allow": Array.from(ALLOWED_METHODS).join(", "),
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
}

function payloadTooLargeResponse() {
  return new NextResponse("Request payload is too large.", {
    status: 413,
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
  return constantTimeEqual(signature, expectedSignature);
}

function constantTimeEqual(value: string, expected: string) {
  const length = Math.max(value.length, expected.length);
  let mismatch = value.length ^ expected.length;
  for (let index = 0; index < length; index += 1) {
    mismatch |= (value.charCodeAt(index) || 0) ^ (expected.charCodeAt(index) || 0);
  }
  return mismatch === 0;
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
    return constantTimeEqual(providedUsername, username) && constantTimeEqual(providedPassword, password);
  } catch {
    return false;
  }
}

function getClientKey(request: NextRequest) {
  const candidate = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  return candidate.replace(/[^a-f0-9:.\-]/gi, "").slice(0, 64) || "unknown";
}

function passesRateLimit(key: string, limit: number) {
  const now = Date.now();
  if (rateLimitBuckets.size >= MAX_RATE_LIMIT_BUCKETS) {
    rateLimitBuckets.forEach((bucket, bucketKey) => {
      if (bucket.resetAt < now) rateLimitBuckets.delete(bucketKey);
    });
    if (rateLimitBuckets.size >= MAX_RATE_LIMIT_BUCKETS) rateLimitBuckets.clear();
  }
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
  const referer = request.headers.get("referer");
  const authorization = request.headers.get("authorization");
  const source = origin || referer;
  if (!source) return request.nextUrl.pathname === "/api/admin/login" || Boolean(authorization?.startsWith("Basic "));

  try {
    const sourceHost = new URL(source).host.toLowerCase();
    const trustedHosts = new Set<string>();
    const addHost = (host: string | null | undefined) => {
      const normalized = host?.split(",")[0]?.trim().toLowerCase();
      if (!normalized) return;
      trustedHosts.add(normalized);
      if (normalized.startsWith("www.")) trustedHosts.add(normalized.slice(4));
      else trustedHosts.add(`www.${normalized}`);
    };

    addHost(request.nextUrl.host);
    addHost(request.headers.get("host"));
    addHost(request.headers.get("x-forwarded-host"));

    if (process.env.NEXT_PUBLIC_SITE_URL) {
      addHost(new URL(process.env.NEXT_PUBLIC_SITE_URL).host);
    }

    return trustedHosts.has(sourceHost);
  } catch {
    return false;
  }
}

function isPayloadTooLarge(request: NextRequest) {
  const length = Number(request.headers.get("content-length"));
  if (!Number.isFinite(length) || length <= 0) return false;
  const pathname = request.nextUrl.pathname;
  if (pathname === "/api/admin/login") return length > 16 * 1024;
  if (pathname === "/api/messages") return length > 64 * 1024;
  if (pathname === "/api/plans") return length > 2 * 1024 * 1024;
  if (pathname === "/api/upload/signature") return length > 16 * 1024;
  return false;
}

function hasWeakProductionSecrets() {
  return Boolean(getAdminConfigIssue());
}

function shouldSkipSecurityHeaders(pathname: string) {
  return pathname.startsWith("/_next") || pathname.startsWith("/images") || pathname === "/favicon.ico";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!shouldSkipSecurityHeaders(pathname)) {
    if (!ALLOWED_METHODS.has(request.method)) return methodNotAllowedResponse();
    if (scannerPathPatterns.some((pattern) => pattern.test(pathname))) return notFoundResponse();
    if (pathname !== "/api/health" && isBlockedBot(request)) return forbiddenResponse("Crawler blocked.");
    if (!isSameOriginWrite(request)) return forbiddenResponse("Cross-origin write blocked.");
    if (isPayloadTooLarge(request)) return payloadTooLargeResponse();

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
    if (hasWeakProductionSecrets()) {
      return new NextResponse(`Admin configuration error: ${getAdminConfigMessage(getAdminConfigIssue())}`, {
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
  response.headers.set(
    "Permissions-Policy",
    "accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), usb=()"
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.set("Origin-Agent-Cluster", "?1");

  if (isProtectedPath(request)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "no-store");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
