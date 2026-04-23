import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProgramaPageSections } from "@/components/sections/programa/ProgramaPageSections";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("programaPage.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function ProgramaPage() {
  return <ProgramaPageSections />;
}
