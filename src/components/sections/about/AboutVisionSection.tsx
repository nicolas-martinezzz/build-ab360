import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

export const AboutVisionSection = async () => {
  const t = await getTranslations("aboutPage.vision");

  return (
    <section aria-labelledby="about-vision-title" className="section-block bg-green-50">
      <SectionContainer>
        <div className="grid gap-9 md:grid-cols-2 md:gap-14">
          <div>
            <p className="type-eyebrow text-grey-dark">
              {t("eyebrow")}
            </p>
            <h2 className="figma-title-2 mt-3 text-surface-bg" id="about-vision-title">
              {t("title")}
            </h2>
          </div>
          <div className="flex flex-col gap-5">
            <p className="figma-text-l text-surface-bg">{t("para1")}</p>
            <p className="figma-text-l text-surface-bg">{t("para2")}</p>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
