import type { MetadataRoute } from "next";
import { mockBlogPosts } from "@/lib/mockBlogPosts";
import { readPlans } from "@/lib/planData";
import { getSiteUrl } from "@/lib/site";

const staticRoutes = [
  "",
  "/plans",
  "/free-house-plans",
  "/premium-house-plans",
  "/cad-revit-house-plans",
  "/tools",
  "/blog",
  "/about",
  "/contact",
  "/before-you-build",
  "/license",
  "/privacy",
  "/terms",
  "/refund-policy"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const plans = (await readPlans()).filter((plan) => plan.status === "Published");
  const posts = mockBlogPosts.filter((post) => post.status === "Published");

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" || route === "/plans" ? "daily" as const : "weekly" as const,
      priority: route === "" ? 1 : route === "/plans" ? 0.95 : 0.7
    })),
    ...plans.map((plan) => ({
      url: `${siteUrl}/plans/${plan.slug}`,
      lastModified: plan.updatedAt ? new Date(plan.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85
    })),
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.65
    }))
  ];
}
