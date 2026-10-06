/**
 * Intro-shield boot — runs once per full document load, after the HTML is
 * parsed but before React hydration begins (see Next.js `instrumentation-client`
 * file convention). This is the only place that can safely host this
 * synchronous pre-hydration script: it is not part of the React component
 * tree, so it survives client-side locale switches untouched (unlike a
 * `<script>`/`next/script` tag declared inside `[locale]/layout.tsx`, which
 * crashes with "Encountered a script tag while rendering React component"
 * once that layout re-renders on the client after a dynamic-segment change).
 *
 * For returning visitors (`sessionStorage.getItem('intro-seen')`), it hides
 * the server-rendered `#intro-shield` overlay and clears the inline black
 * `body` background immediately, before the first paint — avoiding a flash
 * of the black shield for people who have already seen the intro.
 */
try {
  const shield = document.getElementById("intro-shield");
  if (sessionStorage.getItem("intro-seen")) {
    if (shield) shield.style.display = "none";
    document.body.style.background = "";
  }
} catch {
  // sessionStorage may be unavailable (e.g. privacy mode) — fail silently,
  // the shield simply stays up until IntroOverlay removes it on mount.
}
