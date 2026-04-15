import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";

const CARD_KEYS = ["card1", "card2", "card3"] as const;
const TESTIMONIAL_AVATAR_URL =
  "https://www.figma.com/api/mcp/asset/32961a07-3aa7-46b4-a86a-2c11cdde5e72";

export const TestimonialsSection = async () => {
  const t = await getTranslations("home.testimonials");

  return (
    <section
      aria-labelledby="testimonials-title"
      className="bg-[rgba(228,241,207,0.4)] py-14 md:min-h-[42.125rem] md:py-[4.3125rem]"
    >
      <SectionContainer>
        <p className="text-base font-normal leading-[1.4] text-grey-dark">{t("label")}</p>
        <h2
          className="mt-[1.6875rem] text-[2.25rem] font-medium leading-[1.22] text-grey-dark [overflow-wrap:anywhere] md:text-[3rem]"
          id="testimonials-title"
        >
          {t("title")}
        </h2>

        <ul className="mt-[3.75rem] grid list-none grid-cols-1 gap-5 p-0 md:grid-cols-3 md:gap-5">
          {CARD_KEYS.map((key) => {
            const highlight = t(`${key}.highlight`).trim();
            return (
              <li key={key} className="min-w-0">
                <article className="flex h-full min-w-0 flex-col gap-5 rounded-[5px] border border-[#e0e9e9] bg-[#f8f8f8] p-[1.875rem]">
                  <div className="flex min-w-0 items-center justify-between">
                    <div className="flex min-w-0 flex-1 gap-[1.1875rem]">
                      {/* eslint-disable-next-line @next/next/no-img-element -- Figma avatar needs exact visual parity */}
                      <img
                        alt=""
                        aria-hidden
                        className="size-[3.3125rem] shrink-0 rounded-[3.5rem] object-cover"
                        height={53}
                        src={TESTIMONIAL_AVATAR_URL}
                        width={53}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[1.25rem] font-bold leading-[1.4] text-grey-dark">{t(`${key}.name`)}</p>
                        <p className="text-base font-medium leading-[1.4] text-black">{t(`${key}.company`)}</p>
                        <p className="text-[0.9375rem] italic leading-[1.4] text-grey-dark">{t(`${key}.role`)}</p>
                      </div>
                    </div>
                  </div>
                  {highlight ? <p className="text-[1.125rem] font-bold leading-[1.4] text-green-600">{highlight}</p> : null}
                  <blockquote className="border-l-0 pl-0 text-base font-normal leading-6 text-black">
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
