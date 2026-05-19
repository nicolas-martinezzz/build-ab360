"use client";

import { useState } from "react";
import { ArticleCard } from "./ArticleCard";
import type { Article, ArticleCategory } from "@/content/articles";

type ContentTab = "articles" | "ebooks";

interface ResourcesGridProps {
  articles: Article[];
  ebooks: Article[];
  locale: string;
  labels: {
    featured: string;
    readMore: string;
    viewEbook: string;
    minRead: string;
    noResults: string;
    tabArticles: string;
    tabEbooks: string;
    badgeArticle: string;
    badgeEbook: string;
    categories: Record<string, string>;
  };
  allCategories: ArticleCategory[];
}

export const ResourcesGrid = ({
  articles,
  ebooks,
  locale,
  labels,
  allCategories,
}: ResourcesGridProps) => {
  const [activeTab, setActiveTab] = useState<ContentTab>("articles");
  const [activeCategory, setActiveCategory] = useState<ArticleCategory | "all">("all");

  const pool = activeTab === "ebooks" ? ebooks : articles;
  const activeItems =
    activeCategory === "all"
      ? pool
      : pool.filter((a) => a.categories.includes(activeCategory));

  return (
    <div className="flex flex-col gap-8">
      {/* Top-level tabs: Artículos / Ebooks */}
      <div className="flex gap-2 border-b border-surface-bg/10" role="tablist">
        <button
          aria-selected={activeTab === "articles"}
          className={`border-b-2 px-5 py-2.5 text-sm font-semibold transition focus:outline-none ${
            activeTab === "articles"
              ? "border-green-500 text-surface-bg"
              : "border-transparent text-surface-bg/50 hover:text-surface-bg/80"
          }`}
          onClick={() => { setActiveTab("articles"); setActiveCategory("all"); }}
          role="tab"
          type="button"
        >
          {labels.tabArticles}
        </button>
        <button
          aria-selected={activeTab === "ebooks"}
          className={`border-b-2 px-5 py-2.5 text-sm font-semibold transition focus:outline-none ${
            activeTab === "ebooks"
              ? "border-green-500 text-surface-bg"
              : "border-transparent text-surface-bg/50 hover:text-surface-bg/80"
          }`}
          onClick={() => { setActiveTab("ebooks"); setActiveCategory("all"); }}
          role="tab"
          type="button"
        >
          {labels.tabEbooks}
        </button>
      </div>

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

      {/* Grid */}
      {activeItems.length === 0 ? (
        <p className="py-12 text-center text-surface-bg/60">{labels.noResults}</p>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {activeItems.map((item) => (
            <li className="flex" key={item.slug}>
              <ArticleCard
                article={item}
                categoryLabels={labels.categories}
                featuredLabel={labels.featured}
                locale={locale}
                minReadLabel={labels.minRead}
                readMoreLabel={item.type === "ebook" ? labels.viewEbook : labels.readMore}
                typeLabel={item.type === "ebook" ? labels.badgeEbook : labels.badgeArticle}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
