"use client";

import React from "react";
import { Avatar, Button, ScrollShadow, Tooltip, Spacer, User, Link, LinkIcon, DropdownItem, DropdownSection, DropdownMenu, Dropdown, DropdownTrigger } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useMediaQuery } from "usehooks-ts";

import { AcmeLogo } from "./acme";
import { sectionItemsWithTeams } from "./sidebar-items";
import { LoginButton } from '../login-button';
import Sidebar from "./sidebar";

import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { Providers } from '../default-layout/providers';
import Box from '../default-layout/box';
import { logo } from '../primitives';
import { SessionProvider, signOut, useSession } from 'next-auth/react';
import DefaultLogo from '../logo/logo-default';
import { useTheme } from 'next-themes';

import { DefaultLogoOnlyIcon } from '../logo/logo-default-only-icon';
import DefaultLogoNoIcon from '../logo/logo-default-no-icon';
import LogoGrayscale from '@/components/logo/logo-grayscale'
import { cl } from "../cl";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: 'device-width',
  initialScale: 1,
};

export { viewport };

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession()
  const { theme: rawTheme, setTheme: _setTheme, systemTheme: _systemTheme } = useTheme()

  const theme = rawTheme ?? "light"
  const backfilter = theme === "light" ? "brightness(1)" : "brightness(0.4)"


  const isCompact = useMediaQuery("(max-width: 768px)");
  const [isHidden, setIsHidden] = React.useState(false);

  const sessionAvatar = (): React.ReactNode => {
    if (session?.user) {
      return (
        <div>
          <Avatar
            isBordered
            className="flex-none"
            size="sm"
            src={session?.user?.image || ""}
          />
        </div>)
    }

    return (<div></div>)
  }

  return (
    <div className="flex h-dvh w-full">
      <div className="absolute top-0 left-0 w-full h-full z-[-1]"

        style={{
          // backgroundImage: `url('/1337gg/crowd_arena.png')`,
          backgroundImage: `url('/blur-glow-pry-gh.svg')`,
          backgroundSize: "cover",
          filter: backfilter,
          content: '',
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          zIndex: -1,
          opacity: (theme === "light" ? "10%" : "100%")
        }}
      >


      </div>
      <div
        className={cl(
          "relative flex h-full w-72 flex-col !border-r-small border-divider p-6 transition-width",
          {
            "w-16 items-center px-2 py-6": isCompact,
          },
        )}
      >
        <div
          className={cl(
            "flex items-center gap-3 px-3",

            {
              "justify-center gap-0": isCompact,
            },
          )}
        >
          {/* <div className="flex h-8 w-2 items-center rounded-full">
            <div style={{
              transform: "scale(10)",
              transformOrigin: "left",
            }}>
              <LogoGrayscale />
            </div>

          </div> */}
          {/* <span
            style={{
              transform: "scale(1.8)",
              transformOrigin: "left",
            }}
            className={cl("text-small font-bold opacity-100", {
              "w-0 opacity-0": isCompact,
              "transform -scale": !isCompact,
            })}
          >
            <DefaultLogo tag={false}></DefaultLogo>
          </span> */}
        </div>
        <div className="flex items-center gap-3 px-3 w-[82px]">
        <LogoGrayscale />
        </div>
        <div className="flex items-center gap-3 px-3 w-[82px]">
          <Dropdown showArrow placement="bottom-start">
            <DropdownTrigger>
              <Button disableRipple isIconOnly className="-mr-1" radius="full" variant="light">
                <Avatar
                  className="h-6 w-6 cursor-pointer"
                  name="My Group"
                  src="/logo_leetgaming-big-g.png"
                />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Custom item styles" disabledKeys={["profile"]}>
              <DropdownSection showDivider aria-label="Profile & Actions">
                <DropdownItem
                  key="profile"
                  isReadOnly
                  className="h-14 gap-2 opacity-100"
                  textValue="Signed in as"
                >
                  <User
                    avatarProps={{
                      size: "sm",
                      imgProps: {
                        className: "transition-none",
                      },
                      src: session?.user?.image || "/logo_leetgaming-big-g.png",
                    }}
                    classNames={{
                      name: "text-default-600",
                      description: "text-default-500",
                    }}
                    description={session?.user?.email || ""}
                    name={session?.user?.name || "Guest"}
                  />
                </DropdownItem>
                <DropdownItem key="dashboard" href="/replays">
                  Dashboard
                </DropdownItem>
                <DropdownItem key="settings" href="/settings">
                  Settings
                </DropdownItem>
                <DropdownItem
                  key="upload"
                  href="/upload"
                  endContent={<Icon className="text-large" icon="lucide:plus" />}
                >
                  Upload Replay
                </DropdownItem>
              </DropdownSection>

              <DropdownSection showDivider aria-label="Account">
                <DropdownItem
                  key="subscription"
                  href="/checkout"
                  startContent={<Icon className="text-warning" icon="solar:crown-bold" width={18} />}
                >
                  Subscription
                </DropdownItem>
                <DropdownItem
                  key="billing"
                  href="/settings?tab=billing"
                  startContent={<Icon className="text-default-500" icon="solar:card-bold" width={18} />}
                >
                  Billing
                </DropdownItem>
                <DropdownItem
                  key="privacy"
                  href="/settings?tab=privacy"
                  startContent={<Icon className="text-default-500" icon="solar:shield-check-bold" width={18} />}
                >
                  Privacy & Data
                </DropdownItem>
              </DropdownSection>

              <DropdownSection showDivider aria-label="Preferences">
                <DropdownItem key="quick_search" shortcut="⌘K">
                  Quick search
                </DropdownItem>
                <DropdownItem
                  key="theme"
                  isReadOnly
                  className="cursor-default"
                  endContent={
                    <select
                      className="z-10 w-16 rounded-md border-small border-default-300 bg-transparent py-0.5 text-tiny text-default-500 outline-none group-data-[hover=true]:border-default-500 dark:border-default-200"
                      id="theme"
                      name="theme"
                      value={theme}
                      onChange={(e) => _setTheme(e.target.value.toLowerCase())}
                    >
                      <option value="system">System</option>
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  }
                >
                  Theme
                </DropdownItem>
              </DropdownSection>

              <DropdownSection aria-label="Help & Feedback">
                <DropdownItem key="help_and_feedback" href="/help">
                  Help & Feedback
                </DropdownItem>
                <DropdownItem key="logout" className="text-danger" color="danger" onClick={() => signOut()}>
                  Log Out
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </div>
        <Spacer y={8} />
        <div className="flex items-center gap-3 px-3">
          {sessionAvatar()}
          <div className={cl("flex max-w-full flex-col", { hidden: isCompact })}>
            <p className="truncate text-small font-medium text-default-600">{session?.user?.name || LoginButton()}</p>
            <p className="truncate text-tiny text-default-400">{session?.user?.email || ""}</p>
          </div>
        </div>
        <ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
          <Sidebar defaultSelectedKey="home" isCompact={isCompact} items={sectionItemsWithTeams} />
        </ScrollShadow>
        <Spacer y={2} />
        <div
          className={cl("mt-auto flex flex-col", {
            "items-center": isCompact,
          })}
        >
          <Tooltip content="Help & Feedback" isDisabled={!isCompact} placement="right">
            <Button
              fullWidth
              className={cl(
                "justify-start truncate text-default-500 data-[hover=true]:text-foreground",
                {
                  "justify-center": isCompact,
                },
              )}
              isIconOnly={isCompact}
              startContent={
                isCompact ? null : (
                  <Icon
                    className="flex-none text-default-500"
                    icon="solar:info-circle-line-duotone"
                    width={24}
                  />
                )
              }
              variant="light"
            >
              {isCompact ? (
                <Icon
                  className="text-default-500"
                  icon="solar:info-circle-line-duotone"
                  width={24}
                />
              ) : (
                "Help & Information"
              )}
            </Button>
          </Tooltip>
          <Tooltip content="Log Out" isDisabled={!isCompact} placement="right">
            <Button
              className={cl("justify-start text-default-500 data-[hover=true]:text-foreground", {
                "justify-center": isCompact,
              })}
              isIconOnly={isCompact}
              onClick={() => signOut()}
              startContent={
                isCompact ? null : (
                  <Icon
                    className="flex-none rotate-180 text-default-500"
                    icon="solar:minus-circle-line-duotone"
                    width={24}
                  />
                )
              }
              variant="light"
            >
              {isCompact ? (
                <Icon
                  className="rotate-180 text-default-500"
                  icon="solar:minus-circle-line-duotone"
                  width={24}
                />
              ) : (
                "Log Out"
              )}
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="w-full flex-1 flex-col p-4">
        <header className="flex items-center gap-3 rounded-medium border-small border-divider p-4">
          <h2 className="text-medium font-medium text-default-700">Overview</h2>
        </header>
        <main className="mt-4 h-full w-full overflow-visible">
          <div className="flex h-[90%] w-full flex-col gap-4 rounded-medium border-small border-divider">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
