import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ChallengePageSections } from "@/components/sections/challenge/ChallengePageSections";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("challengePage.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function ChallengePage() {
  return <ChallengePageSections />;
}
