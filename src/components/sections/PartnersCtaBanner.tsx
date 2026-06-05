import Image from "next/image";
import { getLocale } from "next-intl/server";
import { twMerge } from "tailwind-merge";
import { LinkButton } from "@/components/ui/LinkButton";
import { MediaBackdrop } from "@/components/ui/MediaBackdrop";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { getBootcampPathByLocale } from "@/config/routes";

type PartnersCtaBannerProps = {
  headline: string;
  cta: string;
  backgroundSrc: string;
  taglineLine1?: string;
  taglineLine2?: string;
  headlineClassName?: string;
  ctaWrapperClassName?: string;
};

export const PartnersCtaBanner = async ({
  headline,
  cta,
  backgroundSrc,
  taglineLine1,
  taglineLine2,
  headlineClassName,
  ctaWrapperClassName,
}: PartnersCtaBannerProps) => {
  const locale = await getLocale();
  return (
  <section aria-labelledby="partners-cta-banner-title" className="relative flex min-h-[28rem] items-center justify-center py-16 sm:min-h-[35.5625rem]">
    <div className="absolute inset-0 overflow-hidden">
      <Image
        alt=""
        aria-hidden
        className="object-cover"
        fill
        sizes="100vw"
        src={backgroundSrc}
      />
      <MediaBackdrop opacity={0.6} />
    </div>

    <SectionContainer className="relative z-10 text-center">
      <h2
        className={twMerge(
          "figma-title-3 mx-auto max-w-[61.3125rem] font-normal text-white",
          headlineClassName ?? "",
        )}
        id="partners-cta-banner-title"
      >
        {headline}
      </h2>

      <div className={twMerge("mt-12 flex justify-center", ctaWrapperClassName ?? "")}>
        <LinkButton
          href={getBootcampPathByLocale(locale)}
          variant="primary"
        >
          {cta}
        </LinkButton>
      </div>
      {(taglineLine1 || taglineLine2) && (
        <p className="mt-5 text-sm italic leading-[1.65] text-white/82">
          {taglineLine1}
          {taglineLine2 ? <><br />{taglineLine2}</> : null}
        </p>
      )}
    </SectionContainer>
  </section>
  );
};
