import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

const PRINCIPLE_KEYS = ["principle1", "principle2", "principle3"] as const;

export const AboutPrinciplesSection = async () => {
  const t = await getTranslations("aboutPage.principles");

  return (
    <section aria-labelledby="about-principles-title" className="section-block bg-white">
      <SectionContainer>
        <h2 className="figma-title-2-bold max-w-[52rem] text-surface-bg" id="about-principles-title">
          {t("title")}
        </h2>
        <ul className="mt-8 list-none divide-y divide-grey-light/70 p-0">
          {PRINCIPLE_KEYS.map((key) => (
            <li key={key} className="max-w-[52rem] py-6 first:pt-0 last:pb-0">
              <h3 className="figma-text-l-bold text-surface-bg">
                {t(`${key}.title`)}
              </h3>
              <p className="figma-text-l mt-2 text-grey-dark">
                {t(`${key}.body`)}
              </p>
            </li>
          ))}
        </ul>
      </SectionContainer>
    </section>
  );
};
