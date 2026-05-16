export type ArticleCategory = "datos" | "sostenibilidad" | "tecnologia" | "estrategia";

export interface Article {
  slug: string;
  publishedAt: string; // ISO date string
  readingTimeMin: number;
  author: string;
  authorRole: string;
  categories: ArticleCategory[];
  coverImage: string;
  coverImageAlt: string;
  featured?: boolean;
  translations: {
    es: ArticleTranslation;
    en: ArticleTranslation;
    ca: ArticleTranslation;
  };
}

export interface ArticleTranslation {
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  content: ArticleSection[];
}

export type ArticleSection =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "callout"; text: string };
