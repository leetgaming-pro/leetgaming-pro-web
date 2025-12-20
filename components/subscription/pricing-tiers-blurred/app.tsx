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
} from "@nextui-org/react";
import {cn} from "@nextui-org/react";
import { useTheme } from "next-themes";

import {FrequencyEnum, TiersEnum} from "./pricing-types";
import {frequencies, tiers} from "./pricing-tiers";

export default function Component() {
  const [selectedFrequency, setSelectedFrequency] = React.useState(frequencies[0]);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const onFrequencyChange = (selectedKey: React.Key) => {
    const frequencyIndex = frequencies.findIndex((f) => f.key === selectedKey);
    setSelectedFrequency(frequencies[frequencyIndex]);
  };

  const isYearly = selectedFrequency.key === FrequencyEnum.Yearly;

  // Brand-aligned tier styles using LeetGaming colors
  // Navy #34445C, Lime #DCFF37, Orange #FF4654, Gold #FFC700, Cream #F5F0E1
  const tierStyles = {
    [TiersEnum.Free]: {
      icon: "solar:gamepad-bold",
      gradient: "from-[#34445C] to-[#4a5568]",
      accent: isDark ? "text-[#F5F0E1]/70" : "text-[#34445C]",
    },
    [TiersEnum.Pro]: {
      icon: "solar:crown-bold",
      gradient: "from-[#FF4654] to-[#FFC700]",
      accent: isDark ? "text-[#DCFF37]" : "text-[#FF4654]",
    },
    [TiersEnum.Team]: {
      icon: "solar:users-group-rounded-bold",
      gradient: isDark ? "from-[#DCFF37] to-[#34445C]" : "from-[#34445C] to-[#FF4654]",
      accent: isDark ? "text-[#DCFF37]" : "text-[#34445C]",
    },
    [TiersEnum.Organizer]: {
      icon: "solar:cup-star-bold",
      gradient: "from-[#FFC700] to-[#FF4654]",
      accent: "text-[#FFC700]",
    },
  };

  return (
    <div className="relative flex max-w-6xl flex-col items-center py-16 px-4">
      {/* Blurred background decoration - brand colors */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-3 z-0 h-full w-full transform-gpu overflow-hidden blur-3xl md:right-20 md:h-auto md:w-auto md:px-36"
      >
        <div
          className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#FF4654] to-[#DCFF37] opacity-20"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
      
      <div className="relative z-10 flex max-w-xl flex-col text-center">
        <h2 className="font-medium text-[#FF4654] dark:text-[#DCFF37]">Pricing</h2>
        <h1 className="text-4xl font-bold tracking-tight text-[#34445C] dark:text-[#F5F0E1]">
          Choose Your Competitive Edge
        </h1>
        <Spacer y={4} />
        <p className="text-large text-[#34445C]/70 dark:text-[#F5F0E1]/60">
          From casual gaming to professional esports.
          {isYearly && (
            <span className="text-[#FF4654] dark:text-[#DCFF37] font-medium"> Save 20% with yearly billing.</span>
          )}
        </p>
      </div>
      
      <Spacer y={8} />
      
      <div className="leet-tabs">
        <Tabs
          classNames={{
            tabList: "bg-leet-cream/80 dark:bg-[#1a1a1a]/80 backdrop-blur-lg border border-[#FF4654]/20 dark:border-[#DCFF37]/20 p-1 rounded-none",
            tab: "data-[hover-unselected=true]:opacity-80 px-6 rounded-none",
            cursor: "bg-[#34445C] dark:bg-[#DCFF37] rounded-none",
          }}
          radius="none"
          size="lg"
          selectedKey={selectedFrequency.key}
          onSelectionChange={onFrequencyChange}
        >
          <Tab key={FrequencyEnum.Monthly} title="Monthly" />
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
      
      <Spacer y={12} />
      
      <div className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full">
        {tiers.map((tier) => {
          const style = tierStyles[tier.key];
          const isPopular = tier.mostPopular;
          const isFeatured = tier.featured;
          
          return (
            <Card
              key={tier.key}
              className={cn(
                "relative p-3 transition-all duration-300 leet-card",
                "border border-[#FF4654]/20 dark:border-[#DCFF37]/10",
                "bg-leet-cream/90 dark:bg-[#0a0a0a]/80 backdrop-blur-xl",
                "hover:shadow-xl hover:-translate-y-1",
                {
                  "ring-2 ring-[#FF4654] dark:ring-[#DCFF37] shadow-lg": isPopular,
                  "ring-2 ring-[#34445C]/50 dark:ring-[#DCFF37]/30": isFeatured && !isPopular,
                }
              )}
              shadow="none"
              style={{ borderRadius: 0 }}
            >
              {/* Badge - edgy style */}
              {isPopular && (
                <Chip
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 font-semibold shadow-md bg-gradient-to-r from-[#FF4654] to-[#FFC700] text-[#F5F0E1] rounded-none"
                  style={{ 
                    clipPath: 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)',
                    borderRadius: 0 
                  }}
                >
                  Most Popular
                </Chip>
              )}

              <CardHeader className="flex flex-col items-start gap-2 pt-6 pb-4">
                {/* Icon - edgy branded style */}
                <div 
                  className={cn(
                    "w-10 h-10 flex items-center justify-center",
                    "bg-gradient-to-br",
                    style.gradient,
                    tier.key === TiersEnum.Team && isDark ? "text-[#34445C]" : "text-[#F5F0E1]"
                  )}
                  style={{ 
                    clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)'
                  }}
                >
                  <Icon icon={style.icon} width={20} />
                </div>
                
                <h2 className="text-xl font-bold text-[#34445C] dark:text-[#F5F0E1]">{tier.title}</h2>
                <p className="text-sm text-[#34445C]/70 dark:text-[#F5F0E1]/60">
                  {tier.description}
                </p>
              </CardHeader>
              
              <Divider className="opacity-30" />
              
              <CardBody className="gap-6 py-4">
                <div>
                  <p className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                      {typeof tier.price === "string" 
                        ? tier.price 
                        : tier.price[selectedFrequency.key]}
                    </span>
                    {typeof tier.price !== "string" && (
                      <span className="text-sm text-[#34445C]/50 dark:text-[#F5F0E1]/40">
                        /{selectedFrequency.priceSuffix}
                      </span>
                    )}
                  </p>
                  {tier.priceSuffix && (
                    <p className="text-xs text-[#34445C]/50 dark:text-[#F5F0E1]/40 mt-1">
                      {tier.priceSuffix}
                    </p>
                  )}
                </div>
                
                <ul className="flex flex-col gap-2">
                  {tier.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Icon 
                        className={cn("flex-shrink-0 mt-0.5", style.accent)} 
                        icon="solar:check-circle-bold" 
                        width={16} 
                      />
                      <span className="text-sm text-[#34445C]/80 dark:text-[#F5F0E1]/70">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardBody>
              
              <CardFooter className="pt-0">
                <Button
                  fullWidth
                  as={Link}
                  href={tier.href}
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
      
      <Spacer y={12} />
      
      <div className="relative z-10 flex py-2">
        <p className="text-[#34445C]/60 dark:text-[#F5F0E1]/50">
          Need a custom solution?{" "}
          <Link className="text-[#FF4654] dark:text-[#DCFF37]" href="/contact" underline="always">
            Contact our sales team
          </Link>
        </p>
      </div>
    </div>
  );
}
