import { readFileSync } from "node:fs";
import { join } from "node:path";

const LOCALES = ["es", "en", "ca"];
const MESSAGES_DIR = join(process.cwd(), "src", "messages");

const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

const collectKeyPaths = (value, basePath = "") => {
  if (Array.isArray(value)) {
    return [basePath];
  }

  if (!isObject(value)) {
    return [basePath];
  }

  return Object.entries(value).flatMap(([key, child]) => {
    const nextPath = basePath ? `${basePath}.${key}` : key;
    return collectKeyPaths(child, nextPath);
  });
};

const localeData = Object.fromEntries(
  LOCALES.map((locale) => {
    const filePath = join(MESSAGES_DIR, `${locale}.json`);
    const content = JSON.parse(readFileSync(filePath, "utf8"));
    return [locale, content];
  }),
);

const keySets = Object.fromEntries(
  LOCALES.map((locale) => [locale, new Set(collectKeyPaths(localeData[locale]).filter(Boolean))]),
);

const allKeys = new Set(LOCALES.flatMap((locale) => [...keySets[locale]]));
const missingByLocale = Object.fromEntries(LOCALES.map((locale) => [locale, []]));

for (const key of allKeys) {
  for (const locale of LOCALES) {
    if (!keySets[locale].has(key)) {
      missingByLocale[locale].push(key);
    }
  }
}

const hasMissing = LOCALES.some((locale) => missingByLocale[locale].length > 0);

if (hasMissing) {
  console.error("i18n parity check failed. Missing keys detected:");
  for (const locale of LOCALES) {
    if (missingByLocale[locale].length === 0) {
      continue;
    }
    console.error(`\n[${locale}] missing ${missingByLocale[locale].length} key(s):`);
    for (const key of missingByLocale[locale]) {
      console.error(`- ${key}`);
    }
  }
  process.exit(1);
}

console.log(`i18n parity check passed (${allKeys.size} keys across ${LOCALES.length} locales).`);
