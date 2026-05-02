"use client";

import { useCallback, useEffect, useRef } from "react";

type DiagnosticEmbedFrameProps = {
  ariaLabel: string;
  html: string;
  title: string;
};

export const DiagnosticEmbedFrame = ({ ariaLabel, html, title }: DiagnosticEmbedFrameProps) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const syncHeight = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    const bodyHeight = doc.body ? doc.body.scrollHeight : 0;
    const htmlHeight = doc.documentElement ? doc.documentElement.scrollHeight : 0;
    // Use a generous fallback so the form is reachable
    // even if observers fail to initialize in some environments.
    const nextHeight = Math.max(bodyHeight, htmlHeight, window.innerHeight, 2600);

    iframe.style.height = `${nextHeight}px`;
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    let intervalId: number | null = null;

    const handleLoad = () => {
      syncHeight();

      const doc = iframe.contentDocument;
      if (!doc) return;

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          syncHeight();
        });
        if (doc.body) resizeObserver.observe(doc.body);
        resizeObserver.observe(doc.documentElement);
      }

      if (typeof MutationObserver !== "undefined") {
        mutationObserver = new MutationObserver(() => {
          syncHeight();
        });
        mutationObserver.observe(doc.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
        });
      }

      // Fallback for transitions driven by inline scripts in srcDoc.
      intervalId = window.setInterval(syncHeight, 350);
    };

    iframe.addEventListener("load", handleLoad);
    window.addEventListener("resize", syncHeight);

    return () => {
      iframe.removeEventListener("load", handleLoad);
      window.removeEventListener("resize", syncHeight);
      if (resizeObserver) resizeObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, [syncHeight]);

  return (
    <section aria-label={ariaLabel} className="w-full">
      <iframe
        className="block w-full border-0 bg-white"
        ref={iframeRef}
        sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
        srcDoc={html}
        style={{ height: "2600px" }}
        title={title}
      />
    </section>
  );
};
