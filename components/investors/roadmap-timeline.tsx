"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { getTierOneLocale } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { roadmapTimelineCopy } from "@/lib/investors/shared-copy";

const statusConfig = {
  completed: {
    icon: "solar:check-circle-bold",
    color: "text-emerald-500",
    borderColor: "border-emerald-500",
    bgColor: "bg-emerald-500",
    label: "Completed",
  },
  "in-progress": {
    icon: "solar:refresh-circle-bold",
    color: "text-[#FF4654] dark:text-[#DCFF37]",
    borderColor: "border-[#FF4654] dark:border-[#DCFF37]",
    bgColor: "bg-[#FF4654] dark:bg-[#DCFF37]",
    label: "In Progress",
  },
  upcoming: {
    icon: "solar:clock-circle-bold",
    color: "text-default-400",
    borderColor: "border-default-300",
    bgColor: "bg-default-300",
    label: "Upcoming",
  },
};

export function RoadmapTimeline() {
  const { locale } = useTranslation();
  const copy = roadmapTimelineCopy[getTierOneLocale(locale)];
  const phases = copy.phases.map((phase, index) => ({
    ...phase,
    status: (index === 0
      ? "completed"
      : index === 1
        ? "in-progress"
        : "upcoming") as "completed" | "in-progress" | "upcoming",
  }));
  const localizedStatusConfig = {
    completed: { ...statusConfig.completed, label: copy.completed },
    "in-progress": { ...statusConfig["in-progress"], label: copy.inProgress },
    upcoming: { ...statusConfig.upcoming, label: copy.upcoming },
  };

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-[#FF4654] to-default-300 dark:via-[#DCFF37]" />

      <div className="flex flex-col gap-8 lg:gap-12">
        {phases.map((phase, index) => {
          const config = localizedStatusConfig[phase.status];
          return (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="relative pl-16 md:pl-20"
            >
              {/* Timeline dot */}
              <div
                className={`absolute left-4 md:left-6 w-4 h-4 md:w-5 md:h-5 rounded-full ${config.bgColor} border-2 border-white dark:border-[#0a0a0a] z-10`}
                style={{ top: "6px" }}
              />

              {/* Phase card */}
              <div
                className="border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-white/50 dark:bg-[#0a0a0a]/50 p-6 lg:p-8 rounded-none hover:shadow-xl hover:shadow-[#FF4654]/5 dark:hover:shadow-[#DCFF37]/5 transition-all duration-300"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon={config.icon}
                      className={config.color}
                      width={22}
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-default-400">
                      {phase.phase}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-default-500 bg-default-100 dark:bg-default-50/10 px-2 py-0.5 w-fit">
                    {phase.period}
                  </span>
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}
                  >
                    {config.label}
                  </span>
                </div>

                <h3 className="text-xl lg:text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1] mb-4">
                  {phase.title}
                </h3>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {phase.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-default-600"
                    >
                      <Icon
                        icon="solar:arrow-right-bold"
                        className="text-[#FF4654] dark:text-[#DCFF37] mt-0.5 flex-shrink-0"
                        width={14}
                      />
                      {item}
                    </li>
                  ))}
                </ul>

                {phase.kpis && (
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-default-200 dark:border-default-100/10">
                    {phase.kpis.map((kpi, i) => (
                      <span
                        key={i}
                        className="text-xs font-medium px-2 py-1 bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 text-[#FF4654] dark:text-[#DCFF37]"
                      >
                        {kpi}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
