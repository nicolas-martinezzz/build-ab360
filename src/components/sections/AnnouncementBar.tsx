import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getProgramaPathByLocale } from "@/config/routes";

export const AnnouncementBar = async () => {
  const [t, locale] = await Promise.all([
    getTranslations("nav"),
    getLocale(),
  ]);

  return (
    <div className="w-full bg-green-500 px-4 py-2.5 text-center text-sm font-medium text-white">
      <span>{t("announcementText")}</span>
      {" "}
      <Link
        className="font-bold underline underline-offset-2 transition-opacity hover:opacity-80"
        href={`${getProgramaPathByLocale(locale)}#bootcamp-formulario` as never}
      >
        {t("announcementLinkLabel")}
      </Link>
    </div>
  );
};
