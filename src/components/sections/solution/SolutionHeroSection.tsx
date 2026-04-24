import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { LinkButton } from "@/components/ui/LinkButton";
import { MediaBackdrop } from "@/components/ui/MediaBackdrop";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { SITE_PATHS } from "@/config/routes";

export const SolutionHeroSection = async () => {
  const t = await getTranslations("solutionPage.hero");

  return (
    <section
      aria-labelledby="solution-hero-heading"
      className="relative flex min-h-[44.8125rem] items-start pt-24 pb-16 md:pt-32 md:pb-20 lg:pt-36"
    >
      <div className="absolute inset-0 overflow-hidden">
        <Image
          alt=""
          aria-hidden
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src={SITE_ASSETS.solution.heroBackground}
        />
        <MediaBackdrop opacity={0.5} />
      </div>

      <SectionContainer className="relative z-10">
        <div className="flex flex-wrap items-center gap-4">
          <p className="figma-text-l text-white">{t("eyebrow")}</p>
          <span className="figma-text-m rounded-[5px] border border-green-200 bg-white px-2.5 py-[3px] text-green-500">
            {t("badge")}
          </span>
        </div>

        <h1
          className="figma-title-1 mt-4 max-w-[57.5rem] text-white"
          id="solution-hero-heading"
        >
          {t("headline")}
        </h1>

        <p className="figma-text-l mt-6 max-w-[55.8125rem] whitespace-pre-line text-white">
          {t("body")}
        </p>

        <LinkButton
          className="mt-8 w-full sm:w-auto"
          href={SITE_PATHS.contact}
          variant="primary"
        >
          {t("cta")}
        </LinkButton>
      </SectionContainer>
    </section>
  );
};
