import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { LinkButton } from "@/components/ui/LinkButton";
import { SITE_PATHS } from "@/config/routes";

export const ProgramaHeroBottomBanner = async () => {
  const t = await getTranslations("programaPage");

  return (
    <div className="bg-green-500 py-2.5">
      <SectionContainer className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="figma-text-m text-white">
          {t("logosStrip.topBanner")}
        </p>
        <LinkButton
          className="h-9 rounded-[6px] bg-white px-6 py-2 text-sm font-semibold text-surface-bg hover:bg-white/90"
          href={SITE_PATHS.contact}
        >
          {t("logosStrip.topCta")}
        </LinkButton>
      </SectionContainer>
    </div>
  );
};

export const ProgramaLogosStrip = async () => {
  const t = await getTranslations("programaPage");

  return (
    <section aria-label={t("logosStrip.ariaLabel")}>
    <div className="bg-green-50 py-12 md:py-16">
      <SectionContainer className="grid gap-10 md:grid-cols-2 md:gap-16">
        <p className="max-w-[32rem] text-[1.5rem] leading-[1.25] sm:text-[1.75rem] md:text-[2rem] text-surface-bg">
          {t("logosStrip.leftLine1")}
          <br />
          {t("logosStrip.leftLine2")}
        </p>

        <p className="max-w-[32rem] justify-self-start text-[1.5rem] leading-[1.25] sm:text-[1.75rem] md:text-[2rem] text-surface-bg md:justify-self-end">
          <span className="font-bold text-green-500">
            {t("logosStrip.rightLead")}
          </span>
          <br />
          {t("logosStrip.rightBody")}
        </p>
      </SectionContainer>
    </div>
  </section>
  );
};
