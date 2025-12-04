"use client";

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Link } from "@nextui-org/link";
import { Divider } from "@nextui-org/react";
import { Icon } from "@iconify/react";

import { link as linkStyles } from "@nextui-org/theme";

import { siteConfig } from "@/config/site";
import NextLink from "next/link";
import clsx from "clsx";

import { ThemeSwitch } from "@/components/theme-switch";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  SearchIcon,
  Logo,
  SteamIcon,
  LogOutIcon,
  HeartFilledIcon,
  StarredIcon,
} from "@/components/icons";

import { logo, title } from './primitives';
import { LoginButton } from './login-button';
import SessionButton from './session-button';
import { useSession, signOut } from 'next-auth/react';
import SearchInput from "./search/search-modal/search-modal";

import DefaultLogo from './logo/logo-default';
import { useTheme } from "next-themes";
import { electrolize } from "@/config/fonts";
import { Chip, Button } from "@nextui-org/react";
import { NotificationCenter } from '@/components/notifications/notification-center';

export const Navbar = () => {

  let { theme, setTheme } = useTheme();

  if (theme === null || theme === undefined) {
    theme = "dark";
  }

  let SessionArea;

  const { data: session } = useSession()

  // console.log('##session##', JSON.stringify(session))
  if (session) {
    SessionArea = SessionButton;
  } else {
    SessionArea = LoginButton;
  }

  const searchInput = SearchInput();

  return (
    <NextUINavbar
      maxWidth="full"
      height="3.5rem"
      position="sticky"
      isBordered={false}
      isBlurred={true}
      className="border-b border-divider/30 backdrop-blur-md backdrop-saturate-150"
      classNames={{
        wrapper: "px-4 lg:px-6 max-w-full",
      }}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="max-w-fit">
          <NextLink className="flex items-center gap-2" href="/">
            <DefaultLogo onClick={() => window.location.href = "/"} />
          </NextLink>
        </NavbarBrand>

        <ul className="hidden lg:flex items-center gap-1 ml-4">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  "relative px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-lg",
                  "hover:bg-default-100 hover:text-foreground",
                  "data-[active=true]:text-primary data-[active=true]:bg-primary/10",
                  electrolize.className,
                  item.href === "/match-making" && "bg-gradient-to-br from-[#DCFF37] to-[#B8D930] text-zinc-900 font-semibold hover:shadow-md",
                  item.href === "/cloud" && "bg-gradient-to-br from-zinc-600 to-zinc-700 text-zinc-100"
                )}
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-2" justify="end">
        <NavbarItem className="hidden lg:flex w-64 xl:w-80">
          {searchInput}
        </NavbarItem>

        <NavbarItem className="hidden sm:flex gap-1.5 items-center">
          <NotificationCenter enableRealtime={true} />
          <ThemeSwitch />
        </NavbarItem>

        <NavbarItem className="hidden lg:flex">
          <SessionArea />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu className="pt-6 pb-6 gap-2 bg-background/95 backdrop-blur-xl">
        <div className="px-4 mb-4">
          {searchInput}
        </div>
        <div className="flex flex-col gap-1 px-2">
          {siteConfig.navMenuItems.map((item, index) => {
            // Handle divider
            if (item.label === 'divider') {
              return <Divider key={`divider-${index}`} className="my-2" />;
            }

            const isHighlight = (item as any).highlight;
            const itemIcon = (item as any).icon;

            return (
              <NavbarMenuItem key={`${item.label}-${index}`}>
                <Link
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isHighlight
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "hover:bg-default-100 text-foreground"
                  )}
                  href={item.href}
                  size="lg"
                >
                  {itemIcon && (
                    <Icon
                      icon={itemIcon}
                      className={clsx(
                        "w-5 h-5",
                        isHighlight ? "text-primary-foreground" : "text-default-500"
                      )}
                    />
                  )}
                  <span>{item.label}</span>
                </Link>
              </NavbarMenuItem>
            );
          })}

          {/* Logout button - only show if logged in */}
          {session && (
            <>
              <Divider className="my-2" />
              <NavbarMenuItem>
                <Button
                  className="w-full justify-start gap-3 px-3"
                  color="danger"
                  variant="light"
                  startContent={<Icon icon="solar:logout-2-bold" className="w-5 h-5" />}
                  onPress={() => signOut()}
                >
                  Log Out
                </Button>
              </NavbarMenuItem>
            </>
          )}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
