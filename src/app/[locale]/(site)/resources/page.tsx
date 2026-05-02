import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BlogResourcesSection } from "@/components/sections/home/BlogResourcesSection";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("resourcesPage.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ResourcesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BlogResourcesSection />;
}
