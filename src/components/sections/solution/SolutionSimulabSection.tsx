import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

const FeatureBlock = ({ title, body, icon }: { title: string; body: string; icon: string }) => (
  <div className="flex flex-col gap-4">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img alt="" aria-hidden height={40} src={icon} width={40} />
    <div className="flex flex-col gap-3">
      <h3 className="figma-text-l-bold text-surface-bg">{title}</h3>
      <p className="figma-text-m text-grey-dark">{body}</p>
    </div>
  </div>
);

export const SolutionSimulabSection = async () => {
  const t = await getTranslations("solutionPage.simulab");

  return (
    <section aria-label="SimuLab" className="section-block-spacious bg-white">
      <SectionContainer>

        {/* Intro — heading then body, single column */}
        <div className="flex flex-col gap-6 max-w-3xl">
          <h2 className="figma-title-2-bold text-surface-bg">
            {t("intro1")}
          </h2>
          <p className="figma-text-l text-surface-bg">{t("intro2")}</p>
        </div>

        {/* Demo iframe */}
        <div className="mt-10 w-full overflow-hidden rounded-[10px] lg:mt-14">
          <iframe
            className="h-[32rem] w-full sm:h-[40rem] lg:h-[46rem]"
            loading="lazy"
            src="/simulab-demo.html"
            title={t("imageAlt")}
          />
        </div>

        {/* Features — headline + 4-col grid */}
        <p className="figma-text-l mt-12 max-w-[42rem] text-grey-dark lg:mt-16">
          {t("featuresHeadline")}
        </p>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureBlock body={t("feature1Body")} icon="/images/icons/simulab-feature-1.png" title={t("feature1Title")} />
          <FeatureBlock body={t("feature2Body")} icon="/images/icons/simulab-feature-2.png" title={t("feature2Title")} />
          <FeatureBlock body={t("feature3Body")} icon="/images/icons/simulab-feature-3.png" title={t("feature3Title")} />
          <FeatureBlock body={t("feature4Body")} icon="/images/icons/simulab-feature-4.png" title={t("feature4Title")} />
        </div>

      </SectionContainer>
    </section>
  );
};
