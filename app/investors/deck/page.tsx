"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { title } from "@/components/primitives";
import { EsportsButton } from "@/components/ui/esports-button";
import { InvestorSubNav } from "@/components/investors/investor-sub-nav";
import { getTierOneLocale } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { getInvestorDeckCopy } from "@/lib/investors/deck-copy";

const CALENDLY_URL = "https://calendly.com/leetgaming-pro/investor-meeting";
const CONTACT_EMAIL = "investors@leetgaming.pro";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

function SlideFrame({
  children,
  gradient,
}: {
  children: React.ReactNode;
  gradient?: string;
}) {
  return (
    <div
      className={`min-h-[calc(100vh-220px)] w-full px-6 py-12 sm:px-10 lg:px-16 ${gradient ?? "bg-white dark:bg-[#0a0a0a]"}`}
    >
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col justify-center">
        {children}
      </div>
    </div>
  );
}

function SlideBadge({ text }: { text: string }) {
  return (
    <Chip className="mb-6 w-fit rounded-none bg-[#FF4654]/10 text-[#FF4654] dark:bg-[#DCFF37]/10 dark:text-[#DCFF37]">
      {text}
    </Chip>
  );
}

export default function InvestorDeckPage() {
  const { locale } = useTranslation();
  const copy = getInvestorDeckCopy(getTierOneLocale(locale));
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPresentation, setIsPresentation] = useState(false);

  const slides = useMemo(
    () => [
      {
        key: "cover",
        render: () => (
          <SlideFrame gradient="bg-gradient-to-br from-[#34445C] to-[#1e2a38]">
            <div className="text-center">
              <div className="mb-5 text-4xl font-bold text-[#F5F0E1] md:text-6xl lg:text-7xl">
                LEET<span className="text-[#DCFF37]">GAMING</span>.PRO
              </div>
              <h1 className="mx-auto max-w-4xl text-2xl font-semibold text-[#F5F0E1] md:text-4xl lg:text-5xl">
                {copy.slides.cover.title}
              </h1>
              <p className="mt-4 text-lg font-semibold tracking-wider text-[#DCFF37] md:text-xl">
                {copy.slides.cover.subtitle}
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {copy.slides.cover.stats.map(
                  (stat: { value: string; label: string }) => (
                    <Card
                      key={stat.label}
                      className="rounded-none border border-white/10 bg-white/5"
                    >
                      <CardBody className="p-6 text-center">
                        <div className="text-3xl font-bold text-[#DCFF37]">
                          {stat.value}
                        </div>
                        <div className="mt-2 text-xs uppercase tracking-[0.2em] text-[#F5F0E1]/70">
                          {stat.label}
                        </div>
                      </CardBody>
                    </Card>
                  ),
                )}
              </div>
            </div>
          </SlideFrame>
        ),
      },
      {
        key: "problem",
        render: () => (
          <SlideFrame>
            <SlideBadge text={copy.slides.problem.badge} />
            <h2
              className={title({
                size: "lg",
                class:
                  "mb-4 text-[#34445C] dark:text-[#F5F0E1] text-3xl lg:text-5xl",
              })}
            >
              {copy.slides.problem.title}
            </h2>
            <p className="mb-10 max-w-3xl text-default-500">
              {copy.slides.problem.body}
            </p>
            <div className="grid gap-5 md:grid-cols-2">
              {copy.slides.problem.items.map(
                (item: { title: string; desc: string }, itemIndex: number) => (
                  <Card
                    key={item.title}
                    className="rounded-none border border-[#FF4654]/10 dark:border-[#DCFF37]/10"
                  >
                    <CardBody className="p-6">
                      <div className="mb-3 flex h-11 w-11 items-center justify-center bg-[#FF4654]/10 dark:bg-[#DCFF37]/10">
                        <Icon
                          icon={
                            [
                              "solar:danger-triangle-bold",
                              "solar:shield-warning-bold",
                              "solar:map-point-wave-bold",
                              "solar:ghost-bold",
                            ][itemIndex]
                          }
                          width={22}
                          className="text-[#FF4654] dark:text-[#DCFF37]"
                        />
                      </div>
                      <h3 className="font-bold text-[#34445C] dark:text-[#F5F0E1]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-default-500">
                        {item.desc}
                      </p>
                    </CardBody>
                  </Card>
                ),
              )}
            </div>
          </SlideFrame>
        ),
      },
      {
        key: "solution",
        render: () => (
          <SlideFrame>
            <SlideBadge text={copy.slides.solution.badge} />
            <h2
              className={title({
                size: "lg",
                class:
                  "mb-4 text-[#34445C] dark:text-[#F5F0E1] text-3xl lg:text-5xl",
              })}
            >
              {copy.slides.solution.title}
            </h2>
            <p className="mb-10 max-w-3xl text-default-500">
              {copy.slides.solution.body}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {copy.slides.solution.items.map(
                (item: { label: string; desc: string }, itemIndex: number) => (
                  <div
                    key={item.label}
                    className="border border-[#FF4654]/10 p-5 text-center dark:border-[#DCFF37]/10"
                  >
                    <Icon
                      icon={
                        [
                          "solar:video-frame-play-horizontal-bold",
                          "solar:users-group-rounded-bold",
                          "solar:shield-check-bold",
                          "solar:wallet-money-bold",
                        ][itemIndex]
                      }
                      width={24}
                      className="mx-auto text-[#FF4654] dark:text-[#DCFF37]"
                    />
                    <h3 className="mt-4 font-bold text-[#34445C] dark:text-[#F5F0E1]">
                      {item.label}
                    </h3>
                    <p className="mt-2 text-sm text-default-500">{item.desc}</p>
                  </div>
                ),
              )}
            </div>
          </SlideFrame>
        ),
      },
      {
        key: "moat",
        render: () => (
          <SlideFrame gradient="bg-gradient-to-br from-[#34445C]/5 to-[#FF4654]/5 dark:from-[#DCFF37]/5 dark:to-[#34445C]/10">
            <SlideBadge text={copy.slides.moat.badge} />
            <h2
              className={title({
                size: "lg",
                class:
                  "mb-4 text-[#34445C] dark:text-[#F5F0E1] text-3xl lg:text-5xl",
              })}
            >
              {copy.slides.moat.title}
            </h2>
            <p className="mb-10 max-w-4xl text-default-500">
              {copy.slides.moat.body}
            </p>
            <div className="grid gap-5 md:grid-cols-3">
              {copy.slides.moat.items.map(
                (item: { title: string; desc: string }, itemIndex: number) => (
                  <Card
                    key={item.title}
                    className="rounded-none border border-[#FF4654]/10 dark:border-[#DCFF37]/10"
                  >
                    <CardBody className="p-6">
                      <Icon
                        icon={
                          [
                            "solar:database-bold",
                            "solar:shield-check-bold",
                            "solar:wallet-money-bold",
                          ][itemIndex]
                        }
                        width={24}
                        className="text-[#FF4654] dark:text-[#DCFF37]"
                      />
                      <h3 className="mt-4 font-bold text-[#34445C] dark:text-[#F5F0E1]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-default-500">
                        {item.desc}
                      </p>
                    </CardBody>
                  </Card>
                ),
              )}
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {copy.slides.moat.stats.map(
                (stat: { value: string; label: string }) => (
                  <Card
                    key={stat.label}
                    className="rounded-none border border-[#FF4654]/20 bg-[#FF4654]/5 dark:border-[#DCFF37]/20 dark:bg-[#DCFF37]/5"
                  >
                    <CardBody className="p-5 text-center">
                      <div className="text-3xl font-bold text-[#FF4654] dark:text-[#DCFF37]">
                        {stat.value}
                      </div>
                      <div className="mt-2 text-xs uppercase tracking-[0.2em] text-default-500">
                        {stat.label}
                      </div>
                    </CardBody>
                  </Card>
                ),
              )}
            </div>
          </SlideFrame>
        ),
      },
      {
        key: "leverage",
        render: () => (
          <SlideFrame>
            <SlideBadge text={copy.slides.leverage.badge} />
            <h2
              className={title({
                size: "lg",
                class:
                  "mb-4 text-[#34445C] dark:text-[#F5F0E1] text-3xl lg:text-5xl",
              })}
            >
              {copy.slides.leverage.title}
            </h2>
            <p className="mb-10 max-w-4xl text-default-500">
              {copy.slides.leverage.body}
            </p>
            <div className="grid gap-5 md:grid-cols-3">
              {copy.slides.leverage.items.map(
                (item: { title: string; desc: string }, itemIndex: number) => (
                  <Card
                    key={item.title}
                    className="rounded-none border border-[#FF4654]/10 dark:border-[#DCFF37]/10"
                  >
                    <CardBody className="p-6">
                      <Icon
                        icon={
                          [
                            "solar:gamepad-bold",
                            "solar:chart-square-bold",
                            "solar:server-square-cloud-bold",
                          ][itemIndex]
                        }
                        width={24}
                        className="text-[#FF4654] dark:text-[#DCFF37]"
                      />
                      <h3 className="mt-4 font-bold text-[#34445C] dark:text-[#F5F0E1]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-default-500">
                        {item.desc}
                      </p>
                    </CardBody>
                  </Card>
                ),
              )}
            </div>
            <div className="mt-8 border border-[#FF4654]/20 bg-[#FF4654]/5 p-6 dark:border-[#DCFF37]/20 dark:bg-[#DCFF37]/5">
              <div className="text-sm font-semibold uppercase tracking-wider text-[#FF4654] dark:text-[#DCFF37]">
                {copy.slides.leverage.takeawayLabel}
              </div>
              <div className="mt-2 text-lg font-bold text-[#34445C] dark:text-[#F5F0E1]">
                {copy.slides.leverage.takeaway}
              </div>
            </div>
          </SlideFrame>
        ),
      },
      {
        key: "market",
        render: () => (
          <SlideFrame>
            <SlideBadge text={copy.slides.market.badge} />
            <h2
              className={title({
                size: "lg",
                class:
                  "mb-4 text-[#34445C] dark:text-[#F5F0E1] text-3xl lg:text-5xl",
              })}
            >
              <span className="text-[#FF4654] dark:text-[#DCFF37]">
                {copy.slides.market.titlePrefix}
              </span>{" "}
              {copy.slides.market.titleSuffix}
            </h2>
            <p className="mb-10 text-default-500">{copy.slides.market.body}</p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {copy.slides.market.segments.map(
                (segment: { label: string; value: string; growth: string }) => (
                  <Card
                    key={segment.label}
                    className="rounded-none border border-[#FF4654]/10 dark:border-[#DCFF37]/10"
                  >
                    <CardBody className="p-5 text-center">
                      <div className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                        {segment.label}
                      </div>
                      <div className="mt-3 text-2xl font-bold text-[#FF4654] dark:text-[#DCFF37]">
                        {segment.value}
                      </div>
                      <div className="mt-2 text-xs text-default-500">
                        {segment.growth}
                      </div>
                    </CardBody>
                  </Card>
                ),
              )}
            </div>
          </SlideFrame>
        ),
      },
      {
        key: "revenue",
        render: () => (
          <SlideFrame>
            <SlideBadge text={copy.slides.revenue.badge} />
            <h2
              className={title({
                size: "lg",
                class:
                  "mb-8 text-[#34445C] dark:text-[#F5F0E1] text-3xl lg:text-5xl",
              })}
            >
              {copy.slides.revenue.title}
            </h2>
            <div className="mb-6 grid gap-4 sm:grid-cols-4">
              {copy.slides.revenue.split.map((part: string) => (
                <div
                  key={part}
                  className="border border-[#FF4654]/20 bg-[#FF4654]/5 p-4 text-center text-sm font-semibold text-[#34445C] dark:border-[#DCFF37]/20 dark:bg-[#DCFF37]/5 dark:text-[#F5F0E1]"
                >
                  {part}
                </div>
              ))}
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {copy.slides.revenue.streams.map(
                (stream: { title: string; desc: string }) => (
                  <Card
                    key={stream.title}
                    className="rounded-none border border-[#FF4654]/10 dark:border-[#DCFF37]/10"
                  >
                    <CardBody className="p-6">
                      <h3 className="font-bold text-[#34445C] dark:text-[#F5F0E1]">
                        {stream.title}
                      </h3>
                      <p className="mt-2 text-sm text-default-500">
                        {stream.desc}
                      </p>
                    </CardBody>
                  </Card>
                ),
              )}
            </div>
            <div className="mt-8 border border-[#FF4654]/20 bg-[#FF4654]/5 p-6 dark:border-[#DCFF37]/20 dark:bg-[#DCFF37]/5">
              <div className="text-sm font-semibold uppercase tracking-wider text-[#FF4654] dark:text-[#DCFF37]">
                {copy.slides.revenue.expansionLabel}
              </div>
              <div className="mt-2 text-sm text-default-600 dark:text-default-300">
                {copy.slides.revenue.expansionBody}
              </div>
            </div>
          </SlideFrame>
        ),
      },
      {
        key: "competitive",
        render: () => (
          <SlideFrame>
            <SlideBadge text={copy.slides.competitive.badge} />
            <h2
              className={title({
                size: "lg",
                class:
                  "mb-4 text-[#34445C] dark:text-[#F5F0E1] text-3xl lg:text-5xl",
              })}
            >
              {copy.slides.competitive.title}
            </h2>
            <p className="mb-10 max-w-4xl text-default-500">
              {copy.slides.competitive.body}
            </p>
            <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <CardBody className="p-0">
                <div className="grid grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] bg-[#34445C] text-[#F5F0E1]">
                  <div className="px-4 py-3 text-sm font-bold">
                    {copy.slides.competitive.featureLabel}
                  </div>
                  {["LeetGaming.PRO", "FACEIT", "Leetify", "ESEA"].map(
                    (name, colIndex) => (
                      <div
                        key={name}
                        className={`px-4 py-3 text-center text-sm font-bold ${colIndex === 0 ? "text-[#DCFF37]" : ""}`}
                      >
                        {name}
                      </div>
                    ),
                  )}
                </div>
                {copy.slides.competitive.features.map(
                  (feature: string, rowIndex: number) => (
                    <div
                      key={feature}
                      className={`grid grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] border-t border-default-100 dark:border-default-50/10 ${rowIndex % 2 === 0 ? "bg-default-50/50 dark:bg-default-50/5" : ""}`}
                    >
                      <div className="px-4 py-3 text-sm text-[#34445C] dark:text-[#F5F0E1]">
                        {feature}
                      </div>
                      {[
                        [true, true, true, true, true, true],
                        [false, true, true, true, false, false],
                        [true, false, false, false, true, false],
                        [false, true, true, false, false, false],
                      ].map((matrix, colIndex) => (
                        <div
                          key={`${feature}-${colIndex}`}
                          className="flex items-center justify-center px-4 py-3"
                        >
                          <Icon
                            icon={
                              matrix[rowIndex]
                                ? "solar:check-circle-bold"
                                : "solar:close-circle-linear"
                            }
                            width={20}
                            className={
                              matrix[rowIndex]
                                ? colIndex === 0
                                  ? "text-[#FF4654] dark:text-[#DCFF37]"
                                  : "text-emerald-500"
                                : "text-default-300"
                            }
                          />
                        </div>
                      ))}
                    </div>
                  ),
                )}
              </CardBody>
            </Card>
          </SlideFrame>
        ),
      },
      {
        key: "traction",
        render: () => (
          <SlideFrame>
            <SlideBadge text={copy.slides.traction.badge} />
            <h2
              className={title({
                size: "lg",
                class:
                  "mb-4 text-[#34445C] dark:text-[#F5F0E1] text-3xl lg:text-5xl",
              })}
            >
              {copy.slides.traction.title}
            </h2>
            <p className="mb-10 max-w-4xl text-default-500">
              {copy.slides.traction.body}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {copy.slides.traction.items.map(
                (item: { label: string; pct: number }) => (
                  <Card
                    key={item.label}
                    className="rounded-none border border-[#FF4654]/10 dark:border-[#DCFF37]/10"
                  >
                    <CardBody className="p-5">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                          {item.label}
                        </span>
                        <span className="text-sm font-bold text-[#FF4654] dark:text-[#DCFF37]">
                          {item.pct}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden bg-default-100 dark:bg-default-50/10">
                        <div
                          className="h-full bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#FFC700]"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </CardBody>
                  </Card>
                ),
              )}
            </div>
          </SlideFrame>
        ),
      },
      {
        key: "financials",
        render: () => (
          <SlideFrame>
            <SlideBadge text={copy.slides.financials.badge} />
            <h2
              className={title({
                size: "lg",
                class:
                  "mb-8 text-[#34445C] dark:text-[#F5F0E1] text-3xl lg:text-5xl",
              })}
            >
              {copy.slides.financials.title}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {copy.slides.financials.scenarios.map(
                (scenario: { scenario: string; mrr: string }) => (
                  <Card
                    key={scenario.scenario}
                    className="rounded-none border border-[#FF4654]/10 dark:border-[#DCFF37]/10"
                  >
                    <CardBody className="p-6 text-center">
                      <div className="text-sm uppercase tracking-wider text-default-500">
                        {scenario.scenario}
                      </div>
                      <div className="mt-3 text-3xl font-bold text-[#FF4654] dark:text-[#DCFF37]">
                        {scenario.mrr}
                      </div>
                      <div className="mt-2 text-xs text-default-500">
                        {copy.slides.financials.mrrTarget}
                      </div>
                    </CardBody>
                  </Card>
                ),
              )}
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {copy.slides.financials.stats.map(
                (stat: { value: string; label: string }) => (
                  <div
                    key={stat.label}
                    className="border border-default-200 p-5 text-center dark:border-default-100/10"
                  >
                    <div className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                      {stat.value}
                    </div>
                    <div className="mt-2 text-xs uppercase tracking-[0.2em] text-default-500">
                      {stat.label}
                    </div>
                  </div>
                ),
              )}
            </div>
          </SlideFrame>
        ),
      },
      {
        key: "roadmap",
        render: () => (
          <SlideFrame>
            <SlideBadge text={copy.slides.roadmap.badge} />
            <h2
              className={title({
                size: "lg",
                class:
                  "mb-8 text-[#34445C] dark:text-[#F5F0E1] text-3xl lg:text-5xl",
              })}
            >
              {copy.slides.roadmap.title}
            </h2>
            <div className="space-y-4">
              {copy.slides.roadmap.phases.map(
                (phase: {
                  label: string;
                  title: string;
                  period: string;
                  status: string;
                  items: string;
                }) => (
                  <Card
                    key={phase.label}
                    className="rounded-none border border-[#FF4654]/10 dark:border-[#DCFF37]/10"
                  >
                    <CardBody className="grid gap-4 p-6 md:grid-cols-[120px_1fr] md:items-start">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-[#FF4654] dark:text-[#DCFF37]">
                          {phase.label}
                        </div>
                        <div className="mt-1 text-xs text-default-500">
                          {phase.period}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#FF4654] dark:text-[#DCFF37]">
                          {phase.status}
                        </div>
                        <h3 className="mt-1 font-bold text-[#34445C] dark:text-[#F5F0E1]">
                          {phase.title}
                        </h3>
                        <p className="mt-2 text-sm text-default-500">
                          {phase.items}
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                ),
              )}
            </div>
          </SlideFrame>
        ),
      },
      {
        key: "team",
        render: () => (
          <SlideFrame>
            <SlideBadge text={copy.slides.team.badge} />
            <h2
              className={title({
                size: "lg",
                class:
                  "mb-8 text-[#34445C] dark:text-[#F5F0E1] text-3xl lg:text-5xl",
              })}
            >
              {copy.slides.team.title}
            </h2>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardBody className="p-6">
                  <div className="text-sm uppercase tracking-wider text-default-400">
                    {copy.slides.team.founderRole}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                    Pascal Savelis
                  </div>
                  <p className="mt-4 text-sm text-default-500">
                    {copy.slides.team.founderBody}
                  </p>
                </CardBody>
              </Card>
              <div className="grid gap-4">
                {copy.slides.team.advisorRoles.map((role: string) => (
                  <Card
                    key={role}
                    className="rounded-none border border-[#FF4654]/10 dark:border-[#DCFF37]/10"
                  >
                    <CardBody className="p-5">
                      <div className="font-bold text-[#34445C] dark:text-[#F5F0E1]">
                        {role}
                      </div>
                      <div className="mt-1 text-sm text-default-500">
                        {copy.slides.team.openPosition}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
            <div className="mt-8 border border-[#FF4654]/20 bg-[#FF4654]/5 p-5 text-center text-lg font-bold text-[#34445C] dark:border-[#DCFF37]/20 dark:bg-[#DCFF37]/5 dark:text-[#F5F0E1]">
              {copy.slides.team.growth}
            </div>
          </SlideFrame>
        ),
      },
      {
        key: "timing",
        render: () => (
          <SlideFrame>
            <SlideBadge text={copy.slides.timing.badge} />
            <h2
              className={title({
                size: "lg",
                class:
                  "mb-8 text-[#34445C] dark:text-[#F5F0E1] text-3xl lg:text-5xl",
              })}
            >
              {copy.slides.timing.titlePrefix}{" "}
              <span className="text-[#FF4654] dark:text-[#DCFF37]">
                {copy.slides.timing.titleAccent}
              </span>
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {copy.slides.timing.reasons.map((reason: string) => (
                <Card
                  key={reason}
                  className="rounded-none border border-[#FF4654]/10 dark:border-[#DCFF37]/10"
                >
                  <CardBody className="flex flex-row gap-3 p-5">
                    <Icon
                      icon="solar:check-circle-bold"
                      width={20}
                      className="mt-0.5 text-[#FF4654] dark:text-[#DCFF37]"
                    />
                    <p className="text-sm text-default-600 dark:text-default-300">
                      {reason}
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </SlideFrame>
        ),
      },
      {
        key: "cta",
        render: () => (
          <SlideFrame gradient="bg-gradient-to-br from-[#34445C] to-[#1e2a38]">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[#F5F0E1] lg:text-5xl">
                {copy.slides.cta.title}{" "}
                <span className="text-[#DCFF37]">{copy.slides.cta.accent}</span>
              </h2>
              <p className="mx-auto mt-5 max-w-4xl text-[#F5F0E1]/75">
                {copy.slides.cta.body}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <EsportsButton
                  variant="primary"
                  size="lg"
                  onClick={() =>
                    window.open(CALENDLY_URL, "_blank", "noopener,noreferrer")
                  }
                >
                  {copy.slides.cta.meeting}
                </EsportsButton>
                <EsportsButton
                  as="a"
                  href={`mailto:${CONTACT_EMAIL}`}
                  variant="ghost"
                  size="lg"
                >
                  {CONTACT_EMAIL}
                </EsportsButton>
              </div>
            </div>
          </SlideFrame>
        ),
      },
    ],
    [copy],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        setDirection(1);
        setIndex((current) => Math.min(current + 1, slides.length - 1));
      }
      if (event.key === "ArrowLeft") {
        setDirection(-1);
        setIndex((current) => Math.max(current - 1, 0));
      }
      if (event.key.toLowerCase() === "f") {
        setIsPresentation(true);
      }
      if (event.key === "Escape") {
        setIsPresentation(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [slides.length]);

  const currentSlide = slides[index];

  return (
    <div
      className={`w-full ${isPresentation ? "fixed inset-0 z-50 overflow-auto bg-white dark:bg-[#0a0a0a]" : ""}`}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-12">
        {!isPresentation && <InvestorSubNav />}

        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-default-400">
              {index + 1} / {slides.length}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <EsportsButton
              variant="ghost"
              size="sm"
              onClick={() => setIsPresentation((value) => !value)}
            >
              {isPresentation
                ? copy.nav.exitPresentation
                : copy.nav.enterPresentation}
            </EsportsButton>
            <EsportsButton
              variant="ghost"
              size="sm"
              onClick={() => {
                setDirection(-1);
                setIndex((current) => Math.max(current - 1, 0));
              }}
            >
              {copy.nav.prev}
            </EsportsButton>
            <EsportsButton
              variant="primary"
              size="sm"
              onClick={() => {
                setDirection(1);
                setIndex((current) => Math.min(current + 1, slides.length - 1));
              }}
            >
              {copy.nav.next}
            </EsportsButton>
          </div>
        </div>

        <div className="overflow-hidden border border-[#FF4654]/10 dark:border-[#DCFF37]/10">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentSlide.key}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35 }}
            >
              {currentSlide.render()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.key}
              type="button"
              aria-label={`${copy.nav.goToSlide} ${slideIndex + 1}`}
              onClick={() => {
                setDirection(slideIndex > index ? 1 : -1);
                setIndex(slideIndex);
              }}
              className={`h-2.5 flex-1 min-w-8 ${slideIndex === index ? "bg-[#FF4654] dark:bg-[#DCFF37]" : "bg-default-200 dark:bg-default-50/10"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
