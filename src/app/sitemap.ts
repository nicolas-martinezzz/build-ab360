import type { MetadataRoute } from "next";
import { ALL_CONTENT } from "@/content/articles";

export const dynamic = "force-static";

const BASE_URL = "https://yutopias.com";
const LOCALES = ["es", "en", "ca"] as const;

const STATIC_PAGES = [
  { path: "", priority: 1.0, changeFrequency: "weekly" as const },
  { path: "/challenge", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/solution", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/programa", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/nosotros", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/resources", priority: 0.8, changeFrequency: "weekly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.flatMap((page) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE_URL}/${l}${page.path}`])
        ),
      },
    }))
  );

  const articleEntries: MetadataRoute.Sitemap = ALL_CONTENT.flatMap((article) =>
    LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}/resources/${article.slug}`,
      lastModified: new Date(article.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${BASE_URL}/${l}/resources/${article.slug}`])
        ),
      },
    }))
  );

  return [...staticEntries, ...articleEntries];
}
