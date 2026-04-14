import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

const CARD_KEYS = ["card1", "card2", "card3"] as const;

export const TestimonialsSection = async () => {
  const t = await getTranslations("home.testimonials");

  return (
    <section
      aria-labelledby="testimonials-title"
      className="section-block bg-green-100"
    >
      <SectionContainer>
        <p className="text-base font-normal leading-[1.4] text-surface-bg">{t("label")}</p>
        <h2
          className="mt-3 text-[2rem] font-medium leading-[1.22] text-surface-bg [overflow-wrap:anywhere] sm:text-[2.25rem] lg:text-[3rem]"
          id="testimonials-title"
        >
          {t("title")}
        </h2>

        <ul className="mt-12 grid list-none grid-cols-1 gap-8 p-0 sm:mt-14 md:grid-cols-3 md:gap-8 lg:gap-10">
          {CARD_KEYS.map((key) => {
            const highlight = t(`${key}.highlight`).trim();
            return (
              <li key={key} className="min-w-0">
                <article className="flex h-full min-w-0 flex-col rounded-[0.3125rem] border border-[#e0e9e9] bg-white p-[1.875rem]">
                  <div className="flex min-w-0 gap-4">
                    <div
                      aria-hidden
                      className="flex size-[3.3125rem] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-200 to-green-300 text-sm font-bold text-green-900 shadow-inner"
                    >
                      {t(`${key}.initials`)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[1.25rem] font-bold leading-[1.4] text-[#394a5a]">{t(`${key}.name`)}</p>
                      <p className="text-base font-medium leading-[1.4] text-black">{t(`${key}.company`)}</p>
                      <p className="mt-1 text-[0.9375rem] italic leading-[1.4] text-[#394a5a]">{t(`${key}.role`)}</p>
                    </div>
                  </div>
                  {highlight ? (
                    <p className="mt-5 text-[1.125rem] font-bold leading-[1.4] text-green-600">{highlight}</p>
                  ) : null}
                  <blockquote className="mt-4 border-l-0 pl-0 text-base font-normal leading-6 text-black">
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
