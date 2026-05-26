import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { Link } from "@/i18n/navigation";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { ALL_ARTICLES, ALL_EBOOKS } from "@/content/articles";
import { formatArticleDate } from "@/lib/dateFormat";
import { SITE_PATHS } from "@/config/routes";

export const BlogResourcesSection = async () => {
  const t = await getTranslations("home.blogResources");
  const locale = await getLocale();
  const lang = locale as "es" | "en" | "ca";

  const latestArticles = ALL_ARTICLES.slice(0, 2);
  const ebooks = ALL_EBOOKS.slice(0, 2);

  return (
    <section aria-labelledby="blog-resources-title" className="section-block bg-green-100/40">
      <SectionContainer>

        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="type-eyebrow text-grey-dark">{t("eyebrow")}</p>
            <h2 className="figma-title-3 mt-2 text-surface-bg" id="blog-resources-title">
              {t("title")}
            </h2>
          </div>
          <LinkButton
            className="self-start md:self-auto"
            href={SITE_PATHS.resources}
            variant="outline"
          >
            {t("cta")}
          </LinkButton>
        </div>

        {/* Unified grid: articles + ebooks together */}
        <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {latestArticles.map((article) => {
            const tr = article.translations[lang] ?? article.translations.es;
            return (
              <li key={article.slug}>
                <Link className="group block h-full" href={`${SITE_PATHS.resources}/${article.slug}`}>
                  <article className="flex h-full flex-col overflow-hidden rounded-[10px] bg-white shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-card-hover)]">
                    <div className="relative h-[13rem] w-full shrink-0 overflow-hidden sm:h-[15rem]">
                      <Image
                        alt={article.coverImageAlt}
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        src={article.coverImage}
                      />
                      <span className="absolute left-3 top-3 rounded-[5px] bg-green-500 px-4 py-1.5 figma-text-m font-semibold text-white shadow-[var(--shadow-card-sm)]">
                        {t("articleBadge")}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 px-5 py-5">
                      <p className="figma-text-m leading-none text-grey-dark">
                        {formatArticleDate(article.publishedAt, locale)} · {article.readingTimeMin} {t("minRead")}
                      </p>
                      <h3 className="figma-card-title text-surface-bg transition group-hover:text-green-700">
                        {tr.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {article.categories.slice(0, 2).map((cat) => (
                          <span
                            className="rounded-[5px] bg-green-100 px-2.5 py-1 figma-text-m leading-none text-surface-bg"
                            key={cat}
                          >
                            {t(`categories.${cat}`)}
                          </span>
                        ))}
                      </div>
                      <p className="figma-text-m mt-auto text-surface-bg/60">
                        {article.author} · {article.authorRole}
                      </p>
                    </div>
                  </article>
                </Link>
              </li>
            );
          })}
          {ebooks.slice(0, 1).map((ebook) => {
            const tr = ebook.translations[lang] ?? ebook.translations.es;
            return (
              <li key={ebook.slug}>
                <Link className="group block h-full" href={`${SITE_PATHS.resources}/${ebook.slug}`}>
                  <article className="flex h-full flex-col overflow-hidden rounded-[10px] bg-white shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-card-hover)]">
                    <div className="relative h-[13rem] w-full shrink-0 overflow-hidden sm:h-[15rem]">
                      <Image
                        alt={ebook.coverImageAlt}
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        src={ebook.coverImage}
                      />
                      <span className="absolute left-3 top-3 rounded-[5px] bg-green-500 px-4 py-1.5 figma-text-m font-semibold text-white shadow-[var(--shadow-card-sm)]">
                        {t("ebookBadge")}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 px-5 py-5">
                      <h3 className="figma-card-title text-surface-bg transition group-hover:text-green-700">
                        {tr.title}
                      </h3>
                      <p className="figma-text-m mt-auto font-medium text-green-600">
                        {t("viewEbook")} <span aria-hidden>→</span>
                      </p>
                    </div>
                  </article>
                </Link>
              </li>
            );
          })}
        </ul>

      </SectionContainer>
    </section>
  );
};
