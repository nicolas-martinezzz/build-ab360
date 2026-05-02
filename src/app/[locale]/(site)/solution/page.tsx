import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SolutionPageSections } from "@/components/sections/solution/SolutionPageSections";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("solutionPage.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function SolutionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SolutionPageSections />;
}
