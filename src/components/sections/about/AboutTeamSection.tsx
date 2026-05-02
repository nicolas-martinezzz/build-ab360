import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SITE_ASSETS } from "@/config/assets";
import { Link } from "@/i18n/navigation";

const MEMBER_KEYS = [
  "member1",
  "member2",
  "member3",
  "member4",
  "member5",
  "member6",
  "member7",
  "member8",
  "member9",
] as const;

const MEMBER_PHOTOS: Record<(typeof MEMBER_KEYS)[number], string> = {
  member1: SITE_ASSETS.about.teamEugeniaRossetti,
  member2: SITE_ASSETS.about.teamAlejandroGlejberman,
  member3: SITE_ASSETS.about.teamTereTrepat,
  member4: SITE_ASSETS.about.teamAidaFreixanet,
  member5: SITE_ASSETS.about.teamLauraIglesias,
  member6: SITE_ASSETS.about.teamAndresMontanez,
  member7: SITE_ASSETS.about.teamMiguelAngelZamora,
  member8: SITE_ASSETS.about.teamPedroGonzalezAnta,
  member9: SITE_ASSETS.about.teamMariCarmenSanchez,
};

export const AboutTeamSection = async () => {
  const introT = await getTranslations("aboutPage.teamIntro");
  const teamT = await getTranslations("aboutPage.team");
  const footerT = await getTranslations("footer");
  const fallbackLinkedinUrl = footerT("linkedinUrl");

  return (
    <>
      {/* Team intro — cream bg */}
      <section className="section-block bg-green-100/40">
        <SectionContainer>
          <div className="grid gap-8 md:grid-cols-2 md:gap-16">
            <p className="figma-text-l text-surface-bg">{introT("left")}</p>
            <p className="figma-text-l text-surface-bg">
              {introT("right")}{" "}
              <strong className="font-semibold text-green-700">{introT("rightAccent")}</strong>
            </p>
          </div>
        </SectionContainer>
      </section>

      {/* Full team — dark bg */}
      <section
        aria-labelledby="about-team-title"
        className="section-block bg-surface-bg text-white"
      >
        <SectionContainer>
          <p className="type-eyebrow text-green-300">{teamT("eyebrow")}</p>
          <h2
            className="figma-title-2 mt-3 max-w-[46rem]"
            id="about-team-title"
          >
            {teamT("title")}
          </h2>

          <ul className="mt-10 grid list-none gap-6 p-0 sm:grid-cols-2 md:grid-cols-4">
            {MEMBER_KEYS.map((key) => {
              const linkedinUrlRaw = teamT(`${key}.linkedinUrl`).trim();
              const linkedinUrl = linkedinUrlRaw || fallbackLinkedinUrl;
              return (
                <li key={key} className="flex flex-col">
                  <div className="relative h-[14rem] w-full overflow-hidden rounded-[8px] bg-white/10 grayscale">
                    <Image
                      alt={teamT(`${key}.name`)}
                      className="object-cover object-center"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      src={MEMBER_PHOTOS[key]}
                    />
                  </div>
                  <div className="mt-4 flex flex-1 flex-col">
                    <p className="figma-text-l-bold md:min-h-[3.5rem]">
                      {teamT(`${key}.name`)}
                    </p>
                    <p className="figma-text-m mt-1 text-white/60 md:min-h-[3rem]">{teamT(`${key}.role`)}</p>
                    <p className="figma-text-m mt-2 leading-relaxed text-white/70 md:min-h-[8rem]">
                      {teamT(`${key}.bio`)}
                    </p>
                    <Link
                      className="figma-text-m mt-3 text-green-300 underline-offset-2 hover:underline sm:mt-auto"
                      href={linkedinUrl as never}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {teamT("linkedin")}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </SectionContainer>
      </section>
    </>
  );
};
