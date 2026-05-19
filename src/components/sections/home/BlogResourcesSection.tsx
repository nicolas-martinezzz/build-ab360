import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { LinkButton } from "@/components/ui/LinkButton";
import { Link } from "@/i18n/navigation";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { ALL_ARTICLES, ALL_EBOOKS } from "@/content/articles";
import { formatArticleDate } from "@/lib/dateFormat";

export const BlogResourcesSection = async () => {
  const t = await getTranslations("home.blogResources");
  const locale = await getLocale();
  const lang = locale as "es" | "en" | "ca";

  const latestArticles = ALL_ARTICLES.slice(0, 2);
  const ebooks = ALL_EBOOKS.slice(0, 2);

  return (
    <section aria-labelledby="blog-resources-title" className="bg-green-100/40 py-16 md:py-20">
      <SectionContainer>

        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-grey-dark">
              {t("eyebrow")}
            </p>
            <h2 className="mt-2 text-[2rem] font-normal leading-[1.15] text-surface-bg sm:text-[2.25rem]" id="blog-resources-title">
              {t("title")}
            </h2>
          </div>
          <LinkButton
            className="h-9 self-start rounded-[5px] border border-green-500 bg-transparent px-4 text-sm font-medium text-green-500 hover:bg-green-100/50 md:self-auto"
            href={t("ctaHref")}
            variant="text"
          >
            {t("cta")}
          </LinkButton>
        </div>

        {/* Articles */}
        <ul className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2">
          {latestArticles.map((article) => {
            const tr = article.translations[lang] ?? article.translations.es;
            return (
              <li key={article.slug}>
                <Link className="group block h-full" href={`/resources/${article.slug}`}>
                  <article className="flex h-full flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_4px_14px_rgba(28,30,46,0.08)] transition hover:shadow-[0_8px_24px_rgba(28,30,46,0.14)]">
                    <div className="relative h-[13rem] w-full shrink-0 overflow-hidden sm:h-[15rem]">
                      <Image
                        alt={article.coverImageAlt}
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        src={article.coverImage}
                      />
                      <span className="absolute left-3 top-3 rounded-[5px] bg-green-500 px-4 py-1.5 text-[0.9375rem] font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
                        {t("articleBadge")}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 px-5 py-5">
                      <p className="text-[0.75rem] leading-none text-grey-dark">
                        {formatArticleDate(article.publishedAt, locale)} · {article.readingTimeMin} {t("minRead")}
                      </p>
                      <h3 className="text-[1.25rem] font-bold leading-[1.3] text-surface-bg transition group-hover:text-green-700">
                        {tr.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {article.categories.slice(0, 2).map((cat) => (
                          <span
                            className="rounded-[5px] bg-green-100 px-2.5 py-1 text-[0.8125rem] leading-none text-surface-bg"
                            key={cat}
                          >
                            {t(`categories.${cat}`)}
                          </span>
                        ))}
                      </div>
                      <p className="mt-auto text-sm text-surface-bg/60">
                        {article.author} · {article.authorRole}
                      </p>
                    </div>
                  </article>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Ebooks */}
        {ebooks.length > 0 && (
          <>
            <div className="my-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-surface-bg/10" />
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-surface-bg/40">
                {t("ebookBadge")}
              </span>
              <div className="h-px flex-1 bg-surface-bg/10" />
            </div>
            <ul className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2">
              {ebooks.map((ebook, i) => {
                const tr = ebook.translations[lang] ?? ebook.translations.es;
                return (
                  <li key={`${ebook.slug}-${i}`}>
                    <Link className="group block h-full" href={`/resources/${ebook.slug}`}>
                      <article className="flex h-full flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_4px_14px_rgba(28,30,46,0.08)] transition hover:shadow-[0_8px_24px_rgba(28,30,46,0.14)]">
                        <div className="relative h-[13rem] w-full shrink-0 overflow-hidden sm:h-[15rem]">
                          <Image
                            alt={ebook.coverImageAlt}
                            className="object-cover transition duration-300 group-hover:scale-[1.02]"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            src={ebook.coverImage}
                          />
                          <span className="absolute left-3 top-3 rounded-[5px] bg-green-500 px-4 py-1.5 text-[0.9375rem] font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
                            {t("ebookBadge")}
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col gap-3 px-5 py-5">
                          <h3 className="text-[1.25rem] font-bold leading-[1.3] text-surface-bg transition group-hover:text-green-700">
                            {tr.title}
                          </h3>
                          <p className="mt-auto text-sm font-medium text-green-600">
                            {t("viewEbook")} →
                          </p>
                        </div>
                      </article>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}

      </SectionContainer>
    </section>
  );
};
