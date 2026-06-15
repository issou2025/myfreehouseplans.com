import type { Plan } from "@/types/plan";
import { getPlanSeoScore, getReadinessScore } from "@/lib/adminMetrics";
import { normalizePlanReference } from "@/lib/planReferences";
import { calculatePriorityScore, calculateSmartScore } from "@/lib/planRanking";

export function normalizePlan(plan: Plan): Plan {
  const scores = {
    functionality: plan.scores?.functionality ?? 0,
    comfort: plan.scores?.comfort ?? 0,
    constructionSimplicity: plan.scores?.constructionSimplicity ?? 0,
    costEfficiency: plan.scores?.costEfficiency ?? 0,
    hotClimateAdaptation: plan.scores?.hotClimateAdaptation ?? 0,
    futureExtension: plan.scores?.futureExtension ?? 0,
    naturalVentilation: plan.scores?.naturalVentilation ?? 0,
    familySuitability: plan.scores?.familySuitability ?? 0
  };
  const normalized = {
    ...plan,
    reference: normalizePlanReference(plan.reference),
    shortDescription: plan.shortDescription ?? "",
    description: plan.description ?? "",
    builtArea: plan.builtArea ?? plan.totalArea ?? 0,
    livingArea: plan.livingArea ?? plan.totalArea ?? 0,
    totalArea: plan.totalArea ?? 0,
    plotWidth: plan.plotWidth ?? 0,
    plotLength: plan.plotLength ?? 0,
    bedrooms: plan.bedrooms ?? 0,
    bathrooms: plan.bathrooms ?? 0,
    livingRooms: plan.livingRooms ?? 0,
    kitchens: plan.kitchens ?? 0,
    floors: plan.floors ?? 1,
    roofType: plan.roofType ?? "",
    architecturalStyle: plan.architecturalStyle ?? "",
    foundationType: plan.foundationType ?? "",
    structureType: plan.structureType ?? "",
    mainImage: plan.mainImage ?? "",
    galleryImages: plan.galleryImages ?? [],
    freePackEnabled: plan.freePackEnabled ?? false,
    premiumPackEnabled: plan.premiumPackEnabled ?? false,
    cadPackEnabled: plan.cadPackEnabled ?? false,
    freePdfUrl: plan.freePdfUrl ?? "",
    premiumUrl: plan.premiumUrl ?? plan.premiumPdfUrl ?? "",
    cadUrl: plan.cadUrl ?? plan.cadZipUrl ?? "",
    gumroadPremiumUrl: plan.gumroadPremiumUrl ?? "",
    gumroadCadUrl: plan.gumroadCadUrl ?? "",
    premiumPdfUrl: plan.premiumPdfUrl ?? plan.premiumUrl,
    premiumPrice: plan.premiumPrice ?? 0,
    cadPrice: plan.cadPrice ?? 0,
    badges: plan.badges ?? [],
    scores,
    bestFor: plan.bestFor ?? [],
    beCareful: plan.beCareful ?? [],
    views: plan.views ?? 0,
    metaDescription: plan.metaDescription ?? plan.seoDescription ?? plan.shortDescription,
    updatedAt: plan.updatedAt ?? new Date().toISOString().slice(0, 10),
    showOnHomepage: plan.showOnHomepage ?? plan.status === "Published",
    showInCategory: plan.showInCategory ?? true,
    manualRank: plan.manualRank,
    categoryRank: plan.categoryRank,
    homepageRank: plan.homepageRank
  };
  return {
    ...normalized,
    smartScore: calculateSmartScore(normalized),
    seoScore: getPlanSeoScore(normalized),
    readinessScore: getReadinessScore(normalized),
    priorityScore: calculatePriorityScore(normalized)
  };
}
