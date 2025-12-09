"use client";

import type {IconProps} from "@iconify/react";

import React from "react";
import {Divider, Link} from "@nextui-org/react";
import {Icon} from "@iconify/react";
import NextLink from "next/link";

import ThemeSwitch from "./theme-switch";
import LogoGrayscale from "../logo/logo-grayscale";

import { useTheme } from "next-themes";

type SocialIconProps = Omit<IconProps, "icon">;

const footerNavigation = {
  resources: [
    { name: "Service Status", href: "/service-status" },
    { name: "Cloud Storage", href: "/cloud" },
    { name: "Upload Files", href: "/upload" },
    { name: "Pricing Plans", href: "/pricing" },
    { name: "Supply Store", href: "/supply" },
  ],
  community: [
    { name: "Leaderboards", href: "/leaderboards" },
    { name: "Tournaments", href: "/tournaments" },
    { name: "Players", href: "/players" },
    { name: "Teams", href: "/teams" },
    { name: "Matches", href: "/matches" },
    { name: "Replays", href: "/replays" },
    { name: "Highlights", href: "/highlights" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Documentation", href: "/docs" },
    { name: "Support", href: "/docs#support" },
    { name: "Contact", href: "/about#contact" },
  ],
  legal: [
    { name: "Terms of Service", href: "/legal/terms" },
    { name: "Privacy Policy", href: "/legal/privacy" },
    { name: "Cookie Policy", href: "/legal/cookies" },
  ],
  social: [
    {
      name: "Discord",
      href: "https://discord.gg/leetgaming",
      icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:discord" />,
    },
    {
      name: "Twitch",
      href: "https://twitch.tv/leetgamingpro",
      icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:twitch" />,
    },
    {
      name: "Twitter",
      href: "https://twitter.com/leetgamingpro",
      icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:twitter" />,
    },
    {
      name: "YouTube",
      href: "https://youtube.com/@leetgamingpro",
      icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:youtube-play" />,
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/leetgaming",
      icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:linkedin" />,
    },
  ],
};

// FooterLink component that handles both internal and external links
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith('http') || href.startsWith('//');
  
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
  const renderList = React.useCallback(
    ({title, items}: {title: string; items: {name: string; href: string}[]}) => (
      <div>
        <h3 className="text-small font-semibold text-[#FF4654] dark:text-[#DCFF37] uppercase tracking-wider">{title}</h3>
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={item.name}>
              <FooterLink href={item.href}>
                {item.name}
              </FooterLink>
            </li>
          ))}
        </ul>
      </div>
    ),
    [],
  );

  let { theme } = useTheme();

  if (!theme) {
    theme = "light";
  }

  return (
    <div className="basis-1/5 sm:basis-full justify-center align-items align-center"
      style={{
        backgroundImage: `url('/blur-glow-pry-gh.svg')`,
        backgroundSize: "cover",
        backgroundColor: theme === "dark" ? "rgba(0, 0, 0, 0.5)" : "",
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
                Get to clutch in the international stage.
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
                <div>{renderList({title: "Resources", items: footerNavigation.resources})}</div>
                <div className="mt-10 md:mt-0">
                  {renderList({title: "Community", items: footerNavigation.community})}
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>{renderList({title: "Company", items: footerNavigation.company})}</div>
                <div className="mt-10 md:mt-0">
                  {renderList({title: "Legal", items: footerNavigation.legal})}
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
              <Icon icon="solar:gamepad-bold" className="w-8 h-8 text-[#FF4654] dark:text-[#DCFF37]" />
              <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">Play Now</span>
            </NextLink>
            
            <NextLink 
              href="/tournaments" 
              className="flex flex-col items-center gap-2 p-4 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
            >
              <Icon icon="solar:cup-star-bold" className="w-8 h-8 text-[#FF4654] dark:text-[#DCFF37]" />
              <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">Tournaments</span>
            </NextLink>
            
            <NextLink 
              href="/cloud" 
              className="flex flex-col items-center gap-2 p-4 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
            >
              <Icon icon="solar:cloud-bold" className="w-8 h-8 text-[#FF4654] dark:text-[#DCFF37]" />
              <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">Cloud</span>
            </NextLink>
            
            <NextLink 
              href="/leaderboards" 
              className="flex flex-col items-center gap-2 p-4 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
            >
              <Icon icon="solar:ranking-bold" className="w-8 h-8 text-[#FF4654] dark:text-[#DCFF37]" />
              <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">Leaderboards</span>
            </NextLink>
          </div>
          
          <Divider className="mt-8 bg-[#FF4654]/20 dark:bg-[#DCFF37]/20" />
          
          <div className="flex flex-wrap justify-between gap-2 pt-8">
            <p className="text-small text-[#34445C]/60 dark:text-[#F5F0E1]/60">
              &copy; {new Date().getFullYear()} Leet Gaming Pro Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <NextLink 
                href="/signin" 
                className="text-small text-[#34445C]/60 dark:text-[#F5F0E1]/60 hover:text-[#FF4654] dark:hover:text-[#DCFF37] transition-colors"
              >
                Sign In
              </NextLink>
              <NextLink 
                href="/signup" 
                className="text-small text-[#34445C]/60 dark:text-[#F5F0E1]/60 hover:text-[#FF4654] dark:hover:text-[#DCFF37] transition-colors"
              >
                Sign Up
              </NextLink>
              <ThemeSwitch />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
