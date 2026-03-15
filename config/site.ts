export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  highlight?: boolean;
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
      href: "/",
      icon: "solar:home-2-bold",
    },
    {
      label: "PLAY",
      href: "/match-making",
      icon: "solar:gamepad-bold",
      highlight: true, // Primary CTA
    },
    {
      label: "MATCHES",
      href: "/matches",
      icon: "solar:gamepad-2-bold",
    },
    {
      label: "PLAYERS",
      href: "/players",
      icon: "solar:user-bold",
    },
    {
      label: "TEAMS",
      href: "/teams",
      icon: "solar:users-group-two-rounded-bold",
    },
    {
      label: "TOURNAMENTS",
      href: "/tournaments",
      icon: "solar:cup-star-bold",
    },
    {
      label: "CLOUD",
      href: "/cloud",
      icon: "solar:cloud-bold",
    },
    {
      label: "DOCS",
      href: "/docs",
      icon: "solar:book-bold",
    },
  ],
  navMenuItems: [
    // Core Navigation
    {
      label: "Home",
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
      href: "/match-making",
      icon: "solar:gamepad-bold",
      highlight: true,
    },
    {
      label: "Browse Matches",
      href: "/matches",
      icon: "solar:gamepad-2-bold",
    },
    {
      label: "Replays",
      href: "/replays",
      icon: "solar:videocamera-record-bold",
    },
    {
      label: "Highlights",
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
      href: "/players",
      icon: "solar:user-bold",
    },
    {
      label: "Teams",
      href: "/teams",
      icon: "solar:users-group-two-rounded-bold",
    },
    {
      label: "Tournaments",
      href: "/tournaments",
      icon: "solar:cup-star-bold",
    },
    {
      label: "Leaderboards",
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
      href: "/cloud",
      icon: "solar:cloud-bold",
    },
    {
      label: "Upload Content",
      href: "/upload",
      icon: "solar:cloud-upload-bold",
    },
    {
      label: "Pricing Plans",
      href: "/pricing",
      icon: "solar:tag-price-bold",
    },
    {
      label: "Supply Store",
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
      href: "/wallet",
      icon: "solar:wallet-2-bold",
    },
    {
      label: "Subscription",
      href: "/checkout",
      icon: "solar:crown-bold",
    },
    {
      label: "Settings",
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
      href: "/docs",
      icon: "solar:book-bold",
    },
    {
      label: "Service Status",
      href: "/service-status",
      icon: "solar:server-bold",
    },
    {
      label: "Help & Support",
      href: "/docs#support",
      icon: "solar:question-circle-bold",
    },
    {
      label: "For Investors",
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
      href: "/legal/terms",
      icon: "solar:document-text-bold",
    },
    {
      label: "Privacy Policy",
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
