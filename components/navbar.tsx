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
import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback } from "react";

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
import { LanguageSelector } from '@/components/i18n/language-selector';

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle menu item click - close menu and navigate
  const handleMenuItemClick = useCallback((href: string) => {
    setIsMenuOpen(false);
    router.push(href);
  }, [router]);

  let { theme, setTheme } = useTheme();

  if (theme === null || theme === undefined) {
    theme = "dark";
  }

  let SessionArea;

  const { data: session } = useSession()
  
  // Helper to check if path is active
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // console.log('##session##', JSON.stringify(session))
  if (session) {
    SessionArea = SessionButton;
  } else {
    SessionArea = LoginButton;
  }

  const searchInput = <SearchInput />;

  return (
    <NextUINavbar
      maxWidth="full"
      height="3.5rem"
      position="sticky"
      isBordered={false}
      isBlurred={true}
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      className="border-b border-divider/30 backdrop-blur-md backdrop-saturate-150"
      classNames={{
        wrapper: "px-4 md:px-6 max-w-full",
        menuItem: "data-[active=true]:bg-primary/10",
      }}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="max-w-fit">
          <NextLink className="flex items-center gap-2" href="/">
            <DefaultLogo onClick={() => window.location.href = "/"} />
          </NextLink>
        </NavbarBrand>

        <ul className="hidden md:flex items-stretch h-full gap-0 ml-4">
          {siteConfig.navItems.map((item, index) => {
            const active = isActive(item.href);
            const isPrimary = item.href === "/match-making";
            const isCloud = item.href === "/cloud";
            
            return (
              <NavbarItem key={item.href} className="h-full flex items-stretch">
                <NextLink
                  className={clsx(
                    "relative px-5 flex items-center text-sm font-semibold uppercase tracking-wider transition-all duration-200",
                    "hover:text-foreground h-full",
                    electrolize.className,
                    isPrimary
                      ? "esports-nav-link-primary bg-gradient-to-br from-[#DCFF37] to-[#B8D930] text-zinc-900 hover:shadow-lg hover:shadow-[#DCFF37]/30"
                      : isCloud
                        ? clsx(
                            "esports-nav-link bg-gradient-to-br from-zinc-600 to-zinc-700 text-zinc-100 hover:from-zinc-500 hover:to-zinc-600",
                            active && "esports-nav-link-active"
                          )
                        : clsx(
                            "esports-nav-link",
                            active 
                              ? "esports-nav-link-active text-white dark:text-[#DCFF37]"
                              : "text-[#34445C]/80 dark:text-[#F5F0E1]/80 hover:text-[#34445C] dark:hover:text-[#F5F0E1] hover:bg-[#34445C]/10 dark:hover:bg-[#DCFF37]/10"
                          ),
                    index === 0 && "!ml-0" /* primeiro item sem margem negativa */
                  )}
                  href={item.href}
                >
                  <span>{item.label}</span>
                </NextLink>
              </NavbarItem>
            );
          })}
        </ul>
      </NavbarContent>

      <NavbarContent className="hidden md:flex gap-3" justify="end">
        {/* Separator */}
        <NavbarItem className="hidden md:flex items-center">
          <span className="text-[#FF4654]/40 dark:text-[#DCFF37]/40 font-mono text-lg tracking-tighter select-none">{"//"}</span>
        </NavbarItem>
        
        <NavbarItem className="hidden md:flex w-48 lg:w-64 xl:w-80">
          {searchInput}
        </NavbarItem>

        <NavbarItem className="hidden md:flex gap-1.5 items-center">
          <LanguageSelector showFlag={true} variant="flat" size="sm" />
          <NotificationCenter enableRealtime={true} />
          <ThemeSwitch />
        </NavbarItem>

        <NavbarItem className="hidden md:flex">
          <SessionArea />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="md:hidden basis-1 gap-1" justify="end">
        <LanguageSelector showFlag={true} variant="flat" size="sm" />
        <ThemeSwitch />
        <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
      </NavbarContent>

      <NavbarMenu className="pt-6 pb-6 gap-2 bg-background/95 backdrop-blur-xl">
        <div className="px-4 mb-4">
          {searchInput}
        </div>
        <div className="flex flex-col gap-1 px-2">
          {siteConfig.navMenuItems.map((item, index) => {
            // Handle divider
            if (item.label === 'divider') {
              return <Divider key={`divider-${index}`} className="my-2 bg-[#FF4654]/20 dark:bg-[#DCFF37]/20" />;
            }

            const isHighlight = (item as any).highlight;
            const itemIcon = (item as any).icon;
            const active = isActive(item.href);

            return (
              <NavbarMenuItem key={`${item.label}-${index}`}>
                <button
                  onClick={() => handleMenuItemClick(item.href)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 text-left",
                    // Edgy clip-path for all menu items
                    isHighlight
                      ? "bg-gradient-to-r from-[#FF4654] to-[#FFC700] text-white font-semibold dark:from-[#DCFF37] dark:to-[#34445C] dark:text-[#1a1a1a]"
                      : active
                        ? "bg-[#34445C] text-white dark:bg-[#DCFF37] dark:text-[#1a1a1a] font-semibold border-l-4 border-[#FF4654] dark:border-[#1a1a1a]"
                        : "hover:bg-[#34445C]/10 dark:hover:bg-[#DCFF37]/10 text-foreground"
                  )}
                  style={{ 
                    clipPath: isHighlight || active 
                      ? 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)'
                      : undefined 
                  }}
                >
                  {itemIcon && (
                    <Icon
                      icon={itemIcon}
                      className={clsx(
                        "w-5 h-5 flex-shrink-0",
                        isHighlight || active ? "text-current" : "text-default-500"
                      )}
                    />
                  )}
                  <span>{item.label}</span>
                </button>
              </NavbarMenuItem>
            );
          })}

          {/* Logout button - only show if logged in */}
          {session && (
            <>
              <Divider className="my-2 bg-[#FF4654]/20 dark:bg-[#DCFF37]/20" />
              <NavbarMenuItem>
                <Button
                  className="w-full justify-start gap-3 px-3 bg-danger/10 hover:bg-danger/20 text-danger font-semibold"
                  radius="none"
                  variant="flat"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
                  startContent={<Icon icon="solar:logout-2-bold" className="w-5 h-5" />}
                  onPress={() => {
                    setIsMenuOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
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
