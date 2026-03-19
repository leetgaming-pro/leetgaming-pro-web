import { cookies } from "next/headers";

import {
  LOCALE_COOKIE_KEY,
  Locale,
  defaultLocale,
  localeInfo,
  normalizeLocale,
} from "./index";
import enUS from "./translations/en-US.json";
import ptBR from "./translations/pt-BR.json";
import esES from "./translations/es-ES.json";
import esLA from "./translations/es-LA.json";
import zhCN from "./translations/zh-CN.json";

type TranslationDictionary = typeof enUS;
export type TierOneLocale = "en-US" | "pt-BR" | "es-ES" | "es-LA" | "zh-CN";

const translations: Record<Locale, TranslationDictionary> = {
  "en-US": enUS,
  "en-GB": enUS,
  "pt-BR": ptBR,
  "es-ES": esES,
  "es-LA": esLA,
  "zh-CN": zhCN,
  "de-DE": enUS,
  "fr-FR": enUS,
  "ja-JP": enUS,
  "ko-KR": enUS,
  "zh-TW": zhCN,
  "ru-RU": enUS,
  "ar-SA": enUS,
};

function getNestedValue(
  dictionary: TranslationDictionary,
  path: string,
): string | undefined {
  const keys = path.split(".");
  let value: unknown = dictionary;

  for (const currentKey of keys) {
    if (value && typeof value === "object" && currentKey in value) {
      value = (value as Record<string, unknown>)[currentKey];
    } else {
      return undefined;
    }
  }

  return typeof value === "string" ? value : undefined;
}

function resolveTranslation(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const primaryDict = translations[locale] || translations[defaultLocale];
  const fallbackDict = translations[defaultLocale];
  const rawValue =
    getNestedValue(primaryDict, key) ?? getNestedValue(fallbackDict, key);

  if (!rawValue) {
    return key;
  }

  if (!params) {
    return rawValue;
  }

  return Object.entries(params).reduce((str, [param, val]) => {
    return str.replace(new RegExp(`\\{${param}\\}`, "g"), String(val));
  }, rawValue);
}

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(
    cookieStore.get(LOCALE_COOKIE_KEY)?.value ?? defaultLocale,
  );
}

export async function getServerI18n() {
  const locale = await getServerLocale();

  return {
    locale,
    t: (key: string, params?: Record<string, string | number>) =>
      resolveTranslation(locale, key, params),
    isRTL: localeInfo[locale].direction === "rtl",
  };
}

export function getTierOneLocale(locale: Locale): TierOneLocale {
  switch (locale) {
    case "pt-BR":
    case "es-ES":
    case "es-LA":
    case "zh-CN":
      return locale;
    case "zh-TW":
      return "zh-CN";
    default:
      return "en-US";
  }
}

export function formatLocalizedDate(
  value: string | Date,
  locale: Locale,
): string {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
