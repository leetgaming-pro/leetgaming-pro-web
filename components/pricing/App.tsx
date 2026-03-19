"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Link,
  Spacer,
  Spinner,
  Tab,
  Tabs,
  Tooltip,
} from "@nextui-org/react";
import { cn } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { useTranslation } from "@/lib/i18n/useTranslation";

import { FrequencyEnum, TiersEnum } from "./pricing-types";
import { frequencies, tiers as staticTiers } from "./pricing-tiers";
import features from "./pricing-tiers-features";
import { MobileNavigation } from "@/components/ui";

// API Plan type matching backend response
interface ApiPlanPrice {
  amount: number;
  currency: string;
  total_discount?: number;
  yearly_total?: number;
}

interface ApiPlan {
  id: string;
  name: string;
  description: string;
  kind: string;
  is_free: boolean;
  is_available: boolean;
  price_amount: number;
  price_currency: string;
  prices: {
    monthly?: ApiPlanPrice;
    yearly?: ApiPlanPrice;
  };
  all_prices?: {
    monthly?: ApiPlanPrice[];
    yearly?: ApiPlanPrice[];
  };
  regions?: string[];
  languages?: string[];
  features: string[];
  display_priority_score: number;
}

// Currency symbol map for display
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  BRL: "R$",
  EUR: "€",
  MXN: "MX$",
  CNY: "¥",
  GBP: "£",
  JPY: "¥",
  KRW: "₩",
  INR: "₹",
};

// Get the currency symbol for a given currency code
function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency?.toUpperCase()] || "$";
}

// Detect user's region from browser locale/timezone for price filtering
function detectUserRegion(): string {
  if (typeof window === "undefined") return "NA";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const lang = navigator.language || "en-US";

  if (tz.startsWith("America/Sao_Paulo") || tz.startsWith("America/Fortaleza") || tz.startsWith("America/Recife") || tz.startsWith("America/Bahia") || tz.startsWith("America/Belem") || tz.startsWith("America/Manaus") || lang.startsWith("pt-BR")) {
    return "BR";
  }
  if (tz.startsWith("Europe/")) return "EU";
  if (tz.startsWith("America/Mexico") || tz.startsWith("America/Bogota") || tz.startsWith("America/Lima") || tz.startsWith("America/Santiago") || tz.startsWith("America/Buenos_Aires") || tz.startsWith("America/Argentina")) {
    return "LATAM";
  }
  if (tz.startsWith("Asia/Shanghai") || tz.startsWith("Asia/Chongqing") || tz.startsWith("Asia/Hong_Kong") || tz.startsWith("Asia/Tokyo") || tz.startsWith("Asia/Seoul") || tz.startsWith("Asia/Singapore")) {
    return "ASIA";
  }
  return "NA";
}

// Map API plan kind to frontend TiersEnum
function mapPlanKindToTier(kind: string): TiersEnum {
  switch (kind) {
    case "free":
      return TiersEnum.Free;
    case "pro":
      return TiersEnum.Pro;
    case "team":
      return TiersEnum.Team;
    case "business":
    case "organizer":
      return TiersEnum.Organizer;
    default:
      return TiersEnum.Free;
  }
}

export default function Component() {
  const { t } = useTranslation();
  const [selectedFrequency, setSelectedFrequency] = React.useState(
    frequencies[0],
  );
  const [apiPlans, setApiPlans] = useState<ApiPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRegion] = useState(() => detectUserRegion());

  // Fetch plans from API with region parameter for currency filtering
  useEffect(() => {
    async function fetchPlans() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/plans?region=${userRegion}`);
        if (!response.ok) {
          throw new Error("Failed to fetch plans");
        }
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          // Sort by display_priority_score ascending (Free first, then Pro, etc.)
          const sortedPlans = [...data.data].sort(
            (a, b) => a.display_priority_score - b.display_priority_score,
          );
          setApiPlans(sortedPlans);
        }
      } catch (err) {
        console.error("Failed to fetch plans:", err);
        setError(t("pricingPage.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlans();
  }, [t, userRegion]);

  // Merge API plans with static tier data for styling/layout
  // PRICING COMES FROM DB — static tiers only provide UI metadata (buttonColor, etc.)
  const tiers = useMemo(() => {
    if (apiPlans.length === 0) {
      return staticTiers; // Fallback to static data during loading
    }

    return apiPlans.map((apiPlan) => {
      const tierKey = mapPlanKindToTier(apiPlan.kind);
      const staticTier =
        staticTiers.find((t) => t.key === tierKey) || staticTiers[0];

      // Prices come from the DB (filtered by region on the API side)
      const currencySymbol = getCurrencySymbol(
        apiPlan.prices?.monthly?.currency || apiPlan.price_currency || "USD",
      );
      const monthlyPrice =
        apiPlan.prices?.monthly?.amount ?? apiPlan.price_amount;
      const yearlyPrice = apiPlan.prices?.yearly?.amount ?? monthlyPrice * 0.8;

      return {
        ...staticTier,
        key: tierKey,
        title:
          tierKey === TiersEnum.Free
            ? t("pricing.free")
            : tierKey === TiersEnum.Pro
              ? t("pricing.pro")
              : tierKey === TiersEnum.Team
                ? t("pricing.team")
                : t("pricing.organizer"),
        description: apiPlan.description || staticTier.description,
        price: apiPlan.is_free
          ? t("pricing.free")
          : {
              [FrequencyEnum.Monthly]: `${currencySymbol}${monthlyPrice.toFixed(2)}`,
              [FrequencyEnum.Yearly]: `${currencySymbol}${yearlyPrice.toFixed(2)}`,
            },
        features:
          apiPlan.features.length > 0
            ? apiPlan.features.map((f) =>
                f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              )
            : staticTier.features,
        href: apiPlan.is_free ? "/signup" : `/checkout?plan=${apiPlan.id}`,
        mostPopular: apiPlan.kind === "pro",
        featured: apiPlan.kind === "team" || apiPlan.kind === "business",
        badge:
          apiPlan.kind === "pro"
            ? t("pricing.mostPopular")
            : apiPlan.kind === "business"
              ? t("pricing.bestValue")
              : staticTier.badge,
      };
    });
  }, [apiPlans, t]);

  const onFrequencyChange = (selectedKey: React.Key) => {
    const frequencyIndex = frequencies.findIndex((f) => f.key === selectedKey);
    setSelectedFrequency(frequencies[frequencyIndex]);
  };

  let { theme } = useTheme();

  if (theme === null || theme === undefined || !theme || theme === "system") {
    theme = "dark";
  }

  const isYearly = selectedFrequency.key === FrequencyEnum.Yearly;
  const isDark = theme === "dark";

  // Brand-aligned tier styles using LeetGaming colors
  // Navy #34445C, Lime #DCFF37, Orange #FF4654, Gold #FFC700, Cream #F5F0E1
  const tierStyles = {
    [TiersEnum.Free]: {
      icon: "solar:gamepad-bold",
      gradient: isDark
        ? "from-[#34445C] to-[#2a3749]"
        : "from-[#34445C] to-[#4a5568]",
      ring: isDark ? "ring-[#34445C]/30" : "ring-[#34445C]/20",
      accent: isDark ? "text-[#F5F0E1]/70" : "text-[#34445C]",
      iconBg: isDark ? "bg-[#34445C]" : "bg-[#34445C]",
    },
    [TiersEnum.Pro]: {
      icon: "solar:crown-bold",
      gradient: "from-[#FF4654] to-[#FFC700]",
      ring: isDark ? "ring-[#DCFF37]/30" : "ring-[#FF4654]/30",
      accent: isDark ? "text-[#DCFF37]" : "text-[#FF4654]",
      iconBg: "bg-gradient-to-br from-[#FF4654] to-[#FFC700]",
    },
    [TiersEnum.Team]: {
      icon: "solar:users-group-rounded-bold",
      gradient: isDark
        ? "from-[#DCFF37] to-[#34445C]"
        : "from-[#34445C] to-[#FF4654]",
      ring: isDark ? "ring-[#DCFF37]/30" : "ring-[#34445C]/30",
      accent: isDark ? "text-[#DCFF37]" : "text-[#34445C]",
      iconBg: isDark
        ? "bg-gradient-to-br from-[#DCFF37] to-[#34445C]"
        : "bg-gradient-to-br from-[#34445C] to-[#FF4654]",
    },
    [TiersEnum.Organizer]: {
      icon: "solar:cup-star-bold",
      gradient: "from-[#FFC700] to-[#FF4654]",
      ring: isDark ? "ring-[#FFC700]/30" : "ring-[#FFC700]/30",
      accent: isDark ? "text-[#FFC700]" : "text-[#FFC700]",
      iconBg: "bg-gradient-to-br from-[#FFC700] to-[#FF4654]",
    },
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden pb-24 md:pb-0"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)"
          : "linear-gradient(135deg, #F5F0E1 0%, #e8e3d4 50%, #F5F0E1 100%)",
      }}
    >
      {/* Background decorations - brand colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FF4654]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#34445C]/20 dark:bg-[#DCFF37]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-[#FFC700]/10 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: isDark
              ? `linear-gradient(rgba(220, 255, 55, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(220, 255, 55, 0.1) 1px, transparent 1px)`
              : `linear-gradient(rgba(52, 68, 92, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(52, 68, 92, 0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-24 py-12 sm:py-16 lg:py-24 xl:py-32">
        {/* Header Section */}
        <div className="text-center max-w-3xl lg:max-w-4xl mx-auto mb-10 sm:mb-12 lg:mb-16 xl:mb-20">
          {/* Brand icon box with edgy clip-path */}
          <div className="leet-icon-box leet-icon-box-lg mx-auto mb-4 sm:mb-6 lg:mb-8">
            <Icon icon="solar:tag-price-bold" width={28} />
          </div>

          <p className="text-xs sm:text-sm lg:text-base font-medium text-[#FF4654] dark:text-[#DCFF37] mb-3 sm:mb-4 uppercase tracking-wider">
            {t("pricingPage.eyebrow")}
          </p>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 sm:mb-6 lg:mb-8">
            <span className="text-foreground">
              {t("pricingPage.titlePrefix")}{" "}
            </span>
            <span className="bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#DCFF37] bg-clip-text text-transparent">
              {t("pricingPage.titleHighlight")}
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-default-500 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-4">
            {t("pricingPage.subtitle")}
            {isYearly && (
              <span className="block mt-2 text-[#FF4654] dark:text-[#DCFF37] font-medium">
                {t("pricingPage.yearlySavings")}
              </span>
            )}
          </p>
        </div>

        {/* Billing Toggle - edgy style */}
        <div className="flex justify-center mb-8 sm:mb-10 lg:mb-16">
          <div className="leet-tabs">
            <Tabs
              classNames={{
                tabList:
                  "bg-leet-cream/90 dark:bg-[#1a1a1a] border border-[#FF4654]/20 dark:border-[#DCFF37]/20 p-1 rounded-none",
                tab: "data-[hover-unselected=true]:opacity-80 px-4 sm:px-6 py-2 rounded-none min-h-[44px]",
                cursor: "bg-[#34445C] dark:bg-[#DCFF37] rounded-none",
              }}
              radius="none"
              size="lg"
              selectedKey={selectedFrequency.key}
              onSelectionChange={onFrequencyChange}
            >
              <Tab
                key={FrequencyEnum.Monthly}
                title={
                  <span className="text-inherit text-sm sm:text-base">
                    {t("pricingPage.monthly")}
                  </span>
                }
              />
              <Tab
                key={FrequencyEnum.Yearly}
                title={
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-sm sm:text-base">
                      {t("pricingPage.yearly")}
                    </span>
                    <Chip
                      size="sm"
                      className="bg-[#DCFF37] text-[#34445C] font-semibold rounded-none text-xs"
                      style={{
                        clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0 100%)",
                      }}
                    >
                      -20%
                    </Chip>
                  </div>
                }
              />
            </Tabs>
          </div>
        </div>

        {/* Pricing Cards Grid - Mobile horizontal scroll, edgy style */}
        <div className="mb-12 lg:mb-20 xl:mb-28">
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Spinner size="lg" color="warning" />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#DCFF37] text-[#34445C] font-semibold rounded-none hover:bg-[#c8eb2e] transition-colors"
              >
                {t("common.retry")}
              </button>
            </div>
          )}

          {/* Desktop Grid */}
          {!isLoading && !error && (
            <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 xl:gap-8 2xl:gap-10">
              {tiers.map((tier) => {
                const style = tierStyles[tier.key];
                const isPopular = tier.mostPopular;
                const isFeatured = tier.featured;

                return (
                  <Card
                    key={tier.key}
                    className={cn(
                      "relative overflow-visible transition-all duration-300 leet-card",
                      "border dark:border-[#DCFF37]/10",
                      "bg-leet-cream/95 dark:bg-[#0a0a0a]/90 backdrop-blur-xl",
                      "hover:shadow-2xl hover:-translate-y-1",
                      {
                        "ring-2 ring-[#FF4654] dark:ring-[#DCFF37] shadow-xl shadow-[#FF4654]/20 dark:shadow-[#DCFF37]/10":
                          isPopular,
                        "ring-2 ring-[#34445C]/50 dark:ring-[#DCFF37]/30":
                          isFeatured && !isPopular,
                      },
                    )}
                    shadow="none"
                    style={{ borderRadius: 0 }}
                  >
                    {/* Badge - edgy style */}
                    {tier.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <Chip
                          className={cn(
                            "px-4 font-semibold shadow-lg rounded-none",
                            isPopular
                              ? "bg-gradient-to-r from-[#FF4654] to-[#FFC700] text-[#F5F0E1]"
                              : isFeatured
                                ? isDark
                                  ? "bg-gradient-to-r from-[#DCFF37] to-[#34445C] text-[#34445C]"
                                  : "bg-gradient-to-r from-[#34445C] to-[#FF4654] text-[#F5F0E1]"
                                : "bg-gradient-to-r from-[#FFC700] to-[#FF4654] text-[#34445C]",
                          )}
                          style={{
                            clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0 100%)",
                            borderRadius: 0,
                          }}
                        >
                          {tier.badge}
                        </Chip>
                      </div>
                    )}

                    <CardHeader className="flex flex-col items-start gap-3 pt-8 pb-4 px-6">
                      {/* Icon - edgy branded style */}
                      <div
                        className={cn(
                          "w-12 h-12 flex items-center justify-center",
                          style.iconBg,
                          tier.key === TiersEnum.Team && isDark
                            ? "text-[#34445C]"
                            : "text-[#F5F0E1]",
                        )}
                        style={{
                          clipPath:
                            "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                        }}
                      >
                        <Icon
                          icon={style.icon}
                          width={24}
                          className={
                            tier.key === TiersEnum.Team && isDark
                              ? "text-[#34445C]"
                              : ""
                          }
                        />
                      </div>

                      {/* Title & Audience */}
                      <div>
                        <h3 className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                          {tier.title}
                        </h3>
                        {tier.targetAudience && (
                          <p
                            className={cn("text-sm font-medium", style.accent)}
                          >
                            {tier.targetAudience}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-[#34445C]/70 dark:text-[#F5F0E1]/60 text-sm leading-relaxed">
                        {tier.description}
                      </p>
                    </CardHeader>

                    <Divider className="opacity-30" />

                    <CardBody className="px-6 py-6">
                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold tracking-tight text-[#34445C] dark:text-[#F5F0E1]">
                            {typeof tier.price === "string"
                              ? tier.price
                              : tier.price[selectedFrequency.key]}
                          </span>
                          {typeof tier.price !== "string" && (
                            <span className="text-[#34445C]/60 dark:text-[#F5F0E1]/50 text-sm">
                              /{selectedFrequency.priceSuffix}
                            </span>
                          )}
                        </div>
                        {tier.priceSuffix && (
                          <p className="text-[#34445C]/50 dark:text-[#F5F0E1]/40 text-sm mt-1">
                            {tier.priceSuffix}
                          </p>
                        )}
                        {isYearly && typeof tier.price !== "string" && (
                          <p className="text-[#FF4654] dark:text-[#DCFF37] text-xs mt-2 font-medium">
                            {t("pricing.billedAnnually")}
                          </p>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="space-y-3">
                        {tier.features?.map((feature, idx) => {
                          const isSubheading = feature.endsWith(":");
                          return (
                            <li
                              key={idx}
                              className={cn(
                                "flex items-start gap-3",
                                isSubheading && "mt-4 first:mt-0",
                              )}
                            >
                              {!isSubheading && (
                                <Icon
                                  className={cn(
                                    "flex-shrink-0 mt-0.5",
                                    style.accent,
                                  )}
                                  icon="solar:check-circle-bold"
                                  width={18}
                                />
                              )}
                              <span
                                className={cn(
                                  "text-sm",
                                  isSubheading
                                    ? "font-semibold text-[#34445C] dark:text-[#F5F0E1]"
                                    : "text-[#34445C]/80 dark:text-[#F5F0E1]/70",
                                )}
                              >
                                {feature}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </CardBody>

                    <CardFooter className="px-6 pb-6 pt-0">
                      <Button
                        fullWidth
                        as={Link}
                        href={tier.href}
                        size="lg"
                        className={cn(
                          "font-semibold esports-btn",
                          tier.buttonVariant === "solid" &&
                            tier.buttonColor === "primary" &&
                            "esports-btn-primary",
                          tier.buttonVariant === "solid" &&
                            tier.buttonColor === "secondary" &&
                            "esports-btn-action",
                          tier.buttonVariant === "bordered" &&
                            "esports-btn-ghost",
                        )}
                        style={{ borderRadius: 0 }}
                      >
                        {tier.buttonText}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Mobile Horizontal Scroll Cards */}
          {!isLoading && !error && (
            <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4 scroll-smooth snap-x snap-mandatory">
              <div className="flex gap-4 pb-4" style={{ width: "max-content" }}>
                {tiers.map((tier) => {
                  const style = tierStyles[tier.key];
                  const isPopular = tier.mostPopular;
                  const isFeatured = tier.featured;

                  return (
                    <Card
                      key={`mobile-${tier.key}`}
                      className={cn(
                        "relative overflow-visible transition-all duration-300 leet-card snap-start",
                        "border dark:border-[#DCFF37]/10",
                        "bg-leet-cream/95 dark:bg-[#0a0a0a]/90 backdrop-blur-xl",
                        "w-[280px] flex-shrink-0",
                        {
                          "ring-2 ring-[#FF4654] dark:ring-[#DCFF37] shadow-xl shadow-[#FF4654]/20 dark:shadow-[#DCFF37]/10":
                            isPopular,
                          "ring-2 ring-[#34445C]/50 dark:ring-[#DCFF37]/30":
                            isFeatured && !isPopular,
                        },
                      )}
                      shadow="none"
                      style={{ borderRadius: 0 }}
                    >
                      {/* Badge - edgy style */}
                      {tier.badge && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                          <Chip
                            className={cn(
                              "px-3 text-xs font-semibold shadow-lg rounded-none",
                              isPopular
                                ? "bg-gradient-to-r from-[#FF4654] to-[#FFC700] text-[#F5F0E1]"
                                : isFeatured
                                  ? isDark
                                    ? "bg-gradient-to-r from-[#DCFF37] to-[#34445C] text-[#34445C]"
                                    : "bg-gradient-to-r from-[#34445C] to-[#FF4654] text-[#F5F0E1]"
                                  : "bg-gradient-to-r from-[#FFC700] to-[#FF4654] text-[#34445C]",
                            )}
                            style={{
                              clipPath:
                                "polygon(8% 0, 100% 0, 92% 100%, 0 100%)",
                              borderRadius: 0,
                            }}
                          >
                            {tier.badge}
                          </Chip>
                        </div>
                      )}

                      <CardHeader className="flex flex-col items-start gap-2 pt-6 pb-3 px-4">
                        {/* Icon */}
                        <div
                          className={cn(
                            "w-10 h-10 flex items-center justify-center",
                            style.iconBg,
                            tier.key === TiersEnum.Team && isDark
                              ? "text-[#34445C]"
                              : "text-[#F5F0E1]",
                          )}
                          style={{
                            clipPath:
                              "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                          }}
                        >
                          <Icon
                            icon={style.icon}
                            width={20}
                            className={
                              tier.key === TiersEnum.Team && isDark
                                ? "text-[#34445C]"
                                : ""
                            }
                          />
                        </div>

                        {/* Title & Price */}
                        <div>
                          <h3 className="text-xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                            {tier.title}
                          </h3>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                              {typeof tier.price === "string"
                                ? tier.price
                                : tier.price[selectedFrequency.key]}
                            </span>
                            {typeof tier.price !== "string" && (
                              <span className="text-[#34445C]/60 dark:text-[#F5F0E1]/50 text-xs">
                                /{selectedFrequency.priceSuffix}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <Divider className="opacity-30" />

                      <CardBody className="px-4 py-4">
                        <ul className="space-y-2">
                          {tier.features?.slice(0, 5).map((feature, idx) => {
                            const isSubheading = feature.endsWith(":");
                            if (isSubheading) return null;
                            return (
                              <li key={idx} className="flex items-start gap-2">
                                <Icon
                                  className={cn(
                                    "flex-shrink-0 mt-0.5",
                                    style.accent,
                                  )}
                                  icon="solar:check-circle-bold"
                                  width={16}
                                />
                                <span className="text-xs text-[#34445C]/80 dark:text-[#F5F0E1]/70">
                                  {feature}
                                </span>
                              </li>
                            );
                          })}
                          {(tier.features?.length || 0) > 5 && (
                            <li className="text-xs text-[#FF4654] dark:text-[#DCFF37] font-medium">
                              {t("pricingPage.moreFeatures", {
                                count: (tier.features?.length || 0) - 5,
                              })}
                            </li>
                          )}
                        </ul>
                      </CardBody>

                      <CardFooter className="px-4 pb-4 pt-0">
                        <Button
                          fullWidth
                          as={Link}
                          href={tier.href}
                          size="md"
                          className={cn(
                            "font-semibold esports-btn h-12 touch-target",
                            tier.buttonVariant === "solid" &&
                              tier.buttonColor === "primary" &&
                              "esports-btn-primary",
                            tier.buttonVariant === "solid" &&
                              tier.buttonColor === "secondary" &&
                              "esports-btn-action",
                            tier.buttonVariant === "bordered" &&
                              "esports-btn-ghost",
                          )}
                          style={{ borderRadius: 0 }}
                        >
                          {tier.buttonText}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mobile scroll indicator */}
          {!isLoading && !error && (
            <div className="md:hidden flex justify-center gap-2 mt-4">
              {tiers.map((tier, idx) => (
                <div
                  key={`dot-${tier.key}`}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    idx === 0
                      ? "bg-[#FF4654] dark:bg-[#DCFF37]"
                      : "bg-default-300",
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Feature Comparison Section */}
        <div className="mb-16 lg:mb-24">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6 text-[#34445C] dark:text-[#F5F0E1]">
              {t("pricingPage.compareTitle")}
            </h2>
            <p className="text-[#34445C]/70 dark:text-[#F5F0E1]/60 max-w-2xl lg:max-w-3xl mx-auto text-base lg:text-lg">
              {t("pricingPage.compareSubtitle")}
            </p>
          </div>

          {/* Desktop Table - edgy style */}
          <div
            className="hidden lg:block overflow-hidden border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-leet-cream/95 dark:bg-[#0a0a0a]/90 backdrop-blur-xl"
            style={{ borderRadius: 0 }}
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                  <th className="text-left p-6 w-1/5">
                    <span className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                      {t("pricing.features")}
                    </span>
                  </th>
                  {tiers.map((tier) => {
                    const style = tierStyles[tier.key];
                    return (
                      <th key={tier.key} className="p-6 text-center w-1/5">
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={cn(
                              "w-10 h-10 flex items-center justify-center",
                              style.iconBg,
                              tier.key === TiersEnum.Team && isDark
                                ? "text-[#34445C]"
                                : "text-[#F5F0E1]",
                            )}
                            style={{
                              clipPath:
                                "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                            }}
                          >
                            <Icon icon={style.icon} width={20} />
                          </div>
                          <span className="font-bold text-lg text-[#34445C] dark:text-[#F5F0E1]">
                            {tier.title}
                          </span>
                          <span className="text-[#34445C]/60 dark:text-[#F5F0E1]/50 text-sm">
                            {typeof tier.price === "string"
                              ? tier.price
                              : `${tier.price[selectedFrequency.key]}/${selectedFrequency.key === FrequencyEnum.Monthly ? "mo" : "yr"}`}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {features.map((section, sectionIdx) => (
                  <React.Fragment key={section.title}>
                    {/* Section Header */}
                    <tr className="bg-[#34445C]/5 dark:bg-[#DCFF37]/5">
                      <td
                        colSpan={5}
                        className="px-6 py-4 font-semibold text-[#34445C] dark:text-[#F5F0E1]"
                      >
                        <div className="flex items-center gap-2">
                          <Icon
                            icon={
                              sectionIdx === 0
                                ? "solar:folder-cloud-bold"
                                : sectionIdx === 1
                                  ? "solar:chart-2-bold"
                                  : sectionIdx === 2
                                    ? "solar:users-group-two-rounded-bold"
                                    : sectionIdx === 3
                                      ? "solar:gamepad-bold"
                                      : sectionIdx === 4
                                        ? "solar:cup-star-bold"
                                        : sectionIdx === 5
                                          ? "solar:settings-bold"
                                          : sectionIdx === 6
                                            ? "solar:wallet-money-bold"
                                            : "solar:headphones-round-sound-bold"
                            }
                            width={20}
                            className="text-[#FF4654] dark:text-[#DCFF37]"
                          />
                          {section.title}
                        </div>
                      </td>
                    </tr>
                    {/* Features */}
                    {section.items.map((item, itemIdx) => (
                      <tr
                        key={item.title}
                        className={cn(
                          "border-b border-[#34445C]/10 dark:border-[#DCFF37]/10 hover:bg-[#34445C]/5 dark:hover:bg-[#DCFF37]/5 transition-colors",
                          itemIdx === section.items.length - 1 && "border-b-0",
                        )}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#34445C] dark:text-[#F5F0E1]">
                              {item.title}
                            </span>
                            {item.helpText && (
                              <Tooltip
                                content={item.helpText}
                                className="max-w-xs"
                                placement="right"
                              >
                                <Icon
                                  icon="solar:info-circle-line-duotone"
                                  width={16}
                                  className="text-[#34445C]/40 dark:text-[#F5F0E1]/40 cursor-help"
                                />
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        {tiers.map((tier) => {
                          const value = item.tiers[tier.key];
                          const style = tierStyles[tier.key];
                          return (
                            <td
                              key={tier.key}
                              className="px-6 py-4 text-center"
                            >
                              {typeof value === "boolean" ? (
                                value ? (
                                  <Icon
                                    icon="solar:check-circle-bold"
                                    width={22}
                                    className={cn("mx-auto", style.accent)}
                                  />
                                ) : (
                                  <Icon
                                    icon="solar:close-circle-bold"
                                    width={22}
                                    className="mx-auto text-[#34445C]/20 dark:text-[#F5F0E1]/20"
                                  />
                                )
                              ) : (
                                <span className="text-sm text-[#34445C]/80 dark:text-[#F5F0E1]/70 font-medium">
                                  {value}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Feature Cards */}
          <div className="lg:hidden space-y-4">
            {features.map((section) => (
              <Card
                key={section.title}
                className="border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-leet-cream/95 dark:bg-[#0a0a0a]/90"
                style={{ borderRadius: 0 }}
              >
                <CardHeader className="px-4 py-3">
                  <h3 className="font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                    {section.title}
                  </h3>
                </CardHeader>
                <Divider className="opacity-30" />
                <CardBody className="px-4 py-3">
                  <div className="space-y-4">
                    {section.items.map((item) => (
                      <div key={item.title} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#34445C] dark:text-[#F5F0E1]">
                            {item.title}
                          </span>
                          {item.helpText && (
                            <Tooltip
                              content={item.helpText}
                              className="max-w-xs"
                            >
                              <Icon
                                icon="solar:info-circle-line-duotone"
                                width={14}
                                className="text-[#34445C]/40 dark:text-[#F5F0E1]/40"
                              />
                            </Tooltip>
                          )}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {tiers.map((tier) => {
                            const value = item.tiers[tier.key];
                            const style = tierStyles[tier.key];
                            return (
                              <div
                                key={tier.key}
                                className="text-center p-2 bg-[#34445C]/5 dark:bg-[#DCFF37]/5"
                                style={{ borderRadius: 0 }}
                              >
                                <p className="text-xs text-[#34445C]/60 dark:text-[#F5F0E1]/50 mb-1">
                                  {tier.title}
                                </p>
                                {typeof value === "boolean" ? (
                                  value ? (
                                    <Icon
                                      icon="solar:check-circle-bold"
                                      width={18}
                                      className={cn("mx-auto", style.accent)}
                                    />
                                  ) : (
                                    <Icon
                                      icon="solar:close-circle-bold"
                                      width={18}
                                      className="mx-auto text-[#34445C]/20 dark:text-[#F5F0E1]/20"
                                    />
                                  )
                                ) : (
                                  <span className="text-xs text-[#34445C]/80 dark:text-[#F5F0E1]/70 font-medium">
                                    {value}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ / CTA Section */}
        <div className="text-center">
          <Card
            className="max-w-2xl lg:max-w-3xl mx-auto border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-leet-cream/95 dark:bg-[#0a0a0a]/90 backdrop-blur-xl p-8 lg:p-12"
            style={{ borderRadius: 0 }}
          >
            <CardBody className="text-center">
              <div className="leet-icon-box leet-icon-box-xl mx-auto mb-4 lg:mb-6">
                <Icon icon="solar:question-circle-bold" width={32} />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold mb-2 lg:mb-4 text-[#34445C] dark:text-[#F5F0E1]">
                Need help choosing?
              </h3>
              <p className="text-[#34445C]/70 dark:text-[#F5F0E1]/60 mb-6 lg:mb-8 text-base lg:text-lg">
                Our team can help you find the perfect plan for your team or
                organization. We also offer custom enterprise solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  as={Link}
                  href="/contact"
                  size="lg"
                  className="esports-btn esports-btn-primary font-semibold"
                  startContent={
                    <Icon icon="solar:chat-round-dots-bold" width={20} />
                  }
                >
                  Contact Sales
                </Button>
                <Button
                  as={Link}
                  href="/help"
                  size="lg"
                  className="esports-btn esports-btn-ghost font-semibold"
                  startContent={<Icon icon="solar:book-bold" width={20} />}
                >
                  View FAQ
                </Button>
              </div>
            </CardBody>
          </Card>

          <Spacer y={8} />

          <p className="text-[#34445C]/50 dark:text-[#F5F0E1]/40 text-xs sm:text-sm px-4">
            All prices in USD. VAT may apply based on your location.
            Subscription billing is limited to users 18+ and may require
            additional eligibility checks in some jurisdictions.{" "}
            <Link
              href="/legal/terms"
              className="underline text-[#FF4654] dark:text-[#DCFF37]"
            >
              Terms
            </Link>{" "}
            apply.
          </p>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
