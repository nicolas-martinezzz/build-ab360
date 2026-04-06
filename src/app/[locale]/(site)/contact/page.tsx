import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalContentSection } from "@/components/sections/LegalContentSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contactPage.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ContactPage() {
  const t = await getTranslations("contactPage");

  return <LegalContentSection title={t("title")}>{t("body")}</LegalContentSection>;
}
