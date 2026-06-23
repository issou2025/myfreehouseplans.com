import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { Category } from "@/types/category";
import { ensureDatabaseSchema, hasDatabase, query } from "@/lib/db";
import { mockCategories } from "@/lib/mockCategories";

const dataDir = path.join(process.cwd(), "data");
const categoriesPath = path.join(dataDir, "categories.json");
const deletedCategoriesPath = path.join(dataDir, "deleted-categories.json");

function requiresDatabase() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1" || process.env.REQUIRE_DATABASE === "true";
}

function normalizeCategory(category: Category): Category {
  return {
    ...category,
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    planCount: Number(category.planCount) || 0,
    publishedCount: Number(category.publishedCount) || 0,
    draftCount: Number(category.draftCount) || 0,
    seoScore: Number(category.seoScore) || 0,
    featured: Boolean(category.featured),
    visible: category.visible !== false
  };
}

export async function readCategories() {
  if (hasDatabase()) {
    try {
      await ensureDatabaseSchema();
      const result = await query<{ data: Category }>("select data from app_categories order by updated_at desc");
      const deleted = await query<{ id: string }>("select id from app_deleted_categories");
      const deletedIds = new Set(deleted?.rows.map((row) => row.id) ?? []);
      const byId = new Map<string, Category>();
      mockCategories.map(normalizeCategory).filter((category) => !deletedIds.has(category.id)).forEach((category) => byId.set(category.id, category));
      result?.rows.map((row) => normalizeCategory(row.data)).filter((category) => !deletedIds.has(category.id)).forEach((category) => byId.set(category.id, category));
      return Array.from(byId.values());
    } catch {
      return mockCategories;
    }
  }

  try {
    let deletedIds = new Set<string>();
    try {
      const deleted = JSON.parse(await readFile(deletedCategoriesPath, "utf-8")) as unknown;
      if (Array.isArray(deleted)) deletedIds = new Set(deleted.filter((id): id is string => typeof id === "string"));
    } catch {}
    const parsed = JSON.parse(await readFile(categoriesPath, "utf-8")) as unknown;
    if (!Array.isArray(parsed)) return mockCategories;
    const byId = new Map<string, Category>();
    mockCategories.map(normalizeCategory).filter((category) => !deletedIds.has(category.id)).forEach((category) => byId.set(category.id, category));
    parsed.map((category) => normalizeCategory(category as Category)).filter((category) => !deletedIds.has(category.id)).forEach((category) => byId.set(category.id, category));
    return Array.from(byId.values());
  } catch {
    return mockCategories;
  }
}

export async function writeCategory(category: Category) {
  if (!hasDatabase() && requiresDatabase()) {
    throw new Error("DATABASE_URL is required for durable category storage on this deployment.");
  }

  const current = await readCategories();
  const normalized = normalizeCategory(category);
  const next = current.some((item) => item.id === normalized.id)
    ? current.map((item) => item.id === normalized.id ? normalized : item)
    : [normalized, ...current];

  if (hasDatabase()) {
    await ensureDatabaseSchema();
    await query("delete from app_deleted_categories where id = $1", [normalized.id]);
    await query(
      `insert into app_categories (id, slug, data, updated_at)
       values ($1, $2, $3::jsonb, now())
       on conflict (id) do update set
         slug = excluded.slug,
         data = excluded.data,
         updated_at = now()`,
      [normalized.id, normalized.slug, JSON.stringify(normalized)]
    );
    return next;
  }

  await mkdir(dataDir, { recursive: true });
  try {
    const parsed = JSON.parse(await readFile(deletedCategoriesPath, "utf-8")) as unknown;
    if (Array.isArray(parsed)) {
      await writeFile(deletedCategoriesPath, JSON.stringify(parsed.filter((id) => id !== normalized.id), null, 2), "utf-8");
    }
  } catch {}
  await writeFile(categoriesPath, JSON.stringify(next, null, 2), "utf-8");
  return next;
}

export async function deleteCategory(id: string) {
  if (!hasDatabase() && requiresDatabase()) throw new Error("DATABASE_URL is required for durable category deletion on this deployment.");

  if (hasDatabase()) {
    await ensureDatabaseSchema();
    await query("delete from app_categories where id = $1", [id]);
    await query("insert into app_deleted_categories (id) values ($1) on conflict (id) do update set deleted_at = now()", [id]);
    return;
  }

  await mkdir(dataDir, { recursive: true });
  let deletedIds: string[] = [];
  try {
    const parsed = JSON.parse(await readFile(deletedCategoriesPath, "utf-8")) as unknown;
    if (Array.isArray(parsed)) deletedIds = parsed.filter((value): value is string => typeof value === "string");
  } catch {}
  if (!deletedIds.includes(id)) deletedIds.push(id);
  const remaining = (await readCategories()).filter((category) => category.id !== id);
  await writeFile(categoriesPath, JSON.stringify(remaining, null, 2), "utf-8");
  await writeFile(deletedCategoriesPath, JSON.stringify(deletedIds, null, 2), "utf-8");
}
