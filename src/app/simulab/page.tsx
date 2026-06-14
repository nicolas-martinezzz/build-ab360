import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SimuLab — AB360 by Yūtopias",
  robots: { index: false, follow: false },
};

export default function SimulabVideoPage() {
  return (
    <iframe
      src="/simulab-teaser.html"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: "none" }}
      title="SimuLab — Proyección de impacto de decisiones en gemelo digital"
    />
  );
}
