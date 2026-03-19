export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  highlight?: boolean;
  labelKey?: string;
}

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  logoName: "LeetGaming.PRO",
  name: "LeetGaming PRO",
  description:
    "Competitive gaming platform with matchmaking, tournaments, and analytics",
  navItems: [
    {
      label: "HOME",
      labelKey: "nav.home",
      href: "/",
      icon: "solar:home-2-bold",
    },
    {
      label: "PLAY",
      labelKey: "nav.play",
      href: "/match-making",
      icon: "solar:gamepad-bold",
      highlight: true, // Primary CTA
    },
    {
      label: "MATCHES",
      labelKey: "nav.matches",
      href: "/matches",
      icon: "solar:gamepad-2-bold",
    },
    {
      label: "PLAYERS",
      labelKey: "nav.players",
      href: "/players",
      icon: "solar:user-bold",
    },
    {
      label: "TEAMS",
      labelKey: "nav.teams",
      href: "/teams",
      icon: "solar:users-group-two-rounded-bold",
    },
    {
      label: "TOURNAMENTS",
      labelKey: "nav.tournaments",
      href: "/tournaments",
      icon: "solar:cup-star-bold",
    },
    {
      label: "CLOUD",
      labelKey: "nav.cloud",
      href: "/cloud",
      icon: "solar:cloud-bold",
    },
    {
      label: "DOCS",
      labelKey: "nav.docs",
      href: "/docs",
      icon: "solar:book-bold",
    },
  ],
  navMenuItems: [
    // Core Navigation
    {
      label: "Home",
      labelKey: "nav.home",
      href: "/",
      icon: "solar:home-2-bold",
    },
    {
      label: "divider",
      href: "",
    },
    // Primary Actions
    {
      label: "Play Now",
      labelKey: "nav.playNow",
      href: "/match-making",
      icon: "solar:gamepad-bold",
      highlight: true,
    },
    {
      label: "Browse Matches",
      labelKey: "nav.browseMatches",
      href: "/matches",
      icon: "solar:gamepad-2-bold",
    },
    {
      label: "Replays",
      labelKey: "nav.replays",
      href: "/replays",
      icon: "solar:videocamera-record-bold",
    },
    {
      label: "Highlights",
      labelKey: "nav.highlights",
      href: "/highlights",
      icon: "solar:star-bold",
    },
    {
      label: "divider",
      href: "",
    },
    // Community
    {
      label: "Players",
      labelKey: "nav.players",
      href: "/players",
      icon: "solar:user-bold",
    },
    {
      label: "Teams",
      labelKey: "nav.teams",
      href: "/teams",
      icon: "solar:users-group-two-rounded-bold",
    },
    {
      label: "Tournaments",
      labelKey: "nav.tournaments",
      href: "/tournaments",
      icon: "solar:cup-star-bold",
    },
    {
      label: "Leaderboards",
      labelKey: "nav.leaderboards",
      href: "/leaderboards",
      icon: "solar:ranking-bold",
    },
    {
      label: "divider",
      href: "",
    },
    // Resources
    {
      label: "Cloud Storage",
      labelKey: "nav.cloudStorage",
      href: "/cloud",
      icon: "solar:cloud-bold",
    },
    {
      label: "Upload Content",
      labelKey: "nav.uploadContent",
      href: "/upload",
      icon: "solar:cloud-upload-bold",
    },
    {
      label: "Pricing Plans",
      labelKey: "nav.pricingPlans",
      href: "/pricing",
      icon: "solar:tag-price-bold",
    },
    {
      label: "Supply Store",
      labelKey: "nav.supplyStore",
      href: "/supply",
      icon: "solar:shop-bold",
    },
    {
      label: "divider",
      href: "",
    },
    // Account
    {
      label: "My Wallet",
      labelKey: "nav.myWallet",
      href: "/wallet/pro",
      icon: "solar:wallet-2-bold",
    },
    {
      label: "Subscription",
      labelKey: "nav.subscription",
      href: "/checkout",
      icon: "solar:crown-bold",
    },
    {
      label: "Settings",
      labelKey: "nav.settings",
      href: "/settings",
      icon: "solar:settings-bold",
    },
    {
      label: "divider",
      href: "",
    },
    // Support
    {
      label: "Documentation",
      labelKey: "nav.docs",
      href: "/docs",
      icon: "solar:book-bold",
    },
    {
      label: "Service Status",
      labelKey: "nav.serviceStatus",
      href: "/service-status",
      icon: "solar:server-bold",
    },
    {
      label: "Help & Support",
      labelKey: "nav.helpSupport",
      href: "/docs#support",
      icon: "solar:question-circle-bold",
    },
    {
      label: "For Investors",
      labelKey: "nav.investors",
      href: "/investors",
      icon: "solar:chart-2-bold",
    },
    {
      label: "divider",
      href: "",
    },
    // Legal
    {
      label: "Terms of Service",
      labelKey: "nav.terms",
      href: "/legal/terms",
      icon: "solar:document-text-bold",
    },
    {
      label: "Privacy Policy",
      labelKey: "nav.privacy",
      href: "/legal/privacy",
      icon: "solar:shield-check-bold",
    },
  ],
  links: {
    github: "https://github.com/leetgaming-pro",
    twitter: "https://twitter.com/leetgamingpro",
    tech: "https://dev.leetgaming.pro",
    discord: "https://discord.gg/leetgaming",
    sponsor: "https://patreon.com/leetgaming",
  },
};
