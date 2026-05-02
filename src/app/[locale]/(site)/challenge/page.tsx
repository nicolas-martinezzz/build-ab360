import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ChallengePageSections } from "@/components/sections/challenge/ChallengePageSections";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("challengePage.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ChallengePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ChallengePageSections />;
}
