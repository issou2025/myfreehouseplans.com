import { NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "mfhp_admin_session";

function redirectUrl(request: Request, path: string) {
  const requestUrl = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host") || requestUrl.host;
  const protocol = forwardedProto || requestUrl.protocol.replace(":", "");
  return new URL(path, `${protocol}://${host}`);
}

export async function POST(request: Request) {
  const response = NextResponse.redirect(redirectUrl(request, "/admin/login"), 303);
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
  return response;
}
