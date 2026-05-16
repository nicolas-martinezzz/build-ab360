"use client";

interface ArticleEbookBannerProps {
  eyebrow: string;
  title: string;
  buttonLabel: string;
}

export const ArticleEbookBanner = ({ eyebrow, title, buttonLabel }: ArticleEbookBannerProps) => {
  const handleClick = () => {
    document.getElementById("ebook-cta")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="mb-8 flex items-center justify-between gap-3 rounded-[8px] border border-green-200 bg-green-50 px-5 py-4 sm:gap-5">
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-green-700">
          {eyebrow}
        </p>
        <p className="truncate text-sm font-semibold text-surface-bg">{title}</p>
      </div>
      <button
        className="shrink-0 rounded-[5px] bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
        onClick={handleClick}
        type="button"
      >
        {buttonLabel}
      </button>
    </div>
  );
};
