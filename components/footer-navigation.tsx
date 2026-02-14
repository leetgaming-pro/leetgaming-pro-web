"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@nextui-org/react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface FooterNavItem {
  label: string;
  href: string;
  icon: string;
  activeIcon?: string;
}

const footerNavItems: FooterNavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: "solar:home-2-linear",
    activeIcon: "solar:home-2-bold",
  },
  {
    label: "Matches",
    href: "/matches",
    icon: "solar:gamepad-2-linear",
    activeIcon: "solar:gamepad-2-bold",
  },
  {
    label: "Replays",
    href: "/replays",
    icon: "solar:videocamera-record-linear",
    activeIcon: "solar:videocamera-record-bold",
  },
  {
    label: "Highlights",
    href: "/highlights",
    icon: "solar:star-linear",
    activeIcon: "solar:star-bold",
  },
  {
    label: "Play",
    href: "/match-making",
    icon: "solar:gamepad-linear",
    activeIcon: "solar:gamepad-bold",
  },
];

export function FooterNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
    >
      {/* Background with esports gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] backdrop-blur-md backdrop-saturate-150" />

      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-20 h-20 bg-[#06FFA5] rounded-full filter blur-[20px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-20 h-20 bg-[#FF4654] rounded-full filter blur-[20px] animate-pulse delay-500" />
      </div>

      {/* Navigation bar */}
      <div className="relative border-t border-[#34445C]/20">
        <div className="flex items-center justify-around px-2 py-2">
          {footerNavItems.map((item, index) => {
            const active = isActive(item.href);
            const isPlayButton = item.href === "/match-making";

            return (
              <motion.div
                key={item.href}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex-1"
              >
                <Button
                  onPress={() => handleNavigation(item.href)}
                  className={clsx(
                    "w-full h-14 flex flex-col items-center justify-center gap-1 rounded-none transition-all duration-300",
                    "hover:bg-[#34445C]/10 active:scale-95",
                    active && !isPlayButton && "bg-[#34445C]/20",
                    isPlayButton && "relative"
                  )}
                  style={{
                    backgroundColor:
                      active && !isPlayButton
                        ? "rgba(52, 68, 92, 0.1)"
                        : "transparent",
                  }}
                >
                  {/* Play button special styling */}
                  {isPlayButton && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF4654] to-[#FFC700] opacity-20 animate-pulse" />
                  )}

                  <div className="relative z-10 flex flex-col items-center gap-1">
                    {/* Icon with active state */}
                    <motion.div
                      animate={{
                        scale: active ? 1.1 : 1,
                        color: active
                          ? isPlayButton
                            ? "#FF4654"
                            : "#06FFA5"
                          : "#F5F0E1",
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon
                        icon={active ? item.activeIcon || item.icon : item.icon}
                        width={20}
                        height={20}
                        className={clsx(
                          "transition-colors duration-200",
                          active && isPlayButton && "drop-shadow-lg"
                        )}
                      />
                    </motion.div>

                    {/* Label */}
                    <span
                      className={clsx(
                        "text-xs font-medium uppercase tracking-wide transition-colors duration-200",
                        active
                          ? isPlayButton
                            ? "text-[#FF4654]"
                            : "text-[#06FFA5]"
                          : "text-[#F5F0E1]/70"
                      )}
                    >
                      {item.label}
                    </span>

                    {/* Active indicator */}
                    {active && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 rounded-full"
                        style={{
                          backgroundColor: isPlayButton ? "#FF4654" : "#06FFA5",
                          boxShadow: isPlayButton
                            ? "0 0 8px rgba(255, 70, 84, 0.5)"
                            : "0 0 8px rgba(6, 255, 165, 0.5)",
                        }}
                      />
                    )}
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-[#0a0a0a]" />
    </motion.div>
  );
}
