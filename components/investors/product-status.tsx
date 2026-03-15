"use client";

import React from "react";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

const statusData = [
  {
    area: "Infrastructure & DevOps",
    progress: 95,
    status: "live" as const,
    icon: "solar:server-bold",
    details: "Kubernetes, CI/CD, monitoring, multi-region ready",
  },
  {
    area: "Frontend (Next.js)",
    progress: 93,
    status: "live" as const,
    icon: "solar:monitor-bold",
    details: "Competition hub, analytics dashboard, wallet, tournaments",
  },
  {
    area: "Authentication & Billing",
    progress: 90,
    status: "live" as const,
    icon: "solar:shield-keyhole-bold",
    details: "Steam OAuth, Stripe integration, subscription management",
  },
  {
    area: "Backend Services (Go)",
    progress: 85,
    status: "live" as const,
    icon: "solar:code-square-bold",
    details: "Replay API, matchmaking, tournament engine, scoring",
  },
  {
    area: "Wallet & Payments",
    progress: 85,
    status: "live" as const,
    icon: "solar:wallet-money-bold",
    details: "Fiat wallet, Stripe payouts, escrow system operational",
  },
  {
    area: "Payment Integration",
    progress: 80,
    status: "beta" as const,
    icon: "solar:hand-money-bold",
    details: "Stripe live, PayPal & PIX planned, wager settlement",
  },
  {
    area: "Testing & QA",
    progress: 50,
    status: "active" as const,
    icon: "solar:test-tube-bold",
    details: "Unit, integration, E2E (Playwright), load testing planned",
  },
  {
    area: "Blockchain Bridge",
    progress: 30,
    status: "dev" as const,
    icon: "solar:link-circle-bold",
    details: "Polygon/Base smart contracts, NFT achievements, on-chain prizes",
  },
];

const statusConfig = {
  live: {
    label: "Live",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    barColor: "from-emerald-500 to-emerald-400",
  },
  beta: {
    label: "Beta",
    color: "bg-[#FFC700]/10 text-[#FFC700] dark:text-[#FFC700]",
    barColor: "from-[#FFC700] to-[#FF4654]",
  },
  active: {
    label: "Active",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    barColor: "from-blue-500 to-blue-400",
  },
  dev: {
    label: "In Dev",
    color: "bg-[#FF4654]/10 text-[#FF4654] dark:text-[#DCFF37]",
    barColor: "from-[#FF4654] to-[#DCFF37]",
  },
};

export function ProductStatus() {
  const avgProgress = Math.round(
    statusData.reduce((sum, s) => sum + s.progress, 0) / statusData.length
  );

  return (
    <div className="w-full">
      {/* Overall progress header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
            }}
          >
            <Icon
              icon="solar:chart-2-bold"
              className="text-[#F5F0E1] dark:text-[#34445C]"
              width={24}
            />
          </div>
          <div>
            <h4 className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1]">
              Platform Readiness
            </h4>
            <p className="text-sm text-default-500">
              Live progress across all systems
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-3 px-6 py-3 border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-[#FF4654]/5 dark:bg-[#DCFF37]/5"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
          }}
        >
          <span className="text-3xl font-bold text-[#FF4654] dark:text-[#DCFF37]">
            {avgProgress}%
          </span>
          <span className="text-xs text-default-500 uppercase tracking-wider">
            Overall
            <br />
            Complete
          </span>
        </div>
      </motion.div>

      {/* Progress bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statusData.map((item, i) => {
          const config = statusConfig[item.status];
          return (
            <motion.div
              key={item.area}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Card className="rounded-none border border-[#FF4654]/10 dark:border-[#DCFF37]/10 hover:border-[#FF4654]/30 dark:hover:border-[#DCFF37]/30 transition-colors">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon
                        icon={item.icon}
                        className="text-[#FF4654] dark:text-[#DCFF37]"
                        width={18}
                      />
                      <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                        {item.area}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Chip size="sm" className={config.color}>
                        {config.label}
                      </Chip>
                      <span className="text-sm font-bold text-[#FF4654] dark:text-[#DCFF37]">
                        {item.progress}%
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-default-100 dark:bg-default-50/10 overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${config.barColor}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.progress}%` }}
                      viewport={{ once: true }}
                      transition={{
                        delay: i * 0.05 + 0.3,
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                  <p className="text-xs text-default-400 mt-2">
                    {item.details}
                  </p>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
