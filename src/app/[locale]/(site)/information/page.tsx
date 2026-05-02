import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalContentSection } from "@/components/sections/LegalContentSection";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("informationPage.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function InformationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("informationPage");

  return <LegalContentSection title={t("title")}>{t("body")}</LegalContentSection>;
}
