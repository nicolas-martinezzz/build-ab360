"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { LinkButton } from "@/components/ui/LinkButton";
import { SITE_PATHS } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { DesktopNav } from "@/components/sections/site-header/DesktopNav";
import { MobileDrawer } from "@/components/sections/site-header/MobileDrawer";
import { useDesktopViewport, useHeaderCompact, useMenuA11y } from "@/components/sections/site-header/hooks";
import { buildNavigationLinks } from "@/components/sections/site-header/navigation";
import type { SiteHeaderBarProps } from "@/components/sections/site-header/types";

export const SiteHeaderBar = ({
  brandAria,
  mainNavAria,
  mobileMenuAria,
  drawerLinksNavAria,
  openMenuLabel,
  closeMenuLabel,
  challenge,
  solution,
  program,
  about,
  joinBootcamp,
}: SiteHeaderBarProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstDrawerLinkRef = useRef<HTMLAnchorElement>(null);
  const lastDrawerActionRef = useRef<HTMLAnchorElement>(null);
  const wasMenuOpenRef = useRef(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const navigationLinks = buildNavigationLinks({
    challenge,
    solution,
    program,
    about,
  });

  useHeaderCompact({ setIsCompact });
  useDesktopViewport({ setIsDesktopViewport });
  useMenuA11y({
    menuOpen,
    closeMenu,
    menuButtonRef,
    firstDrawerLinkRef,
    lastDrawerActionRef,
    wasMenuOpenRef,
  });

  useEffect(() => {
    if (isDesktopViewport && !isCompact && menuOpen) {
      closeMenu();
    }
  }, [isDesktopViewport, isCompact, menuOpen, closeMenu]);

  return (
    <header
      className={twMerge(
        "fixed inset-x-0 top-0 z-40 border-b border-white/10 pt-[env(safe-area-inset-top)] transition-all duration-500 ease-out",
        isCompact ? "border-white/15" : "border-white/10",
      )}
      role="banner"
    >
      <div
        className={twMerge(
          "relative z-[60] overflow-hidden backdrop-blur-xl supports-[backdrop-filter]:backdrop-saturate-150 transition-all duration-500 ease-out",
          isCompact
            ? "bg-surface-bg/70 ring-1 ring-inset ring-white/15 shadow-[0_14px_45px_rgba(0,0,0,0.28)]"
            : "bg-surface-bg/52 ring-1 ring-inset ring-white/10 shadow-[0_8px_28px_rgba(0,0,0,0.18)]",
        )}
      >
        <div
          aria-hidden="true"
          className={twMerge(
            "pointer-events-none absolute inset-0 transition-all duration-500 ease-out",
            isCompact
              ? "bg-gradient-to-b from-surface-bg/92 via-surface-bg/76 to-surface-bg/68"
              : "bg-gradient-to-b from-surface-bg/82 via-surface-bg/62 to-surface-bg/48",
          )}
        />
        <div
          className={twMerge(
            "relative z-10 mx-auto flex max-w-6xl flex-nowrap items-center justify-between pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:pl-[max(1rem,env(safe-area-inset-left))] sm:pr-[max(1rem,env(safe-area-inset-right))] lg:pl-8 lg:pr-8 transition-all duration-500 ease-out",
            isCompact
              ? "gap-2 py-1.5 sm:gap-2.5 sm:py-2 md:min-h-12 md:gap-3 md:py-2"
              : "gap-2 py-2.5 sm:gap-3 sm:py-3 md:min-h-14 md:gap-4 md:py-3",
          )}
        >
          <Link
            aria-label={brandAria}
            className={twMerge(
              "min-w-0 max-w-[calc(100%-3.25rem)] shrink-0 font-bold leading-tight tracking-tight text-white transition-all duration-500 ease-out sm:max-w-[calc(100%-3.5rem)] md:max-w-none",
              isCompact ? "text-[0.75rem] sm:text-sm md:text-base" : "text-[0.8125rem] sm:text-base md:text-lg",
            )}
            href={SITE_PATHS.home}
            onClick={closeMenu}
          >
            <span className="inline-block whitespace-nowrap">
              <span className="text-green-300">yūtopias</span>{" "}
              <span className="font-medium text-white/90">systems</span>
            </span>
          </Link>

          <DesktopNav isCompact={isCompact} links={navigationLinks} mainNavAria={mainNavAria} />

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div
              className={twMerge(
                "hidden md:items-center md:transition-all md:duration-500 md:ease-out",
                isCompact ? "md:pointer-events-none md:opacity-0" : "md:flex md:opacity-100",
              )}
            >
              <LinkButton
                className={twMerge(
                  "min-h-10 whitespace-nowrap text-sm transition-all duration-500 ease-out md:min-h-10",
                  isCompact ? "px-3.5" : "px-4 md:px-5",
                )}
                href={SITE_PATHS.contact}
                variant="primary"
              >
                {joinBootcamp}
              </LinkButton>
            </div>

            <button
              ref={menuButtonRef}
              aria-controls={menuId}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? closeMenuLabel : openMenuLabel}
              className={twMerge(
                "inline-flex shrink-0 items-center justify-center rounded-[var(--radius-button)] text-white transition-all duration-500 ease-out hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-bg",
                isCompact ? "size-10 md:inline-flex" : "size-11 md:hidden",
              )}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              ) : (
                <svg aria-hidden className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <MobileDrawer
        closeMenu={closeMenu}
        closeMenuLabel={closeMenuLabel}
        drawerLinksNavAria={drawerLinksNavAria}
        firstDrawerLinkRef={firstDrawerLinkRef}
        joinBootcamp={joinBootcamp}
        lastDrawerActionRef={lastDrawerActionRef}
        links={navigationLinks}
        menuId={menuId}
        menuOpen={menuOpen}
        mobileMenuAria={mobileMenuAria}
      />
    </header>
  );
};
