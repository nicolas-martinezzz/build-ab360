import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Article } from "@/content/articles";
import { formatArticleDate } from "@/lib/dateFormat";

interface ArticleCardProps {
  article: Article;
  locale: string;
  featuredLabel: string;
  readMoreLabel: string;
  minReadLabel: string;
  categoryLabels: Record<string, string>;
  typeLabel?: string;
}

export const ArticleCard = ({
  article,
  locale,
  featuredLabel,
  readMoreLabel,
  minReadLabel,
  categoryLabels,
  typeLabel,
}: ArticleCardProps) => {
  const lang = locale as "es" | "en" | "ca";
  const translation = article.translations[lang] ?? article.translations.es;
  const date = formatArticleDate(article.publishedAt, locale);

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-[10px] bg-white shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-card-hover)]">
      <Link className="flex flex-1 flex-col" href={`/resources/${article.slug}`}>
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden">
          <Image
            alt={article.coverImageAlt}
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={article.coverImage}
          />
          {(typeLabel ?? (article.featured ? featuredLabel : null)) ? (
            <span className="absolute left-3 top-3 rounded-[5px] bg-green-500 px-4 py-1.5 text-[0.9375rem] font-semibold text-white shadow-[var(--shadow-card-sm)]">
              {typeLabel ?? featuredLabel}
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
          <p className="text-[0.75rem] leading-[1.4] text-grey-dark">
            <time dateTime={article.publishedAt}>{date}</time> · {article.readingTimeMin} {minReadLabel}
          </p>
          <h3 className="mt-2 text-[1.25rem] font-bold leading-[1.3] text-surface-bg transition group-hover:text-green-600">
            {translation.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-surface-bg/70">
            {translation.excerpt}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {article.categories.map((cat) => (
              <span
                className="rounded-[5px] bg-green-100 px-2.5 py-1 text-[0.8125rem] leading-none text-surface-bg"
                key={cat}
              >
                {categoryLabels[cat] ?? cat}
              </span>
            ))}
          </div>
          <p className="mt-auto pt-3 text-[0.8125rem] font-medium text-green-600">
            {readMoreLabel} <span aria-hidden>→</span>
          </p>
        </div>
      </Link>
    </article>
  );
};
