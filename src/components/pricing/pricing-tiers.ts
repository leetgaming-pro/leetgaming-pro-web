import type {Frequency, Tier} from "./pricing-types";

import {FrequencyEnum, TiersEnum} from "./pricing-types";

export const frequencies: Array<Frequency> = [
  {key: FrequencyEnum.Yearly, label: "Pay Yearly", priceSuffix: "per year"},
  {key: FrequencyEnum.Quarterly, label: "Pay Quarterly", priceSuffix: "per quarter"},
];

export const tiers: Array<Tier> = [
  {
    key: TiersEnum.Free,
    title: "Free",
    price: "Free",
    href: "#",
    featured: false,
    mostPopular: false,
    description: "For starters and casual gamers that want to try out.",
    features: ["10 players included", "2 GB of storage", "Help center access", "Email support"],
    buttonText: "Continue with Free",
    buttonColor: "default",
    buttonVariant: "flat",
  },
  {
    key: TiersEnum.Pro,
    title: "Pro",
    description: "For teams that have less that 10 players.",
    href: "#",
    mostPopular: true,
    price: {
      yearly: "$7",
      quarterly: "$2",
    },
    featured: false,
    features: [
      "20 players included",
      "10 GB of storage",
      "Help center access",
      "Priority email support",
    ],
    buttonText: "Get started",
    buttonColor: "primary",
    buttonVariant: "solid",
  },
  {
    key: TiersEnum.Team,
    title: "Team",
    href: "#",
    featured: true,
    mostPopular: false,
    description: "For large teams that have more than 10 members, requires more storage, API access, and more.",
    price: {
      yearly: "$9",
      quarterly: "$12",
    },
    priceSuffix: "per user",
    features: [
      "50 players & staff members included",
      "50 GB of storage",
      "Help center access",
      "API keys & webhooks",
      "Phone & email support",
    ],
    buttonText: "Contact us",
    buttonColor: "default",
    buttonVariant: "flat",
  },
];
