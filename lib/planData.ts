import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { Plan } from "@/types/plan";
import { ensureDatabaseSchema, hasDatabase, query } from "@/lib/db";
import { mockPlans } from "@/lib/mockPlans";
import { normalizePlan } from "@/lib/normalizePlan";

const dataDir = path.join(process.cwd(), "data");
const plansPath = path.join(dataDir, "plans.json");
const deletedPlansPath = path.join(dataDir, "deleted-plans.json");

function requiresDatabase() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1" || process.env.REQUIRE_DATABASE === "true";
}

export async function readPlans() {
  if (hasDatabase()) {
    try {
      await ensureDatabaseSchema();
      const result = await query<{ data: Plan }>("select data from app_plans order by updated_at desc");
      const deleted = await query<{ id: string }>("select id from app_deleted_plans");
      const deletedIds = new Set(deleted?.rows.map((row) => row.id) ?? []);
      const byId = new Map<string, Plan>();
      mockPlans.map(normalizePlan).filter((plan) => !deletedIds.has(plan.id)).forEach((plan) => byId.set(plan.id, plan));
      result?.rows.map((row) => normalizePlan(row.data)).filter((plan) => !deletedIds.has(plan.id)).forEach((plan) => byId.set(plan.id, plan));
      return Array.from(byId.values());
    } catch {
      return mockPlans;
    }
  }

  try {
    let deletedIds = new Set<string>();
    try {
      const deleted = JSON.parse(await readFile(deletedPlansPath, "utf-8")) as unknown;
      if (Array.isArray(deleted)) deletedIds = new Set(deleted.filter((id): id is string => typeof id === "string"));
    } catch {}
    const content = await readFile(plansPath, "utf-8");
    const parsed = JSON.parse(content) as unknown;
    if (!Array.isArray(parsed)) return mockPlans;
    const byId = new Map<string, Plan>();
    mockPlans.map(normalizePlan).filter((plan) => !deletedIds.has(plan.id)).forEach((plan) => byId.set(plan.id, plan));
    parsed.map((plan) => normalizePlan(plan as Plan)).filter((plan) => !deletedIds.has(plan.id)).forEach((plan) => byId.set(plan.id, plan));
    return Array.from(byId.values());
  } catch {
    return mockPlans;
  }
}

export async function writePlan(plan: Plan) {
  if (!hasDatabase() && requiresDatabase()) {
    throw new Error("DATABASE_URL is required for durable plan storage on this deployment.");
  }

  const current = await readPlans();
  const normalized = normalizePlan(plan);
  const next = current.some((item) => item.id === normalized.id)
    ? current.map((item) => item.id === normalized.id ? normalized : item)
    : [normalized, ...current];

  if (hasDatabase()) {
    await ensureDatabaseSchema();
    await query("delete from app_deleted_plans where id = $1", [normalized.id]);
    await query(
      `insert into app_plans (id, slug, reference, status, data, updated_at)
       values ($1, $2, $3, $4, $5::jsonb, now())
       on conflict (id) do update set
         slug = excluded.slug,
         reference = excluded.reference,
         status = excluded.status,
         data = excluded.data,
         updated_at = now()`,
      [normalized.id, normalized.slug, normalized.reference, normalized.status, JSON.stringify(normalized)]
    );
    return next;
  }

  await mkdir(dataDir, { recursive: true });
  try {
    const parsed = JSON.parse(await readFile(deletedPlansPath, "utf-8")) as unknown;
    if (Array.isArray(parsed)) {
      const restored = parsed.filter((id) => id !== normalized.id);
      await writeFile(deletedPlansPath, JSON.stringify(restored, null, 2), "utf-8");
    }
  } catch {}
  await writeFile(plansPath, JSON.stringify(next, null, 2), "utf-8");
  return next;
}

export async function deletePlan(id: string) {
  if (!hasDatabase() && requiresDatabase()) throw new Error("DATABASE_URL is required for durable plan deletion on this deployment.");

  if (hasDatabase()) {
    await ensureDatabaseSchema();
    await query("delete from app_plans where id = $1", [id]);
    await query("insert into app_deleted_plans (id) values ($1) on conflict (id) do update set deleted_at = now()", [id]);
    return;
  }

  await mkdir(dataDir, { recursive: true });
  let deletedIds: string[] = [];
  try {
    const parsed = JSON.parse(await readFile(deletedPlansPath, "utf-8")) as unknown;
    if (Array.isArray(parsed)) deletedIds = parsed.filter((value): value is string => typeof value === "string");
  } catch {}
  if (!deletedIds.includes(id)) deletedIds.push(id);
  const remaining = (await readPlans()).filter((plan) => plan.id !== id);
  await writeFile(plansPath, JSON.stringify(remaining, null, 2), "utf-8");
  await writeFile(deletedPlansPath, JSON.stringify(deletedIds, null, 2), "utf-8");
}
