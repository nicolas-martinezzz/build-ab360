import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { Link } from "@/i18n/navigation";
import { EbookSection } from "@/components/sections/resources/EbookSection";
import { ArticleEbookBanner } from "@/components/sections/resources/ArticleEbookBanner";
import { ArticleCard } from "@/components/sections/resources/ArticleCard";
import { ALL_ARTICLES, getArticleBySlug, getRelatedArticles } from "@/content/articles";
import type { ArticleSection } from "@/content/articles";
import { SITE_PATHS } from "@/config/routes";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const locales = ["es", "en", "ca"];
  return locales.flatMap((locale) =>
    ALL_ARTICLES.map((article) => ({ locale, slug: article.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const article = getArticleBySlug(slug);
  if (!article) return {};

  const lang = locale as "es" | "en" | "ca";
  const translation = article.translations[lang] ?? article.translations.es;

  return {
    title: translation.seoTitle,
    description: translation.seoDescription,
    openGraph: {
      title: translation.seoTitle,
      description: translation.seoDescription,
      images: [article.coverImage],
      type: "article",
      publishedTime: article.publishedAt,
    },
  };
}

function renderSection(section: ArticleSection, index: number) {
  switch (section.type) {
    case "paragraph":
      return (
        <p className="leading-[1.6] text-surface-bg/80 sm:leading-[1.75]" key={index}>
          {section.text}
        </p>
      );
    case "heading":
      if (section.level === 2) {
        return (
          <h2 className="mt-4 text-[1.2rem] font-bold leading-tight text-surface-bg sm:text-[1.35rem] md:text-[1.5rem]" key={index}>
            {section.text}
          </h2>
        );
      }
      return (
        <h3 className="mt-3 text-[1.2rem] font-semibold leading-tight text-surface-bg" key={index}>
          {section.text}
        </h3>
      );
    case "list":
      return (
        <ul className="flex flex-col gap-2 pl-4 sm:gap-2.5 sm:pl-6" key={index}>
          {section.items.map((item, i) => (
            <li className="list-disc leading-relaxed text-surface-bg/80" key={i}>
              {item}
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote
          className="border-l-4 border-green-500 pl-5 italic text-surface-bg/70"
          key={index}
        >
          <p>{section.text}</p>
          {section.attribution ? (
            <footer className="mt-2 text-sm font-medium not-italic text-surface-bg/50">
              — {section.attribution}
            </footer>
          ) : null}
        </blockquote>
      );
    case "callout":
      return (
        <div
          className="rounded-[10px] bg-green-50 px-6 py-5 text-surface-bg/80"
          key={index}
        >
          {section.text}
        </div>
      );
    default:
      return null;
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const lang = locale as "es" | "en" | "ca";
  const translation = article.translations[lang] ?? article.translations.es;
  const related = getRelatedArticles(slug, 2);

  const t = await getTranslations("resourcesPage");

  const ebookT = {
    eyebrow: t("ebook.eyebrow"),
    title: t("ebook.title"),
    subtitle: t("ebook.subtitle"),
    emailPlaceholder: t("ebook.emailPlaceholder"),
    consentLabel: t("ebook.consentLabel"),
    consentLinkLabel: t("ebook.consentLinkLabel"),
    ctaButton: t("ebook.ctaButton"),
    submitButton: t("ebook.submitButton"),
    successTitle: t("ebook.successTitle"),
    downloadButton: t("ebook.downloadButton"),
    errorMessage: t("ebook.errorMessage"),
    botBlockedMessage: t("ebook.botBlockedMessage"),
  };

  const categoryLabels: Record<string, string> = {
    all: t("categories.all"),
    datos: t("categories.datos"),
    sostenibilidad: t("categories.sostenibilidad"),
    tecnologia: t("categories.tecnologia"),
    estrategia: t("categories.estrategia"),
  };

  const date = new Date(article.publishedAt).toLocaleDateString(
    locale === "ca" ? "ca-ES" : locale === "en" ? "en-GB" : "es-ES",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <>
      {/* Back navigation */}
      <div className="border-b border-surface-bg/10 bg-[#f4f6f3]">
        <SectionContainer className="py-3">
          <Link
            className="flex w-fit items-center gap-1.5 text-sm text-surface-bg/60 transition hover:text-surface-bg"
            href={SITE_PATHS.resources}
          >
            <span aria-hidden>←</span>
            {t("articlePage.backToResources")}
          </Link>
        </SectionContainer>
      </div>

      {/* Article hero */}
      <article>
        <header className="bg-surface-bg pb-10 pt-12 md:pb-14 md:pt-20">
          <SectionContainer>
            <div className="mx-auto max-w-3xl">
              <div className="flex flex-wrap gap-2">
                {article.categories.map((cat) => (
                  <span
                    className="rounded-[5px] bg-white/10 px-2.5 py-1 text-[0.8125rem] leading-none text-white/70"
                    key={cat}
                  >
                    {categoryLabels[cat] ?? cat}
                  </span>
                ))}
              </div>
              <h1 className="mt-4 text-[1.75rem] font-bold leading-[1.2] text-white sm:text-[2.25rem] md:text-[2.75rem]">
                {translation.title}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
                {translation.excerpt}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-white/50">
                <span>
                  {t("articlePage.authorBy")} {article.author} · {article.authorRole}
                </span>
                <span aria-hidden className="hidden sm:inline">·</span>
                <span>
                  {t("articlePage.publishedOn")} {date}
                </span>
                <span aria-hidden className="hidden sm:inline">·</span>
                <span>
                  {article.readingTimeMin} {t("articlePage.minRead")}
                </span>
              </div>
            </div>
          </SectionContainer>
        </header>

        {/* Article body */}
        <div className="bg-white py-12 md:py-16">
          <SectionContainer>
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
              {/* Cover image — constrained to article width */}
              <div className="relative h-[14rem] w-full overflow-hidden rounded-[10px] sm:h-[18rem] md:h-[24rem]">
                <Image
                  alt={article.coverImageAlt}
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                  src={article.coverImage}
                />
              </div>
              <ArticleEbookBanner
                buttonLabel={t("ebookBanner.button")}
                eyebrow={t("ebookBanner.eyebrow")}
                title={t("ebookBanner.title")}
              />
              {translation.content.map((section, i) => renderSection(section, i))}
            </div>
          </SectionContainer>
        </div>
      </article>

      {/* Related articles */}
      {related.length > 0 ? (
        <section
          aria-label={t("articlePage.relatedTitle")}
          className="bg-[#f4f6f3] py-14 md:py-20"
        >
          <SectionContainer>
            <h2 className="mb-8 text-[1.5rem] font-bold text-surface-bg">
              {t("articlePage.relatedTitle")}
            </h2>
            <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2">
              {related.map((rel) => (
                <li className="flex" key={rel.slug}>
                  <ArticleCard
                    article={rel}
                    categoryLabels={categoryLabels}
                    featuredLabel={t("grid.featured")}
                    locale={locale}
                    minReadLabel={t("grid.minRead")}
                    readMoreLabel={t("grid.readMore")}
                  />
                </li>
              ))}
            </ul>
          </SectionContainer>
        </section>
      ) : null}

      {/* Ebook CTA */}
      <EbookSection sourceArticle={slug} t={ebookT} />
    </>
  );
}
