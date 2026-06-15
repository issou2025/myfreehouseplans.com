import { jsonError, jsonSuccess } from "@/lib/apiResponse";
import { deletePlan, readPlans, writePlan } from "@/lib/planData";
import { isReferenceUnique, normalizePlanReference, parsePlanReference } from "@/lib/planReferences";
import { cleanMultilineText, cleanText, getClientKey, isSafeRelativeOrHttpUrl, rateLimit, readJsonBody } from "@/lib/security";
import { slugify } from "@/lib/slug";
import type { Plan } from "@/types/plan";

export const runtime = "nodejs";

const statuses = ["Published", "Draft", "Archived"] as const;
const urlFields = [
  "mainImage",
  "floorPlanImage",
  "elevationImage",
  "threeDViewImage",
  "threeDImage",
  "cadPreviewImage",
  "revitPreviewImage",
  "openGraphImage",
  "freePdfUrl",
  "premiumUrl",
  "cadUrl",
  "gumroadPremiumUrl",
  "gumroadCadUrl",
  "premiumPdfUrl",
  "premiumZipUrl",
  "dwgFileUrl",
  "revitFileUrl",
  "ifcFileUrl",
  "cadZipUrl"
] as const satisfies ReadonlyArray<keyof Plan>;

function cleanStringList(value: unknown, maxItemLength = 120) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => cleanText(item, maxItemLength)).filter(Boolean);
}

function cleanNumber(value: unknown, fallback = 0) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

export async function GET() {
  const plans = await readPlans();
  return jsonSuccess("Plans loaded.", { plans });
}

export async function POST(request: Request) {
  try {
    if (process.env.VERCEL === "1" && !process.env.DATABASE_URL) {
      return jsonError("DATABASE_URL is required to save plans on Vercel.", 503);
    }
    if (!rateLimit(`plans:${getClientKey(request)}`, 60, 60_000)) {
      return jsonError("Too many plan actions. Please wait a minute and try again.", 429);
    }

    let body: Plan;
    try {
      body = await readJsonBody<Plan>(request, 2 * 1024 * 1024);
    } catch {
      return jsonError("Invalid JSON body.", 400);
    }

    const plans = await readPlans();
    const id = cleanText(body.id, 120) || `plan-${Date.now()}`;
    const title = cleanText(body.title, 180);
    const slug = slugify(cleanText(body.slug, 180) || title);
    const reference = normalizePlanReference(cleanText(body.reference, 40));
    const status = statuses.includes(body.status) ? body.status : "Draft";
    const errors: Record<string, string> = {};

    if (!title) errors.title = "Title is required.";
    if (!slug) errors.slug = "Slug is required.";
    if (!reference) errors.reference = "Reference is required.";
    if (reference && !parsePlanReference(reference)) errors.reference = "Reference must use the MFHP-001/2026 format.";
    if (!isReferenceUnique(reference, plans, id)) errors.reference = "Reference already exists.";
    if (plans.some((plan) => plan.id !== id && plan.slug === slug)) errors.slug = "Slug already exists.";
    if (status === "Published" && !body.category) errors.category = "Category is required before publishing.";

    urlFields.forEach((field) => {
      const value = cleanText(body[field], 500);
      if (value && !isSafeRelativeOrHttpUrl(value)) {
        errors[field] = "URL is not allowed.";
      }
    });

    if (Object.keys(errors).length) return jsonError("Validation failed.", 400, errors);

    const savedPlan: Plan = {
      ...body,
      id,
      title,
      slug,
      reference,
      status,
      category: cleanText(body.category, 140),
      shortDescription: cleanText(body.shortDescription, 500),
      description: cleanMultilineText(body.description, 5000),
      tags: cleanStringList(body.tags),
      climateTags: cleanStringList(body.climateTags),
      specialFeatures: cleanStringList(body.specialFeatures),
      features: cleanStringList(body.features),
      galleryImages: cleanStringList(body.galleryImages, 500),
      premiumIncludedFiles: cleanStringList(body.premiumIncludedFiles),
      cadIncludedFiles: cleanStringList(body.cadIncludedFiles),
      badges: cleanStringList(body.badges),
      bestFor: cleanStringList(body.bestFor, 180),
      beCareful: cleanStringList(body.beCareful, 180),
      mainStrengths: cleanStringList(body.mainStrengths, 180),
      mainLimitations: cleanStringList(body.mainLimitations, 180),
      recommendedUsers: cleanStringList(body.recommendedUsers, 180),
      seoKeywords: cleanStringList(body.seoKeywords),
      secondaryKeywords: cleanStringList(body.secondaryKeywords),
      totalArea: cleanNumber(body.totalArea),
      builtArea: cleanNumber(body.builtArea),
      livingArea: cleanNumber(body.livingArea),
      plotWidth: cleanNumber(body.plotWidth),
      plotLength: cleanNumber(body.plotLength),
      minPlotWidth: cleanNumber(body.minPlotWidth),
      minPlotLength: cleanNumber(body.minPlotLength),
      minimumPlotWidth: cleanNumber(body.minimumPlotWidth),
      minimumPlotLength: cleanNumber(body.minimumPlotLength),
      bedrooms: cleanNumber(body.bedrooms),
      bathrooms: cleanNumber(body.bathrooms),
      livingRooms: cleanNumber(body.livingRooms),
      kitchens: cleanNumber(body.kitchens),
      floors: Math.max(1, cleanNumber(body.floors, 1)),
      premiumPrice: cleanNumber(body.premiumPrice),
      cadPrice: cleanNumber(body.cadPrice),
      oldPremiumPrice: cleanNumber(body.oldPremiumPrice),
      oldCadPrice: cleanNumber(body.oldCadPrice),
      views: cleanNumber(body.views)
    };

    urlFields.forEach((field) => {
      savedPlan[field] = cleanText(body[field], 500) as never;
    });

    const nextPlans = await writePlan(savedPlan);
    return jsonSuccess(savedPlan.status === "Published" ? "Plan published and persisted." : "Plan saved.", { plan: savedPlan, plans: nextPlans }, 201);
  } catch {
    return jsonError("Unable to save plan right now.", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    if (!rateLimit(`plans-delete:${getClientKey(request)}`, 30, 60_000)) {
      return jsonError("Too many plan actions. Please wait a minute and try again.", 429);
    }
    const body = await readJsonBody<{ id?: string }>(request, 8 * 1024);
    const id = cleanText(body.id, 120);
    if (!id) return jsonError("Plan id is required.", 400);
    await deletePlan(id);
    return jsonSuccess("Plan deleted.", { id });
  } catch {
    return jsonError("Unable to delete plan right now.", 500);
  }
}
