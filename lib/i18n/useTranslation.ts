"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  startTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  LOCALE_COOKIE_KEY,
  LOCALE_STORAGE_KEY,
  Locale,
  defaultLocale,
  detectBestLocale,
  getPersistedUserLocale,
  getUserLocale,
  localeInfo,
  normalizeLocale,
} from "./index";

// Import translations - Tier 1 Languages (PRD E.10)
import enUS from "./translations/en-US.json";
import ptBR from "./translations/pt-BR.json";
import esES from "./translations/es-ES.json";
import esLA from "./translations/es-LA.json";
import zhCN from "./translations/zh-CN.json";

type TranslationDictionary = typeof enUS;

const translations: Record<Locale, TranslationDictionary> = {
  // Tier 1 Languages (Full support)
  "en-US": enUS,
  "en-GB": enUS, // Fallback to en-US
  "pt-BR": ptBR,
  "es-ES": esES,
  "es-LA": esLA, // Latin American Spanish - dedicated translations
  "zh-CN": zhCN, // Chinese Simplified - full support
  // Tier 2 Languages (Fallback to en-US until translated)
  "de-DE": enUS, // TODO: Add German translations
  "fr-FR": enUS, // TODO: Add French translations
  "ja-JP": enUS, // TODO: Add Japanese translations
  "ko-KR": enUS, // TODO: Add Korean translations
  "zh-TW": zhCN, // Traditional Chinese fallback to Simplified
  "ru-RU": enUS, // TODO: Add Russian translations
  "ar-SA": enUS, // TODO: Add Arabic translations
};

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type _TranslationKey = NestedKeyOf<TranslationDictionary>;

interface I18nContextValue {
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: Locale;
  changeLocale: (newLocale: Locale) => void;
  currentLocale: (typeof localeInfo)[Locale];
  isLoading: boolean;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function resolveTranslation(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const primaryDict = translations[locale] || translations[defaultLocale];
  const fallbackDict = translations[defaultLocale];

  const getNestedValue = (
    dictionary: TranslationDictionary,
    path: string,
  ): string | undefined => {
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
  };

  const rawValue =
    getNestedValue(primaryDict, key) ?? getNestedValue(fallbackDict, key);

  if (!rawValue) {
    console.warn(`Translation missing: ${key} for locale ${locale}`);
    return key;
  }

  if (!params) {
    return rawValue;
  }

  return Object.entries(params).reduce((str, [param, val]) => {
    return str.replace(new RegExp(`\\{${param}\\}`, "g"), String(val));
  }, rawValue);
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(
    normalizeLocale(initialLocale),
  );
  const [isLoading, setIsLoading] = useState(true);

  const persistLocale = useCallback((nextLocale: Locale) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
  }, []);

  const syncServerLocale = useCallback(
    (nextLocale: Locale) => {
      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          document.cookie = `${LOCALE_COOKIE_KEY}=${encodeURIComponent(nextLocale)}; path=/; max-age=31536000; samesite=lax`;
          window.location.reload();
        }, 0);
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    },
    [router],
  );

  useEffect(() => {
    const serverLocale = normalizeLocale(
      initialLocale ??
        (typeof document !== "undefined"
          ? document.documentElement.lang
          : defaultLocale),
    );
    const persistedLocale = getPersistedUserLocale();
    const resolvedLocale = persistedLocale ?? serverLocale;

    setLocaleState(resolvedLocale);
    setIsLoading(false);

    if (persistedLocale && persistedLocale !== serverLocale) {
      persistLocale(persistedLocale);
      syncServerLocale(persistedLocale);
      return;
    }

    if (!persistedLocale) {
      const detectedLocale = getUserLocale() ?? detectBestLocale();

      if (detectedLocale !== serverLocale) {
        persistLocale(detectedLocale);
        setLocaleState(detectedLocale);
        syncServerLocale(detectedLocale);
      }
    }
  }, [initialLocale, persistLocale, syncServerLocale]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.lang = locale;
    document.documentElement.dir = localeInfo[locale].direction;
  }, [locale]);

  const changeLocale = useCallback(
    (newLocale: Locale) => {
      if (newLocale === locale) {
        return;
      }

      persistLocale(newLocale);
      setLocaleState(newLocale);
      syncServerLocale(newLocale);
    },
    [locale, persistLocale, syncServerLocale],
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string =>
      resolveTranslation(locale, key, params),
    [locale],
  );

  const currentLocale = useMemo(() => localeInfo[locale], [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      t,
      locale,
      changeLocale,
      currentLocale,
      isLoading,
      isRTL: currentLocale.direction === "rtl",
    }),
    [t, locale, changeLocale, currentLocale, isLoading],
  );

  return React.createElement(I18nContext.Provider, { value }, children);
}

/**
 * Hook for accessing translations
 */
export function useTranslation() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }

  return context;
}

/**
 * Provider component for i18n context (optional, can use hook directly)
 */
export { useTranslation as default };
