import { twMerge } from "tailwind-merge";
import { Link } from "@/i18n/navigation";
import { NAV_LINK_CLASS } from "@/components/sections/site-header/navigation";
import type { HeaderNavigationLink } from "@/components/sections/site-header/types";

type DesktopNavProps = {
  mainNavAria: string;
  isCompact: boolean;
  links: HeaderNavigationLink[];
};

export const DesktopNav = ({ mainNavAria, isCompact, links }: DesktopNavProps) => (
  <nav
    aria-label={mainNavAria}
    className={twMerge(
      "hidden min-w-0 flex-1 justify-center text-white/90 md:flex transition-all duration-500 ease-out",
      isCompact ? "pointer-events-none max-w-0 opacity-0" : "max-w-[48rem] gap-4 opacity-100 lg:gap-8",
    )}
  >
    {links.map((link) => (
      <Link key={link.key} className={NAV_LINK_CLASS} href={link.href as never}>
        {link.label}
      </Link>
    ))}
  </nav>
);
