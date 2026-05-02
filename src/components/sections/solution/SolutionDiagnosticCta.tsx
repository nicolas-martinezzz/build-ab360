import { getLocale, getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { getDiagnosticPathByLocale } from "@/config/routes";

export const SolutionDiagnosticCta = async () => {
  const locale = await getLocale();
  const t = await getTranslations("solutionPage.diagnosticCta");
  const diagnosticPath = getDiagnosticPathByLocale(locale);

  return (
    <section className="section-block bg-white">
      <SectionContainer className="text-center">
        <p className="figma-text-l mx-auto max-w-[74.75rem] text-surface-bg">
          {t("body")}
        </p>

        <div className="mt-10 flex justify-center md:mt-[4.3125rem]">
          <LinkButton
            href={diagnosticPath}
            variant="primary"
          >
            {t("cta")}
          </LinkButton>
        </div>
        <p className="mt-5 text-sm italic text-grey-dark/80">
          {t("hint")}
        </p>
      </SectionContainer>
    </section>
  );
};
