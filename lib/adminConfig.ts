export type AdminConfigIssue = "missing-password" | "weak-password" | "missing-session-secret" | "weak-session-secret" | "shared-session-secret";

export function getAdminConfigIssue(): AdminConfigIssue | null {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!password) return "missing-password";
  if (process.env.NODE_ENV !== "production") return null;
  if (password.length < 16) return "weak-password";
  if (!secret) return "missing-session-secret";
  if (secret.length < 32) return "weak-session-secret";
  if (secret === password) return "shared-session-secret";
  return null;
}

export function getAdminConfigMessage(issue: AdminConfigIssue | null) {
  if (!issue) return "";
  if (issue === "missing-password") return "ADMIN_PASSWORD is not configured on the server.";
  if (issue === "weak-password") return "ADMIN_PASSWORD must be at least 16 characters in production.";
  if (issue === "missing-session-secret") return "ADMIN_SESSION_SECRET is required in production.";
  if (issue === "weak-session-secret") return "ADMIN_SESSION_SECRET must be at least 32 characters in production.";
  return "ADMIN_SESSION_SECRET must be different from ADMIN_PASSWORD.";
}
