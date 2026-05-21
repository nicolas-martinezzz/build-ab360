import { article as adiosALosSilos } from "./adios-a-los-silos";
import { article as roiDeLaSostenibilidad } from "./roi-de-la-sostenibilidad";
import { article as laEraDelDato } from "./la-era-del-dato";
import { article as gemeloDigitalSemantico } from "./gemelo-digital-semantico";
import { article as ab360Ebook } from "./ab360-ebook";
import type { Article, ArticleCategory } from "./types";

export type { Article, ArticleCategory, ArticleSection, ArticleTranslation, ContentType } from "./types";

export const ALL_EBOOKS: Article[] = [ab360Ebook];

export const ALL_ARTICLES: Article[] = [
  adiosALosSilos,
  roiDeLaSostenibilidad,
  laEraDelDato,
  gemeloDigitalSemantico,
].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

export const ALL_CONTENT: Article[] = [...ALL_EBOOKS, ...ALL_ARTICLES];

export const getFeaturedArticle = (): Article | undefined =>
  ALL_ARTICLES.find((a) => a.featured);

export const getArticleBySlug = (slug: string): Article | undefined =>
  ALL_CONTENT.find((a) => a.slug === slug);

export const getArticlesByCategory = (category: ArticleCategory): Article[] =>
  ALL_ARTICLES.filter((a) => a.categories.includes(category));

export const getRelatedArticles = (slug: string, limit = 2): Article[] =>
  ALL_ARTICLES.filter((a) => a.slug !== slug).slice(0, limit);

export const ALL_CATEGORIES: ArticleCategory[] = ["datos", "sostenibilidad", "tecnologia", "estrategia"];
