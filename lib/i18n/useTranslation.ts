"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Locale,
  defaultLocale,
  getUserLocale,
  setUserLocale,
  localeInfo,
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

type TranslationKey = NestedKeyOf<TranslationDictionary>;

/**
 * Hook for accessing translations
 */
export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize locale from storage/browser on mount
  useEffect(() => {
    const userLocale = getUserLocale();
    setLocaleState(userLocale);
    setIsLoading(false);
  }, []);

  // Change locale function
  const changeLocale = useCallback((newLocale: Locale) => {
    setUserLocale(newLocale);
    setLocaleState(newLocale);

    // Update HTML lang attribute
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLocale;
      document.documentElement.dir = localeInfo[newLocale].direction;
    }
  }, []);

  // Get translation function
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = translations[locale] || translations[defaultLocale];

      // Navigate nested keys (e.g., 'common.loading')
      const keys = key.split(".");
      let value: any = dict;

      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k];
        } else {
          // Key not found, return the key itself
          console.warn(`Translation missing: ${key} for locale ${locale}`);
          return key;
        }
      }

      if (typeof value !== "string") {
        return key;
      }

      // Replace parameters (e.g., {provider} -> Steam)
      if (params) {
        return Object.entries(params).reduce((str, [param, val]) => {
          return str.replace(new RegExp(`\\{${param}\\}`, "g"), String(val));
        }, value);
      }

      return value;
    },
    [locale]
  );

  // Get current locale info
  const currentLocale = useMemo(() => localeInfo[locale], [locale]);

  return {
    t,
    locale,
    changeLocale,
    currentLocale,
    isLoading,
    isRTL: currentLocale.direction === "rtl",
  };
}

/**
 * Provider component for i18n context (optional, can use hook directly)
 */
export { useTranslation as default };
