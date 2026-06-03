import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";

const CARD_KEYS = ["card1", "card2", "card3"] as const;

const TESTIMONIAL_AVATARS: Record<typeof CARD_KEYS[number], string> = {
  card1: SITE_ASSETS.home.testimonialAvatar,
  card2: SITE_ASSETS.home.testimonialTeresaBatlle,
  card3: SITE_ASSETS.home.testimonialHowardPierce,
};

export const TestimonialsSection = async () => {
  const t = await getTranslations("home.testimonials");

  return (
    <section
      aria-labelledby="testimonials-title"
      className="section-block bg-green-100/40"
    >
      <SectionContainer>
        <p className="type-eyebrow text-grey-dark">{t("label")}</p>
        <h2
          className="figma-title-2 mt-4 text-grey-dark [overflow-wrap:anywhere]"
          id="testimonials-title"
        >
          {t("title")}
        </h2>

        <ul className="mt-14 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 md:grid-cols-3">
          {CARD_KEYS.map((key) => {
            const highlight = t(`${key}.highlight`).trim();
            return (
              <li key={key} className="min-w-0">
                <article className="flex h-full min-w-0 flex-col gap-5 rounded-[5px] border border-grey-light bg-white p-7">
                  <div className="flex min-w-0 items-center justify-between">
                    <div className="flex min-w-0 flex-1 gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element -- Figma avatar needs exact visual parity */}
                      <img
                        alt=""
                        aria-hidden
                        className="size-[3.3125rem] shrink-0 rounded-[3.5rem] object-cover"
                        height={53}
                        src={TESTIMONIAL_AVATARS[key]}
                        width={53}
                      />
                      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                        <p className="figma-text-l-bold leading-tight text-grey-dark">{t(`${key}.name`)}</p>
                        <p className="figma-text-m font-medium leading-tight text-black">{t(`${key}.company`)}</p>
                        <p className="figma-text-m italic leading-tight text-grey-dark">{t(`${key}.role`)}</p>
                      </div>
                    </div>
                  </div>
                  {highlight ? <p className="figma-text-l-bold text-green-600">{highlight}</p> : null}
                  <blockquote className="figma-text-m border-l-0 pl-0 text-black">
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
