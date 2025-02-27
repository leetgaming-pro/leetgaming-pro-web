import CookieBottomMenu from "../cookie-consent/bottom-menu/app";
// import CookieSettingsConsent from "../cookie-consent/bottom-settings/app";
// import CookieConsentBrandColors from "../cookie-consent/brand-color/app";

export default function Box({
	children,
}: {
	children: React.ReactNode;
}) {
  return (
    <div style={{boxSizing: "border-box", maxWidth: "100%" }}>
      {children}
      <CookieBottomMenu/>
      </div>
  );
}
