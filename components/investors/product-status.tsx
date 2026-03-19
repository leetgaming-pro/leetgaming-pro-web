"use client";

import React from "react";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { getTierOneLocale } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { productStatusCopy } from "@/lib/investors/shared-copy";

const statusIcons = [
  "solar:server-bold",
  "solar:monitor-bold",
  "solar:shield-keyhole-bold",
  "solar:code-square-bold",
  "solar:wallet-money-bold",
  "solar:hand-money-bold",
  "solar:test-tube-bold",
  "solar:link-circle-bold",
] as const;

const statusProgress = [95, 93, 90, 85, 85, 80, 50, 30] as const;

const localizedStatusData = {
  "en-US": [
    [
      "Infrastructure & DevOps",
      "Kubernetes, CI/CD, monitoring, multi-region ready",
    ],
    [
      "Frontend (Next.js)",
      "Competition hub, analytics dashboard, wallet, tournaments",
    ],
    [
      "Authentication & Billing",
      "Steam OAuth, Stripe integration, subscription management",
    ],
    [
      "Backend Services (Go)",
      "Replay API, matchmaking, tournament engine, scoring",
    ],
    [
      "Wallet & Payments",
      "Fiat wallet, Stripe payouts, escrow system operational",
    ],
    [
      "Payment Integration",
      "Stripe live, PayPal & PIX planned, wager settlement",
    ],
    [
      "Testing & QA",
      "Unit, integration, E2E (Playwright), load testing planned",
    ],
    [
      "Blockchain Bridge",
      "Polygon/Base smart contracts, NFT achievements, on-chain prizes",
    ],
  ],
  "pt-BR": [
    [
      "Infraestrutura e DevOps",
      "Kubernetes, CI/CD, monitoramento e pronto para múltiplas regiões",
    ],
    [
      "Frontend (Next.js)",
      "Competition hub, dashboard de analytics, carteira e torneios",
    ],
    [
      "Autenticação e billing",
      "Steam OAuth, integração com Stripe e gestão de assinaturas",
    ],
    [
      "Serviços backend (Go)",
      "Replay API, matchmaking, motor de torneios e scoring",
    ],
    [
      "Carteira e pagamentos",
      "Carteira fiat, payouts via Stripe e sistema de escrow operacional",
    ],
    [
      "Integração de pagamentos",
      "Stripe ao vivo, PayPal e PIX planejados, liquidação de wagers",
    ],
    [
      "Testes e QA",
      "Unit, integration, E2E (Playwright) e load testing planejados",
    ],
    [
      "Bridge blockchain",
      "Smart contracts em Polygon/Base, conquistas NFT e prêmios on-chain",
    ],
  ],
  "es-ES": [
    [
      "Infraestructura y DevOps",
      "Kubernetes, CI/CD, monitorización y preparado para multirregión",
    ],
    [
      "Frontend (Next.js)",
      "Competition hub, panel de analítica, wallet y torneos",
    ],
    [
      "Autenticación y billing",
      "Steam OAuth, integración con Stripe y gestión de suscripciones",
    ],
    [
      "Servicios backend (Go)",
      "Replay API, matchmaking, motor de torneos y scoring",
    ],
    [
      "Wallet y pagos",
      "Wallet fiat, payouts con Stripe y sistema de escrow operativo",
    ],
    [
      "Integración de pagos",
      "Stripe en vivo, PayPal y PIX planificados, liquidación de wagers",
    ],
    [
      "Testing y QA",
      "Unit, integration, E2E (Playwright) y load testing planificados",
    ],
    [
      "Puente blockchain",
      "Smart contracts en Polygon/Base, logros NFT y premios on-chain",
    ],
  ],
  "es-LA": [
    [
      "Infraestructura y DevOps",
      "Kubernetes, CI/CD, monitoreo y listo para multirregión",
    ],
    [
      "Frontend (Next.js)",
      "Competition hub, dashboard de analítica, wallet y torneos",
    ],
    [
      "Autenticación y billing",
      "Steam OAuth, integración con Stripe y gestión de suscripciones",
    ],
    [
      "Servicios backend (Go)",
      "Replay API, matchmaking, motor de torneos y scoring",
    ],
    [
      "Wallet y pagos",
      "Wallet fiat, payouts con Stripe y sistema de escrow operativo",
    ],
    [
      "Integración de pagos",
      "Stripe en vivo, PayPal y PIX planificados, liquidación de wagers",
    ],
    [
      "Testing y QA",
      "Unit, integration, E2E (Playwright) y load testing planificados",
    ],
    [
      "Puente blockchain",
      "Smart contracts en Polygon/Base, logros NFT y premios on-chain",
    ],
  ],
  "zh-CN": [
    ["基础设施与 DevOps", "Kubernetes、CI/CD、监控，多区域就绪"],
    ["前端（Next.js）", "赛事中心、分析面板、钱包与赛事功能"],
    ["认证与计费", "Steam OAuth、Stripe 集成与订阅管理"],
    ["后端服务（Go）", "Replay API、匹配、赛事引擎与评分"],
    ["钱包与支付", "法币钱包、Stripe 打款与托管系统已运行"],
    ["支付集成", "Stripe 已上线，计划接入 PayPal 与 PIX，支持 wager 结算"],
    ["测试与 QA", "单元、集成、E2E（Playwright）及负载测试规划中"],
    ["区块链桥接层", "Polygon/Base 智能合约、NFT 成就与链上奖金"],
  ],
} as const;

export function ProductStatus() {
  const { locale } = useTranslation();
  const tierOneLocale = getTierOneLocale(locale);
  const copy = productStatusCopy[tierOneLocale];
  const statusData = localizedStatusData[tierOneLocale].map(
    ([area, details], index) => ({
      area,
      details,
      progress: statusProgress[index],
      icon: statusIcons[index],
      status: (
        [
          "live",
          "live",
          "live",
          "live",
          "live",
          "beta",
          "active",
          "dev",
        ] as const
      )[index],
    }),
  );

  const avgProgress = Math.round(
    statusData.reduce((sum, s) => sum + s.progress, 0) / statusData.length,
  );

  const statusConfig = {
    live: {
      label: copy.statuses.live,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      barColor: "from-emerald-500 to-emerald-400",
    },
    beta: {
      label: copy.statuses.beta,
      color: "bg-[#FFC700]/10 text-[#FFC700] dark:text-[#FFC700]",
      barColor: "from-[#FFC700] to-[#FF4654]",
    },
    active: {
      label: copy.statuses.active,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      barColor: "from-blue-500 to-blue-400",
    },
    dev: {
      label: copy.statuses.dev,
      color: "bg-[#FF4654]/10 text-[#FF4654] dark:text-[#DCFF37]",
      barColor: "from-[#FF4654] to-[#DCFF37]",
    },
  };

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
              {copy.platformReadiness}
            </h4>
            <p className="text-sm text-default-500">{copy.liveProgress}</p>
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
            {copy.overall}
            <br />
            {copy.complete}
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
