"use client";

import React from "react";
import {Icon} from "@iconify/react";
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
  Tab,
  Tabs,
  Tooltip,
} from "@nextui-org/react";
import {cn} from "@nextui-org/react";
import { useTheme } from "next-themes";

import {FrequencyEnum, TiersEnum} from "./pricing-types";
import {frequencies, tiers} from "./pricing-tiers";
import features from "./pricing-tiers-features";

export default function Component() {
  const [selectedFrequency, setSelectedFrequency] = React.useState(frequencies[0]);

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
      gradient: isDark ? "from-[#34445C] to-[#2a3749]" : "from-[#34445C] to-[#4a5568]",
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
      gradient: isDark ? "from-[#DCFF37] to-[#34445C]" : "from-[#34445C] to-[#FF4654]",
      ring: isDark ? "ring-[#DCFF37]/30" : "ring-[#34445C]/30",
      accent: isDark ? "text-[#DCFF37]" : "text-[#34445C]",
      iconBg: isDark ? "bg-gradient-to-br from-[#DCFF37] to-[#34445C]" : "bg-gradient-to-br from-[#34445C] to-[#FF4654]",
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
      className="relative min-h-screen w-full overflow-hidden"
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
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-24 py-16 sm:py-24 lg:py-32">
        {/* Header Section */}
        <div className="text-center max-w-3xl lg:max-w-4xl mx-auto mb-16 lg:mb-20">
          {/* Brand icon box with edgy clip-path */}
          <div 
            className="leet-icon-box leet-icon-box-lg mx-auto mb-6 lg:mb-8"
          >
            <Icon icon="solar:tag-price-bold" width={28} />
          </div>
          
          <p className="text-sm lg:text-base font-medium text-[#FF4654] dark:text-[#DCFF37] mb-4 uppercase tracking-wider">
            Competitive Pricing
          </p>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 lg:mb-8">
            <span className="text-foreground">Choose Your </span>
            <span className="bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#DCFF37] bg-clip-text text-transparent">
              Competitive Edge
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl text-default-500 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed">
            From casual gaming to professional esports, find the perfect plan for your competitive journey.
            {isYearly && (
              <span className="block mt-2 text-[#FF4654] dark:text-[#DCFF37] font-medium">
                Save 20% with yearly billing
              </span>
            )}
          </p>
        </div>

        {/* Billing Toggle - edgy style */}
        <div className="flex justify-center mb-12 lg:mb-16">
          <div className="leet-tabs">
            <Tabs
              classNames={{
                tabList: "bg-leet-cream/90 dark:bg-[#1a1a1a] border border-[#FF4654]/20 dark:border-[#DCFF37]/20 p-1 rounded-none",
                tab: "data-[hover-unselected=true]:opacity-80 px-6 py-2 rounded-none",
                cursor: "bg-[#34445C] dark:bg-[#DCFF37] rounded-none",
              }}
              radius="none"
              size="lg"
              selectedKey={selectedFrequency.key}
              onSelectionChange={onFrequencyChange}
            >
              <Tab
                key={FrequencyEnum.Monthly}
                title={<span className="text-inherit">Monthly</span>}
              />
              <Tab
                key={FrequencyEnum.Yearly}
                title={
                  <div className="flex items-center gap-2">
                    <span>Yearly</span>
                    <Chip 
                      size="sm" 
                      className="bg-[#DCFF37] text-[#34445C] font-semibold rounded-none"
                      style={{ clipPath: 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)' }}
                    >
                      -20%
                    </Chip>
                  </div>
                }
              />
            </Tabs>
          </div>
        </div>

        {/* Pricing Cards Grid - edgy style */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 xl:gap-10 mb-20 lg:mb-28">
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
                    "ring-2 ring-[#FF4654] dark:ring-[#DCFF37] shadow-xl shadow-[#FF4654]/20 dark:shadow-[#DCFF37]/10": isPopular,
                    "ring-2 ring-[#34445C]/50 dark:ring-[#DCFF37]/30": isFeatured && !isPopular,
                  }
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
                          : "bg-gradient-to-r from-[#FFC700] to-[#FF4654] text-[#34445C]"
                      )}
                      style={{ 
                        clipPath: 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)',
                        borderRadius: 0 
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
                      tier.key === TiersEnum.Team && isDark ? "text-[#34445C]" : "text-[#F5F0E1]"
                    )}
                    style={{ 
                      clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)'
                    }}
                  >
                    <Icon 
                      icon={style.icon} 
                      width={24} 
                      className={tier.key === TiersEnum.Team && isDark ? "text-[#34445C]" : ""} 
                    />
                  </div>
                  
                  {/* Title & Audience */}
                  <div>
                    <h3 className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">{tier.title}</h3>
                    {tier.targetAudience && (
                      <p className={cn("text-sm font-medium", style.accent)}>
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
                        Billed annually
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
                            isSubheading && "mt-4 first:mt-0"
                          )}
                        >
                          {!isSubheading && (
                            <Icon 
                              className={cn("flex-shrink-0 mt-0.5", style.accent)} 
                              icon="solar:check-circle-bold" 
                              width={18} 
                            />
                          )}
                          <span className={cn(
                            "text-sm",
                            isSubheading 
                              ? "font-semibold text-[#34445C] dark:text-[#F5F0E1]" 
                              : "text-[#34445C]/80 dark:text-[#F5F0E1]/70"
                          )}>
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
                      tier.buttonVariant === "solid" && tier.buttonColor === "primary" && 
                        "esports-btn-primary",
                      tier.buttonVariant === "solid" && tier.buttonColor === "secondary" && 
                        "esports-btn-action",
                      tier.buttonVariant === "bordered" && "esports-btn-ghost",
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

        {/* Feature Comparison Section */}
        <div className="mb-16 lg:mb-24">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 lg:mb-6 text-[#34445C] dark:text-[#F5F0E1]">
              Compare All Features
            </h2>
            <p className="text-[#34445C]/70 dark:text-[#F5F0E1]/60 max-w-2xl lg:max-w-3xl mx-auto text-base lg:text-lg">
              See exactly what&apos;s included in each plan. All plans include our core esports platform features.
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
                    <span className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">Features</span>
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
                              tier.key === TiersEnum.Team && isDark ? "text-[#34445C]" : "text-[#F5F0E1]"
                            )}
                            style={{ 
                              clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)'
                            }}
                          >
                            <Icon icon={style.icon} width={20} />
                          </div>
                          <span className="font-bold text-lg text-[#34445C] dark:text-[#F5F0E1]">{tier.title}</span>
                          <span className="text-[#34445C]/60 dark:text-[#F5F0E1]/50 text-sm">
                            {typeof tier.price === "string" 
                              ? tier.price 
                              : `${tier.price[selectedFrequency.key]}/${selectedFrequency.key === FrequencyEnum.Monthly ? 'mo' : 'yr'}`}
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
                              sectionIdx === 0 ? "solar:folder-cloud-bold" :
                              sectionIdx === 1 ? "solar:chart-2-bold" :
                              sectionIdx === 2 ? "solar:users-group-two-rounded-bold" :
                              sectionIdx === 3 ? "solar:gamepad-bold" :
                              sectionIdx === 4 ? "solar:cup-star-bold" :
                              sectionIdx === 5 ? "solar:settings-bold" :
                              sectionIdx === 6 ? "solar:wallet-money-bold" :
                              "solar:headphones-round-sound-bold"
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
                          itemIdx === section.items.length - 1 && "border-b-0"
                        )}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#34445C] dark:text-[#F5F0E1]">{item.title}</span>
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
                            <td key={tier.key} className="px-6 py-4 text-center">
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
                  <h3 className="font-semibold text-[#34445C] dark:text-[#F5F0E1]">{section.title}</h3>
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
                            <Tooltip content={item.helpText} className="max-w-xs">
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
              <div 
                className="leet-icon-box leet-icon-box-xl mx-auto mb-4 lg:mb-6"
              >
                <Icon icon="solar:question-circle-bold" width={32} />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold mb-2 lg:mb-4 text-[#34445C] dark:text-[#F5F0E1]">
                Need help choosing?
              </h3>
              <p className="text-[#34445C]/70 dark:text-[#F5F0E1]/60 mb-6 lg:mb-8 text-base lg:text-lg">
                Our team can help you find the perfect plan for your team or organization. 
                We also offer custom enterprise solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  as={Link}
                  href="/contact"
                  size="lg"
                  className="esports-btn esports-btn-primary font-semibold"
                  startContent={<Icon icon="solar:chat-round-dots-bold" width={20} />}
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
          
          <p className="text-[#34445C]/50 dark:text-[#F5F0E1]/40 text-sm">
            All prices in USD. VAT may apply based on your location.{" "}
            <Link href="/terms" className="underline text-[#FF4654] dark:text-[#DCFF37]">Terms</Link> apply.
          </p>
        </div>
      </div>
    </div>
  );
}
