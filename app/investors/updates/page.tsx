"use client";

import React from "react";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { title, subtitle } from "@/components/primitives";
import { EsportsButton } from "@/components/ui/esports-button";
import { InvestorSubNav } from "@/components/investors/investor-sub-nav";

/* ──────────────────────────────────────────────────────────────────
 *  Placeholder investor updates
 *  Replace with real Strapi/CMS data when available
 * ────────────────────────────────────────────────────────────────── */
interface InvestorUpdate {
  id: string;
  date: string;
  title: string;
  summary: string;
  category: "milestone" | "product" | "funding" | "partnership";
  highlights: string[];
}

const categoryConfig = {
  milestone: {
    label: "Milestone",
    icon: "solar:flag-bold",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  product: {
    label: "Product Update",
    icon: "solar:code-square-bold",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  funding: {
    label: "Funding",
    icon: "solar:dollar-minimalistic-bold",
    color: "bg-[#FFC700]/10 text-[#FFC700]",
  },
  partnership: {
    label: "Partnership",
    icon: "solar:handshake-bold",
    color: "bg-[#FF4654]/10 text-[#FF4654] dark:text-[#DCFF37]",
  },
};

const updates: InvestorUpdate[] = [
  {
    id: "update-6",
    date: "2026-02-15",
    title: "Full Investor Page & Pitch Deck Launched",
    summary:
      "Published comprehensive investor resources including interactive pitch deck, dynamic one-pager PDF generation, success metrics dashboard, and product status tracking.",
    category: "milestone",
    highlights: [
      "7-section investor overview page live at /investors",
      "Interactive 12-slide pitch deck at /investors/deck",
      "Dynamic PDF one-pager with real-time data",
      "Product readiness dashboard with live progress bars",
    ],
  },
  {
    id: "update-5",
    date: "2026-02-01",
    title: "Frontend Feature Completion at 93%",
    summary:
      "Major frontend milestone — competition hub, analytics dashboard, wallet management, and tournament pages all feature-complete. Preparing for public beta.",
    category: "product",
    highlights: [
      "93% frontend feature completion",
      "Wallet system with Stripe integration live",
      "Tournament creation and bracket management UI",
      "Real-time match spectating interface",
    ],
  },
  {
    id: "update-4",
    date: "2026-01-15",
    title: "Phase 2 Development Kickoff",
    summary:
      "Core Feature Completion phase initiated. Tournament system, advanced analytics, and coaching marketplace development underway.",
    category: "milestone",
    highlights: [
      "Tournament engine backend 60% complete",
      "Advanced replay analytics with AI insights",
      "Coaching marketplace design finalized",
      "5 new engineering hires onboarding",
    ],
  },
  {
    id: "update-3",
    date: "2025-12-20",
    title: "Phase 1 Complete — Production Infrastructure",
    summary:
      "Successfully completed Phase 1: Production Stabilization. All core infrastructure, authentication, billing, and replay engine are live and operational.",
    category: "milestone",
    highlights: [
      "Infrastructure 95% complete — K8s, CI/CD, monitoring",
      "Authentication & Billing 90% — Steam OAuth + Stripe",
      "Backend services 85% deployed",
      "Replay analysis engine processing demos",
    ],
  },
  {
    id: "update-2",
    date: "2025-11-01",
    title: "Stripe Payment Integration Live",
    summary:
      "Payment processing fully operational with Stripe. Subscription management, one-time purchases, and escrow system for wager matches all functional.",
    category: "product",
    highlights: [
      "Stripe checkout and billing portal live",
      "Subscription tiers: Free, Pro ($9.99), Team ($29.99)",
      "Escrow wallet for skill-based wagers",
      "Webhook-driven billing event processing",
    ],
  },
  {
    id: "update-1",
    date: "2025-09-15",
    title: "Platform Architecture Finalized",
    summary:
      "Core technical architecture locked — microservices on Go + Next.js, MongoDB, Kafka event streaming, Kubernetes orchestration. Built for scale from day one.",
    category: "product",
    highlights: [
      "Go 1.23 microservices architecture",
      "Next.js 14 with App Router for frontend",
      "Kafka event streaming for real-time processing",
      "Multi-region Kubernetes deployment planned",
    ],
  },
];

/* ──────────────────────────────────────────────────────────────────
 *  Page Component
 * ────────────────────────────────────────────────────────────────── */
export default function InvestorUpdatesPage() {
  return (
    <div className="flex w-full flex-col items-center gap-12 md:gap-16 px-4 py-8 md:py-12 sm:px-6 lg:px-12 xl:px-24 2xl:px-32">
      <InvestorSubNav />

      {/* Header */}
      <motion.div
        className="w-full max-w-4xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] mx-auto mb-6"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
          }}
        >
          <Icon
            icon="solar:document-text-bold"
            className="text-[#F5F0E1] dark:text-[#34445C]"
            width={32}
          />
        </div>
        <h1
          className={title({
            size: "lg",
            class: "text-[#34445C] dark:text-[#F5F0E1] text-3xl md:text-4xl lg:text-5xl",
          })}
        >
          Investor Updates
        </h1>
        <p className={subtitle({ class: "mt-3 max-w-2xl mx-auto" })}>
          Key milestones, product progress, and announcements for our
          investors and stakeholders.
        </p>
      </motion.div>

      {/* Subscribe CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-gradient-to-r from-[#FF4654]/5 to-[#FFC700]/5 dark:from-[#DCFF37]/5 dark:to-[#34445C]/5">
          <CardBody className="p-6 flex flex-col sm:flex-row items-center gap-4">
            <Icon
              icon="solar:bell-bold"
              className="text-[#FF4654] dark:text-[#DCFF37]"
              width={24}
            />
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-sm font-bold text-[#34445C] dark:text-[#F5F0E1]">
                Stay Updated
              </h3>
              <p className="text-xs text-default-500">
                Get quarterly investor updates delivered to your inbox.
              </p>
            </div>
            <EsportsButton
              variant="primary"
              size="sm"
              as="a"
              href="mailto:investors@leetgaming.pro?subject=Subscribe to Investor Updates"
              startContent={<Icon icon="solar:letter-bold" width={16} />}
            >
              Subscribe
            </EsportsButton>
          </CardBody>
        </Card>
      </motion.div>

      {/* Timeline */}
      <div className="w-full max-w-4xl">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#FF4654] via-[#FFC700] to-[#DCFF37] dark:from-[#DCFF37] dark:via-[#FFC700] dark:to-[#FF4654]" />

          {updates.map((update, i) => {
            const cat = categoryConfig[update.category];
            return (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative pl-12 md:pl-20 pb-10 last:pb-0"
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-2 md:left-6 w-5 h-5 bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] z-10"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)",
                  }}
                />

                <Card className="rounded-none border border-[#FF4654]/10 dark:border-[#DCFF37]/10 hover:border-[#FF4654]/30 dark:hover:border-[#DCFF37]/30 transition-colors">
                  <CardBody className="p-5 lg:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Chip size="sm" className={cat.color}>
                          <span className="flex items-center gap-1">
                            <Icon icon={cat.icon} width={12} />
                            {cat.label}
                          </span>
                        </Chip>
                        <span className="text-xs text-default-400 font-mono">
                          {new Date(update.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1] mb-2">
                      {update.title}
                    </h3>
                    <p className="text-sm text-default-500 leading-relaxed mb-4">
                      {update.summary}
                    </p>

                    {/* Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {update.highlights.map((h, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <Icon
                            icon="solar:check-square-bold"
                            className="text-emerald-500 mt-0.5 flex-shrink-0"
                            width={14}
                          />
                          <span className="text-xs text-default-600">{h}</span>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full max-w-4xl text-center pb-8"
      >
        <p className="text-sm text-default-400 mb-4">
          Questions? Reach out to our investor relations team.
        </p>
        <EsportsButton
          variant="ghost"
          size="md"
          as="a"
          href="mailto:investors@leetgaming.pro"
          startContent={<Icon icon="solar:letter-bold" width={18} />}
        >
          investors@leetgaming.pro
        </EsportsButton>
      </motion.div>
    </div>
  );
}
