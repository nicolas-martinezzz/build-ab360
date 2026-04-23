import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SolutionRebuildPageSections } from "@/components/sections/solution-rebuild/SolutionRebuildPageSections";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("solutionPage.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function SolutionPage() {
  return <SolutionRebuildPageSections />;
}
