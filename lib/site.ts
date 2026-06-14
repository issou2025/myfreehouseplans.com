export const siteName = "myfreehouseplans.com";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return "https://myfreehouseplans.com";
  return configured.replace(/\/+$/, "");
}
