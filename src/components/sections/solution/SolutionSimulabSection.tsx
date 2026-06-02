import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

const FeatureBlock = ({ title, body }: { title: string; body: string }) => (
  <div className="flex flex-col gap-1.5">
    <h3 className="figma-text-l-bold text-surface-bg">{title}</h3>
    <p className="figma-text-l text-grey-dark">{body}</p>
  </div>
);

export const SolutionSimulabSection = async () => {
  const t = await getTranslations("solutionPage.simulab");

  return (
    <section aria-label="SimuLab" className="section-block bg-white">
      <SectionContainer>
        <div className="mx-auto w-full max-w-[75rem] overflow-hidden rounded-[10px]">
          <iframe
            className="h-[32rem] w-full sm:h-[40rem] lg:h-[46rem]"
            loading="lazy"
            src="/simulab-demo.html"
            title={t("imageAlt")}
          />
        </div>

        <div className="mt-10 grid gap-8 lg:mt-12 lg:grid-cols-[23.375rem_1fr] lg:gap-14">
          <div className="w-full max-w-[23.375rem]">
            <p className="figma-text-l text-surface-bg">{t("intro1")}</p>
            <p className="figma-text-l mt-3 text-surface-bg md:mt-4">{t("intro2")}</p>
            <p className="figma-text-l mt-3 font-semibold text-green-500 md:mt-4">{t("intro3")}</p>
          </div>

          <div className="grid gap-y-8 md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            <FeatureBlock body={t("feature1Body")} title={t("feature1Title")} />
            <FeatureBlock body={t("feature2Body")} title={t("feature2Title")} />
            <FeatureBlock body={t("feature3Body")} title={t("feature3Title")} />
            <FeatureBlock body={t("feature4Body")} title={t("feature4Title")} />
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
