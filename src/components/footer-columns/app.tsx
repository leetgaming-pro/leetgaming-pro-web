"use client";

import type {IconProps} from "@iconify/react";

import React from "react";
import {Divider, Link} from "@nextui-org/react";
import {Icon} from "@iconify/react";

import ThemeSwitch from "./theme-switch";
import LogoGrayscale from "../logo/logo-grayscale";

import { useTheme } from "next-themes";

type SocialIconProps = Omit<IconProps, "icon">;

const footerNavigation = {
  resources: [
    { name: "Service Status", href: "/service-status" },
    { name: "Authenticator", href: "/authenticator" },
    { name: "CloudStorage", href: "/vault" },
    { name: "Dedicated Servers", href: "/game-servers" },
    { name: "Supply", href: "#" },
  ],
  community: [
    { name: "Forums", href: "#" },
    { name: "Stats", href: "#" },
    { name: "Featured", href: "#" },
    { name: <Divider className="w-full max-w-md p-0 w-12"/>, href: "#" },
    { name: "Highlights", href: "#" },
    { name: "Players", href: "#" },
    { name: "Teams", href: "#" },
    { name: "Matches", href: "#" },
    { name: "Replays", href: "#" },

  ],
  company: [
    { name: "Blog", href: "#" }, // Content related to eSports and improvement
    { name: "Project Board", href: "#" },
    { name: "Developer Portal", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Partnerships", href: "#" },
    { name: "Customer Support", href: "#" },
    { name: "Frequently Asked Questions", href: "#" },
  ],
  legal: [ // Keep these as they are essential
    { name: "Terms of Service", href: "#" },
    { name: "Privacy Policy", href: "#" },
  ],
  social: [ // Focus on platforms relevant to gamers and eSports
    {
      name: "Discord",
      href: "#",
      icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:discord" />,
    },
    {
      name: "Twitch",
      href: "#",
      icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:twitch" />,
    },
    {
      name: "Twitter",
      href: "#",
      icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:twitter" />,
    },
    {
      name: "YouTube",
      href: "#",
      icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:youtube-play" />,
    },
    {
      name: "LinkedIn",
      href: "#",
      icon: (props: SocialIconProps) => <Icon {...props} icon="fontisto:linkedin" />,
    },
  ],
};


export default function FooterColumns() {
  const renderList = React.useCallback(
    ({title, items}: {title: string; items: {name: any; href: string}[]}) => (
      <div>
        <h3 className="text-small font-semibold text-default-600">{title}</h3>
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={item.name}>
              <Link className="text-default-400" href={item.href} size="sm">
                {item.name}
              </Link>
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
    <div className="basis-1/5 sm:basis-full justify-center align-items align-center "
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
              <LogoGrayscale />
            </div>
            <p className="font-medium text-small text-default-500">
              Get to clutch in the international stage.
             </p>

            <div className="flex space-x-6">
              {footerNavigation.social.map((item) => (
                <Link key={item.name} isExternal className="text-default-400" href={item.href}>
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
        <Divider className="mt-16 sm:mt-20 lg:mt-24" />
        <div className="flex flex-wrap justify-between gap-2 pt-8">
          <p className="text-small text-default-400">&copy; 2024 Leet Gaming Pro Inc. All rights reserved.</p>
          <ThemeSwitch />
        </div>
      </div>
    </footer>
    </div>
  );
}
