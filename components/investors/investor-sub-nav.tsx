"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getTierOneLocale } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { investorSubNavCopy } from "@/lib/investors/shared-copy";

const navItems = [
  {
    key: "overview",
    href: "/investors",
    icon: "solar:chart-2-bold",
    exact: true,
  },
  {
    key: "deck",
    href: "/investors/deck",
    icon: "solar:presentation-graph-bold",
    exact: false,
  },
  {
    key: "updates",
    href: "/investors/updates",
    icon: "solar:document-text-bold",
    exact: false,
  },
] as const;

type NavItem = (typeof navItems)[number];

export function InvestorSubNav() {
  const pathname = usePathname();
  const { locale } = useTranslation();
  const copy = investorSubNavCopy[getTierOneLocale(locale)];

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <nav className="w-full max-w-7xl mx-auto mb-8 lg:mb-12">
      <div
        className="flex items-center justify-center gap-1 p-1.5 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-default-50/50 dark:bg-default-50/5"
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex-1 sm:flex-none"
            >
              <div
                className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "text-[#F5F0E1]"
                    : "text-default-500 hover:text-[#FF4654] dark:hover:text-[#DCFF37]"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="investor-nav-active"
                    className="absolute inset-0 bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon icon={item.icon} width={18} />
                  <span className="hidden sm:inline">{copy[item.key]}</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
