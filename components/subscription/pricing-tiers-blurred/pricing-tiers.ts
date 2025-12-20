import type {Frequency, Tier} from "./pricing-types";

import {FrequencyEnum, TiersEnum} from "./pricing-types";

export const frequencies: Array<Frequency> = [
  {key: FrequencyEnum.Monthly, label: "Pay Monthly", priceSuffix: "per month"},
  {key: FrequencyEnum.Yearly, label: "Pay Yearly", priceSuffix: "per year"},
];

export const tiers: Array<Tier> = [
  {
    key: TiersEnum.Free,
    title: "Free",
    price: "Free",
    href: "/signup",
    featured: false,
    mostPopular: false,
    description: "For casual players exploring competitive gaming.",
    features: [
      "5 replay uploads/month",
      "500 MB cloud storage",
      "Basic analytics",
      "Casual matchmaking",
    ],
    buttonText: "Continue with Free",
    buttonColor: "default",
    buttonVariant: "flat",
  },
  {
    key: TiersEnum.Pro,
    title: "Pro",
    description: "For competitive players serious about improving.",
    href: "/checkout?plan=pro",
    mostPopular: true,
    price: {
      monthly: "$9.99",
      yearly: "$7.99",
    },
    featured: false,
    features: [
      "Unlimited replay uploads",
      "25 GB cloud storage",
      "Advanced analytics & AI",
      "Priority matchmaking",
    ],
    buttonText: "Get Pro",
    buttonColor: "primary",
    buttonVariant: "solid",
  },
  {
    key: TiersEnum.Team,
    title: "Team",
    href: "/checkout?plan=team",
    featured: true,
    mostPopular: false,
    description: "Complete team management for esports teams.",
    price: {
      monthly: "$29.99",
      yearly: "$23.99",
    },
    priceSuffix: "for 10 seats",
    features: [
      "100 GB shared storage",
      "Team analytics dashboard",
      "Scrim scheduling",
      "API access & webhooks",
    ],
    buttonText: "Get Team",
    buttonColor: "secondary",
    buttonVariant: "solid",
  },
  {
    key: TiersEnum.Organizer,
    title: "Organizer",
    href: "/contact?plan=organizer",
    featured: false,
    mostPopular: false,
    description: "Professional tournament hosting platform.",
    price: {
      monthly: "$99.99",
      yearly: "$79.99",
    },
    features: [
      "500 GB enterprise storage",
      "Unlimited tournaments",
      "Automated prize distribution",
      "White-label branding",
    ],
    buttonText: "Contact Sales",
    buttonColor: "default",
    buttonVariant: "bordered",
  },
];
