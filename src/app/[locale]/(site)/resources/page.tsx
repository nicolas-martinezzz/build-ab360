import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { ResourcesGrid } from "@/components/sections/resources/ResourcesGrid";
import { ALL_ARTICLES, ALL_EBOOKS, ALL_CATEGORIES } from "@/content/articles";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("resourcesPage.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ResourcesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("resourcesPage");

  const gridLabels = {
    featured: t("grid.featured"),
    readMore: t("grid.readMore"),
    viewEbook: t("grid.viewEbook"),
    minRead: t("grid.minRead"),
    noResults: t("grid.noResults"),
    tabArticles: t("grid.tabArticles"),
    tabEbooks: t("grid.tabEbooks"),
    badgeArticle: t("grid.badgeArticle"),
    badgeEbook: t("grid.badgeEbook"),
    categories: {
      all: t("categories.all"),
      datos: t("categories.datos"),
      sostenibilidad: t("categories.sostenibilidad"),
      tecnologia: t("categories.tecnologia"),
      estrategia: t("categories.estrategia"),
    },
  };

  return (
    <>
      {/* Hero */}
      <section
        aria-labelledby="resources-hero-title"
        className="bg-surface-bg py-16 md:py-24 lg:py-32"
      >
        <SectionContainer>
          <div className="max-w-2xl">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-green-400">
              {t("hero.eyebrow")}
            </p>
            <h1
              className="mt-3 text-[1.75rem] font-bold leading-[1.15] text-white sm:text-[2.25rem] md:text-[2.75rem] lg:text-[3.5rem]"
              id="resources-hero-title"
            >
              {t("hero.title")}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
              {t("hero.subtitle")}
            </p>
          </div>
        </SectionContainer>
      </section>

      {/* Content grid with tab filter */}
      <section
        aria-label={t("grid.allArticles")}
        className="bg-surface-light py-14 md:py-20"
      >
        <SectionContainer>
          <ResourcesGrid
            allCategories={ALL_CATEGORIES}
            articles={ALL_ARTICLES}
            ebooks={ALL_EBOOKS}
            labels={gridLabels}
            locale={locale}
          />
        </SectionContainer>
      </section>
    </>
  );
}
