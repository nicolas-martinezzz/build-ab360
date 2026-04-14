import { homeSectionHref, SITE_PATHS } from "@/config/routes";
import type { HeaderNavigationLink } from "@/components/sections/site-header/types";

export const NAV_LINK_CLASS =
  "whitespace-nowrap text-base font-normal text-white/90 transition hover:text-white focus-visible:text-white";

export const DRAWER_LINK_CLASS =
  "rounded-lg px-3 py-3 text-base text-white/95 hover:bg-white/10 focus-visible:text-white";

export const buildNavigationLinks = ({
  challenge,
  solution,
  program,
  about,
}: {
  challenge: string;
  solution: string;
  program: string;
  about: string;
}): HeaderNavigationLink[] => [
  { key: "challenge", href: SITE_PATHS.challenge, label: challenge },
  { key: "solution", href: homeSectionHref("solution"), label: solution },
  { key: "program", href: homeSectionHref("program"), label: program },
  { key: "about", href: homeSectionHref("about"), label: about },
];
