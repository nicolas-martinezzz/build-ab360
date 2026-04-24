import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { SITE_PATHS } from "@/config/routes";

export const ChallengeFinalCtaSection = async () => {
  const t = await getTranslations("challengePage.finalCtaSection");

  return (
    <section
      aria-labelledby="challenge-final-cta-title"
      className="relative isolate flex min-h-[35.5625rem] items-center justify-center overflow-hidden py-14 md:py-[4.8125rem]"
    >
      <Image
        alt=""
        aria-hidden
        className="object-cover object-center"
        fill
        priority={false}
        sizes="100vw"
        src={SITE_ASSETS.challenge.rectangle64}
      />
      <div aria-hidden className="absolute inset-0 bg-black/60" />

      <SectionContainer className="relative z-10 text-center">
        <h2
          className="figma-title-3 mx-auto max-w-[74.75rem] text-white"
          id="challenge-final-cta-title"
        >
          <span className="block">{t("line1")}</span>
          <span className="block">{t("line2")}</span>
        </h2>
        <LinkButton
          className="mx-auto mt-10 w-full max-w-xs justify-center sm:w-auto"
          href={SITE_PATHS.contact}
          variant="primary"
        >
          {t("cta")}
        </LinkButton>
      </SectionContainer>
    </section>
  );
};
