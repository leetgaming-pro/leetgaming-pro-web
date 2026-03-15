"use client";

import React from "react";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface KPIRow {
  metric: string;
  month6: string;
  month12: string;
  icon: string;
}

const northStar = {
  metric: "Monthly Active Competitors",
  target: "100K",
  by: "Year 1",
  icon: "solar:star-bold",
};

const kpis: KPIRow[] = [
  {
    metric: "Monthly Active Users (MAU)",
    month6: "25K",
    month12: "100K",
    icon: "solar:users-group-rounded-bold",
  },
  {
    metric: "Paid Subscribers",
    month6: "2,500",
    month12: "15K",
    icon: "solar:crown-bold",
  },
  {
    metric: "Monthly Recurring Revenue",
    month6: "$25K",
    month12: "$150K",
    icon: "solar:dollar-minimalistic-bold",
  },
  {
    metric: "Replay Analyses / Month",
    month6: "50K",
    month12: "500K",
    icon: "solar:video-frame-play-horizontal-bold",
  },
  {
    metric: "Matches Played / Month",
    month6: "100K",
    month12: "1M",
    icon: "solar:gamepad-bold",
  },
  {
    metric: "Tournament GMV",
    month6: "$50K",
    month12: "$500K",
    icon: "solar:cup-star-bold",
  },
  {
    metric: "Net Promoter Score",
    month6: "40+",
    month12: "55+",
    icon: "solar:graph-up-bold",
  },
  {
    metric: "Monthly Churn Rate",
    month6: "<8%",
    month12: "<5%",
    icon: "solar:chart-bold",
  },
];

export function SuccessMetrics() {
  return (
    <div className="w-full">
      {/* North Star */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-8 lg:mb-10"
      >
        <Card className="rounded-none border-2 border-[#FF4654]/30 dark:border-[#DCFF37]/30 bg-gradient-to-br from-[#FF4654]/5 to-[#FFC700]/5 dark:from-[#DCFF37]/5 dark:to-[#34445C]/10">
          <CardBody className="p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div
                className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
                }}
              >
                <Icon
                  icon={northStar.icon}
                  className="text-[#F5F0E1] dark:text-[#34445C]"
                  width={32}
                />
              </div>
              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <Chip
                    size="sm"
                    variant="flat"
                    className="bg-[#FFC700]/20 text-[#FFC700] font-bold w-fit mx-auto sm:mx-0"
                  >
                    NORTH STAR
                  </Chip>
                  <span className="text-xs text-default-500 uppercase tracking-wider">
                    {northStar.by}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1] mb-1">
                  {northStar.metric}
                </h4>
              </div>
              <div className="text-center sm:text-right">
                <span className="text-4xl lg:text-5xl font-bold text-[#FF4654] dark:text-[#DCFF37]">
                  {northStar.target}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* KPI Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        {/* Desktop table */}
        <div className="hidden md:block">
          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 overflow-hidden">
            <CardBody className="p-0">
              {/* Header row */}
              <div className="grid grid-cols-[1fr_120px_120px] bg-[#34445C] dark:bg-[#1e2a38]">
                <div className="px-6 py-3 text-sm font-bold text-[#F5F0E1]">
                  Success Metric
                </div>
                <div className="px-4 py-3 text-sm font-bold text-[#DCFF37] text-center">
                  Month 6
                </div>
                <div className="px-4 py-3 text-sm font-bold text-[#DCFF37] text-center">
                  Month 12
                </div>
              </div>
              {/* Data rows */}
              {kpis.map((kpi, i) => (
                <div
                  key={kpi.metric}
                  className={`grid grid-cols-[1fr_120px_120px] border-b border-default-100 dark:border-default-50/10 ${
                    i % 2 === 0
                      ? "bg-default-50/50 dark:bg-default-50/5"
                      : ""
                  }`}
                >
                  <div className="px-6 py-3 flex items-center gap-2">
                    <Icon
                      icon={kpi.icon}
                      className="text-[#FF4654] dark:text-[#DCFF37] flex-shrink-0"
                      width={16}
                    />
                    <span className="text-sm text-[#34445C] dark:text-[#F5F0E1] font-medium">
                      {kpi.metric}
                    </span>
                  </div>
                  <div className="px-4 py-3 text-sm font-semibold text-center text-default-600">
                    {kpi.month6}
                  </div>
                  <div className="px-4 py-3 text-sm font-bold text-center text-[#FF4654] dark:text-[#DCFF37]">
                    {kpi.month12}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.metric}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Card className="rounded-none border border-[#FF4654]/10 dark:border-[#DCFF37]/10 h-full">
                <CardBody className="p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon
                      icon={kpi.icon}
                      className="text-[#FF4654] dark:text-[#DCFF37]"
                      width={14}
                    />
                    <span className="text-xs font-medium text-[#34445C] dark:text-[#F5F0E1] leading-tight">
                      {kpi.metric}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-default-400">6mo:</span>
                    <span className="text-sm font-semibold text-default-600">
                      {kpi.month6}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-default-400">12mo:</span>
                    <span className="text-sm font-bold text-[#FF4654] dark:text-[#DCFF37]">
                      {kpi.month12}
                    </span>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
