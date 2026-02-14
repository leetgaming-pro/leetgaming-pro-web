"use client";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING SWIPEABLE TABS - Touch-Optimized Tab Navigation              ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Native-feel swipeable tab navigation for mobile:                            ║
 * ║  • Horizontal swipe between tabs                                             ║
 * ║  • Spring animations                                                          ║
 * ║  • Scrollable tab headers                                                     ║
 * ║  • Active indicator animation                                                 ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useCallback, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { cn } from "@nextui-org/react";
import { Icon } from "@iconify/react";

// ============================================================================
// 🎯 TYPES
// ============================================================================

interface SwipeableTab {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
  content: React.ReactNode;
}

interface SwipeableTabsProps {
  tabs: SwipeableTab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  /** Whether to enable swipe gestures (default: true) */
  swipeable?: boolean;
  /** Animation type */
  animationType?: "slide" | "fade";
}

// ============================================================================
// 🎮 MAIN COMPONENT
// ============================================================================

export function SwipeableTabs({
  tabs,
  defaultTab,
  onChange,
  className,
  headerClassName,
  contentClassName,
  swipeable = true,
  animationType = "slide",
}: SwipeableTabsProps) {
  const [activeIndex, setActiveIndex] = useState(() => {
    if (defaultTab) {
      const index = tabs.findIndex((t) => t.id === defaultTab);
      return index >= 0 ? index : 0;
    }
    return 0;
  });
  const [direction, setDirection] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  const handleTabChange = useCallback(
    (index: number) => {
      const newDirection = index > activeIndex ? 1 : -1;
      setDirection(newDirection);
      setActiveIndex(index);
      onChange?.(tabs[index].id);
    },
    [activeIndex, onChange, tabs],
  );

  const handleSwipe = useCallback(
    (_: unknown, info: PanInfo) => {
      const threshold = 50;
      const velocity = info.velocity.x;
      const offset = info.offset.x;

      if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
        if (offset > 0 && activeIndex > 0) {
          handleTabChange(activeIndex - 1);
        } else if (offset < 0 && activeIndex < tabs.length - 1) {
          handleTabChange(activeIndex + 1);
        }
      }
    },
    [activeIndex, tabs.length, handleTabChange],
  );

  // Scroll active tab into view
  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      const tabRect = activeTabRef.current.getBoundingClientRect();
      const containerRect = tabsRef.current.getBoundingClientRect();

      if (
        tabRect.left < containerRect.left ||
        tabRect.right > containerRect.right
      ) {
        activeTabRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeIndex]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const fadeVariants = {
    enter: {
      opacity: 0,
      scale: 0.98,
    },
    center: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 0.98,
    },
  };

  const variants = animationType === "slide" ? slideVariants : fadeVariants;

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Tab Headers */}
      <div
        ref={tabsRef}
        className={cn(
          "relative flex items-center gap-1",
          "overflow-x-auto scrollbar-hide",
          "bg-[#34445C]/5 dark:bg-[#DCFF37]/5",
          "p-1 rounded-xl",
          // Hide scrollbar
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
          headerClassName,
        )}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={index === activeIndex ? activeTabRef : null}
            onClick={() => handleTabChange(index)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5",
              "rounded-lg whitespace-nowrap",
              "text-sm font-medium",
              "transition-colors duration-200",
              // Touch target
              "min-h-[44px]",
              // States
              index === activeIndex
                ? "text-white dark:text-[#34445C]"
                : "text-[#34445C]/70 dark:text-[#F5F0E1]/70 hover:text-[#34445C] dark:hover:text-[#F5F0E1]",
            )}
            aria-selected={index === activeIndex}
            role="tab"
          >
            {/* Active background */}
            {index === activeIndex && (
              <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-lg"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon && <Icon icon={tab.icon} className="w-4 h-4" />}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={cn(
                    "min-w-[18px] h-[18px] px-1 flex items-center justify-center",
                    "text-[10px] font-semibold rounded-full",
                    index === activeIndex
                      ? "bg-white/30 dark:bg-[#34445C]/30 text-white dark:text-[#34445C]"
                      : "bg-[#FF4654] dark:bg-[#DCFF37] text-white dark:text-[#34445C]",
                  )}
                >
                  {tab.badge > 99 ? "99+" : tab.badge}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        className={cn("relative flex-1 overflow-hidden mt-4", contentClassName)}
      >
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            drag={swipeable ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleSwipe}
            className="w-full"
          >
            {tabs[activeIndex].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// 🎮 PILL TABS (Compact variant)
// ============================================================================

interface PillTabsProps {
  tabs: { id: string; label: string; icon?: string }[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PillTabs({
  tabs,
  activeTab,
  onChange,
  className,
  size = "md",
}: PillTabsProps) {
  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 min-h-[32px]",
    md: "text-sm px-4 py-2 min-h-[40px]",
    lg: "text-base px-5 py-2.5 min-h-[48px]",
  };

  return (
    <div
      className={cn(
        "inline-flex gap-1 p-1 rounded-full",
        "bg-[#34445C]/5 dark:bg-[#DCFF37]/5",
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative flex items-center gap-1.5",
            "rounded-full font-medium",
            "transition-colors duration-200",
            sizeStyles[size],
            tab.id === activeTab
              ? "text-white dark:text-[#34445C]"
              : "text-[#34445C]/70 dark:text-[#F5F0E1]/70",
          )}
        >
          {tab.id === activeTab && (
            <motion.div
              layoutId="pillTabBg"
              className="absolute inset-0 bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-full"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {tab.icon && <Icon icon={tab.icon} className="w-4 h-4" />}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export default SwipeableTabs;
