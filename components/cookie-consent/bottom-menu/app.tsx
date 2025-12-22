import React from "react";
import { Link } from "@nextui-org/react";
import { EsportsButton } from "@/components/ui/esports-button";
import CookieSettingsModal from "./CookieSettingsModal";

/**
 * Cookie utility functions for proper consent management
 * Uses actual cookies instead of localStorage for:
 * 1. Server-side access to consent status
 * 2. Proper expiration (1 year)
 * 3. GDPR compliance
 */
const COOKIE_CONSENT_NAME = "leetgaming_cookie_consent";
const COOKIE_EXPIRY_DAYS = 365;

function setCookieConsent(value: string) {
  const expires = new Date();
  expires.setTime(expires.getTime() + COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  document.cookie = `${COOKIE_CONSENT_NAME}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure`;
}

function getCookieConsent(): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === COOKIE_CONSENT_NAME) {
      return value;
    }
  }
  return null;
}

export default function CookieBottomMenu() {
  const [showCookieSettings, setShowCookieSettings] = React.useState(false);
  const [showCookieMenu, setShowCookieMenu] = React.useState(true);

  const handleRejectAll = () => {
    setCookieConsent("rejected");
    setShowCookieSettings(false);
    setShowCookieMenu(false);
  };

  const handleAcceptAll = () => {
    setCookieConsent("accepted");
    setShowCookieSettings(false);
    setShowCookieMenu(false);
  };

  const handleAcceptSelected = () => {
    setCookieConsent("selected");
    setShowCookieSettings(false);
    setShowCookieMenu(false);
  };

  React.useEffect(() => {
    const cookieConsent = getCookieConsent();
    if (cookieConsent) {
      setShowCookieMenu(false);
    }
  }, []);

  if (!showCookieMenu) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 px-6 pb-6 z-10">
      <div className="pointer-events-auto ml-auto max-w-sm rounded-large border border-divider bg-background/15 p-6 shadow-small backdrop-blur">
        <p className="text-small font-normal text-default-700">
          We use cookies on our website to give you the most relevant experience by remembering your
          preferences and repeat visits. By clicking&nbsp;
          <b className="font-semibold">&quot;Accept All&quot;</b>, you consent to the use of ALL the
          cookies. However, you may visit&nbsp;
          <span className="font-semibold">&quot;Cookie Settings&quot;</span> to provide a controlled
          consent. For more information, please read our{" "}
          <Link href="/legal/cookies" size="sm" underline="hover">
            Cookie Policy.
          </Link>
        </p>
        <div className="mt-4 space-y-2">
          <EsportsButton
            fullWidth
            variant="action"
            size="md"
            onClick={() => setShowCookieSettings(true)}
          >
            Cookie Settings
          </EsportsButton>
          {showCookieSettings && (
            <CookieSettingsModal onClose={() => setShowCookieSettings(false)} onRejectAll={handleRejectAll} onAcceptAll={handleAcceptAll} onAcceptSelected={handleAcceptSelected} />
          )}
          <EsportsButton
            fullWidth
            variant="ghost"
            size="md"
            onClick={handleRejectAll}
          >
            Reject All
          </EsportsButton>
          <EsportsButton
            fullWidth
            variant="primary"
            size="md"
            onClick={handleAcceptAll}
          >
            Accept All
          </EsportsButton>
        </div>
      </div>
    </div>
  );
}
