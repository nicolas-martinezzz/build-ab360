import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";

export const ChallengeTodaySection = async () => {
  const t = await getTranslations("challengePage.todaySection");

  return (
    <section className="bg-green-100 py-16 sm:py-20 md:py-24">
      <SectionContainer>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_25rem] xl:gap-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-grey-dark sm:text-sm">{t("eyebrow")}</p>
            <h2 className="mt-4 max-w-3xl whitespace-pre-line text-2xl font-semibold leading-tight text-surface-bg sm:text-3xl md:text-4xl">
              {t("headline")}
            </h2>
            <p className="mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-surface-bg/80 sm:text-base">{t("paragraph1")}</p>
            <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-surface-bg/80 sm:text-base">{t("paragraph2")}</p>

            <article className="mt-7 max-w-3xl border-l-2 border-green-500 pl-4 sm:pl-5">
              <h3 className="text-2xl font-semibold leading-tight text-green-500 sm:text-3xl">{t("taxonomy.title")}</h3>
              <p className="mt-2 text-xl leading-snug text-green-500 sm:text-2xl">{t("taxonomy.body")}</p>
              <p className="mt-3 text-sm text-green-500/80 underline decoration-green-500/60 underline-offset-2">
                {t("taxonomy.source")}
              </p>
            </article>
          </div>

          <div className="mx-auto w-full max-w-md lg:pt-2">
            <Image
              alt={t("pillarsImageAlt")}
              className="h-auto w-full"
              height={956}
              priority={false}
              src={SITE_ASSETS.challenge.taxonomyPillars}
              width={704}
            />
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
