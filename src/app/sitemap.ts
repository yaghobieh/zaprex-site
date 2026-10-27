import type { MetadataRoute } from "next";
import { DOCS } from "@/lib/docs";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/docs`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.7 },
    ...DOCS.map(doc => ({ url: `${SITE_URL}/docs/${doc.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
