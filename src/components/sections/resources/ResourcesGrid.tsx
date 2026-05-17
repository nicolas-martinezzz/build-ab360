"use client";

import { useState } from "react";
import { ArticleCard } from "./ArticleCard";
import type { Article, ArticleCategory } from "@/content/articles";

interface ResourcesGridProps {
  articles: Article[];
  locale: string;
  labels: {
    featured: string;
    readMore: string;
    minRead: string;
    allArticles: string;
    noResults: string;
    categories: Record<string, string>;
  };
  allCategories: ArticleCategory[];
}

export const ResourcesGrid = ({ articles, locale, labels, allCategories }: ResourcesGridProps) => {
  const [activeCategory, setActiveCategory] = useState<ArticleCategory | "all">("all");

  const filtered =
    activeCategory === "all"
      ? articles
      : articles.filter((a) => a.categories.includes(activeCategory));

  return (
    <div className="flex flex-col gap-8">
      {/* Category filter */}
      <div aria-label="Filtrar por categoría" className="flex flex-wrap gap-2" role="group">
        <button
          aria-pressed={activeCategory === "all"}
          className={`rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#f4f6f3] ${
            activeCategory === "all"
              ? "bg-surface-bg text-white"
              : "bg-white text-surface-bg hover:bg-green-50"
          }`}
          onClick={() => setActiveCategory("all")}
          type="button"
        >
          {labels.categories["all"]}
        </button>
        {allCategories.map((cat) => (
          <button
            aria-pressed={activeCategory === cat}
            className={`rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#f4f6f3] ${
              activeCategory === cat
                ? "bg-surface-bg text-white"
                : "bg-white text-surface-bg hover:bg-green-50"
            }`}
            key={cat}
            onClick={() => setActiveCategory(cat)}
            type="button"
          >
            {labels.categories[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-surface-bg/60">{labels.noResults}</p>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <li className="flex" key={article.slug}>
              <ArticleCard
                article={article}
                categoryLabels={labels.categories}
                featuredLabel={labels.featured}
                locale={locale}
                minReadLabel={labels.minRead}
                readMoreLabel={labels.readMore}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
