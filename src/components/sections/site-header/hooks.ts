import { useEffect, type RefObject } from "react";

export const useHeaderCompact = ({
  setIsCompact,
}: {
  setIsCompact: (value: boolean) => void;
}) => {
  useEffect(() => {
    const updateCompactState = () => {
      setIsCompact(window.scrollY > 24);
    };

    updateCompactState();
    window.addEventListener("scroll", updateCompactState, { passive: true });
    return () => window.removeEventListener("scroll", updateCompactState);
  }, [setIsCompact]);
};

export const useDesktopViewport = ({
  setIsDesktopViewport,
}: {
  setIsDesktopViewport: (value: boolean) => void;
}) => {
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateViewportState = () => {
      setIsDesktopViewport(mediaQuery.matches);
    };

    updateViewportState();
    mediaQuery.addEventListener("change", updateViewportState);
    return () => mediaQuery.removeEventListener("change", updateViewportState);
  }, [setIsDesktopViewport]);
};

export const useMenuA11y = ({
  menuOpen,
  closeMenu,
  menuButtonRef,
  firstDrawerLinkRef,
  lastDrawerActionRef,
  wasMenuOpenRef,
}: {
  menuOpen: boolean;
  closeMenu: () => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  firstDrawerLinkRef: RefObject<HTMLAnchorElement | null>;
  lastDrawerActionRef: RefObject<HTMLAnchorElement | null>;
  wasMenuOpenRef: RefObject<boolean>;
}) => {
  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    if (menuOpen) {
      wasMenuOpenRef.current = true;
      const frameId = requestAnimationFrame(() => {
        firstDrawerLinkRef.current?.focus();
      });
      return () => cancelAnimationFrame(frameId);
    }
    if (wasMenuOpenRef.current) {
      wasMenuOpenRef.current = false;
      menuButtonRef.current?.focus();
    }
  }, [menuOpen, firstDrawerLinkRef, menuButtonRef, wasMenuOpenRef]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const first = firstDrawerLinkRef.current;
    const last = lastDrawerActionRef.current;
    if (!first || !last) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, firstDrawerLinkRef, lastDrawerActionRef]);
};
