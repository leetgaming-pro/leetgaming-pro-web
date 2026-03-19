"use client";

import React from "react";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { getTierOneLocale } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { successMetricsCopy } from "@/lib/investors/shared-copy";

const localizedMetrics = {
  "en-US": {
    northStar: {
      metric: "Monthly Active Competitors",
      target: "100K",
      icon: "solar:star-bold",
    },
    kpis: [
      [
        "Monthly Active Users (MAU)",
        "25K",
        "100K",
        "solar:users-group-rounded-bold",
      ],
      ["Paid Subscribers", "2,500", "15K", "solar:crown-bold"],
      [
        "Monthly Recurring Revenue",
        "$25K",
        "$150K",
        "solar:dollar-minimalistic-bold",
      ],
      [
        "Replay Analyses / Month",
        "50K",
        "500K",
        "solar:video-frame-play-horizontal-bold",
      ],
      ["Matches Played / Month", "100K", "1M", "solar:gamepad-bold"],
      ["Tournament GMV", "$50K", "$500K", "solar:cup-star-bold"],
      ["Net Promoter Score", "40+", "55+", "solar:graph-up-bold"],
      ["Monthly Churn Rate", "<8%", "<5%", "solar:chart-bold"],
    ],
  },
  "pt-BR": {
    northStar: {
      metric: "Competidores ativos mensais",
      target: "100 mil",
      icon: "solar:star-bold",
    },
    kpis: [
      [
        "Usuários ativos mensais (MAU)",
        "25 mil",
        "100 mil",
        "solar:users-group-rounded-bold",
      ],
      ["Assinantes pagos", "2.500", "15 mil", "solar:crown-bold"],
      [
        "Receita recorrente mensal",
        "$25 mil",
        "$150 mil",
        "solar:dollar-minimalistic-bold",
      ],
      [
        "Análises de replay / mês",
        "50 mil",
        "500 mil",
        "solar:video-frame-play-horizontal-bold",
      ],
      ["Partidas jogadas / mês", "100 mil", "1 mi", "solar:gamepad-bold"],
      ["GMV de torneios", "$50 mil", "$500 mil", "solar:cup-star-bold"],
      ["Net Promoter Score", "40+", "55+", "solar:graph-up-bold"],
      ["Churn mensal", "<8%", "<5%", "solar:chart-bold"],
    ],
  },
  "es-ES": {
    northStar: {
      metric: "Competidores activos mensuales",
      target: "100K",
      icon: "solar:star-bold",
    },
    kpis: [
      [
        "Usuarios activos mensuales (MAU)",
        "25K",
        "100K",
        "solar:users-group-rounded-bold",
      ],
      ["Suscriptores de pago", "2.500", "15K", "solar:crown-bold"],
      [
        "Ingresos recurrentes mensuales",
        "$25K",
        "$150K",
        "solar:dollar-minimalistic-bold",
      ],
      [
        "Análisis de replay / mes",
        "50K",
        "500K",
        "solar:video-frame-play-horizontal-bold",
      ],
      ["Partidas jugadas / mes", "100K", "1M", "solar:gamepad-bold"],
      ["GMV de torneos", "$50K", "$500K", "solar:cup-star-bold"],
      ["Net Promoter Score", "40+", "55+", "solar:graph-up-bold"],
      ["Churn mensual", "<8%", "<5%", "solar:chart-bold"],
    ],
  },
  "es-LA": {
    northStar: {
      metric: "Competidores activos mensuales",
      target: "100K",
      icon: "solar:star-bold",
    },
    kpis: [
      [
        "Usuarios activos mensuales (MAU)",
        "25K",
        "100K",
        "solar:users-group-rounded-bold",
      ],
      ["Suscriptores pagos", "2,500", "15K", "solar:crown-bold"],
      [
        "Ingresos recurrentes mensuales",
        "$25K",
        "$150K",
        "solar:dollar-minimalistic-bold",
      ],
      [
        "Análisis de replay / mes",
        "50K",
        "500K",
        "solar:video-frame-play-horizontal-bold",
      ],
      ["Partidas jugadas / mes", "100K", "1M", "solar:gamepad-bold"],
      ["GMV de torneos", "$50K", "$500K", "solar:cup-star-bold"],
      ["Net Promoter Score", "40+", "55+", "solar:graph-up-bold"],
      ["Churn mensual", "<8%", "<5%", "solar:chart-bold"],
    ],
  },
  "zh-CN": {
    northStar: {
      metric: "月活竞技玩家",
      target: "100K",
      icon: "solar:star-bold",
    },
    kpis: [
      ["月活用户（MAU）", "25K", "100K", "solar:users-group-rounded-bold"],
      ["付费订阅用户", "2,500", "15K", "solar:crown-bold"],
      ["月度经常性收入", "$25K", "$150K", "solar:dollar-minimalistic-bold"],
      [
        "每月回放分析次数",
        "50K",
        "500K",
        "solar:video-frame-play-horizontal-bold",
      ],
      ["每月比赛场次", "100K", "1M", "solar:gamepad-bold"],
      ["赛事 GMV", "$50K", "$500K", "solar:cup-star-bold"],
      ["净推荐值", "40+", "55+", "solar:graph-up-bold"],
      ["月流失率", "<8%", "<5%", "solar:chart-bold"],
    ],
  },
} as const;

export function SuccessMetrics() {
  const { locale } = useTranslation();
  const tierOneLocale = getTierOneLocale(locale);
  const copy = successMetricsCopy[tierOneLocale];
  const data = localizedMetrics[tierOneLocale];
  const northStar = { ...data.northStar, by: copy.year1 };
  const kpis = data.kpis.map(([metric, month6, month12, icon]) => ({
    metric,
    month6,
    month12,
    icon,
  }));

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
                    {copy.northStar}
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
                  {copy.successMetric}
                </div>
                <div className="px-4 py-3 text-sm font-bold text-[#DCFF37] text-center">
                  {copy.month6}
                </div>
                <div className="px-4 py-3 text-sm font-bold text-[#DCFF37] text-center">
                  {copy.month12}
                </div>
              </div>
              {/* Data rows */}
              {kpis.map((kpi, i) => (
                <div
                  key={kpi.metric}
                  className={`grid grid-cols-[1fr_120px_120px] border-b border-default-100 dark:border-default-50/10 ${
                    i % 2 === 0 ? "bg-default-50/50 dark:bg-default-50/5" : ""
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
                    <span className="text-xs text-default-400">
                      {copy.month6Short}
                    </span>
                    <span className="text-sm font-semibold text-default-600">
                      {kpi.month6}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-default-400">
                      {copy.month12Short}
                    </span>
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
