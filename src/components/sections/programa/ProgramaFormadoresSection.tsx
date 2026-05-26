import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { SITE_ASSETS } from "@/config/assets";

type ProgramaFormadoresSectionProps = {
  embedded?: boolean;
};

type Formador = {
  avatar: string;
  name: string;
  role: string;
  org: string;
  linkedin?: string;
  pending?: boolean;
};

export const ProgramaFormadoresSection = async ({
  embedded = false,
}: ProgramaFormadoresSectionProps = {}) => {
  const t = await getTranslations("programaPage.formadores");

  const formadores: Formador[] = [
    {
      avatar: SITE_ASSETS.solution.ponentes.eduardoNunez,
      name: t("formador1Name"),
      role: t("formador1Role"),
      org: t("formador1Org"),
      linkedin: "https://www.linkedin.com/in/eduardo-consultoria-facilities-management/",
    },
    {
      avatar: SITE_ASSETS.solution.ponentes.ivanPerez,
      name: t("formador2Name"),
      role: t("formador2Role"),
      org: t("formador2Org"),
      linkedin: "https://www.linkedin.com/in/ivan-perez-bar%C3%A9s-747a3848/",
    },
    {
      avatar: SITE_ASSETS.solution.ponentes.juanjoMoreno,
      name: t("formador3Name"),
      role: t("formador3Role"),
      org: t("formador3Org"),
      linkedin: "https://www.linkedin.com/in/juanjo-moreno/",
    },
    {
      avatar: SITE_ASSETS.solution.ponentes.ramonMartin,
      name: t("formador4Name"),
      role: t("formador4Role"),
      org: t("formador4Org"),
      linkedin: "https://www.linkedin.com/in/jramonmartinvega/",
    },
    {
      avatar: SITE_ASSETS.solution.ponentes.pacoGomez,
      name: t("formador5Name"),
      role: t("formador5Role"),
      org: t("formador5Org"),
      linkedin: "https://www.linkedin.com/in/pacogomezes/",
    },
    {
      avatar: SITE_ASSETS.solution.ponentes.sandraColom,
      name: t("formador6Name"),
      role: t("formador6Role"),
      org: t("formador6Org"),
      linkedin: "https://www.linkedin.com/in/sandra-colom-cabr%C3%A9-a48b38bb/",
    },
    {
      avatar: SITE_ASSETS.solution.ponentes.tereTrepat,
      name: t("formador7Name"),
      role: t("formador7Role"),
      org: t("formador7Org"),
      linkedin: "https://www.linkedin.com/in/teretrepat/",
    },
    {
      avatar: SITE_ASSETS.solution.ponentes.xavierBano,
      name: t("formador8Name"),
      role: t("formador8Role"),
      org: t("formador8Org"),
      linkedin: "https://www.linkedin.com/in/xavier-ba%C3%B1o-2948ba355/?locale=es",
    },
    {
      avatar: SITE_ASSETS.solution.ponentes.genisRoca,
      name: t("formador9Name"),
      role: t("formador9Role"),
      org: t("formador9Org"),
      linkedin: "https://www.linkedin.com/in/genisroca/",
    },
    {
      avatar: SITE_ASSETS.solution.ponentes.brunoSauer,
      name: t("formador10Name"),
      role: t("formador10Role"),
      org: t("formador10Org"),
      linkedin: "https://www.linkedin.com/in/bruno-sauer/",
    },
    {
      avatar: SITE_ASSETS.solution.ponentes.lurdesMochales,
      name: t("formador11Name"),
      role: t("formador11Role"),
      org: t("formador11Org"),
      linkedin: "https://www.linkedin.com/in/lmochales/",
    },
  ];

  return (
    <div className={embedded ? "mt-10 md:mt-12" : "section-block bg-green-50"}>
      <h2 className="figma-title-3 text-surface-bg">{t("headline")}</h2>

      <ul className="mt-7 grid gap-x-10 gap-y-7 sm:grid-cols-2">
        {formadores.map(({ avatar, name, role, org, linkedin, pending }) => (
          <li key={pending ? "pending" : name} className="flex items-start gap-4">
            <div
              className={`relative size-[4rem] shrink-0 overflow-hidden rounded-full md:size-[4.5rem] ${pending ? "border-2 border-dashed border-grey-light bg-grey-light/30" : ""}`}
            >
              {pending ? (
                <span className="flex size-full items-center justify-center figma-text-m text-grey-dark">?</span>
              ) : (
                <Image
                  alt=""
                  aria-hidden
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 64px, 72px"
                  src={avatar}
                />
              )}
            </div>
            <div>
              {pending ? (
                <>
                  <p className="figma-text-l-bold text-surface-bg">{t("pendingName")}</p>
                  <p className="figma-text-l text-grey-dark">{t("pendingRole")}</p>
                  <p className="figma-text-l text-surface-bg">{t("pendingOrg")}</p>
                </>
              ) : (
                <>
                  <p className="figma-text-l-bold text-surface-bg">{name}</p>
                  <p className="figma-text-l text-grey-dark">{role}</p>
                  <p className="figma-text-l text-surface-bg">{org}</p>
                  {linkedin && (
                    <a
                      className="figma-text-m mt-1 inline-block text-green-600 underline-offset-2 hover:underline"
                      href={linkedin}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      LinkedIn ↗
                    </a>
                  )}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
