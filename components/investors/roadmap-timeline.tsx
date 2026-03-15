"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface RoadmapPhase {
  phase: string;
  title: string;
  period: string;
  status: "completed" | "in-progress" | "upcoming";
  items: string[];
  kpis?: string[];
}

const phases: RoadmapPhase[] = [
  {
    phase: "Phase 1",
    title: "Production Stabilization",
    period: "Q4 2025",
    status: "completed",
    items: [
      "Infrastructure & CI/CD pipelines",
      "Authentication (Steam & Google OAuth)",
      "Core API architecture & MongoDB",
      "Monitoring with Prometheus & Grafana",
    ],
    kpis: ["95% Infrastructure completion", "90% Auth completion"],
  },
  {
    phase: "Phase 2",
    title: "Core Feature Completion",
    period: "Q1 2026",
    status: "in-progress",
    items: [
      "Skill-based matchmaking live",
      "Tournament system with brackets",
      "Stripe payment integration",
      "Wallet & escrow system",
    ],
    kpis: ["10,000 registered users", "$50K monthly transaction volume"],
  },
  {
    phase: "Phase 3",
    title: "Blockchain Integration",
    period: "Q1–Q2 2026",
    status: "upcoming",
    items: [
      "On-chain prize pool verification",
      "Transparent prize distribution (Polygon/Base)",
      "Wallet connect & crypto payments",
      "Smart contract audit & deployment",
    ],
    kpis: ["100 prize pools created", "Blockchain verification live"],
  },
  {
    phase: "Phase 4",
    title: "Scale & Expansion",
    period: "Q2–Q3 2026",
    status: "upcoming",
    items: [
      "Multi-region deployment (LATAM, SEA, MENA)",
      "Mobile companion app",
      "Coaching marketplace launch",
      "Multi-game expansion (Valorant, PUBG)",
    ],
    kpis: [
      "500,000 registered users",
      "$2.5M monthly transaction volume",
      "100K Monthly Active Competitors",
    ],
  },
];

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
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-[#FF4654] to-default-300 dark:via-[#DCFF37]" />

      <div className="flex flex-col gap-8 lg:gap-12">
        {phases.map((phase, index) => {
          const config = statusConfig[phase.status];
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
              <div className="border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-white/50 dark:bg-[#0a0a0a]/50 p-6 lg:p-8 rounded-none hover:shadow-xl hover:shadow-[#FF4654]/5 dark:hover:shadow-[#DCFF37]/5 transition-all duration-300"
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
