import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/uploads/"] },
      { userAgent: ["AhrefsBot", "Amazonbot", "Bytespider", "CCBot", "ClaudeBot", "GPTBot", "MJ12bot", "SemrushBot"], disallow: "/" }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
