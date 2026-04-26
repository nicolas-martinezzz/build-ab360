import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { SITE_ASSETS } from "@/config/assets";

type ProgramaFormadoresSectionProps = {
  embedded?: boolean;
};

export const ProgramaFormadoresSection = async ({
  embedded = false,
}: ProgramaFormadoresSectionProps = {}) => {
  const t = await getTranslations("programaPage.formadores");

  const formadores = [
    { avatar: SITE_ASSETS.solution.avatarCeo, name: t("formador1Name"), role: t("formador1Role"), org: t("formador1Org") },
    {
      avatar: SITE_ASSETS.solution.avatarDirectorEstudios,
      name: t("formador2Name"),
      role: t("formador2Role"),
      org: t("formador2Org"),
    },
    { avatar: SITE_ASSETS.solution.avatarArquitecto, name: t("formador3Name"), role: t("formador3Role"), org: t("formador3Org") },
    { avatar: SITE_ASSETS.solution.avatarPromotor, name: t("formador4Name"), role: t("formador4Role"), org: t("formador4Org") },
    {
      avatar: SITE_ASSETS.solution.avatarDelegadoConstruccion,
      name: t("formador5Name"),
      role: t("formador5Role"),
      org: t("formador5Org"),
    },
    { avatar: SITE_ASSETS.solution.avatarGestor, name: t("formador6Name"), role: t("formador6Role"), org: t("formador6Org") },
    { avatar: SITE_ASSETS.solution.avatarCeo, name: t("formador7Name"), role: t("formador7Role"), org: t("formador7Org") },
    { avatar: SITE_ASSETS.solution.avatarDirectorEstudios, name: t("formador8Name"), role: t("formador8Role"), org: t("formador8Org") },
    { avatar: SITE_ASSETS.solution.avatarArquitecto, name: t("formador9Name"), role: t("formador9Role"), org: t("formador9Org") },
    { avatar: SITE_ASSETS.solution.avatarPromotor, name: t("formador10Name"), role: t("formador10Role"), org: t("formador10Org") },
    { avatar: SITE_ASSETS.solution.avatarDelegadoConstruccion, name: t("formador11Name"), role: t("formador11Role"), org: t("formador11Org") },
  ];

  return (
    <div className={embedded ? "mt-10 md:mt-12" : "bg-green-50 pb-16 pt-10 md:pb-20 md:pt-12"}>
      <h2 className="figma-title-3 text-surface-bg">{t("headline")}</h2>

      <ul className="mt-7 grid gap-x-10 gap-y-7 sm:grid-cols-2">
        {formadores.map(({ avatar, name, role, org }) => (
          <li key={name} className="flex items-start gap-4">
            <div className="relative size-[4rem] shrink-0 overflow-hidden rounded-full md:size-[4.5rem]">
              <Image
                alt=""
                aria-hidden
                className="object-cover"
                fill
                sizes="(max-width: 768px) 64px, 72px"
                src={avatar}
              />
            </div>
            <div>
              <p className="figma-text-l-bold text-surface-bg">{name}</p>
              <p className="figma-text-l text-grey-dark">{role}</p>
              <p className="figma-text-l text-surface-bg">{org}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
