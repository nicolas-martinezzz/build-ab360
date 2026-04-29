import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

const COLS = ["col1", "col2", "col3"] as const;

export const AboutIntroSection = async () => {
  const t = await getTranslations("aboutPage.intro");

  return (
    <section className="section-block bg-white">
      <SectionContainer>
        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          {COLS.map((col) => (
            <div key={col}>
              <h2 className="figma-text-l-bold text-surface-bg">
                {t(`${col}Title`)}
              </h2>
              <p className="figma-text-m mt-2.5 text-grey-dark">
                {t(`${col}Body`)}
              </p>
            </div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
};
