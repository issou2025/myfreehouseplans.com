import { NextResponse } from "next/server";
import { hasDatabase, query } from "@/lib/db";
import { getUploadProvider } from "@/lib/uploadStorage";

export const runtime = "nodejs";

export async function GET() {
  const databaseConfigured = hasDatabase();
  let databaseReachable = false;

  if (databaseConfigured) {
    try {
      await query("select 1 as ok");
      databaseReachable = true;
    } catch {
      databaseReachable = false;
    }
  }

  const uploadProvider = getUploadProvider();
  const requireDatabase = process.env.NODE_ENV === "production" || process.env.VERCEL === "1" || process.env.REQUIRE_DATABASE === "true";
  const requireCloudUploads = process.env.VERCEL === "1" || process.env.REQUIRE_CLOUD_UPLOADS === "true";
  const strongAdminPassword = Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 16);
  const strongSessionSecret = Boolean(process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32 && process.env.ADMIN_SESSION_SECRET !== process.env.ADMIN_PASSWORD);
  const deploymentReady = strongAdminPassword && strongSessionSecret && (!requireDatabase || databaseReachable) && (!requireCloudUploads || uploadProvider === "cloudinary");

  return NextResponse.json({
    status: deploymentReady ? "ready" : "degraded",
    deploymentReady
  }, {
    status: deploymentReady || process.env.NODE_ENV !== "production" ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
