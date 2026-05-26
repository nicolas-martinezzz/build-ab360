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
    tabsAriaLabel: t("grid.tabsAriaLabel"),
    filterAriaLabel: t("grid.filterAriaLabel"),
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
        className="section-block-spacious bg-surface-bg"
      >
        <SectionContainer>
          <div className="max-w-2xl">
            <p className="type-eyebrow text-green-400">{t("hero.eyebrow")}</p>
            <h1 className="figma-title-1 mt-3 text-white" id="resources-hero-title">
              {t("hero.title")}
            </h1>
            <p className="figma-text-l mt-4 text-white/70">
              {t("hero.subtitle")}
            </p>
          </div>
        </SectionContainer>
      </section>

      {/* Content grid with tab filter */}
      <section
        aria-label={t("grid.allArticles")}
        className="section-block bg-surface-light"
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
