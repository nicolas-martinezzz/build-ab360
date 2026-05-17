import Image from "next/image";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { EbookLeadForm } from "./EbookLeadForm";

interface EbookSectionProps {
  t: {
    eyebrow: string;
    title: string;
    subtitle: string;
    emailPlaceholder: string;
    consentLabel: string;
    consentLinkLabel: string;
    ctaButton: string;
    submitButton: string;
    successTitle: string;
    downloadButton: string;
    errorMessage: string;
    botBlockedMessage: string;
  };
  sourceArticle?: string;
}

export const EbookSection = ({ t, sourceArticle }: EbookSectionProps) => {
  return (
    <section
      aria-label={t.eyebrow}
      className="bg-surface-bg py-16 md:py-20"
      id="ebook-cta"
    >
      <SectionContainer>
        <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-20">
          {/* Text side */}
          <div className="flex flex-col justify-center gap-5">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-green-400">
              {t.eyebrow}
            </p>
            <h2 className="text-[1.75rem] font-bold leading-[1.2] text-white sm:text-[2rem] md:text-[2.25rem] lg:text-[2.5rem]">
              {t.title}
            </h2>
            <p className="text-base leading-relaxed text-white/70">
              {t.subtitle}
            </p>
            <div className="mt-2 w-full max-w-sm">
              <EbookLeadForm
                botBlockedMessage={t.botBlockedMessage}
                consentLabel={t.consentLabel}
                consentLinkLabel={t.consentLinkLabel}
                ctaButton={t.ctaButton}
                downloadButton={t.downloadButton}
                emailPlaceholder={t.emailPlaceholder}
                errorMessage={t.errorMessage}
                sourceArticle={sourceArticle}
                submitButton={t.submitButton}
                successTitle={t.successTitle}
              />
            </div>
          </div>

          {/* Ebook cover image — hidden on mobile, shown md+ */}
          <div className="hidden items-center justify-center md:flex">
            <div className="relative aspect-[3/4] w-full max-w-[320px] overflow-hidden rounded-[10px] shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              <Image
                alt="AB360 Ebook - Guía práctica para escalar el Inbound Marketing"
                className="object-cover"
                fill
                priority={false}
                sizes="320px"
                src={SITE_ASSETS.resources.ebookCover}
              />
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
