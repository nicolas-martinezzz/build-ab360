import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

// Bootcamp Zero × APCE Catalunya (22/10/2026), es-only — see
// odd/tasks/bootcamp-zero-programa.md. Deliberately compact: white
// background, two columns, no background media — must not read as a second
// hero.
export const ProgramaOpenLabIntroSection = async () => {
  const t = await getTranslations("programaPage.openlabIntro");

  return (
    <section aria-labelledby="programa-openlab-intro-title" className="section-block border-t border-grey-light/60 bg-white">
      <SectionContainer className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="type-eyebrow text-green-600">{t("eyebrow")}</p>
          <h2 className="figma-title-2-bold mt-3 text-surface-bg" id="programa-openlab-intro-title">
            {t("headline")}
          </h2>
        </div>

        <div className="space-y-4 lg:pt-1">
          <p className="figma-text-l text-surface-bg">{t("paragraph1")}</p>
          <p className="figma-text-l text-surface-bg">{t("paragraph2")}</p>
        </div>
      </SectionContainer>
    </section>
  );
};
