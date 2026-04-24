import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_PATHS } from "@/config/routes";

export const ClosingStandardCtaSection = async () => {
  const t = await getTranslations("home.closingStandardCta");

  return (
    <section
      aria-labelledby="closing-standard-cta-title"
      className="bg-green-600 py-12 text-center text-white md:min-h-[18.625rem] md:py-[4.375rem]"
    >
      <SectionContainer className="text-center">
        <h2
          className="mx-auto max-w-[63.5625rem] text-[1.875rem] font-normal leading-[1.22] [overflow-wrap:anywhere] md:text-[2rem]"
          id="closing-standard-cta-title"
        >
          <span className="block">{t("titleLine1")}</span>
          <span className="mt-1.5 block">{t("titleLine2")}</span>
        </h2>
        <LinkButton
          className="mx-auto mt-[2.25rem] w-full max-w-xs focus-visible:ring-offset-green-600 sm:w-auto"
          href={SITE_PATHS.contact}
          variant="dark"
        >
          {t("cta")}
        </LinkButton>
      </SectionContainer>
    </section>
  );
};
