import { getTranslations } from "next-intl/server";
import { BOOTCAMP_ZERO_CTA_HREF } from "@/config/routes";

export const AnnouncementBar = async () => {
  const t = await getTranslations("nav");

  return (
    <div className="w-full bg-green-500 px-4 py-2.5 text-center text-sm font-medium text-white">
      <span>{t("announcementText")}</span>
      {" "}
      <a
        className="font-bold underline underline-offset-2 transition-opacity hover:opacity-80"
        href={BOOTCAMP_ZERO_CTA_HREF}
      >
        {t("announcementLinkLabel")}
      </a>
    </div>
  );
};
