import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalContentSection } from "@/components/sections/LegalContentSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("informationPage.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function InformationPage() {
  const t = await getTranslations("informationPage");

  return <LegalContentSection title={t("title")}>{t("body")}</LegalContentSection>;
}
