import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";

const ARTICLE_KEYS = ["article1", "article2"] as const;

export const BlogResourcesSection = async () => {
  const t = await getTranslations("home.blogResources");

  return (
    <section aria-labelledby="blog-resources-title" className="bg-green-100/40 py-14 md:py-[4.3125rem]">
      <SectionContainer>
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.08em] text-grey-dark">{t("eyebrow")}</p>
            <h2 className="mt-1 text-[2.5rem] font-normal leading-[1.2] text-surface-bg" id="blog-resources-title">
              {t("title")}
            </h2>
          </div>
          <LinkButton
            className="h-9 self-start rounded-[5px] border border-green-500 bg-transparent px-4 py-2 text-sm font-medium text-green-500 hover:bg-green-100/50"
            href={t("ctaHref")}
            variant="text"
          >
            {t("cta")}
          </LinkButton>
        </div>

        <ul className="mt-9 grid list-none grid-cols-1 gap-5 p-0 md:grid-cols-2">
          {ARTICLE_KEYS.map((key) => (
            <li key={key}>
              <article className="overflow-hidden rounded-[10px] bg-white shadow-[0_4px_14px_rgba(28,30,46,0.08)]">
                <div className="relative h-[16rem] w-full">
                  <Image
                    alt={t(`${key}.imageAlt`)}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    src={SITE_ASSETS.home.blogArticleCover}
                  />
                </div>
                <div className="px-5 pb-4 pt-3">
                  <p className="text-[0.75rem] leading-[1.4] text-grey-dark">{t(`${key}.meta`)}</p>
                  <h3 className="mt-3 text-[2.0625rem] font-bold leading-[1.25] text-black">{t(`${key}.title`)}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-[5px] bg-green-100 px-2.5 py-1 text-[0.8125rem] leading-none text-surface-bg">
                      {t(`${key}.tag1`)}
                    </span>
                    <span className="rounded-[5px] bg-green-100 px-2.5 py-1 text-[0.8125rem] leading-none text-surface-bg">
                      {t(`${key}.tag2`)}
                    </span>
                  </div>
                  <p className="mt-3 text-[0.9375rem] leading-[1.4] text-surface-bg">{t(`${key}.author`)}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </SectionContainer>
    </section>
  );
};
