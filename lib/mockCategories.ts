import type { Category } from "@/types/category";

const names = [
  "Modern House Plans",
  "Small House Plans",
  "3 Bedroom House Plans",
  "4 Bedroom House Plans",
  "Low Cost House Plans",
  "African House Plans",
  "20x20m / 66x66 ft Plot House Plans",
  "20x10m / 66x33 ft Plot House Plans",
  "House Plans with Terrace",
  "Free PDF House Plans",
  "CAD House Plans",
  "Revit House Plans"
];

export const mockCategories: Category[] = names.map((name, index) => ({
  id: `cat-${index + 1}`,
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
  description: `Curated ${name.toLowerCase()} for homeowners, builders and design professionals.`,
  planCount: [18, 14, 22, 10, 16, 12, 9, 7, 11, 26, 8, 6][index],
  publishedCount: [15, 12, 19, 8, 14, 10, 7, 5, 9, 22, 6, 5][index],
  draftCount: [3, 2, 3, 2, 2, 2, 2, 2, 2, 4, 2, 1][index],
  seoTitle: `${name} | myfreehouseplans.com`,
  metaDescription: `Browse ${name.toLowerCase()} with free previews, PDF packs and editable CAD/Revit options.`,
  imageUrl: `https://images.unsplash.com/photo-${index % 2 === 0 ? "1600607687939-ce8a6c25118c" : "1600566753190-17f0baa2a6c3"}?auto=format&fit=crop&w=900&q=80`,
  parentCategory: index > 8 ? "File Formats" : "House Plans",
  featured: index < 6,
  seoScore: 72 + index * 2
}));
