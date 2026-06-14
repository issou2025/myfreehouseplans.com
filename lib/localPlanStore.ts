"use client";

import type { Plan } from "@/types/plan";
import { normalizePlan } from "@/lib/normalizePlan";

const STORAGE_KEY = "mfhp.admin.plans";

export function mergePlans(basePlans: Plan[], storedPlans: Plan[]) {
  const byId = new Map<string, Plan>();
  basePlans.map(normalizePlan).forEach((plan) => byId.set(plan.id, plan));
  storedPlans.map(normalizePlan).forEach((plan) => byId.set(plan.id, plan));
  return Array.from(byId.values());
}

export function getStoredPlans() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Plan[];
    return Array.isArray(parsed) ? parsed.map(normalizePlan) : [];
  } catch {
    return [];
  }
}

export function saveStoredPlans(plans: Plan[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plans.map(normalizePlan)));
}

export function upsertStoredPlan(plan: Plan, basePlans: Plan[] = []) {
  const current = mergePlans(basePlans, getStoredPlans());
  const exists = current.some((item) => item.id === plan.id);
  const next = exists ? current.map((item) => item.id === plan.id ? normalizePlan(plan) : item) : [normalizePlan(plan), ...current];
  saveStoredPlans(next);
  return next;
}
