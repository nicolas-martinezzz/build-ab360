import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { LinkButton } from "@/components/ui/LinkButton";
import { MediaBackdrop } from "@/components/ui/MediaBackdrop";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_PATHS } from "@/config/routes";

type PartnersCtaBannerProps = {
  headline: string;
  cta: string;
  backgroundSrc: string;
  headlineClassName?: string;
  ctaWrapperClassName?: string;
};

export const PartnersCtaBanner = ({
  headline,
  cta,
  backgroundSrc,
  headlineClassName,
  ctaWrapperClassName,
}: PartnersCtaBannerProps) => (
  <section className="relative flex min-h-[35.5625rem] items-center justify-center py-16">
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
          "mx-auto max-w-[61.3125rem] text-[2rem] font-normal leading-[1.35] text-white md:text-[2.5rem] md:leading-[1.45] lg:text-[3rem]",
          headlineClassName ?? "",
        )}
      >
        {headline}
      </h2>

      <div className={twMerge("mt-12 flex justify-center", ctaWrapperClassName ?? "")}>
        <LinkButton
          href={SITE_PATHS.contact}
          variant="primary"
        >
          {cta}
        </LinkButton>
      </div>
    </SectionContainer>
  </section>
);
