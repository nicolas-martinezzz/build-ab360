import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";

const ACTORS = [
  { key: "actor1", avatar: SITE_ASSETS.solution.avatarPromotor },
  { key: "actor2", avatar: SITE_ASSETS.solution.avatarCeo },
  { key: "actor3", avatar: SITE_ASSETS.solution.avatarDirectorEstudios },
  { key: "actor4", avatar: SITE_ASSETS.solution.avatarArquitecto },
  { key: "actor5", avatar: SITE_ASSETS.solution.avatarDelegadoConstruccion },
  { key: "actor6", avatar: SITE_ASSETS.solution.avatarGestor },
] as const;

type ActorCardProps = {
  avatar: string;
  title: string;
  description: string;
  quote: string;
};

const ActorCard = ({ avatar, title, description, quote }: ActorCardProps) => (
  <article className="flex w-full max-w-[35.375rem] items-center rounded-[5px] bg-white">
    <div className="relative size-[6rem] shrink-0 overflow-hidden rounded-full sm:size-[9rem] md:size-[14.0625rem]">
      <Image
        alt=""
        aria-hidden
        className="object-cover"
        fill
        sizes="(max-width: 768px) 144px, 225px"
        src={avatar}
      />
    </div>

    <div className="flex flex-1 flex-col gap-4 p-5">
      <div className="flex flex-col gap-2.5">
        <h3 className="figma-card-title text-surface-bg">{title}</h3>
        <p className="figma-text-m font-semibold text-surface-bg">{description}</p>
      </div>

      <blockquote className="figma-text-l italic text-grey-dark">{quote}</blockquote>
    </div>
  </article>
);

export const SolutionActorsSection = async () => {
  const t = await getTranslations("solutionPage.actors");

  return (
    <section className="section-block-spacious bg-white">
      <SectionContainer>
        <p className="figma-text-l text-grey-dark">{t("eyebrow")}</p>

        <h2 className="figma-title-2-bold mt-3 max-w-[53.5rem] text-surface-bg">
          {t("headline")}
        </h2>

        <p className="figma-text-l mt-4 max-w-[73.4375rem] text-surface-bg">
          {t("body")}
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {ACTORS.map(({ key, avatar }) => (
            <ActorCard
              key={key}
              avatar={avatar}
              description={t(`${key}.description`)}
              quote={t(`${key}.quote`)}
              title={t(`${key}.title`)}
            />
          ))}
        </div>
      </SectionContainer>
    </section>
  );
};
