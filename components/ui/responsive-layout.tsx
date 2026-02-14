"use client";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING RESPONSIVE LAYOUT - Award-Winning App Shell                   ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Unified responsive layout that provides:                                    ║
 * ║  • Mobile bottom navigation                                                  ║
 * ║  • Safe area handling                                                        ║
 * ║  • Floating action button                                                    ║
 * ║  • Mobile header                                                             ║
 * ║  • Content padding for navigation                                            ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React from "react";
import { cn } from "@nextui-org/react";
import {
  MobileNavigation,
  MobileHeader,
  FloatingActionButton,
  type NavItem,
} from "./mobile-navigation";

// ============================================================================
// 🎯 TYPES
// ============================================================================

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  /** Show mobile bottom navigation */
  showNavigation?: boolean;
  /** Custom navigation items */
  navigationItems?: NavItem[];
  /** Show floating action button */
  showFAB?: boolean;
  /** FAB configuration */
  fabConfig?: {
    icon?: string;
    label?: string;
    href?: string;
    onClick?: () => void;
    variant?: "primary" | "matchmaking";
  };
  /** Mobile header configuration */
  header?: {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    rightAction?: React.ReactNode;
  };
  /** Add padding for bottom navigation */
  bottomPadding?: boolean;
  /** Content wrapper class */
  contentClassName?: string;
}

// ============================================================================
// 🎮 MAIN COMPONENT
// ============================================================================

export function ResponsiveLayout({
  children,
  className,
  showNavigation = true,
  navigationItems,
  showFAB = false,
  fabConfig,
  header,
  bottomPadding = true,
  contentClassName,
}: ResponsiveLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen w-full",
        "bg-[#F5F0E1] dark:bg-[#0a0a0a]",
        className,
      )}
    >
      {/* Mobile Header (mobile only) */}
      {header && (
        <MobileHeader
          title={header.title}
          subtitle={header.subtitle}
          showBack={header.showBack}
          onBack={header.onBack}
          rightAction={header.rightAction}
        />
      )}

      {/* Main Content */}
      <main
        className={cn(
          "w-full",
          // Add bottom padding on mobile for navigation
          bottomPadding && showNavigation && "pb-20 md:pb-0",
          // Safe area bottom padding
          showNavigation && "safe-area-bottom md:pb-0",
          contentClassName,
        )}
      >
        {children}
      </main>

      {/* Floating Action Button (mobile only) */}
      {showFAB && fabConfig && (
        <FloatingActionButton
          icon={fabConfig.icon}
          label={fabConfig.label}
          href={fabConfig.href}
          onClick={fabConfig.onClick}
          variant={fabConfig.variant}
        />
      )}

      {/* Mobile Bottom Navigation (mobile only) */}
      {showNavigation && <MobileNavigation items={navigationItems} />}
    </div>
  );
}

// ============================================================================
// 🎮 MOBILE PAGE WRAPPER
// ============================================================================

interface MobilePageWrapperProps {
  children: React.ReactNode;
  className?: string;
  /** Page title for mobile header */
  title?: string;
  /** Show back button */
  showBack?: boolean;
  /** Header right action */
  headerAction?: React.ReactNode;
  /** Full width content (no horizontal padding) */
  fullWidth?: boolean;
  /** Show FAB for quick matchmaking */
  showMatchmakingFAB?: boolean;
}

export function MobilePageWrapper({
  children,
  className,
  title,
  showBack = false,
  headerAction,
  fullWidth = false,
  showMatchmakingFAB = true,
}: MobilePageWrapperProps) {
  return (
    <ResponsiveLayout
      header={
        title
          ? {
              title,
              showBack,
              rightAction: headerAction,
            }
          : undefined
      }
      showFAB={showMatchmakingFAB}
      fabConfig={{
        icon: "solar:gamepad-bold",
        label: "Quick Match",
        href: "/match-making",
        variant: "matchmaking",
      }}
      contentClassName={cn(!fullWidth && "px-4 sm:px-6 lg:px-8", className)}
    >
      {children}
    </ResponsiveLayout>
  );
}

// ============================================================================
// 🎮 RESPONSIVE CONTAINER
// ============================================================================

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum width */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  /** Horizontal padding */
  padding?: "none" | "sm" | "md" | "lg";
  /** Center content */
  centered?: boolean;
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = "2xl",
  padding = "md",
  centered = true,
}: ResponsiveContainerProps) {
  const maxWidthStyles = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  };

  const paddingStyles = {
    none: "",
    sm: "px-3 sm:px-4",
    md: "px-4 sm:px-6 lg:px-8",
    lg: "px-6 sm:px-8 lg:px-12",
  };

  return (
    <div
      className={cn(
        "w-full",
        maxWidthStyles[maxWidth],
        paddingStyles[padding],
        centered && "mx-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// 🎮 RESPONSIVE GRID
// ============================================================================

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  /** Number of columns at different breakpoints */
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** Gap between items */
  gap?: "sm" | "md" | "lg";
}

export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = "md",
}: ResponsiveGridProps) {
  const colsClasses = [
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ]
    .filter(Boolean)
    .join(" ");

  const gapStyles = {
    sm: "gap-2 sm:gap-3",
    md: "gap-3 sm:gap-4 lg:gap-6",
    lg: "gap-4 sm:gap-6 lg:gap-8",
  };

  return (
    <div className={cn("grid", colsClasses, gapStyles[gap], className)}>
      {children}
    </div>
  );
}

// ============================================================================
// 🎮 MOBILE SECTION
// ============================================================================

interface MobileSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
  /** Full bleed on mobile (no horizontal padding) */
  fullBleed?: boolean;
}

export function MobileSection({
  children,
  className,
  title,
  action,
  fullBleed = false,
}: MobileSectionProps) {
  return (
    <section className={cn("py-4 sm:py-6", className)}>
      {(title || action) && (
        <div
          className={cn(
            "flex items-center justify-between mb-4",
            !fullBleed && "px-4 sm:px-0",
          )}
        >
          {title && (
            <h2 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      <div className={cn(fullBleed ? "mobile-full-bleed" : "")}>{children}</div>
    </section>
  );
}

export default ResponsiveLayout;
