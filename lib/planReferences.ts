import type { Plan } from "@/types/plan";

const REFERENCE_PREFIX = "MFHP";
const REFERENCE_PATTERN = /^MFHP-(\d{3,})\/(\d{4})$/;
const LEGACY_REFERENCE_PATTERN = /^MFHP-(\d{4})-(\d{3,})$/;

export type ParsedPlanReference = {
  number: number;
  year: number;
};

export function parsePlanReference(reference: string): ParsedPlanReference | null {
  const trimmed = reference.trim().toUpperCase();
  const current = trimmed.match(REFERENCE_PATTERN);
  if (current) {
    return { number: Number(current[1]), year: Number(current[2]) };
  }

  const legacy = trimmed.match(LEGACY_REFERENCE_PATTERN);
  if (legacy) {
    return { number: Number(legacy[2]), year: Number(legacy[1]) };
  }

  return null;
}

export function formatPlanReference(number: number, year: number) {
  return `${REFERENCE_PREFIX}-${String(number).padStart(3, "0")}/${year}`;
}

export function normalizePlanReference(reference: string) {
  const parsed = parsePlanReference(reference);
  return parsed ? formatPlanReference(parsed.number, parsed.year) : reference.trim().toUpperCase();
}

export function getReferenceYear(reference: string, fallbackYear = new Date().getFullYear()) {
  return parsePlanReference(reference)?.year ?? fallbackYear;
}

export function generatePlanReference(existingPlans: Pick<Plan, "reference">[], year = new Date().getFullYear()) {
  const highest = existingPlans.reduce((max, plan) => {
    const parsed = parsePlanReference(plan.reference);
    if (!parsed || parsed.year !== year) return max;
    return Math.max(max, parsed.number);
  }, 0);

  return formatPlanReference(highest + 1, year);
}

export function isReferenceUnique(reference: string, existingPlans: Pick<Plan, "id" | "reference">[], ignorePlanId?: string) {
  const normalized = normalizePlanReference(reference);
  return !existingPlans.some((plan) => plan.id !== ignorePlanId && normalizePlanReference(plan.reference) === normalized);
}
