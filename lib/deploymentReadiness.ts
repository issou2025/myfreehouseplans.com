import { hasDatabase, query } from "@/lib/db";
import { getUploadProvider } from "@/lib/uploadStorage";

export type DeploymentReadiness = {
  ready: boolean;
  databaseConfigured: boolean;
  databaseReachable: boolean;
  databaseRequired: boolean;
  uploadProvider: "cloudinary" | "disk";
  cloudUploadsRequired: boolean;
  adminPasswordStrong: boolean;
  sessionSecretStrong: boolean;
  siteUrlConfigured: boolean;
  issues: string[];
};

export async function getDeploymentReadiness(): Promise<DeploymentReadiness> {
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

  const databaseRequired = process.env.NODE_ENV === "production" || process.env.VERCEL === "1" || process.env.REQUIRE_DATABASE === "true";
  const cloudUploadsRequired = process.env.VERCEL === "1" || process.env.REQUIRE_CLOUD_UPLOADS === "true";
  const uploadProvider = getUploadProvider();
  const adminPasswordStrong = Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 16);
  const sessionSecretStrong = Boolean(process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32 && process.env.ADMIN_SESSION_SECRET !== process.env.ADMIN_PASSWORD);
  const siteUrlConfigured = Boolean(process.env.NEXT_PUBLIC_SITE_URL);
  const issues: string[] = [];

  if (!adminPasswordStrong) issues.push("Use an ADMIN_PASSWORD with at least 16 characters.");
  if (!sessionSecretStrong) issues.push("Use a separate ADMIN_SESSION_SECRET with at least 32 characters.");
  if (databaseRequired && !databaseReachable) issues.push("Connect a reachable PostgreSQL DATABASE_URL.");
  if (cloudUploadsRequired && uploadProvider !== "cloudinary") issues.push("Configure Cloudinary for durable production uploads.");
  if (!siteUrlConfigured) issues.push("Set NEXT_PUBLIC_SITE_URL to the production domain.");

  return {
    ready: issues.length === 0,
    databaseConfigured,
    databaseReachable,
    databaseRequired,
    uploadProvider,
    cloudUploadsRequired,
    adminPasswordStrong,
    sessionSecretStrong,
    siteUrlConfigured,
    issues
  };
}
