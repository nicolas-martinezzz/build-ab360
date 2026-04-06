"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

type FooterLocaleSwitcherProps = {
  ariaLabel: string;
  localeEs: string;
  localeEn: string;
  localeCa: string;
};

const getLocaleLinkClassName = (isActive: boolean): string =>
  isActive
    ? "font-medium text-white"
    : "font-medium text-white/65 transition hover:text-white";

export const FooterLocaleSwitcher = ({
  ariaLabel,
  localeEs,
  localeEn,
  localeCa,
}: FooterLocaleSwitcherProps) => {
  const currentLocale = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={ariaLabel} className="flex flex-wrap items-center gap-3 text-sm">
      <Link
        aria-current={currentLocale === "es" ? "page" : undefined}
        className={getLocaleLinkClassName(currentLocale === "es")}
        href={pathname}
        locale="es"
      >
        {localeEs}
      </Link>
      <span aria-hidden className="text-white/25">
        |
      </span>
      <Link
        aria-current={currentLocale === "en" ? "page" : undefined}
        className={getLocaleLinkClassName(currentLocale === "en")}
        href={pathname}
        locale="en"
      >
        {localeEn}
      </Link>
      <span aria-hidden className="text-white/25">
        |
      </span>
      <Link
        aria-current={currentLocale === "ca" ? "page" : undefined}
        className={getLocaleLinkClassName(currentLocale === "ca")}
        href={pathname}
        locale="ca"
      >
        {localeCa}
      </Link>
    </nav>
  );
};
