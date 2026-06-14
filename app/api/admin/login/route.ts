import crypto from "crypto";
import { NextResponse } from "next/server";
import { getClientKey, rateLimit } from "@/lib/security";

export const runtime = "nodejs";

const ADMIN_COOKIE_NAME = "mfhp_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function safeNextPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/admin";
  return value;
}

function signAdminSession(expiresAt: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(`admin:${expiresAt}`).digest("base64url");
}

function constantTimeEqual(value: string, expected: string) {
  const valueHash = crypto.createHash("sha256").update(value).digest();
  const expectedHash = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(valueHash, expectedHash);
}

export async function POST(request: Request) {
  if (!rateLimit(`admin-login:${getClientKey(request)}`, 8, 15 * 60_000)) {
    return new NextResponse("Too many login attempts. Please wait 15 minutes and try again.", {
      status: 429,
      headers: { "Cache-Control": "no-store", "Retry-After": "900" }
    });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new NextResponse("Invalid login request.", { status: 400 });
  }
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const nextPath = safeNextPath(formData.get("next"));

  const expectedUsername = process.env.ADMIN_USERNAME || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword || !constantTimeEqual(username, expectedUsername) || !constantTimeEqual(password, expectedPassword)) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("error", "1");
    url.searchParams.set("next", nextPath);
    return NextResponse.redirect(url, 303);
  }

  const expiresAt = String(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  const secret = process.env.ADMIN_SESSION_SECRET || expectedPassword;
  const token = `${expiresAt}.${signAdminSession(expiresAt, secret)}`;
  const response = NextResponse.redirect(new URL(nextPath, request.url), 303);

  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/"
  });

  return response;
}
