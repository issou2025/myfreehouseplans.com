import { jsonSuccess } from "@/lib/apiResponse";
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
  const adminConfigured = Boolean(process.env.ADMIN_PASSWORD);
  const deploymentReady = adminConfigured && (!requireDatabase || databaseReachable) && (!requireCloudUploads || uploadProvider === "cloudinary");
  const warnings = [
    requireDatabase && !databaseReachable ? "Configure a reachable DATABASE_URL for durable plans and messages." : "",
    requireCloudUploads && uploadProvider !== "cloudinary" ? "Configure Cloudinary for durable uploads." : "",
    !adminConfigured ? "Configure ADMIN_PASSWORD to enable the admin area." : ""
  ].filter(Boolean);

  return jsonSuccess(deploymentReady ? "Service is deployment ready." : "Service is running but production configuration is incomplete.", {
    status: deploymentReady ? "ready" : "degraded",
    databaseConfigured,
    databaseReachable,
    uploadProvider,
    adminConfigured,
    requireDatabase,
    requireCloudUploads,
    deploymentReady,
    warnings
  }, deploymentReady || process.env.NODE_ENV !== "production" ? 200 : 503);
}
