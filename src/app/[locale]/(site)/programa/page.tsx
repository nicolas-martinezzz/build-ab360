import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProgramaPageSections } from "@/components/sections/programa/ProgramaPageSections";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("programaPage.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ProgramaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ProgramaPageSections />;
}
