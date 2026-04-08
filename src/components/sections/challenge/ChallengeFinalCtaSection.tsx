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
      className="relative isolate flex min-h-[min(70svh,32rem)] items-center justify-center overflow-hidden py-20 sm:min-h-[28rem] sm:py-24 md:min-h-[32rem] md:py-32"
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

      <SectionContainer className="relative z-10 text-center" width="narrow">
        <h2
          className="mx-auto max-w-4xl text-2xl font-medium leading-snug text-white sm:text-3xl md:text-4xl"
          id="challenge-final-cta-title"
        >
          <span className="block">{t("line1")}</span>
          <span className="mt-2 block">{t("line2")}</span>
        </h2>
        <LinkButton
          className="mx-auto mt-8 min-h-12 w-full max-w-xs justify-center sm:mt-10 sm:w-auto sm:min-w-[14rem]"
          href={SITE_PATHS.contact}
          variant="primary"
        >
          {t("cta")}
        </LinkButton>
      </SectionContainer>
    </section>
  );
};
