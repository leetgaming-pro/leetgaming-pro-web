import React from "react";
import { Button, Link } from "@nextui-org/react";
import CookieSettingsModal from "./CookieSettingsModal";

export default function CookieBottomMenu() {
  const [showCookieSettings, setShowCookieSettings] = React.useState(false);
  const [showCookieMenu, setShowCookieMenu] = React.useState(true);

  const handleRejectAll = () => {
    sessionStorage.setItem("cookieConsent", "rejected");
    setShowCookieSettings(false);
    setShowCookieMenu(false);
  };

  const handleAcceptAll = () => {
    sessionStorage.setItem("cookieConsent", "accepted");
    setShowCookieSettings(false);
    setShowCookieMenu(false);
  };

  const handleAcceptSelected = () => {
    sessionStorage.setItem("cookieConsent", "selected");
    setShowCookieSettings(false);
    setShowCookieMenu(false);
  };

  React.useEffect(() => {
    const cookieConsent = sessionStorage.getItem("cookieConsent");
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
          <Link href="#" size="sm" underline="hover">
            Cookie Policy.
          </Link>
        </p>
        <div className="mt-4 space-y-2">
          <Button
            fullWidth
            className="px-4 font-medium"
            radius="lg"
            style={{
              border: "solid 2px transparent",
              backgroundImage: `linear-gradient(hsl(var(--nextui-background)), hsl(var(--nextui-background))), linear-gradient(83.87deg, #FF4654, #FFC700)`,
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
            }}
            onClick={() => setShowCookieSettings(true)}
          >
            Cookie Settings
          </Button>
          {showCookieSettings && (
            <CookieSettingsModal onClose={() => setShowCookieSettings(false)} onRejectAll={handleRejectAll} onAcceptAll={handleAcceptAll} onAcceptSelected={handleAcceptSelected} />
          )}
          <Button
            fullWidth
            className="border-default-200 font-medium text-default-foreground"
            radius="lg"
            variant="bordered"
            onClick={handleRejectAll}
          >
            Reject All
          </Button>
          <Button
            fullWidth
            className="font-medium text-default-foreground"
            radius="lg"
            variant="light"
            onClick={handleAcceptAll}
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
