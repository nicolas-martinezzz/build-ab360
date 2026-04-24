import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_PATHS } from "@/config/routes";

export const SolutionDiagnosticCta = async () => {
  const t = await getTranslations("solutionPage.diagnosticCta");

  return (
    <section className="section-block bg-white">
      <SectionContainer className="text-center">
        <p className="figma-text-l mx-auto max-w-[74.75rem] text-surface-bg">
          {t("body")}
        </p>

        <div className="mt-10 flex justify-center md:mt-[4.3125rem]">
          <LinkButton
            href={SITE_PATHS.contact}
            variant="primary"
          >
            {t("cta")}
          </LinkButton>
        </div>
      </SectionContainer>
    </section>
  );
};
