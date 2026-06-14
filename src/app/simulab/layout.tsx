import type { ReactNode } from "react";

export default function SimulabLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, overflow: "hidden", background: "#0c0e16" }}>
        {children}
      </body>
    </html>
  );
}
