import { jsonError, jsonSuccess } from "@/lib/apiResponse";
import { deleteCategory, readCategories, writeCategory } from "@/lib/categoryData";
import { cleanMultilineText, cleanText, getClientKey, isSafeRelativeOrHttpUrl, rateLimit, readJsonBody } from "@/lib/security";
import { slugify } from "@/lib/slug";
import type { Category } from "@/types/category";

export const runtime = "nodejs";

function cleanNumber(value: unknown, fallback = 0) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

export async function GET() {
  const categories = await readCategories();
  return jsonSuccess("Categories loaded.", { categories });
}

export async function POST(request: Request) {
  try {
    if (process.env.VERCEL === "1" && !process.env.DATABASE_URL) {
      return jsonError("DATABASE_URL is required to save categories on Vercel.", 503);
    }
    if (!rateLimit(`categories:${getClientKey(request)}`, 60, 60_000)) {
      return jsonError("Too many category actions. Please wait a minute and try again.", 429);
    }

    let body: Category;
    try {
      body = await readJsonBody<Category>(request, 256 * 1024);
    } catch {
      return jsonError("Invalid JSON body.", 400);
    }

    const categories = await readCategories();
    const id = cleanText(body.id, 120) || `category-${Date.now()}`;
    const name = cleanText(body.name, 140);
    const slug = slugify(cleanText(body.slug, 180) || name);
    const description = cleanMultilineText(body.description, 2000);
    const imageUrl = cleanText(body.imageUrl, 500);
    const errors: Record<string, string> = {};

    if (!name) errors.name = "Category name is required.";
    if (!slug) errors.slug = "Slug is required.";
    if (categories.some((category) => category.id !== id && category.slug === slug)) errors.slug = "Slug already exists.";
    if (imageUrl && !isSafeRelativeOrHttpUrl(imageUrl)) errors.imageUrl = "Image URL is not allowed.";

    if (Object.keys(errors).length) return jsonError("Validation failed.", 400, errors);

    const savedCategory: Category = {
      id,
      name,
      slug,
      description: description || `Curated ${name.toLowerCase()} for new plan listings.`,
      seoTitle: cleanText(body.seoTitle, 180) || `${name} | myfreehouseplans.com`,
      metaDescription: cleanText(body.metaDescription, 300),
      imageUrl,
      parentCategory: cleanText(body.parentCategory, 140) || "House Plans",
      planCount: cleanNumber(body.planCount),
      publishedCount: cleanNumber(body.publishedCount),
      draftCount: cleanNumber(body.draftCount),
      featured: Boolean(body.featured),
      visible: body.visible !== false,
      seoScore: cleanNumber(body.seoScore, body.metaDescription && description ? 72 : 48)
    };

    const nextCategories = await writeCategory(savedCategory);
    return jsonSuccess("Category saved.", { category: savedCategory, categories: nextCategories }, 201);
  } catch {
    return jsonError("Unable to save category right now.", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    if (!rateLimit(`categories-delete:${getClientKey(request)}`, 30, 60_000)) {
      return jsonError("Too many category actions. Please wait a minute and try again.", 429);
    }
    const body = await readJsonBody<{ id?: string }>(request, 8 * 1024);
    const id = cleanText(body.id, 120);
    if (!id) return jsonError("Category id is required.", 400);
    await deleteCategory(id);
    return jsonSuccess("Category deleted.", { id });
  } catch {
    return jsonError("Unable to delete category right now.", 500);
  }
}
