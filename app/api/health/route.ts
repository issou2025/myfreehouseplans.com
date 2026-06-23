import { NextResponse } from "next/server";
import { getDeploymentReadiness } from "@/lib/deploymentReadiness";

export const runtime = "nodejs";

export async function GET() {
  const readiness = await getDeploymentReadiness();

  return NextResponse.json({
    status: readiness.ready ? "ready" : "degraded",
    deploymentReady: readiness.ready,
    checks: {
      databaseConfigured: readiness.databaseConfigured,
      databaseReachable: readiness.databaseReachable,
      uploadProvider: readiness.uploadProvider,
      adminPasswordStrong: readiness.adminPasswordStrong,
      sessionSecretStrong: readiness.sessionSecretStrong,
      siteUrlConfigured: readiness.siteUrlConfigured
    },
    issues: readiness.issues
  }, {
    status: readiness.ready || process.env.NODE_ENV !== "production" ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
