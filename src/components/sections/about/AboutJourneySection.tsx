import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

const JOURNEY_KEYS = ["step1", "step2", "step3"] as const;

export const AboutJourneySection = async () => {
  const t = await getTranslations("aboutPage.journey");

  return (
    <section aria-labelledby="about-journey-title" className="section-block bg-white">
      <SectionContainer>
        <p className="type-eyebrow text-grey-dark">{t("eyebrow")}</p>
        <h2
          className="figma-title-2 mt-3 max-w-[48rem] text-surface-bg"
          id="about-journey-title"
        >
          {t("title")}
        </h2>
        <ol className="mt-8 grid list-none gap-4 p-0 md:grid-cols-3">
          {JOURNEY_KEYS.map((key) => (
            <li key={key} className="rounded-[10px] border border-grey-light bg-green-100/30 p-6">
              <p className="type-eyebrow text-green-600">{t(`${key}.year`)}</p>
              <h3 className="figma-text-l-bold mt-2 text-surface-bg">{t(`${key}.title`)}</h3>
              <p className="figma-text-m mt-3 text-grey-dark">{t(`${key}.body`)}</p>
            </li>
          ))}
        </ol>
      </SectionContainer>
    </section>
  );
};
