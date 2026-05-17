import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Article } from "@/content/articles";

interface ArticleCardProps {
  article: Article;
  locale: string;
  featuredLabel: string;
  readMoreLabel: string;
  minReadLabel: string;
  categoryLabels: Record<string, string>;
}

export const ArticleCard = ({
  article,
  locale,
  featuredLabel,
  readMoreLabel,
  minReadLabel,
  categoryLabels,
}: ArticleCardProps) => {
  const lang = locale as "es" | "en" | "ca";
  const translation = article.translations[lang] ?? article.translations.es;
  const date = new Date(article.publishedAt).toLocaleDateString(
    locale === "ca" ? "ca-ES" : locale === "en" ? "en-GB" : "es-ES",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-[10px] bg-white shadow-[0_4px_14px_rgba(28,30,46,0.08)] transition hover:shadow-[0_8px_24px_rgba(28,30,46,0.14)]">
      <Link className="flex flex-1 flex-col" href={`/resources/${article.slug}`}>
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden">
          <Image
            alt={article.coverImageAlt}
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={article.coverImage}
          />
          {article.featured ? (
            <span className="absolute left-3 top-3 rounded-[5px] bg-green-500 px-2.5 py-1 text-[0.75rem] font-semibold text-white">
              {featuredLabel}
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
            {readMoreLabel} →
          </p>
        </div>
      </Link>
    </article>
  );
};
