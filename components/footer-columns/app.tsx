"use client";

import type { IconProps } from "@iconify/react";

import React from "react";
import { Divider, Link } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import NextLink from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";

import ThemeSwitch from "./theme-switch";
import LogoGrayscale from "../logo/logo-grayscale";

type SocialIconProps = Omit<IconProps, "icon">;

const footerNavigation = {
  resources: [
    { key: "nav.serviceStatus", href: "/service-status" },
    { key: "nav.cloudStorage", href: "/cloud" },
    { key: "footer.uploadFiles", href: "/upload" },
    { key: "nav.pricingPlans", href: "/pricing" },
    { key: "nav.supplyStore", href: "/supply" },
  ],
  community: [
    { key: "nav.leaderboards", href: "/leaderboards" },
    { key: "nav.tournaments", href: "/tournaments" },
    { key: "nav.players", href: "/players" },
    { key: "nav.teams", href: "/teams" },
    { key: "nav.matches", href: "/matches" },
    { key: "nav.replays", href: "/replays" },
    { key: "nav.highlights", href: "/highlights" },
  ],
  company: [
    { key: "footer.aboutUs", href: "/about" },
    { key: "nav.investors", href: "/investors" },
    { key: "nav.blog", href: "/blog" },
    { key: "nav.docs", href: "/docs" },
    { key: "footer.support", href: "/docs#support" },
    { key: "footer.contact", href: "/about#contact" },
  ],
  legal: [
    { key: "nav.terms", href: "/legal/terms" },
    { key: "nav.privacy", href: "/legal/privacy" },
    { key: "footer.cookiePolicy", href: "/legal/cookies" },
  ],
  social: [
    {
      name: "Discord",
      href: "https://discord.gg/leetgaming",
      icon: (props: SocialIconProps) => (
        <Icon {...props} icon="fontisto:discord" />
      ),
    },
    {
      name: "Twitch",
      href: "https://twitch.tv/leetgamingpro",
      icon: (props: SocialIconProps) => (
        <Icon {...props} icon="fontisto:twitch" />
      ),
    },
    {
      name: "Twitter",
      href: "https://twitter.com/leetgamingpro",
      icon: (props: SocialIconProps) => (
        <Icon {...props} icon="fontisto:twitter" />
      ),
    },
    {
      name: "YouTube",
      href: "https://youtube.com/@leetgamingpro",
      icon: (props: SocialIconProps) => (
        <Icon {...props} icon="fontisto:youtube-play" />
      ),
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/leetgaming",
      icon: (props: SocialIconProps) => (
        <Icon {...props} icon="fontisto:linkedin" />
      ),
    },
  ],
};

// FooterLink component that handles both internal and external links
function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const isExternal = href.startsWith("http") || href.startsWith("//");

  if (isExternal) {
    return (
      <Link
        href={href}
        isExternal
        className="text-[#34445C]/70 dark:text-[#F5F0E1]/70 hover:text-[#FF4654] dark:hover:text-[#DCFF37] transition-colors text-sm"
      >
        {children}
      </Link>
    );
  }

  return (
    <NextLink
      href={href}
      className="text-[#34445C]/70 dark:text-[#F5F0E1]/70 hover:text-[#FF4654] dark:hover:text-[#DCFF37] transition-colors text-sm"
    >
      {children}
    </NextLink>
  );
}

export default function FooterColumns() {
  const { t } = useTranslation();

  const renderList = React.useCallback(
    ({
      title,
      items,
    }: {
      title: string;
      items: { key: string; href: string }[];
    }) => (
      <div>
        <h3 className="text-small font-semibold text-[#FF4654] dark:text-[#DCFF37] uppercase tracking-wider">
          {title}
        </h3>
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={item.key}>
              <FooterLink href={item.href}>{t(item.key)}</FooterLink>
            </li>
          ))}
        </ul>
      </div>
    ),
    [t],
  );

  return (
    // Hide footer on mobile to show only app-like bottom nav bar
    <div
      className="hidden md:block basis-1/5 sm:basis-full justify-center align-items align-center dark:bg-black/50"
      style={{
        backgroundImage: `url('/blur-glow-pry-gh.svg')`,
        backgroundSize: "cover",
      }}
    >
      <footer className="flex w-full justify-center">
        <div className="gap-3 max-w-fit px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 md:pr-8">
              <div className="flex items-center justify-start logo-container">
                <NextLink href="/">
                  <LogoGrayscale />
                </NextLink>
              </div>
              <p className="font-medium text-small text-[#34445C]/70 dark:text-[#F5F0E1]/70">
                {t("footer.tagline")}
              </p>

              <div className="flex space-x-6">
                {footerNavigation.social.map((item) => (
                  <Link
                    key={item.name}
                    isExternal
                    className="text-[#34445C]/60 dark:text-[#F5F0E1]/60 hover:text-[#FF4654] dark:hover:text-[#DCFF37] transition-colors"
                    href={item.href}
                    aria-label={item.name}
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon aria-hidden="true" className="w-6" />
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  {renderList({
                    title: t("footer.resources"),
                    items: footerNavigation.resources,
                  })}
                </div>
                <div className="mt-10 md:mt-0">
                  {renderList({
                    title: t("footer.community"),
                    items: footerNavigation.community,
                  })}
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  {renderList({
                    title: t("footer.company"),
                    items: footerNavigation.company,
                  })}
                </div>
                <div className="mt-10 md:mt-0">
                  {renderList({
                    title: t("footer.legal"),
                    items: footerNavigation.legal,
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom section with additional links */}
          <Divider className="mt-16 sm:mt-20 lg:mt-24 bg-[#FF4654]/20 dark:bg-[#DCFF37]/20" />

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <NextLink
              href="/match-making"
              className="flex flex-col items-center gap-2 p-4 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
            >
              <Icon
                icon="solar:gamepad-bold"
                className="w-8 h-8 text-[#FF4654] dark:text-[#DCFF37]"
              />
              <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                {t("nav.playNow")}
              </span>
            </NextLink>

            <NextLink
              href="/tournaments"
              className="flex flex-col items-center gap-2 p-4 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
            >
              <Icon
                icon="solar:cup-star-bold"
                className="w-8 h-8 text-[#FF4654] dark:text-[#DCFF37]"
              />
              <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                {t("nav.tournaments")}
              </span>
            </NextLink>

            <NextLink
              href="/cloud"
              className="flex flex-col items-center gap-2 p-4 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
            >
              <Icon
                icon="solar:cloud-bold"
                className="w-8 h-8 text-[#FF4654] dark:text-[#DCFF37]"
              />
              <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                {t("nav.cloud")}
              </span>
            </NextLink>

            <NextLink
              href="/leaderboards"
              className="flex flex-col items-center gap-2 p-4 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
            >
              <Icon
                icon="solar:ranking-bold"
                className="w-8 h-8 text-[#FF4654] dark:text-[#DCFF37]"
              />
              <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                {t("nav.leaderboards")}
              </span>
            </NextLink>
          </div>

          <Divider className="mt-8 bg-[#FF4654]/20 dark:bg-[#DCFF37]/20" />

          <div className="flex flex-wrap justify-between gap-2 pt-8">
            <p className="text-small text-[#34445C]/60 dark:text-[#F5F0E1]/60">
              &copy; {new Date().getFullYear()} Leet Gaming Pro Inc.{" "}
              {t("footer.allRightsReserved")}
            </p>
            <div className="flex items-center gap-4">
              <NextLink
                href="/signin"
                className="text-small text-[#34445C]/60 dark:text-[#F5F0E1]/60 hover:text-[#FF4654] dark:hover:text-[#DCFF37] transition-colors"
              >
                {t("auth.signIn")}
              </NextLink>
              <NextLink
                href="/signup"
                className="text-small text-[#34445C]/60 dark:text-[#F5F0E1]/60 hover:text-[#FF4654] dark:hover:text-[#DCFF37] transition-colors"
              >
                {t("auth.signUp")}
              </NextLink>
              <ThemeSwitch />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
