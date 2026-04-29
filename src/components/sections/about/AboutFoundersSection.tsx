import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { Link } from "@/i18n/navigation";

const FOUNDER_KEYS = ["founder1", "founder2", "founder3"] as const;

const FOUNDER_PHOTOS = {
  founder1: SITE_ASSETS.about.founderJuanjoMoreno,
  founder2: SITE_ASSETS.about.founderEduardoNunez,
  founder3: SITE_ASSETS.about.founderIvanPerez,
} as const;

export const AboutFoundersSection = async () => {
  const t = await getTranslations("aboutPage.founders");

  return (
    <section aria-labelledby="about-founders-title" className="section-block bg-green-50">
      <SectionContainer>
        <p className="type-eyebrow text-grey-dark/90">{t("eyebrow")}</p>
        <h2
          className="figma-title-2-bold mt-3 max-w-[46rem] text-surface-bg"
          id="about-founders-title"
        >
          {t("title")}
        </h2>

        <ul className="mt-10 grid list-none gap-6 p-0 md:grid-cols-3 md:gap-5">
          {FOUNDER_KEYS.map((key) => {
            const linkedinUrl = t(`${key}.linkedinUrl`);
            return (
              <li key={key} className="flex flex-col">
                <div className="relative aspect-square w-full overflow-hidden bg-grey-light/20 grayscale">
                  <Image
                    alt={t(`${key}.name`)}
                    className="object-cover object-top"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    src={FOUNDER_PHOTOS[key]}
                  />
                </div>
                <div className="mt-4 flex flex-1 flex-col">
                  <p className="figma-title-3 text-surface-bg">
                    {t(`${key}.name`)}
                  </p>
                  <p className="figma-text-l mt-1 text-surface-bg/90">{t(`${key}.role`)}</p>
                  <blockquote className="figma-text-l mt-4 border-l-2 border-green-500 pl-3 italic leading-relaxed text-green-700">
                    &ldquo;{t(`${key}.quote`)}&rdquo;
                  </blockquote>
                  <p className="figma-text-m mt-4 max-w-[34ch] leading-relaxed text-grey-dark">
                    {t(`${key}.bio`)}
                  </p>
                  {linkedinUrl && (
                    <Link
                      className="figma-text-m mt-4 inline-flex min-h-10 items-center gap-1.5 self-start rounded-[4px] border border-green-500/55 px-3.5 py-2 text-green-700 transition-colors hover:bg-green-100/30"
                      href={linkedinUrl as never}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("linkedin")}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </SectionContainer>
    </section>
  );
};
