import {Chip, LinkIcon, Spacer} from "@nextui-org/react";
import {Icon} from "@iconify/react";

import {type SidebarItem, SidebarItemType} from "./sidebar";
import TeamAvatar from "./team-avatar";
import { PlusIcon } from '../icons';

/**
 * Please check the https://nextui.org/docs/guide/routing to have a seamless router integration
 */

export const items: SidebarItem[] = [
  {
    key: "home",
    href: "/",
    icon: "solar:home-2-linear",
    title: "Home",
  },
  {
    key: "match-making",
    href: "/match-making",
    icon: "solar:gamepad-bold",
    title: "Play Now",
    endContent: (
      <Chip size="sm" variant="flat" color="success">
        Live
      </Chip>
    ),
  },
  {
    key: "tournaments",
    href: "/tournaments",
    icon: "solar:cup-star-bold",
    title: "Tournaments",
  },
  {
    key: "teams",
    href: "/teams",
    icon: "solar:users-group-two-rounded-outline",
    title: "Teams",
  },
  {
    key: "leaderboards",
    href: "/leaderboards",
    icon: "solar:ranking-bold",
    title: "Leaderboards",
  },
  {
    key: "analytics",
    href: "/analytics",
    icon: "solar:chart-outline",
    title: "Analytics",
  },
  {
    key: "wallet",
    href: "/wallet",
    icon: "solar:wallet-bold",
    title: "Wallet",
  },
  {
    key: "settings",
    href: "/settings",
    icon: "solar:settings-outline",
    title: "Settings",
  },
];

export const sectionItems: SidebarItem[] = [
  {
    key: "quickstart",
    title: "Quick Start",
    items: [
      {
        key: "match-making",
        href: "/match-making",
        icon: "solar:gamepad-bold",
        title: "Play Now",
        endContent: (
          <Chip size="sm" variant="flat" color="success" className="text-xs">
            Live
          </Chip>
        ),
      },
      {
        key: "upload-replay-file",
        href: "/upload",
        icon: "solar:cloud-upload-bold",
        title: "Upload Replay",
        endContent: <PlusIcon />
      },
      {
        key: "onboarding",
        href: "/onboarding",
        icon: "solar:star-bold",
        title: "Get Started",
      },
    ],
  },
  {
    key: "compete",
    title: "Compete",
    items: [
      {
        key: "tournaments",
        href: "/tournaments",
        icon: "solar:cup-star-bold",
        title: "Tournaments",
      },
      {
        key: "leaderboards",
        href: "/leaderboards",
        icon: "solar:ranking-bold",
        title: "Leaderboards",
      },
      {
        key: "ranked",
        href: "/ranked",
        icon: "solar:medal-ribbons-star-bold",
        title: "Ranked Play",
      },
    ],
  },
  {
    key: "community",
    title: "Community",
    items: [
      {
        key: "find-team",
        href: "/teams",
        icon: "solar:users-group-two-rounded-bold",
        title: "Teams",
      },
      {
        key: "players",
        href: "/players",
        icon: "solar:user-bold",
        title: "Players",
      },
      {
        key: "player-register",
        href: "/players/register",
        icon: "solar:user-plus-bold",
        title: "Create Profile",
      },
    ],
  },
  {
    key: "storage",
    title: "Cloud Storage",
    items: [
      {
        key: "cloud",
        href: "/cloud",
        icon: "solar:cloud-bold",
        title: "Dashboard",
      },
      {
        key: "replays",
        href: "/replays",
        icon: "solar:videocamera-record-bold",
        title: "My Replays",
      },
      {
        key: "analytics",
        href: "/analytics",
        icon: "solar:chart-2-bold",
        title: "Analytics",
      },
    ],
  },
  {
    key: "account",
    title: "Account",
    items: [
      {
        key: "wallet",
        href: "/wallet",
        icon: "solar:wallet-bold",
        title: "Wallet",
        endContent: (
          <Chip size="sm" variant="flat" color="success">
            $
          </Chip>
        ),
      },
      {
        key: "subscription",
        href: "/checkout",
        icon: "solar:crown-bold",
        title: "Subscription",
        endContent: (
          <Chip size="sm" variant="flat" color="warning">
            Pro
          </Chip>
        ),
      },
      {
        key: "billing",
        href: "/settings?tab=billing",
        icon: "solar:card-bold",
        title: "Billing",
      },
      {
        key: "privacy",
        href: "/settings?tab=privacy",
        icon: "solar:shield-check-bold",
        title: "Privacy & Data",
      },
      {
        key: "security",
        href: "/settings?tab=security",
        icon: "solar:lock-bold",
        title: "Security & MFA",
      },
      {
        key: "settings",
        href: "/settings",
        icon: "solar:settings-bold",
        title: "Settings",
      },
      {
        key: "help",
        href: "/help",
        icon: "solar:question-circle-bold",
        title: "Help & Support",
      },
    ],
  },
];

export const sectionItemsWithTeams: SidebarItem[] = [
  ...sectionItems,
  {
    key: "your-teams",
    title: "Your Teams",
    items: [
      {
        key: "create-team",
        href: "/teams/create",
        title: "Create Team",
        icon: "solar:add-circle-bold",
      },
      {
        key: "my-teams",
        href: "/teams/my",
        title: "My Teams",
        startContent: <TeamAvatar name="My Teams" />,
      },
    ],
  },
];

export const brandItems: SidebarItem[] = [
  {
    key: "overview",
    title: "Overview",
    items: [
      {
        key: "home",
        href: "/",
        icon: "solar:home-2-linear",
        title: "Home",
      },
      {
        key: "match-making",
        href: "/match-making",
        icon: "solar:gamepad-bold",
        title: "Play Now",
        endContent: (
          <Chip className="bg-primary-foreground font-medium text-primary" size="sm" variant="flat">
            Live
          </Chip>
        ),
      },
      {
        key: "tournaments",
        href: "/tournaments",
        icon: "solar:cup-star-bold",
        title: "Tournaments",
      },
      {
        key: "teams",
        href: "/teams",
        icon: "solar:users-group-two-rounded-outline",
        title: "Teams",
      },
      {
        key: "leaderboards",
        href: "/leaderboards",
        icon: "solar:ranking-bold",
        title: "Leaderboards",
      },
    ],
  },
  {
    key: "your-account",
    title: "Your Account",
    items: [
      {
        key: "wallet",
        href: "/wallet",
        title: "Wallet",
        icon: "solar:wallet-bold",
      },
      {
        key: "settings",
        href: "/settings",
        title: "Settings",
        icon: "solar:settings-bold",
      },
      {
        key: "help",
        href: "/help",
        title: "Help & Support",
        icon: "solar:question-circle-bold",
      },
    ],
  },
];

export const sectionLongList: SidebarItem[] = [
  ...sectionItems,
  {
    key: "payments",
    title: "Payments",
    items: [
      {
        key: "wallet",
        href: "/wallet",
        title: "Wallet",
        icon: "solar:wallet-bold",
      },
      {
        key: "transactions",
        href: "/wallet?tab=transactions",
        title: "Transactions",
        icon: "solar:file-text-linear",
      },
      {
        key: "billing",
        href: "/settings?tab=billing",
        title: "Billing",
        icon: "solar:card-outline",
      },
      {
        key: "subscription",
        href: "/checkout",
        title: "Subscription",
        icon: "solar:crown-bold",
      },
    ],
  },
];

export const sectionNestedItems: SidebarItem[] = [
  {
    key: "home",
    href: "/",
    icon: "solar:home-2-linear",
    title: "Home",
  },
  {
    key: "match-making",
    href: "/match-making",
    icon: "solar:gamepad-bold",
    title: "Play Now",
    endContent: (
      <Chip size="sm" variant="flat" color="success">
        Live
      </Chip>
    ),
  },
  {
    key: "tournaments",
    href: "/tournaments",
    icon: "solar:cup-star-bold",
    title: "Tournaments",
  },
  {
    key: "teams",
    href: "/teams",
    icon: "solar:users-group-two-rounded-outline",
    title: "Teams",
  },
  {
    key: "leaderboards",
    href: "/leaderboards",
    icon: "solar:ranking-bold",
    title: "Leaderboards",
  },
  {
    key: "analytics",
    href: "/analytics",
    icon: "solar:chart-outline",
    title: "Analytics",
  },
  {
    key: "storage",
    title: "Cloud Storage",
    icon: "solar:cloud-bold",
    type: SidebarItemType.Nest,
    items: [
      {
        key: "cloud",
        icon: "solar:cloud-bold",
        href: "/cloud",
        title: "Dashboard",
      },
      {
        key: "replays",
        icon: "solar:videocamera-record-bold",
        href: "/replays",
        title: "My Replays",
      },
      {
        key: "upload",
        icon: "solar:cloud-upload-bold",
        href: "/upload",
        title: "Upload",
      },
    ],
  },
  {
    key: "wallet",
    href: "/wallet",
    icon: "solar:wallet-bold",
    title: "Wallet",
  },
  {
    key: "settings",
    href: "/settings",
    icon: "solar:settings-bold",
    title: "Settings",
  },
  {
    key: "help",
    href: "/help",
    icon: "solar:question-circle-bold",
    title: "Help",
  },
];
