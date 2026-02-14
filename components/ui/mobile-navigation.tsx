"use client";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING MOBILE NAVIGATION - Premium App-Like Experience              ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Native mobile app-like bottom navigation with:                              ║
 * ║  • Central prominent PLAY button for instant matchmaking                     ║
 * ║  • iOS/Android safe area support                                             ║
 * ║  • Smooth micro-interactions & haptic-like animations                        ║
 * ║  • Touch-optimized 48px+ tap targets                                         ║
 * ║  • LeetGaming brand styling with gradient accents                            ║
 * ║                                                                              ║
 * ║  Layout: PROFILE | WALLET | [PLAY] | MATCHES | SETTINGS                      ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@nextui-org/react";
import { Badge } from "@nextui-org/react";
import { useSubscription } from "@/hooks/use-subscription";

// ============================================================================
// 🎯 TYPES
// ============================================================================

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  iconActive: string;
  badge?: number;
  badgeColor?: "primary" | "secondary" | "success" | "warning" | "danger";
  isCenter?: boolean; // For the prominent PLAY button
}

interface MobileNavigationProps {
  items?: NavItem[];
  className?: string;
  onNavigation?: (href: string) => void;
}

// ============================================================================
// 🎨 DEFAULT NAVIGATION ITEMS
// Layout: PROFILE | WALLET | [PLAY] | MATCHES | SETTINGS
// ============================================================================

const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    id: "profile",
    label: "Profile",
    href: "/settings?tab=profile",
    icon: "solar:user-circle-linear",
    iconActive: "solar:user-circle-bold-duotone",
  },
  {
    id: "wallet",
    label: "Wallet",
    href: "/wallet",
    icon: "solar:wallet-2-linear",
    iconActive: "solar:wallet-2-bold-duotone",
  },
  {
    id: "play",
    label: "Play",
    href: "/match-making",
    icon: "solar:gamepad-linear",
    iconActive: "solar:gamepad-bold-duotone",
    isCenter: true, // Prominent central button
  },
  {
    id: "matches",
    label: "Matches",
    href: "/matches",
    icon: "solar:cup-first-linear",
    iconActive: "solar:cup-first-bold-duotone",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    icon: "solar:settings-linear",
    iconActive: "solar:settings-bold-duotone",
  },
];

// ============================================================================
// 🎮 MAIN COMPONENT
// ============================================================================

export function MobileNavigation({
  items = DEFAULT_NAV_ITEMS,
  className,
  onNavigation,
}: MobileNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isActive: hasActiveSubscription } = useSubscription();

  // Dynamically update navigation items based on subscription status
  const navigationItems = useMemo(() => {
    return items.map((item) => {
      // Route pro/elite users to /wallet/pro instead of /wallet
      if (item.id === "wallet" && hasActiveSubscription) {
        return {
          ...item,
          href: "/wallet/pro",
        };
      }
      return item;
    });
  }, [items, hasActiveSubscription]);

  const isActivePath = useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      // Handle profile tab - special case for /settings?tab=profile
      if (href === "/settings?tab=profile") {
        return (
          pathname === "/settings" &&
          typeof window !== "undefined" &&
          window.location.search.includes("tab=profile")
        );
      }
      // Handle settings page (but not when profile tab is active)
      if (href === "/settings") {
        if (
          typeof window !== "undefined" &&
          window.location.search.includes("tab=profile")
        ) {
          return false;
        }
        return pathname === "/settings" || pathname.startsWith("/settings/");
      }
      // Handle wallet pages - both /wallet and /wallet/pro should be "active" for wallet nav
      if (href === "/wallet" || href === "/wallet/pro") {
        return pathname === "/wallet" || pathname.startsWith("/wallet/");
      }
      return pathname.startsWith(href);
    },
    [pathname],
  );

  const handleNavClick = useCallback(
    (href: string) => {
      onNavigation?.(href);
      router.push(href);
    },
    [router, onNavigation],
  );

  // Find the center item index for the play button
  const _centerIndex = useMemo(() => {
    return navigationItems.findIndex((item) => item.isCenter);
  }, [navigationItems]);

  return (
    <nav
      className={cn(
        // Base styles
        "fixed bottom-0 left-0 right-0 z-50",
        // Safe area padding for iOS
        "pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]",
        // Glassy background matching top navbar
        "bg-white/70 dark:bg-[#0a0a0a]/80 backdrop-blur-xl backdrop-saturate-150",
        // Top border with subtle gradient
        "border-t border-[#34445C]/10 dark:border-[#DCFF37]/10",
        // Premium shadow - softer in light mode
        "shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.5)]",
        // Hide on desktop
        "md:hidden",
        className,
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      {/* Navigation items container - TALLER height */}
      <div className="relative flex items-end justify-around h-[80px] px-2">
        {navigationItems.map((item, _index) => {
          const active = isActivePath(item.href);
          const isPlayButton = item.isCenter;

          // Render the prominent PLAY button - BIGGER size
          if (isPlayButton) {
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  // Positioning - elevated above other items
                  "relative flex flex-col items-center justify-center",
                  "-mt-6 mb-1",
                  // Focus visible
                  "focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FF4654]/40 rounded-full",
                )}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
              >
                {/* Glowing background ring */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF4654]/30 to-[#34445C]/20 blur-xl"
                  animate={{
                    scale: active ? [1, 1.3, 1] : 1,
                    opacity: active ? 0.9 : 0.5,
                  }}
                  transition={{
                    duration: 2,
                    repeat: active ? Infinity : 0,
                    repeatType: "reverse",
                  }}
                />

                {/* Main button - BIGGER 64x64 */}
                <motion.div
                  className={cn(
                    "relative flex items-center justify-center",
                    "w-16 h-16 rounded-full",
                    // Gradient background - esports red primary
                    active
                      ? "bg-gradient-to-br from-[#FF4654] via-[#FF4654] to-[#CC3844]"
                      : "bg-gradient-to-br from-[#34445C] to-[#1a222e] dark:from-[#34445C] dark:to-[#0a0a0a]",
                    // Shadow - red glow when active
                    active
                      ? "shadow-lg shadow-[#FF4654]/50"
                      : "shadow-lg shadow-black/30 dark:shadow-black/50",
                  )}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.08 }}
                  animate={{
                    y: active ? -3 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Icon
                    icon={active ? item.iconActive : item.icon}
                    className={cn(
                      "w-8 h-8",
                      active ? "text-white" : "text-[#F5F0E1]/90",
                    )}
                  />
                </motion.div>

                {/* Label */}
                <motion.span
                  className={cn(
                    "text-[10px] font-bold mt-2 tracking-wide uppercase",
                    active
                      ? "text-[#FF4654]"
                      : "text-[#34445C]/70 dark:text-[#F5F0E1]/60",
                  )}
                  animate={{ opacity: 1 }}
                >
                  {item.label}
                </motion.span>
              </button>
            );
          }

          // Regular nav items - improved colors for light/dark mode
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.href)}
              className={cn(
                // Touch target - minimum 48px for accessibility
                "relative flex flex-col items-center justify-center",
                "min-w-[60px] min-h-[60px] px-3 py-2 mb-1",
                // Tap highlight
                "active:scale-95 transition-transform duration-100",
                // Focus visible
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4654]/40 rounded-xl",
              )}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
            >
              {/* Active background indicator */}
              <AnimatePresence>
                {active && (
                  <motion.div
                    className="absolute inset-1 rounded-xl bg-[#FF4654]/10 dark:bg-[#DCFF37]/10"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>

              {/* Icon with badge */}
              <div className="relative z-10">
                <motion.div
                  initial={false}
                  animate={{
                    y: active ? -2 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Icon
                    icon={active ? item.iconActive : item.icon}
                    className={cn(
                      "w-6 h-6 transition-colors duration-200",
                      // Light mode: red when active, dark gray when inactive
                      // Dark mode: lime when active, muted when inactive
                      active
                        ? "text-[#FF4654] dark:text-[#DCFF37]"
                        : "text-[#34445C]/60 dark:text-[#F5F0E1]/50",
                    )}
                  />
                </motion.div>

                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <Badge
                    content={item.badge > 99 ? "99+" : item.badge}
                    color={item.badgeColor || "danger"}
                    size="sm"
                    className="absolute -top-1 -right-2 min-w-[18px] h-[18px] text-[10px]"
                  >
                    <span />
                  </Badge>
                )}
              </div>

              {/* Label - better contrast */}
              <motion.span
                className={cn(
                  "relative z-10 text-[10px] font-medium mt-1.5 transition-colors duration-200",
                  active
                    ? "text-[#FF4654] dark:text-[#DCFF37] font-semibold"
                    : "text-[#34445C]/70 dark:text-[#F5F0E1]/50",
                )}
                initial={false}
                animate={{
                  fontWeight: active ? 600 : 500,
                }}
              >
                {item.label}
              </motion.span>

              {/* Active indicator dot */}
              <AnimatePresence>
                {active && (
                  <motion.div
                    className="absolute top-0.5 w-1.5 h-1.5 bg-[#FF4654] dark:bg-[#DCFF37] rounded-full"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ============================================================================
// 🎮 FLOATING ACTION BUTTON
// ============================================================================

interface FloatingActionButtonProps {
  icon?: string;
  label?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
  variant?: "primary" | "matchmaking";
}

export function FloatingActionButton({
  icon = "solar:add-circle-bold",
  label = "Quick Action",
  onClick,
  href,
  className,
  variant = "matchmaking",
}: FloatingActionButtonProps) {
  const router = useRouter();

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  }, [onClick, href, router]);

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        // Position - above bottom nav, respecting safe area
        "fixed bottom-20 right-4 z-50 md:hidden",
        "mb-[env(safe-area-inset-bottom)]",
        // Size and shape
        "w-14 h-14 rounded-full",
        // Gradient based on variant
        variant === "matchmaking"
          ? "bg-gradient-to-br from-[#DCFF37] to-[#34445C] shadow-lg shadow-[#DCFF37]/30"
          : "bg-gradient-to-br from-[#FF4654] to-[#FFC700] shadow-lg shadow-[#FF4654]/30",
        // Flex
        "flex items-center justify-center",
        // Focus states
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2",
        variant === "matchmaking"
          ? "focus-visible:ring-[#DCFF37]/50"
          : "focus-visible:ring-[#FF4654]/50",
        className,
      )}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      aria-label={label}
    >
      <Icon
        icon={icon}
        className={cn(
          "w-7 h-7",
          variant === "matchmaking" ? "text-[#34445C]" : "text-[#F5F0E1]",
        )}
      />
    </motion.button>
  );
}

// ============================================================================
// 🎮 MOBILE HEADER
// ============================================================================

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export function MobileHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  className,
}: MobileHeaderProps) {
  const router = useRouter();

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  }, [onBack, router]);

  return (
    <header
      className={cn(
        // Base styles
        "sticky top-0 z-40",
        // Safe area padding
        "pt-[env(safe-area-inset-top)]",
        // Background with blur
        "bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl backdrop-saturate-150",
        // Border
        "border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10",
        // Hide on desktop
        "md:hidden",
        className,
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left - Back button or spacer */}
        <div className="w-10 flex items-center">
          {showBack && (
            <button
              onClick={handleBack}
              className={cn(
                "w-10 h-10 flex items-center justify-center",
                "rounded-lg active:bg-[#34445C]/10 dark:active:bg-[#DCFF37]/10",
                "transition-colors",
              )}
              aria-label="Go back"
            >
              <Icon
                icon="solar:arrow-left-linear"
                className="w-6 h-6 text-[#34445C] dark:text-[#F5F0E1]"
              />
            </button>
          )}
        </div>

        {/* Center - Title */}
        <div className="flex-1 text-center">
          <h1 className="text-base font-semibold text-[#34445C] dark:text-[#F5F0E1] truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[#34445C]/60 dark:text-[#F5F0E1]/60 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right - Action or spacer */}
        <div className="w-10 flex items-center justify-end">{rightAction}</div>
      </div>
    </header>
  );
}

export default MobileNavigation;
