import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { SITE_PATHS } from "@/config/routes";

export const PartnersBootcampCtaSection = async () => {
  const t = await getTranslations("home.partnersBootcampCta");

  return (
    <section
      aria-labelledby="partners-bootcamp-cta-title"
      className="relative isolate flex min-h-[28rem] items-center justify-center overflow-hidden py-14 sm:min-h-[35.5625rem] md:py-[4.625rem]"
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
          className="mx-auto max-w-[61.3125rem] text-[1.75rem] font-normal leading-[1.45] text-white [overflow-wrap:anywhere] sm:text-[2.125rem] md:text-[2.5rem]"
          id="partners-bootcamp-cta-title"
        >
          {t("headline")}
        </h2>
        <LinkButton
          className="mx-auto mt-[2.6875rem] w-full max-w-sm justify-center sm:w-auto"
          href={SITE_PATHS.reservaPlaza}
          variant="primary"
        >
          {t("cta")}
        </LinkButton>
      </SectionContainer>
    </section>
  );
};
