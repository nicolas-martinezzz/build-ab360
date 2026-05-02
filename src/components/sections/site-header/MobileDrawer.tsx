import type { RefObject } from "react";
import { twMerge } from "tailwind-merge";
import { getButtonClassName } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { DRAWER_LINK_CLASS } from "@/components/sections/site-header/navigation";
import type { HeaderNavigationLink } from "@/components/sections/site-header/types";
type MobileDrawerProps = {
  menuOpen: boolean;
  menuId: string;
  mobileMenuAria: string;
  drawerLinksNavAria: string;
  closeMenuLabel: string;
  closeMenu: () => void;
  firstDrawerLinkRef: RefObject<HTMLAnchorElement | null>;
  lastDrawerActionRef: RefObject<HTMLAnchorElement | null>;
  links: HeaderNavigationLink[];
  joinBootcamp: string;
  bootcampPath: string;
};

export const MobileDrawer = ({
  menuOpen,
  menuId,
  mobileMenuAria,
  drawerLinksNavAria,
  closeMenuLabel,
  closeMenu,
  firstDrawerLinkRef,
  lastDrawerActionRef,
  links,
  joinBootcamp,
  bootcampPath,
}: MobileDrawerProps) => (
  <>
    <div
      aria-hidden="true"
      className={twMerge(
        "fixed inset-0 z-[65] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
        menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      onClick={closeMenu}
    />

    <div
      aria-hidden={!menuOpen}
      className={twMerge(
        "fixed inset-y-0 right-0 z-[70] flex w-full max-w-sm flex-col overflow-y-auto overscroll-y-contain border-l border-white/10 bg-surface-bg shadow-xl transition-transform duration-300 ease-out motion-reduce:transition-none",
        menuOpen ? "translate-x-0" : "pointer-events-none translate-x-full",
      )}
      id={menuId}
      role="dialog"
      aria-label={mobileMenuAria}
      aria-modal={menuOpen}
    >
      <div className="flex items-center justify-end px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:px-6 sm:pt-[calc(env(safe-area-inset-top)+1rem)]">
        <button
          aria-label={closeMenuLabel}
          className="inline-flex size-11 items-center justify-center rounded-[var(--radius-button)] text-white transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-bg"
          type="button"
          onClick={closeMenu}
        >
          <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <nav
        aria-label={drawerLinksNavAria}
        className="flex flex-1 flex-col gap-1 px-4 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-3"
      >
        {links.map((link, index) => (
          <Link
            key={link.key}
            ref={index === 0 ? firstDrawerLinkRef : undefined}
            className={DRAWER_LINK_CLASS}
            href={link.href}
            onClick={closeMenu}
          >
            {link.label}
          </Link>
        ))}
        <Link
          ref={lastDrawerActionRef}
          className={getButtonClassName("primary", "mt-4 w-full min-h-12 justify-center sm:max-w-sm")}
          href={bootcampPath}
          onClick={closeMenu}
        >
          {joinBootcamp}
        </Link>
      </nav>
    </div>
  </>
);
