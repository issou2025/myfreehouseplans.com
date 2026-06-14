export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string[];
  coverImage: string;
  author: string;
  readTime: string;
  date: string;
  status: "Published" | "Draft";
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  focusKeyword?: string;
  relatedPlanIds?: string[];
  seoScore?: number;
};
