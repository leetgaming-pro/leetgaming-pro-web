import type {PricingFeatures} from "./pricing-comparison-types";

import {TiersEnum} from "./pricing-types";

const features: PricingFeatures = [
  {
    title: "Replay Analysis & Storage",
    items: [
      {
        title: "Replay uploads",
        tiers: {
          [TiersEnum.Free]: "5/month",
          [TiersEnum.Pro]: "Unlimited",
          [TiersEnum.Team]: "Unlimited",
          [TiersEnum.Organizer]: "Unlimited",
        },
        helpText: "Upload CS2, Valorant, and other game replay files for analysis.",
      },
      {
        title: "Cloud storage",
        tiers: {
          [TiersEnum.Free]: "500 MB",
          [TiersEnum.Pro]: "25 GB",
          [TiersEnum.Team]: "100 GB",
          [TiersEnum.Organizer]: "500 GB",
        },
        helpText: "Store replays, clips, and media in the cloud.",
      },
      {
        title: "Media albums",
        tiers: {
          [TiersEnum.Free]: "1 album",
          [TiersEnum.Pro]: "10 albums",
          [TiersEnum.Team]: "50 albums",
          [TiersEnum.Organizer]: "Unlimited",
        },
        helpText: "Organize clips and highlights into albums.",
      },
      {
        title: "Highlight generation",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: true,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Automatically generate highlight clips from your best plays.",
      },
    ],
  },
  {
    title: "Analytics & Insights",
    items: [
      {
        title: "Basic stats (K/D, ADR, Rating)",
        tiers: {
          [TiersEnum.Free]: true,
          [TiersEnum.Pro]: true,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Track essential performance metrics for each match.",
      },
      {
        title: "Advanced analytics",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: true,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Economy analysis, utility usage, positioning heatmaps, and more.",
      },
      {
        title: "AI-powered recommendations",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: true,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Get personalized tips to improve your gameplay.",
      },
      {
        title: "Team analytics dashboard",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: false,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Comprehensive team performance tracking and analysis.",
      },
      {
        title: "Opponent scouting & research",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: false,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Research opposing teams before matches.",
      },
      {
        title: "Enterprise reporting",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: false,
          [TiersEnum.Team]: false,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Custom reports and data exports for stakeholders.",
      },
    ],
  },
  {
    title: "Squad & Team Management",
    items: [
      {
        title: "Squad profiles",
        tiers: {
          [TiersEnum.Free]: "1 squad",
          [TiersEnum.Pro]: "3 squads",
          [TiersEnum.Team]: "10 squads",
          [TiersEnum.Organizer]: "Unlimited",
        },
        helpText: "Create and manage team profiles.",
      },
      {
        title: "Players per squad",
        tiers: {
          [TiersEnum.Free]: "5 players",
          [TiersEnum.Pro]: "10 players",
          [TiersEnum.Team]: "25 players",
          [TiersEnum.Organizer]: "Unlimited",
        },
        helpText: "Maximum roster size per squad.",
      },
      {
        title: "Custom team branding",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: false,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Upload logos, banners, and customize team appearance.",
      },
      {
        title: "Scrim scheduling calendar",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: false,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Schedule and manage practice matches with other teams.",
      },
      {
        title: "Team seats included",
        tiers: {
          [TiersEnum.Free]: "1 seat",
          [TiersEnum.Pro]: "5 profiles",
          [TiersEnum.Team]: "10 seats",
          [TiersEnum.Organizer]: "Unlimited",
        },
        helpText: "Number of team members who can access the subscription.",
      },
    ],
  },
  {
    title: "Matchmaking & Competition",
    items: [
      {
        title: "Casual matchmaking",
        tiers: {
          [TiersEnum.Free]: true,
          [TiersEnum.Pro]: true,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Find matches with other casual players.",
      },
      {
        title: "Ranked & competitive queues",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: true,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Access skill-based competitive matchmaking.",
      },
      {
        title: "Priority matchmaking",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: true,
          [TiersEnum.Team]: "Team priority",
          [TiersEnum.Organizer]: "Dedicated",
        },
        helpText: "Skip the queue with priority matching.",
      },
      {
        title: "Custom lobbies",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: "5 active",
          [TiersEnum.Team]: "25 active",
          [TiersEnum.Organizer]: "Unlimited",
        },
        helpText: "Create private lobbies for scrims and practice.",
      },
      {
        title: "Skill-based wager matches",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: true,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Compete for stakes in skill-based matches (where legal).",
      },
    ],
  },
  {
    title: "Tournaments",
    items: [
      {
        title: "Community tournament access",
        tiers: {
          [TiersEnum.Free]: true,
          [TiersEnum.Pro]: true,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Join community-organized tournaments.",
      },
      {
        title: "All tournament access",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: true,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Access all tournament tiers including premium events.",
      },
      {
        title: "Host tournaments",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: false,
          [TiersEnum.Team]: "3/month",
          [TiersEnum.Organizer]: "Unlimited",
        },
        helpText: "Create and host your own tournaments.",
      },
      {
        title: "Custom bracket formats",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: false,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Single/double elimination, Swiss, round-robin, and more.",
      },
      {
        title: "Automated prize distribution",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: false,
          [TiersEnum.Team]: false,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Automatic prize pool distribution via crypto or fiat.",
      },
      {
        title: "Sponsor integration tools",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: false,
          [TiersEnum.Team]: false,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Integrate sponsor branding and messaging.",
      },
    ],
  },
  {
    title: "Platform & Integrations",
    items: [
      {
        title: "Ad-free experience",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: true,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: "White-label",
        },
        helpText: "Browse without advertisements.",
      },
      {
        title: "Discord integration",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: "Basic",
          [TiersEnum.Team]: "Full",
          [TiersEnum.Organizer]: "Custom bot",
        },
        helpText: "Connect your Discord server for notifications and management.",
      },
      {
        title: "API access",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: false,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: "Higher limits",
        },
        helpText: "Programmatic access to your data and features.",
      },
      {
        title: "Webhooks",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: false,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: "Advanced",
        },
        helpText: "Real-time event notifications for your systems.",
      },
      {
        title: "White-label branding",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: false,
          [TiersEnum.Team]: false,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Full platform customization with your branding.",
      },
    ],
  },
  {
    title: "Wallet & Payments",
    items: [
      {
        title: "Wallet & prize payouts",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: true,
          [TiersEnum.Team]: "Team wallet",
          [TiersEnum.Organizer]: "Automated",
        },
        helpText: "Receive prize money and manage payments.",
      },
      {
        title: "Crypto payments",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: true,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Accept and send cryptocurrency payments.",
      },
      {
        title: "Team payout splitting",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: false,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Automatically split winnings among team members.",
      },
    ],
  },
  {
    title: "Support & Extras",
    items: [
      {
        title: "Help center access",
        tiers: {
          [TiersEnum.Free]: true,
          [TiersEnum.Pro]: true,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Access to documentation and knowledge base.",
      },
      {
        title: "Email support",
        tiers: {
          [TiersEnum.Free]: "Best effort",
          [TiersEnum.Pro]: "Priority",
          [TiersEnum.Team]: "Priority",
          [TiersEnum.Organizer]: "Priority",
        },
        helpText: "Get help via email from our support team.",
      },
      {
        title: "Phone support",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: false,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Direct phone support for urgent issues.",
      },
      {
        title: "Dedicated account manager",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: false,
          [TiersEnum.Team]: false,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Your personal point of contact for all needs.",
      },
      {
        title: "Early access to features",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: true,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: "Private beta",
        },
        helpText: "Try new features before they're released.",
      },
      {
        title: "Exclusive content & guides",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: true,
          [TiersEnum.Team]: true,
          [TiersEnum.Organizer]: true,
        },
        helpText: "Pro-only guides, tips, and educational content.",
      },
      {
        title: "SLA guarantee",
        tiers: {
          [TiersEnum.Free]: false,
          [TiersEnum.Pro]: false,
          [TiersEnum.Team]: false,
          [TiersEnum.Organizer]: "99.9%",
        },
        helpText: "Service level agreement with uptime guarantee.",
      },
    ],
  },
];

export default features;
