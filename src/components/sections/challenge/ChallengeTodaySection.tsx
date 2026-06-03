import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";

export const ChallengeTodaySection = async () => {
  const t = await getTranslations("challengePage.todaySection");

  return (
    <section aria-labelledby="challenge-today-title" className="section-block bg-green-100/40 md:min-h-[56.3125rem]">
      <SectionContainer>
        <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,28rem)] lg:items-start lg:justify-between">
          <div>
            <p className="type-eyebrow text-grey-dark">{t("eyebrow")}</p>
            <h2 className="figma-title-2-bold mt-5 max-w-[46.6875rem] whitespace-pre-line text-black" id="challenge-today-title">
              {t("headline")}
            </h2>
            <p className="figma-text-l mt-8 max-w-[43.0625rem] text-black">{t("paragraph1")}</p>
            <p className="figma-text-l mt-4 max-w-[43.0625rem] text-black">{t("paragraph2")}</p>

            <article className="mt-10 max-w-[43.125rem] border-l-2 border-green-500 pl-5">
              <h3 className="figma-text-l-bold uppercase text-green-500">{t("taxonomy.title")}</h3>
              <p className="figma-text-l-bold mb-5 mt-0 text-green-500">{t("taxonomy.body")}</p>
              <p className="figma-text-m text-green-500 underline decoration-green-500 underline-offset-2">
                {t("taxonomy.source")}
              </p>
            </article>
          </div>

          <div className="mx-auto w-full max-w-[35.5rem] lg:pt-14">
            <Image
              alt={t("pillarsImageAlt")}
              className="h-auto w-full"
              height={682}
              priority={false}
              src={SITE_ASSETS.challenge.taxonomyPillars}
              width={568}
            />
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};
