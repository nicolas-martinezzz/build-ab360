import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalContentSection } from "@/components/sections/LegalContentSection";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const isLegalSection = (value: unknown): value is LegalSection => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { title?: unknown; paragraphs?: unknown; bullets?: unknown };
  const hasValidTitle = typeof candidate.title === "string";
  const hasValidParagraphs =
    typeof candidate.paragraphs === "undefined" ||
    (Array.isArray(candidate.paragraphs) && candidate.paragraphs.every((p) => typeof p === "string"));
  const hasValidBullets =
    typeof candidate.bullets === "undefined" ||
    (Array.isArray(candidate.bullets) && candidate.bullets.every((b) => typeof b === "string"));
  return hasValidTitle && hasValidParagraphs && hasValidBullets;
};

const getLegalSections = (raw: unknown): LegalSection[] => {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isLegalSection);
};

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
  const sections = getLegalSections(t.raw("sections"));

  return (
    <LegalContentSection title={t("title")}>
      <p className="font-medium text-surface-bg">{t("lead")}</p>

      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-xl font-semibold text-surface-bg">{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.bullets ? (
              <ul className="list-disc space-y-2 pl-5">
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </LegalContentSection>
  );
}
