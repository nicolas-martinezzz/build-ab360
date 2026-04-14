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
      className="relative isolate flex min-h-[min(72svh,34rem)] items-center justify-center overflow-hidden py-24 sm:min-h-[30rem] sm:py-28 md:min-h-[34rem] md:py-36"
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
      <SectionContainer className="relative z-10 text-center" width="narrow">
        <h2
          className="type-title text-white [overflow-wrap:anywhere] md:leading-snug"
          id="partners-bootcamp-cta-title"
        >
          {t("headline")}
        </h2>
        <LinkButton
          className="mx-auto mt-10 min-h-12 w-full max-w-sm justify-center sm:mt-12 sm:w-auto sm:min-w-[14rem]"
          href={SITE_PATHS.contact}
          variant="primary"
        >
          {t("cta")}
        </LinkButton>
      </SectionContainer>
    </section>
  );
};
