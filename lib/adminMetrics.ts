import type { Plan } from "@/types/plan";

export function getPlanSeoScore(plan: Plan) {
  const checks = [
    Boolean(plan.seoTitle),
    Boolean(plan.metaDescription),
    Boolean(plan.focusKeyword),
    Boolean(plan.mainImageAlt),
    Boolean(plan.slug),
    Boolean(plan.faq?.length),
    plan.description.length > 150
  ];
  return plan.seoScore ?? Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function getReadinessScore(plan: Plan) {
  const checks = [
    Boolean(plan.title),
    Boolean(plan.slug),
    Boolean(plan.reference),
    Boolean(plan.category),
    Boolean(plan.shortDescription),
    Boolean(plan.description),
    Boolean(plan.mainImage),
    plan.galleryImages.length > 0,
    plan.totalArea > 0 && plan.bedrooms >= 0,
    !plan.freePackEnabled || Boolean(plan.freePdfUrl),
    !plan.premiumPackEnabled || plan.premiumPrice > 0,
    !plan.premiumPackEnabled || Boolean(plan.premiumUrl),
    !plan.cadPackEnabled || plan.cadPrice > 0,
    !plan.cadPackEnabled || Boolean(plan.cadUrl),
    Boolean(plan.seoTitle),
    Boolean(plan.metaDescription),
    Boolean(plan.focusKeyword),
    Boolean(plan.faq?.length),
    Boolean(plan.scores.functionality)
  ];
  return plan.readinessScore ?? Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function getReadinessLabel(score: number) {
  if (score <= 40) return "Incomplete";
  if (score <= 70) return "Needs Improvement";
  if (score <= 90) return "Good";
  return "Ready to Publish";
}

export function getMissingItems(plan: Plan) {
  const missing: string[] = [];
  if (!plan.mainImage) missing.push("image");
  if (!plan.seoTitle) missing.push("SEO title");
  if (!plan.metaDescription) missing.push("meta description");
  if (plan.premiumPackEnabled && !plan.premiumUrl) missing.push("premium link");
  if (plan.cadPackEnabled && !plan.cadUrl) missing.push("CAD/Revit link");
  if (plan.premiumPackEnabled && !plan.premiumPrice) missing.push("premium price");
  if (plan.freePackEnabled && !plan.freePdfUrl) missing.push("free PDF");
  if (!plan.mainImageAlt) missing.push("alt text");
  return missing;
}
