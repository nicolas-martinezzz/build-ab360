import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/es/autodiagnostico/", "/en/autodiagnostic/", "/ca/autodiagnostic/"],
    },
    sitemap: "https://yutopias.com/sitemap.xml",
  };
}
