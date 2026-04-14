import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_PATHS } from "@/config/routes";

export const ClosingStandardCtaSection = async () => {
  const t = await getTranslations("home.closingStandardCta");

  return (
    <section
      aria-labelledby="closing-standard-cta-title"
      className="bg-green-600 py-16 text-center text-white sm:py-20 md:py-24"
    >
      <SectionContainer className="text-center" width="narrow">
        <h2
          className="text-[1.75rem] font-normal leading-[1.22] [overflow-wrap:anywhere] sm:text-[2rem]"
          id="closing-standard-cta-title"
        >
          <span className="block">{t("titleLine1")}</span>
          <span className="mt-2 block sm:mt-3">{t("titleLine2")}</span>
        </h2>
        <LinkButton
          className="mx-auto mt-8 min-h-12 w-full max-w-xs focus-visible:ring-offset-green-600 sm:mt-10 sm:w-auto"
          href={SITE_PATHS.contact}
          variant="dark"
        >
          {t("cta")}
        </LinkButton>
      </SectionContainer>
    </section>
  );
};
