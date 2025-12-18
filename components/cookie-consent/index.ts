/**
 * Cookie Consent Components Exports
 */

export {
  CookieConsentBanner,
  CookieSettingsButton,
  useCookieConsent,
  type CookieConsentBannerProps,
  type CookiePreferences,
} from "./cookie-consent-banner";

// Re-export minimal variant for backward compatibility
export { default as MinimalCookieConsent } from "./minimal/app";
