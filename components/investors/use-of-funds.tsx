"use client";

import React from "react";
import { Card, CardBody } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { getTierOneLocale } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useOfFundsCopy } from "@/lib/investors/shared-copy";

const allocationMeta = [
  { percentage: 40, icon: "solar:code-square-bold", color: "#FF4654" },
  { percentage: 25, icon: "solar:magnet-bold", color: "#FFC700" },
  { percentage: 20, icon: "solar:server-bold", color: "#DCFF37" },
  { percentage: 15, icon: "solar:shield-check-bold", color: "#34445C" },
] as const;

const localizedAllocations = {
  "en-US": [
    [
      "Engineering & Product",
      "Core platform development, replay analysis AI, matchmaking algorithms, mobile app",
    ],
    [
      "Marketing & User Acquisition",
      "Community growth, streamer partnerships, esports org collaborations, content creation",
    ],
    [
      "Operations & Infrastructure",
      "Cloud infrastructure, multi-region deployment, security, customer support",
    ],
    [
      "Legal, Compliance & Reserves",
      "Gaming licenses, regulatory compliance, IP protection, operational reserves",
    ],
  ],
  "pt-BR": [
    [
      "Engenharia e produto",
      "Desenvolvimento do core da plataforma, IA de replay, algoritmos de matchmaking e app móvel",
    ],
    [
      "Marketing e aquisição",
      "Crescimento de comunidade, parcerias com streamers, orgs de esports e conteúdo",
    ],
    [
      "Operações e infraestrutura",
      "Infraestrutura em nuvem, deploy multirregional, segurança e suporte ao cliente",
    ],
    [
      "Jurídico, compliance e reservas",
      "Licenças, conformidade regulatória, proteção de IP e reservas operacionais",
    ],
  ],
  "es-ES": [
    [
      "Ingeniería y producto",
      "Desarrollo del core de la plataforma, IA de replay, algoritmos de matchmaking y app móvil",
    ],
    [
      "Marketing y adquisición",
      "Crecimiento de comunidad, acuerdos con streamers, orgs esports y creación de contenido",
    ],
    [
      "Operaciones e infraestructura",
      "Infraestructura cloud, despliegue multirregión, seguridad y soporte al cliente",
    ],
    [
      "Legal, compliance y reservas",
      "Licencias, cumplimiento regulatorio, protección IP y reservas operativas",
    ],
  ],
  "es-LA": [
    [
      "Ingeniería y producto",
      "Desarrollo del core de la plataforma, IA de replay, algoritmos de matchmaking y app móvil",
    ],
    [
      "Marketing y adquisición",
      "Crecimiento de comunidad, alianzas con streamers, orgs esports y contenido",
    ],
    [
      "Operaciones e infraestructura",
      "Infraestructura cloud, despliegue multirregión, seguridad y soporte al cliente",
    ],
    [
      "Legal, compliance y reservas",
      "Licencias, cumplimiento regulatorio, protección IP y reservas operativas",
    ],
  ],
  "zh-CN": [
    ["工程与产品", "核心平台开发、回放分析 AI、匹配算法与移动应用"],
    ["营销与获客", "社区增长、主播合作、电竞组织合作与内容制作"],
    ["运营与基础设施", "云基础设施、多区域部署、安全与客户支持"],
    ["法务、合规与储备", "游戏牌照、监管合规、IP 保护与运营储备"],
  ],
} as const;

export function UseOfFunds() {
  const { locale } = useTranslation();
  const tierOneLocale = getTierOneLocale(locale);
  const copy = useOfFundsCopy[tierOneLocale];
  const fundAllocations = localizedAllocations[tierOneLocale].map(
    ([label, description], index) => ({
      label,
      description,
      ...allocationMeta[index],
    }),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-gradient-to-br from-[#FF4654]/5 to-[#FFC700]/5 dark:from-[#DCFF37]/5 dark:to-[#34445C]/5">
        <CardBody className="p-6 lg:p-10">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Left: Visual bar chart */}
            <div className="w-full lg:w-2/5">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                  }}
                >
                  <Icon
                    icon="solar:pie-chart-2-bold"
                    className="text-[#F5F0E1] dark:text-[#34445C]"
                    width={24}
                  />
                </div>
                <h4 className="text-xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                  {copy.title}
                </h4>
              </div>

              {/* Stacked horizontal bar */}
              <div
                className="w-full h-8 flex overflow-hidden mb-4"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                {fundAllocations.map((item) => (
                  <motion.div
                    key={item.label}
                    className="h-full flex items-center justify-center"
                    style={{
                      backgroundColor: item.color,
                      width: `${item.percentage}%`,
                    }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    <span className="text-xs font-bold text-white mix-blend-difference">
                      {item.percentage}%
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Breakdown cards */}
            <div className="w-full lg:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fundAllocations.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: item.color + "20" }}
                  >
                    <Icon
                      icon={item.icon}
                      width={16}
                      style={{ color: item.color }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#34445C] dark:text-[#F5F0E1]">
                        {item.label}
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: item.color }}
                      >
                        {item.percentage}%
                      </span>
                    </div>
                    <p className="text-xs text-default-500 leading-relaxed mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
