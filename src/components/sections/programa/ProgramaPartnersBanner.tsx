import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { LinkButton } from "@/components/ui/LinkButton";
import { MediaBackdrop } from "@/components/ui/MediaBackdrop";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { SITE_PATHS } from "@/config/routes";

export const ProgramaPartnersBanner = async () => {
  const t = await getTranslations("programaPage.partnersBanner");

  return (
    <section className="relative flex min-h-[35.5625rem] items-center justify-center py-16">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          alt=""
          aria-hidden
          className="object-cover"
          fill
          sizes="100vw"
          src={SITE_ASSETS.solution.partnersBackground}
        />
        <MediaBackdrop opacity={0.6} />
      </div>

      <SectionContainer className="relative z-10 text-center">
        <h2 className="figma-title-2 mx-auto max-w-[61.3125rem] text-white">
          {t("headline")}
        </h2>

        <div className="mt-12 flex justify-center">
          <LinkButton
            className="h-[45px] px-5 text-base font-medium leading-[1.4]"
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
