import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

const CARD_KEYS = ["card1", "card2", "card3"] as const;

export const TestimonialsSection = async () => {
  const t = await getTranslations("home.testimonials");

  return (
    <section
      aria-labelledby="testimonials-title"
      className="bg-green-100 py-16 sm:py-20 md:py-28"
    >
      <SectionContainer>
        <p className="text-xs font-medium uppercase tracking-wide text-grey-dark sm:text-sm">{t("label")}</p>
        <h2
          className="mt-3 text-2xl font-bold text-surface-bg [overflow-wrap:anywhere] sm:text-3xl md:text-4xl"
          id="testimonials-title"
        >
          {t("title")}
        </h2>

        <ul className="mt-10 grid list-none grid-cols-1 gap-8 p-0 sm:mt-12 md:grid-cols-3 md:gap-6 lg:gap-8">
          {CARD_KEYS.map((key) => {
            const highlight = t(`${key}.highlight`).trim();
            return (
              <li key={key} className="min-w-0">
                <article className="flex h-full min-w-0 flex-col rounded-xl border border-grey-light/60 bg-white p-6 shadow-md sm:p-7">
                  <div className="flex min-w-0 gap-4">
                    <div
                      aria-hidden
                      className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-200 to-green-300 text-sm font-bold text-green-900 shadow-inner sm:size-[4.5rem] sm:text-base"
                    >
                      {t(`${key}.initials`)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-surface-bg">{t(`${key}.name`)}</p>
                      <p className="font-bold text-surface-bg">{t(`${key}.company`)}</p>
                      <p className="mt-1 text-sm italic text-grey-dark">{t(`${key}.role`)}</p>
                    </div>
                  </div>
                  {highlight ? (
                    <p className="mt-5 text-sm font-bold text-green-600 leading-snug sm:text-base">{highlight}</p>
                  ) : null}
                  <blockquote className="mt-4 border-l-0 pl-0 text-sm text-grey-dark leading-relaxed sm:text-base">
                    <p className="[overflow-wrap:anywhere]">&ldquo;{t(`${key}.quote`)}&rdquo;</p>
                  </blockquote>
                </article>
              </li>
            );
          })}
        </ul>
      </SectionContainer>
    </section>
  );
};
