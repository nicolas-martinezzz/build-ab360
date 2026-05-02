import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalContentSection } from "@/components/sections/LegalContentSection";

type PrivacySection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const isPrivacySection = (value: unknown): value is PrivacySection => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as {
    title?: unknown;
    paragraphs?: unknown;
    bullets?: unknown;
  };

  const hasValidTitle = typeof candidate.title === "string";
  const hasValidParagraphs =
    typeof candidate.paragraphs === "undefined" ||
    (Array.isArray(candidate.paragraphs) && candidate.paragraphs.every((item) => typeof item === "string"));
  const hasValidBullets =
    typeof candidate.bullets === "undefined" ||
    (Array.isArray(candidate.bullets) && candidate.bullets.every((item) => typeof item === "string"));

  return hasValidTitle && hasValidParagraphs && hasValidBullets;
};

const getPrivacySections = (rawSections: unknown): PrivacySection[] => {
  if (!Array.isArray(rawSections)) {
    return [];
  }
  return rawSections.filter(isPrivacySection);
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacyPage.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacyPage");
  const privacySections = getPrivacySections(t.raw("sections"));

  return (
    <LegalContentSection title={t("title")}>
      <p className="font-medium text-surface-bg">{t("lead")}</p>
      <p className="mt-3">{t("intro")}</p>

      <div className="mt-8 space-y-8">
        {privacySections.map((section) => (
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
