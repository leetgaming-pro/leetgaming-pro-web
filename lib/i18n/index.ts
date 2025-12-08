/**
 * LeetGaming.PRO Internationalization (i18n) System
 * 
 * Supports multiple languages and regions for worldwide deployment.
 * Uses client-side locale detection and server-side rendering support.
 */

export type Locale = 
  | 'en-US' 
  | 'en-GB' 
  | 'pt-BR' 
  | 'es-ES' 
  | 'es-LA' 
  | 'de-DE' 
  | 'fr-FR' 
  | 'ja-JP' 
  | 'ko-KR' 
  | 'zh-CN' 
  | 'zh-TW' 
  | 'ru-RU' 
  | 'ar-SA';

export const locales: Locale[] = [
  'en-US',
  'en-GB',
  'pt-BR',
  'es-ES',
  'es-LA',
  'de-DE',
  'fr-FR',
  'ja-JP',
  'ko-KR',
  'zh-CN',
  'zh-TW',
  'ru-RU',
  'ar-SA',
];

export const defaultLocale: Locale = 'en-US';

export interface LocaleInfo {
  code: Locale;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  region: string;
}

export const localeInfo: Record<Locale, LocaleInfo> = {
  'en-US': { code: 'en-US', name: 'English (US)', nativeName: 'English', flag: '🇺🇸', direction: 'ltr', region: 'Americas' },
  'en-GB': { code: 'en-GB', name: 'English (UK)', nativeName: 'English', flag: '🇬🇧', direction: 'ltr', region: 'Europe' },
  'pt-BR': { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português', flag: '🇧🇷', direction: 'ltr', region: 'Americas' },
  'es-ES': { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr', region: 'Europe' },
  'es-LA': { code: 'es-LA', name: 'Spanish (Latin America)', nativeName: 'Español', flag: '🌎', direction: 'ltr', region: 'Americas' },
  'de-DE': { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', direction: 'ltr', region: 'Europe' },
  'fr-FR': { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr', region: 'Europe' },
  'ja-JP': { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', direction: 'ltr', region: 'Asia' },
  'ko-KR': { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', direction: 'ltr', region: 'Asia' },
  'zh-CN': { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', direction: 'ltr', region: 'Asia' },
  'zh-TW': { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼', direction: 'ltr', region: 'Asia' },
  'ru-RU': { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', direction: 'ltr', region: 'Europe' },
  'ar-SA': { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl', region: 'Middle East' },
};

/**
 * Get browser locale or default
 */
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  
  const browserLang = navigator.language || (navigator as any).userLanguage;
  
  // Check for exact match
  if (locales.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }
  
  // Check for language match (e.g., 'en' matches 'en-US')
  const langCode = browserLang.split('-')[0];
  const match = locales.find(l => l.startsWith(langCode));
  
  return match || defaultLocale;
}

/**
 * Get user's preferred locale from storage or browser
 */
export function getUserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  
  const stored = localStorage.getItem('leetgaming-locale');
  if (stored && locales.includes(stored as Locale)) {
    return stored as Locale;
  }
  
  return getBrowserLocale();
}

/**
 * Set user's preferred locale
 */
export function setUserLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('leetgaming-locale', locale);
}

/**
 * Format a number according to locale
 */
export function formatNumber(value: number, locale: Locale = defaultLocale): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format currency according to locale and currency code
 */
export function formatCurrency(
  value: number, 
  currency: string = 'USD', 
  locale: Locale = defaultLocale
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format date according to locale
 */
export function formatDate(
  date: Date | string | number,
  locale: Locale = defaultLocale,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat(locale, options || {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: Locale = defaultLocale
): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  if (days > 0) return rtf.format(-days, 'day');
  if (hours > 0) return rtf.format(-hours, 'hour');
  if (minutes > 0) return rtf.format(-minutes, 'minute');
  return rtf.format(-seconds, 'second');
}

