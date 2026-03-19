/**
 * LeetGaming.PRO Internationalization (i18n) System
 *
 * Supports multiple languages and regions for worldwide deployment.
 * Uses client-side locale detection and server-side rendering support.
 */

export type Locale =
  | "en-US"
  | "en-GB"
  | "pt-BR"
  | "es-ES"
  | "es-LA"
  | "de-DE"
  | "fr-FR"
  | "ja-JP"
  | "ko-KR"
  | "zh-CN"
  | "zh-TW"
  | "ru-RU"
  | "ar-SA";

export const locales: Locale[] = [
  "en-US",
  "en-GB",
  "pt-BR",
  "es-ES",
  "es-LA",
  "de-DE",
  "fr-FR",
  "ja-JP",
  "ko-KR",
  "zh-CN",
  "zh-TW",
  "ru-RU",
  "ar-SA",
];

export const defaultLocale: Locale = "en-US";
export const LOCALE_STORAGE_KEY = "leetgaming-locale";
export const LOCALE_COOKIE_KEY = "leetgaming-locale";

export interface LocaleInfo {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
  direction: "ltr" | "rtl";
  region: string;
}

export const localeInfo: Record<Locale, LocaleInfo> = {
  "en-US": {
    code: "en-US",
    name: "English (US)",
    nativeName: "English",
    flag: "🇺🇸",
    direction: "ltr",
    region: "Americas",
  },
  "en-GB": {
    code: "en-GB",
    name: "English (UK)",
    nativeName: "English",
    flag: "🇬🇧",
    direction: "ltr",
    region: "Europe",
  },
  "pt-BR": {
    code: "pt-BR",
    name: "Portuguese (Brazil)",
    nativeName: "Português",
    flag: "🇧🇷",
    direction: "ltr",
    region: "Americas",
  },
  "es-ES": {
    code: "es-ES",
    name: "Spanish (Spain)",
    nativeName: "Español",
    flag: "🇪🇸",
    direction: "ltr",
    region: "Europe",
  },
  "es-LA": {
    code: "es-LA",
    name: "Spanish (Latin America)",
    nativeName: "Español",
    flag: "🌎",
    direction: "ltr",
    region: "Americas",
  },
  "de-DE": {
    code: "de-DE",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    direction: "ltr",
    region: "Europe",
  },
  "fr-FR": {
    code: "fr-FR",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    direction: "ltr",
    region: "Europe",
  },
  "ja-JP": {
    code: "ja-JP",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    direction: "ltr",
    region: "Asia",
  },
  "ko-KR": {
    code: "ko-KR",
    name: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷",
    direction: "ltr",
    region: "Asia",
  },
  "zh-CN": {
    code: "zh-CN",
    name: "Chinese (Simplified)",
    nativeName: "简体中文",
    flag: "🇨🇳",
    direction: "ltr",
    region: "Asia",
  },
  "zh-TW": {
    code: "zh-TW",
    name: "Chinese (Traditional)",
    nativeName: "繁體中文",
    flag: "🇹🇼",
    direction: "ltr",
    region: "Asia",
  },
  "ru-RU": {
    code: "ru-RU",
    name: "Russian",
    nativeName: "Русский",
    flag: "🇷🇺",
    direction: "ltr",
    region: "Europe",
  },
  "ar-SA": {
    code: "ar-SA",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    direction: "rtl",
    region: "Middle East",
  },
};

export type TierOneLocale = "en-US" | "pt-BR" | "es-ES" | "es-LA" | "zh-CN";

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

export function isSupportedLocale(
  value: string | null | undefined,
): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export function normalizeLocale(value: string | null | undefined): Locale {
  if (isSupportedLocale(value)) {
    return value;
  }

  if (!value) {
    return defaultLocale;
  }

  const lowerValue = value.toLowerCase();
  const exactLanguageMatch = locales.find(
    (locale) => locale.toLowerCase() === lowerValue,
  );
  if (exactLanguageMatch) {
    return exactLanguageMatch;
  }

  const languageCode = lowerValue.split("-")[0];
  const languageMatch = locales.find((locale) =>
    locale.toLowerCase().startsWith(`${languageCode}-`),
  );

  return languageMatch ?? defaultLocale;
}

/**
 * Map timezone to region for better locale detection
 */
const timezoneToRegion: Record<string, Locale> = {
  // Americas
  "America/New_York": "en-US",
  "America/Los_Angeles": "en-US",
  "America/Chicago": "en-US",
  "America/Denver": "en-US",
  "America/Sao_Paulo": "pt-BR",
  "America/Buenos_Aires": "es-LA",
  "America/Mexico_City": "es-LA",
  "America/Bogota": "es-LA",
  "America/Lima": "es-LA",
  "America/Santiago": "es-LA",
  "America/Toronto": "en-US",
  // Europe
  "Europe/London": "en-GB",
  "Europe/Paris": "fr-FR",
  "Europe/Berlin": "de-DE",
  "Europe/Madrid": "es-ES",
  "Europe/Rome": "en-GB",
  "Europe/Moscow": "ru-RU",
  "Europe/Lisbon": "pt-BR", // Portuguese speakers may prefer pt-BR
  // Asia
  "Asia/Tokyo": "ja-JP",
  "Asia/Seoul": "ko-KR",
  "Asia/Shanghai": "zh-CN",
  "Asia/Hong_Kong": "zh-TW",
  "Asia/Taipei": "zh-TW",
  "Asia/Singapore": "en-US",
  // Middle East
  "Asia/Dubai": "ar-SA",
  "Asia/Riyadh": "ar-SA",
  // Oceania
  "Australia/Sydney": "en-GB",
  "Pacific/Auckland": "en-GB",
};

/**
 * Detect locale from user's timezone
 */
export function getLocaleFromTimezone(): Locale | null {
  if (typeof window === "undefined") return null;

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezoneToRegion[timezone] || null;
  } catch {
    return null;
  }
}

/**
 * Get browser locale or default
 */
export function getBrowserLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;

  // userLanguage is a non-standard IE property
  const nav = navigator as Navigator & { userLanguage?: string };
  const browserLang = navigator.language || nav.userLanguage || defaultLocale;

  // Check for exact match
  return normalizeLocale(browserLang);
}

/**
 * Get best locale based on browser language and timezone
 */
export function detectBestLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;

  // First check browser language
  const browserLocale = getBrowserLocale();

  // If browser locale is specific (not just en-US default), use it
  if (browserLocale !== defaultLocale) {
    return browserLocale;
  }

  // Try timezone detection for better regional accuracy
  const timezoneLocale = getLocaleFromTimezone();
  if (timezoneLocale) {
    return timezoneLocale;
  }

  return browserLocale;
}

/**
 * Get user's preferred locale from storage or auto-detect
 */
export function getUserLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;

  const persistedLocale = getPersistedUserLocale();
  if (persistedLocale) {
    return persistedLocale;
  }

  // Auto-detect best locale based on browser + timezone
  return detectBestLocale();
}

/**
 * Get a locale explicitly persisted by the user via localStorage or cookies.
 */
export function getPersistedUserLocale(): Locale | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored) {
    return normalizeLocale(stored);
  }

  const cookieLocale = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${LOCALE_COOKIE_KEY}=`))
    ?.split("=")[1];

  if (cookieLocale) {
    return normalizeLocale(decodeURIComponent(cookieLocale));
  }

  return null;
}

/**
 * Set user's preferred locale
 */
export function setUserLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  document.cookie = `${LOCALE_COOKIE_KEY}=${encodeURIComponent(locale)}; path=/; max-age=31536000; samesite=lax`;
}

/**
 * Format a number according to locale
 */
export function formatNumber(
  value: number,
  locale: Locale = defaultLocale,
): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format currency according to locale and currency code
 */
export function formatCurrency(
  value: number,
  currency: string = "USD",
  locale: Locale = defaultLocale,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Format date according to locale
 */
export function formatDate(
  date: Date | string | number,
  locale: Locale = defaultLocale,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat(
    locale,
    options || {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  ).format(d);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: Locale = defaultLocale,
): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (days > 0) return rtf.format(-days, "day");
  if (hours > 0) return rtf.format(-hours, "hour");
  if (minutes > 0) return rtf.format(-minutes, "minute");
  return rtf.format(-seconds, "second");
}
