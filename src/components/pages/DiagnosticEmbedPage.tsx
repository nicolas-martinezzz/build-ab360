import path from "node:path";
import { readFile } from "node:fs/promises";
import { DiagnosticEmbedFrame } from "@/components/pages/DiagnosticEmbedFrame";

type DiagnosticEmbedPageProps = {
  locale: string;
  ariaLabel: string;
  title: string;
};

const getDiagnosticHtml = async (locale: string): Promise<string> => {
  const filePath = path.join(process.cwd(), "autodiagnostico.html");
  const html = await readFile(filePath, "utf8");

  return html.replace(
    "var answers = [];",
    `var answers = []; var diagnosticLocale = "${locale}";`,
  );
};

export const DiagnosticEmbedPage = async ({
  locale,
  ariaLabel,
  title,
}: DiagnosticEmbedPageProps) => {
  const html = await getDiagnosticHtml(locale);

  return <DiagnosticEmbedFrame ariaLabel={ariaLabel} html={html} title={title} />;
};
