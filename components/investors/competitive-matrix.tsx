"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { getTierOneLocale } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { competitiveMatrixCopy } from "@/lib/investors/shared-copy";

interface Competitor {
  name: string;
  features: Record<string, boolean>;
}

const features = [
  { key: "replay", icon: "solar:videocamera-record-bold" },
  { key: "matchmaking", icon: "solar:gamepad-bold" },
  { key: "prizes", icon: "solar:wallet-money-bold" },
  { key: "multigame", icon: "solar:layers-bold" },
  { key: "freemium", icon: "solar:tag-price-bold" },
  { key: "blockchain", icon: "solar:shield-check-bold" },
] as const;

const competitors: Competitor[] = [
  {
    name: "LeetGaming.PRO",
    features: {
      replay: true,
      matchmaking: true,
      prizes: true,
      multigame: true,
      freemium: true,
      blockchain: true,
    },
  },
  {
    name: "FACEIT",
    features: {
      replay: false,
      matchmaking: true,
      prizes: true,
      multigame: true,
      freemium: false,
      blockchain: false,
    },
  },
  {
    name: "Leetify",
    features: {
      replay: true,
      matchmaking: false,
      prizes: false,
      multigame: false,
      freemium: true,
      blockchain: false,
    },
  },
  {
    name: "ESEA",
    features: {
      replay: false,
      matchmaking: true,
      prizes: true,
      multigame: false,
      freemium: false,
      blockchain: false,
    },
  },
  {
    name: "Scope.gg",
    features: {
      replay: true,
      matchmaking: false,
      prizes: false,
      multigame: false,
      freemium: true,
      blockchain: false,
    },
  },
  {
    name: "Challengermode",
    features: {
      replay: false,
      matchmaking: false,
      prizes: true,
      multigame: true,
      freemium: false,
      blockchain: false,
    },
  },
];

export function CompetitiveMatrix() {
  const { locale } = useTranslation();
  const copy = competitiveMatrixCopy[getTierOneLocale(locale)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 lg:p-4 text-sm font-semibold text-default-500 uppercase tracking-wider border-b border-default-200 dark:border-default-100/10">
                {copy.feature}
              </th>
              {competitors.map((comp, i) => (
                <th
                  key={comp.name}
                  className={`p-3 lg:p-4 text-center text-sm font-semibold uppercase tracking-wider border-b ${
                    i === 0
                      ? "text-[#FF4654] dark:text-[#DCFF37] border-[#FF4654]/30 dark:border-[#DCFF37]/30 bg-[#FF4654]/5 dark:bg-[#DCFF37]/5"
                      : "text-default-500 border-default-200 dark:border-default-100/10"
                  }`}
                >
                  {comp.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr
                key={feature.key}
                className="border-b border-default-100 dark:border-default-100/5 hover:bg-default-50 dark:hover:bg-default-50/5 transition-colors"
              >
                <td className="p-3 lg:p-4">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon={feature.icon}
                      className="text-default-400"
                      width={18}
                    />
                    <span className="text-sm font-medium text-[#34445C] dark:text-[#F5F0E1]">
                      {copy.features[index]}
                    </span>
                  </div>
                </td>
                {competitors.map((comp, i) => (
                  <td
                    key={comp.name}
                    className={`p-3 lg:p-4 text-center ${
                      i === 0 ? "bg-[#FF4654]/5 dark:bg-[#DCFF37]/5" : ""
                    }`}
                  >
                    {comp.features[feature.key] ? (
                      <Icon
                        icon="solar:check-circle-bold"
                        className={
                          i === 0
                            ? "text-[#FF4654] dark:text-[#DCFF37] mx-auto"
                            : "text-emerald-500 mx-auto"
                        }
                        width={22}
                      />
                    ) : (
                      <Icon
                        icon="solar:close-circle-linear"
                        className="text-default-300 mx-auto"
                        width={22}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-4">
        {competitors.map((comp, i) => {
          const checkedCount = Object.values(comp.features).filter(
            Boolean,
          ).length;
          return (
            <div
              key={comp.name}
              className={`p-4 border rounded-none ${
                i === 0
                  ? "border-[#FF4654]/40 dark:border-[#DCFF37]/40 bg-[#FF4654]/5 dark:bg-[#DCFF37]/5"
                  : "border-default-200 dark:border-default-100/10"
              }`}
              style={
                i === 0
                  ? {
                      clipPath:
                        "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                    }
                  : undefined
              }
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`font-bold text-base ${
                    i === 0
                      ? "text-[#FF4654] dark:text-[#DCFF37]"
                      : "text-[#34445C] dark:text-[#F5F0E1]"
                  }`}
                >
                  {comp.name}
                </span>
                <span className="text-xs text-default-400">
                  {checkedCount}/{features.length} {copy.featureCountSuffix}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {features.map((feature, index) => (
                  <div key={feature.key} className="flex items-center gap-1.5">
                    <Icon
                      icon={
                        comp.features[feature.key]
                          ? "solar:check-circle-bold"
                          : "solar:close-circle-linear"
                      }
                      className={
                        comp.features[feature.key]
                          ? i === 0
                            ? "text-[#FF4654] dark:text-[#DCFF37]"
                            : "text-emerald-500"
                          : "text-default-300"
                      }
                      width={16}
                    />
                    <span className="text-xs text-default-600">
                      {copy.features[index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
