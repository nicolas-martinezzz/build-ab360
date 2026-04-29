import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BlogResourcesSection } from "@/components/sections/home/BlogResourcesSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("resourcesPage.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function ResourcesPage() {
  return <BlogResourcesSection />;
}
