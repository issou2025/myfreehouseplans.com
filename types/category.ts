export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  planCount: number;
  publishedCount?: number;
  draftCount?: number;
  seoTitle?: string;
  metaDescription?: string;
  imageUrl?: string;
  parentCategory?: string;
  featured?: boolean;
  visible?: boolean;
  seoScore?: number;
};
