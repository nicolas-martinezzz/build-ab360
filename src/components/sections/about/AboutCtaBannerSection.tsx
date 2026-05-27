import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { SITE_PATHS } from "@/config/routes";

export const AboutCtaBannerSection = async () => {
  const t = await getTranslations("aboutPage.partnersBanner");
  const tagline2 = t("tagline2");

  return (
    <section
      aria-labelledby="about-cta-banner-title"
      className="section-band relative isolate flex min-h-[28rem] items-center justify-center overflow-hidden sm:min-h-[35.5625rem]"
    >
      <Image
        alt=""
        aria-hidden
        className="object-cover object-center"
        fill
        priority={false}
        sizes="100vw"
        src={SITE_ASSETS.home.partnersCtaLounge}
      />
      <div aria-hidden className="absolute inset-0 bg-black/60" />
      <SectionContainer className="relative z-10 text-center">
        <h2
          className="figma-title-3 mx-auto max-w-[61.3125rem] text-white [overflow-wrap:anywhere]"
          id="about-cta-banner-title"
        >
          {t("headline")}
        </h2>
        <LinkButton
          className="mx-auto mt-10 w-full max-w-sm justify-center sm:w-auto"
          href={SITE_PATHS.reservaPlaza}
          variant="primary"
        >
          {t("cta")}
        </LinkButton>
        <p className="figma-text-m mt-6 text-white/80">
          {t("tagline1")}
          {tagline2 ? <><br />{tagline2}</> : null}
        </p>
      </SectionContainer>
    </section>
  );
};
