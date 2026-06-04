import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { Link } from "@/i18n/navigation";
import { ArticleCard } from "@/components/sections/resources/ArticleCard";
import { EbookLeadForm } from "@/components/sections/resources/EbookLeadForm";
import { ALL_CONTENT, ALL_ARTICLES, getArticleBySlug, getRelatedArticles } from "@/content/articles";
import type { ArticleSection } from "@/content/articles";
import { SITE_PATHS } from "@/config/routes";
import { formatArticleDate } from "@/lib/dateFormat";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const locales = ["es", "en", "ca"];
  return locales.flatMap((locale) =>
    ALL_CONTENT.map((item) => ({ locale, slug: item.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const article = getArticleBySlug(slug);
  if (!article) return {};

  const lang = locale as "es" | "en" | "ca";
  const translation = article.translations[lang] ?? article.translations.es;
  const localeMap: Record<string, string> = { es: "es_ES", en: "en_US", ca: "ca_ES" };
  const canonicalUrl = `https://yutopias.com/${locale}/resources/${slug}`;

  return {
    title: translation.seoTitle,
    description: translation.seoDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        es: `https://yutopias.com/es/resources/${slug}`,
        en: `https://yutopias.com/en/resources/${slug}`,
        ca: `https://yutopias.com/ca/resources/${slug}`,
        "x-default": `https://yutopias.com/es/resources/${slug}`,
      },
    },
    openGraph: {
      title: translation.seoTitle,
      description: translation.seoDescription,
      url: canonicalUrl,
      siteName: "Yūtopias Systems",
      locale: localeMap[locale] ?? "es_ES",
      type: "article",
      publishedTime: article.publishedAt,
      images: [
        {
          url: article.coverImage,
          width: 1200,
          height: 630,
          alt: article.coverImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: translation.seoTitle,
      description: translation.seoDescription,
      images: [article.coverImage],
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
  const articleTranslation = article.translations[lang] ?? article.translations.es;
  const articleJsonLd = article.type === "article"
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: articleTranslation.title,
        description: articleTranslation.excerpt,
        image: article.coverImage,
        datePublished: article.publishedAt,
        author: {
          "@type": "Person",
          name: article.author,
          jobTitle: article.authorRole,
        },
        publisher: {
          "@type": "Organization",
          name: "Yūtopias Systems",
          url: "https://yutopias.com",
          logo: {
            "@type": "ImageObject",
            url: "https://yutopias.com/icon.png",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://yutopias.com/${locale}/resources/${slug}`,
        },
      }
    : null;

  const isEbook = article.type === "ebook";
  const translation = articleTranslation;
  const related = isEbook ? ALL_ARTICLES.slice(0, 2) : getRelatedArticles(slug, 2);

  const t = await getTranslations("resourcesPage");

  const categoryLabels: Record<string, string> = {
    all: t("categories.all"),
    datos: t("categories.datos"),
    sostenibilidad: t("categories.sostenibilidad"),
    tecnologia: t("categories.tecnologia"),
    estrategia: t("categories.estrategia"),
  };

  const date = formatArticleDate(article.publishedAt, locale);

  return (
    <>
      {articleJsonLd && (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
          type="application/ld+json"
        />
      )}
      {/* Back navigation */}
      <div className="border-b border-surface-bg/10 bg-surface-light">
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

      {/* Hero */}
      <article>
        <header className="bg-surface-bg pb-10 pt-12 md:pb-14 md:pt-20">
          <SectionContainer>
            <div className="mx-auto max-w-3xl">
              {isEbook ? (
                <span className="inline-block rounded-[5px] bg-green-100 px-2.5 py-1 text-[0.8125rem] font-semibold leading-none text-green-400">
                  {t("grid.tabEbooks")}
                </span>
              ) : (
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
              )}
              <h1 className="mt-4 text-[1.75rem] font-bold leading-[1.2] text-white sm:text-[2.25rem] md:text-[2.75rem]">
                {translation.title}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
                {translation.excerpt}
              </p>
              {!isEbook && (
                <div className="mt-6 flex flex-col gap-1 text-sm text-white/50 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1">
                  <span>
                    {t("articlePage.authorBy")} {article.author} · {article.authorRole}
                  </span>
                  <span aria-hidden className="hidden sm:inline">·</span>
                  <span>
                    {t("articlePage.publishedOn")} <time dateTime={article.publishedAt}>{date}</time>
                  </span>
                  <span aria-hidden className="hidden sm:inline">·</span>
                  <span>
                    {article.readingTimeMin} {t("articlePage.minRead")}
                  </span>
                </div>
              )}
            </div>
          </SectionContainer>
        </header>

        {/* Body */}
        <div className="bg-white py-12 md:py-16">
          <SectionContainer>
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
              {/* Cover image */}
              <div className={`relative w-full overflow-hidden rounded-[10px] ${isEbook ? "aspect-[3/4] max-w-[320px]" : "h-[14rem] sm:h-[18rem] md:h-[24rem]"}`}>
                <Image
                  alt={article.coverImageAlt}
                  className="object-cover"
                  fill
                  priority
                  sizes={isEbook ? "320px" : "(max-width: 768px) 100vw, 768px"}
                  src={article.coverImage}
                />
              </div>

              {/* Article content */}
              {translation.content.map((section, i) => renderSection(section, i))}

              {/* Ebook lead form */}
              {isEbook && (
                <div className="mt-4 rounded-[10px] border border-green-200 bg-green-50 px-6 py-8 sm:px-10">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-green-700">
                    {t("ebook.eyebrow")}
                  </p>
                  <p className="mt-2 text-lg font-bold text-surface-bg">
                    {t("ebook.ctaButton")}
                  </p>
                  <div className="mt-6">
                    <EbookLeadForm
                      botBlockedMessage={t("ebook.botBlockedMessage")}
                      companyPlaceholder={t("ebook.companyPlaceholder")}
                      consentLabel={t("ebook.consentLabel")}
                      consentLinkLabel={t("ebook.consentLinkLabel")}
                      ctaButton={t("ebook.ctaButton")}
                      downloadButton={t("ebook.downloadButton")}
                      emailPlaceholder={t("ebook.emailPlaceholder")}
                      errorMessage={t("ebook.errorMessage")}
                      firstNamePlaceholder={t("ebook.firstNamePlaceholder")}
                      initiallyExpanded
                      lastNamePlaceholder={t("ebook.lastNamePlaceholder")}
                      requiredNote={t("ebook.requiredNote")}
                      sourceArticle={slug}
                      submitButton={t("ebook.submitButton")}
                      successTitle={t("ebook.successTitle")}
                    />
                  </div>
                </div>
              )}
            </div>
          </SectionContainer>
        </div>
      </article>

      {/* Related articles */}
      {related.length > 0 ? (
        <section
          aria-label={t("articlePage.relatedTitle")}
          className="bg-surface-light py-14 md:py-20"
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
                    readMoreLabel={rel.type === "ebook" ? t("grid.viewEbook") : t("grid.readMore")}
                    typeLabel={rel.type === "ebook" ? t("grid.badgeEbook") : t("grid.badgeArticle")}
                  />
                </li>
              ))}
            </ul>
          </SectionContainer>
        </section>
      ) : null}
    </>
  );
}
