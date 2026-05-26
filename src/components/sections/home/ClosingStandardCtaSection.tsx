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
          className="figma-title-2 mx-auto max-w-[72rem] [overflow-wrap:anywhere]"
          id="closing-standard-cta-title"
        >
          {t("titleLine1")} {t("titleLine2")}
        </h2>
        <LinkButton
          className="mx-auto mt-8 w-full max-w-xs border-white/60 bg-transparent px-6 text-white hover:bg-white/10 focus-visible:ring-offset-green-600 sm:w-auto"
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
