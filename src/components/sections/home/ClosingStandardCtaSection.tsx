import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_PATHS } from "@/config/routes";

export const ClosingStandardCtaSection = async () => {
  const t = await getTranslations("home.closingStandardCta");

  return (
    <section
      aria-labelledby="closing-standard-cta-title"
      className="section-band bg-green-600 text-center text-white md:min-h-[18.625rem]"
    >
      <SectionContainer className="text-center">
        <h2
          className="mx-auto max-w-[52rem] text-[1.625rem] font-normal leading-[1.24] [overflow-wrap:anywhere] sm:text-[2rem] md:text-[2.625rem]"
          id="closing-standard-cta-title"
        >
          <span className="block">{t("titleLine1")}</span>
          <span className="mt-1 block">{t("titleLine2")}</span>
        </h2>
        <LinkButton
          className="mx-auto mt-8 h-[45px] w-full max-w-xs border-white/60 bg-transparent px-6 text-base font-medium text-white hover:bg-white/10 focus-visible:ring-offset-green-600 sm:w-auto"
          href={SITE_PATHS.contact}
          variant="outlineInverse"
        >
          {t("cta")}
        </LinkButton>
        <p className="figma-text-m mt-4 italic text-white/70">{t("hint")}</p>
      </SectionContainer>
    </section>
  );
};
