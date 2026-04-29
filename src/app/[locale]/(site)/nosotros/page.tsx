import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AboutPageSections } from "@/components/sections/about/AboutPageSections";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("aboutPage.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function AboutPage() {
  return <AboutPageSections />;
}
