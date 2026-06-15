import type { Plan } from "@/types/plan";

export type PaidPack = "premium" | "cad";

export function isExternalUrl(value?: string) {
  return /^https?:\/\//i.test(value ?? "");
}

export function isGumroadUrl(value?: string) {
  if (!value) return false;
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === "gumroad.com" || host.endsWith(".gumroad.com") || host === "gum.co" || host.endsWith(".gum.co");
  } catch {
    return false;
  }
}

function cleanCheckoutUrl(value?: string) {
  if (!value || value === "#") return "";
  return isExternalUrl(value) ? value : "";
}

export function getPlanCheckoutUrl(plan: Plan, pack: PaidPack) {
  if (pack === "premium") return cleanCheckoutUrl(plan.gumroadPremiumUrl) || cleanCheckoutUrl(plan.premiumUrl);
  return cleanCheckoutUrl(plan.gumroadCadUrl) || cleanCheckoutUrl(plan.cadUrl);
}

export function getRequestHref(plan: Plan, pack: string) {
  return `/contact?plan=${encodeURIComponent(plan.reference)}&title=${encodeURIComponent(plan.title)}&pack=${encodeURIComponent(pack)}`;
}
