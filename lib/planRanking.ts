import type { Plan } from "@/types/plan";
import { getPlanSeoScore, getReadinessScore } from "@/lib/adminMetrics";

export type CatalogSortMode = "ranking" | "newest" | "area" | "price" | "smart" | "popular";

function dateValue(value?: string) {
  const time = value ? Date.parse(value) : 0;
  return Number.isFinite(time) ? time : 0;
}

function rankValue(value?: number) {
  return typeof value === "number" && value > 0 ? value : Number.POSITIVE_INFINITY;
}

export function calculateSmartScore(plan: Plan) {
  const scoreValues = [
    plan.scores.functionality,
    plan.scores.comfort,
    plan.scores.constructionSimplicity,
    plan.scores.costEfficiency,
    plan.scores.hotClimateAdaptation,
    plan.scores.futureExtension,
    plan.scores.naturalVentilation ?? 0,
    plan.scores.familySuitability ?? 0
  ].filter((score) => score > 0);
  return plan.smartScore ?? Math.round(scoreValues.reduce((sum, score) => sum + score, 0) / Math.max(1, scoreValues.length));
}

export function calculatePriorityScore(plan: Plan) {
  if (typeof plan.priorityScore === "number") return plan.priorityScore;

  const engagement = Math.min(20, Math.round((plan.views + (plan.downloads ?? 0) * 2 + (plan.premiumClicks ?? 0) * 5 + (plan.cadClicks ?? 0) * 6) / 1800));
  const badges = (plan.featured ? 14 : 0) + (plan.popular ? 8 : 0) + (plan.isNew ? 6 : 0);
  const quality = Math.round((calculateSmartScore(plan) + getPlanSeoScore(plan) + getReadinessScore(plan)) / 6);
  const files = (plan.freePackEnabled ? 3 : 0) + (plan.premiumPackEnabled ? 5 : 0) + (plan.cadPackEnabled ? 7 : 0);

  return Math.min(100, badges + quality + engagement + files);
}

export function getPublishedPlans(plans: Plan[]) {
  return plans.filter((plan) => plan.status === "Published");
}

function compareBase(a: Plan, b: Plan, rankKey: "manualRank" | "homepageRank" | "categoryRank" = "manualRank") {
  const rankDiff = rankValue(a[rankKey]) - rankValue(b[rankKey]);
  if (rankDiff !== 0) return rankDiff;

  const manualDiff = rankValue(a.manualRank) - rankValue(b.manualRank);
  if (manualDiff !== 0) return manualDiff;

  const priorityDiff = calculatePriorityScore(b) - calculatePriorityScore(a);
  if (priorityDiff !== 0) return priorityDiff;

  return dateValue(b.publishedAt ?? b.createdAt) - dateValue(a.publishedAt ?? a.createdAt);
}

export function sortPlansForCatalog(plans: Plan[], sortMode: CatalogSortMode = "ranking") {
  const published = getPublishedPlans(plans);
  return [...published].sort((a, b) => {
    if (sortMode === "newest") return dateValue(b.publishedAt ?? b.createdAt) - dateValue(a.publishedAt ?? a.createdAt);
    if (sortMode === "area") return b.totalArea - a.totalArea;
    if (sortMode === "price") return (a.freePackEnabled ? 0 : a.premiumPrice) - (b.freePackEnabled ? 0 : b.premiumPrice);
    if (sortMode === "smart") return calculateSmartScore(b) - calculateSmartScore(a);
    if (sortMode === "popular") return (b.views + (b.downloads ?? 0)) - (a.views + (a.downloads ?? 0));
    return compareBase(a, b);
  });
}

export function sortPlansForHomepage(plans: Plan[]) {
  return getPublishedPlans(plans)
    .filter((plan) => plan.showOnHomepage !== false && Boolean(plan.mainImage))
    .sort((a, b) => compareBase(a, b, "homepageRank"));
}

export function sortPlansForCategory(plans: Plan[], category: string) {
  return getPublishedPlans(plans)
    .filter((plan) => plan.category === category && plan.showInCategory !== false)
    .sort((a, b) => compareBase(a, b, "categoryRank"));
}

export function getRelatedPlans(currentPlan: Plan, allPlans: Plan[], limit = 3) {
  return sortPlansForCatalog(allPlans)
    .filter((plan) => plan.id !== currentPlan.id)
    .map((plan) => {
      const sharedTags = (plan.tags ?? []).filter((tag) => (currentPlan.tags ?? []).includes(tag)).length;
      const score =
        (plan.category === currentPlan.category ? 40 : 0) +
        sharedTags * 10 +
        (plan.bedrooms === currentPlan.bedrooms ? 12 : 0) +
        (Math.abs(plan.plotWidth - currentPlan.plotWidth) <= 2 ? 8 : 0) +
        (plan.architecturalStyle === currentPlan.architecturalStyle ? 8 : 0) +
        calculatePriorityScore(plan) / 5;
      return { plan, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.plan);
}
