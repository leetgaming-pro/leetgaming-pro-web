"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { title, subtitle } from "@/components/primitives";
import { EsportsButton } from "@/components/ui/esports-button";
import { CompetitiveMatrix } from "@/components/investors/competitive-matrix";
import { EmailCaptureModal } from "@/components/investors/email-capture-modal";
import { InvestorSubNav } from "@/components/investors/investor-sub-nav";
import { PdfDownloadButton } from "@/components/investors/pdf-download-button";
import { ProductStatus } from "@/components/investors/product-status";
import { RoadmapTimeline } from "@/components/investors/roadmap-timeline";
import { SuccessMetrics } from "@/components/investors/success-metrics";
import { UseOfFunds } from "@/components/investors/use-of-funds";
import { getTierOneLocale } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { investorOverviewCopy } from "@/lib/investors/overview-copy";

const CALENDLY_URL = "https://calendly.com/leetgaming-pro/investor-meeting";
const CONTACT_EMAIL = "investors@leetgaming.pro";

const marketIcons = [
  "solar:cup-star-bold",
  "solar:chart-2-bold",
  "solar:wallet-money-bold",
  "solar:diploma-verified-bold",
  "solar:medal-ribbons-star-bold",
] as const;

const revenueIcons = [
  "solar:crown-bold",
  "solar:hand-money-bold",
  "solar:cup-star-bold",
  "solar:square-academic-cap-bold",
] as const;

const moatIcons = [
  "solar:shield-check-bold",
  "solar:graph-up-bold",
  "solar:widget-4-bold",
] as const;
const ecosystemIcons = [
  "solar:cup-star-bold",
  "solar:server-square-cloud-bold",
  "solar:scale-bold",
] as const;
const unitIcons = [
  "solar:magnet-bold",
  "solar:graph-up-bold",
  "solar:clock-circle-bold",
  "solar:chart-bold",
] as const;
const advisorIcons = [
  "solar:gamepad-bold",
  "solar:code-square-bold",
  "solar:graph-up-bold",
] as const;

export default function InvestorsPage() {
  const { locale } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const copy = investorOverviewCopy[getTierOneLocale(locale)];

  const marketSegments = useMemo(
    () =>
      copy.marketSegments.map((segment, index) => ({
        ...segment,
        icon: marketIcons[index],
      })),
    [copy],
  );
  const revenueStreams = useMemo(
    () =>
      copy.revenueStreams.map((stream, index) => ({
        ...stream,
        icon: revenueIcons[index],
      })),
    [copy],
  );
  const scoreInfrastructurePillars = useMemo(
    () =>
      copy.scoreInfrastructurePillars.map((pillar, index) => ({
        ...pillar,
        icon: moatIcons[index],
      })),
    [copy],
  );
  const ecosystemExpansionCards = useMemo(
    () =>
      copy.ecosystemExpansionCards.map((card, index) => ({
        ...card,
        icon: ecosystemIcons[index],
      })),
    [copy],
  );
  const unitEconomics = useMemo(
    () =>
      copy.unitEconomics.map((item, index) => ({
        ...item,
        icon: unitIcons[index],
      })),
    [copy],
  );
  const advisorSlots = useMemo(
    () =>
      copy.advisorSlots.map((advisor, index) => ({
        ...advisor,
        icon: advisorIcons[index],
      })),
    [copy],
  );

  return (
    <div className="flex w-full flex-col items-center gap-16 px-4 py-8 md:gap-20 md:py-12 sm:px-6 lg:px-12 xl:px-24 2xl:px-32">
      <InvestorSubNav />

      <section className="w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-center"
        >
          <div className="text-center lg:text-left">
            <div className="mb-5 inline-flex items-center gap-3 border border-[#FF4654]/20 bg-[#FF4654]/5 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-[#FF4654] dark:border-[#DCFF37]/20 dark:bg-[#DCFF37]/5 dark:text-[#DCFF37]">
              <Icon icon="solar:chart-2-bold" width={18} />
              {copy.heroLabel}
            </div>

            <h1
              className={title({
                size: "lg",
                class:
                  "text-[#34445C] dark:text-[#F5F0E1] text-4xl md:text-5xl lg:text-6xl",
              })}
            >
              {copy.heroTitlePrefix}{" "}
              <span
                className={title({
                  size: "lg",
                  color: "battleOrange",
                  class:
                    "text-4xl md:text-5xl lg:text-6xl dark:bg-gradient-to-r dark:from-[#DCFF37] dark:to-[#b8d930]",
                })}
              >
                {copy.heroTitleAccent}
              </span>
            </h1>

            <p
              className={subtitle({
                class: "mt-5 max-w-3xl text-lg leading-relaxed lg:text-xl",
              })}
            >
              {copy.heroDescription}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap lg:justify-start">
              <EsportsButton
                variant="primary"
                size="lg"
                onClick={() =>
                  window.open(CALENDLY_URL, "_blank", "noopener,noreferrer")
                }
              >
                {copy.ctas.meeting}
              </EsportsButton>
              <PdfDownloadButton
                variant="action"
                size="lg"
                onBeforeDownload={() => (setIsModalOpen(true), false)}
              />
              <EsportsButton
                as={Link}
                href="/investors/deck"
                variant="ghost"
                size="lg"
              >
                {copy.ctas.viewDeck}
              </EsportsButton>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {copy.heroStats.map((stat) => (
              <Card
                key={stat.label}
                className="rounded-none border border-[#FF4654]/20 bg-[#FF4654]/5 dark:border-[#DCFF37]/20 dark:bg-[#DCFF37]/5"
              >
                <CardBody className="p-6 text-center lg:text-left">
                  <div className="text-3xl font-bold text-[#FF4654] dark:text-[#DCFF37]">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm uppercase tracking-wider text-default-500">
                    {stat.label}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="w-full max-w-7xl space-y-10">
        <div className="text-center">
          <Chip className="mb-4 rounded-none bg-[#FF4654]/10 text-[#FF4654] dark:bg-[#DCFF37]/10 dark:text-[#DCFF37]">
            {copy.sections.opportunityEyebrow}
          </Chip>
          <h2
            className={title({
              size: "md",
              class: "text-[#34445C] dark:text-[#F5F0E1]",
            })}
          >
            {copy.sections.opportunityTitle}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {marketSegments.map((segment) => (
            <Card
              key={segment.label}
              className="rounded-none border border-[#FF4654]/10 dark:border-[#DCFF37]/10"
            >
              <CardBody className="gap-3 p-5">
                <Icon
                  icon={segment.icon}
                  width={22}
                  className="text-[#FF4654] dark:text-[#DCFF37]"
                />
                <div className="text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                  {segment.label}
                </div>
                <div className="text-2xl font-bold text-[#FF4654] dark:text-[#DCFF37]">
                  {segment.value}
                </div>
                <div className="text-xs text-default-500">{segment.growth}</div>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card className="rounded-none border border-[#FF4654]/20 bg-gradient-to-br from-[#FF4654]/5 to-[#FFC700]/5 dark:border-[#DCFF37]/20 dark:from-[#DCFF37]/5 dark:to-[#34445C]/10">
          <CardBody className="p-6 lg:p-8">
            <div className="mb-4 flex items-center gap-3">
              <Icon
                icon="solar:lightbulb-bold"
                width={24}
                className="text-[#FF4654] dark:text-[#DCFF37]"
              />
              <h3 className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                {copy.sections.whyNowTitle}
              </h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {copy.whyNowReasons.map((reason) => (
                <div
                  key={reason}
                  className="flex items-start gap-3 text-sm text-default-600 dark:text-default-400"
                >
                  <Icon
                    icon="solar:check-circle-bold"
                    width={18}
                    className="mt-0.5 text-[#FF4654] dark:text-[#DCFF37]"
                  />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="w-full max-w-7xl space-y-10">
        <div className="text-center">
          <Chip className="mb-4 rounded-none bg-[#FF4654]/10 text-[#FF4654] dark:bg-[#DCFF37]/10 dark:text-[#DCFF37]">
            {copy.sections.competitiveEyebrow}
          </Chip>
          <h2
            className={title({
              size: "md",
              class: "text-[#34445C] dark:text-[#F5F0E1]",
            })}
          >
            {copy.sections.competitiveTitle}
          </h2>
          <p className={subtitle({ class: "mx-auto mt-4 max-w-3xl" })}>
            {copy.sections.competitiveBody}
          </p>
        </div>
        <CompetitiveMatrix />
      </section>

      <section id="scores" className="w-full max-w-7xl space-y-10">
        <div className="text-center">
          <Chip className="mb-4 rounded-none bg-[#FF4654]/10 text-[#FF4654] dark:bg-[#DCFF37]/10 dark:text-[#DCFF37]">
            {copy.sections.moatEyebrow}
          </Chip>
          <h2
            className={title({
              size: "md",
              class: "text-[#34445C] dark:text-[#F5F0E1]",
            })}
          >
            {copy.sections.moatTitle}
          </h2>
          <p className={subtitle({ class: "mx-auto mt-4 max-w-4xl" })}>
            {copy.sections.moatBody}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {scoreInfrastructurePillars.map((pillar) => (
            <Card
              key={pillar.title}
              className="rounded-none border border-[#FF4654]/10 dark:border-[#DCFF37]/10"
            >
              <CardBody className="gap-4 p-6">
                <Icon
                  icon={pillar.icon}
                  width={24}
                  className="text-[#FF4654] dark:text-[#DCFF37]"
                />
                <div>
                  <h3 className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1]">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm text-default-500">
                    {pillar.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pillar.chips.map((chip) => (
                    <Chip
                      key={chip}
                      size="sm"
                      className="rounded-none bg-default-100 dark:bg-default-50/10 text-default-600 dark:text-default-300"
                    >
                      {chip}
                    </Chip>
                  ))}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {copy.scoreInfrastructureStats.map((stat) => (
            <Card
              key={stat.label}
              className="rounded-none border border-[#FF4654]/20 bg-[#FF4654]/5 dark:border-[#DCFF37]/20 dark:bg-[#DCFF37]/5"
            >
              <CardBody className="p-6 text-center">
                <div className="text-3xl font-bold text-[#FF4654] dark:text-[#DCFF37]">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                  {stat.label}
                </div>
                <div className="mt-2 text-xs text-default-500">
                  {stat.caption}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
          <CardBody className="gap-6 p-6 lg:p-8">
            <div>
              <h3 className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                {copy.sections.moatInnerTitle}
              </h3>
              <p className="mt-3 text-default-500">
                {copy.sections.moatInnerBody}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {ecosystemExpansionCards.map((card) => (
                <div
                  key={card.title}
                  className="border border-default-200 p-5 dark:border-default-100/10"
                >
                  <Icon
                    icon={card.icon}
                    width={22}
                    className="text-[#FF4654] dark:text-[#DCFF37]"
                  />
                  <h4 className="mt-3 font-bold text-[#34445C] dark:text-[#F5F0E1]">
                    {card.title}
                  </h4>
                  <p className="mt-2 text-sm text-default-500">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="border border-[#FF4654]/20 bg-[#FF4654]/5 p-5 dark:border-[#DCFF37]/20 dark:bg-[#DCFF37]/5">
              <h4 className="font-bold text-[#34445C] dark:text-[#F5F0E1]">
                {copy.sections.leverageTitle}
              </h4>
              <p className="mt-2 text-sm text-default-500">
                {copy.sections.leverageBody}
              </p>
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="w-full max-w-7xl space-y-10">
        <div className="text-center">
          <Chip className="mb-4 rounded-none bg-[#FF4654]/10 text-[#FF4654] dark:bg-[#DCFF37]/10 dark:text-[#DCFF37]">
            {copy.sections.revenueEyebrow}
          </Chip>
          <h2
            className={title({
              size: "md",
              class: "text-[#34445C] dark:text-[#F5F0E1]",
            })}
          >
            {copy.sections.revenueTitle}
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {revenueStreams.map((stream) => (
            <Card
              key={stream.title}
              className="rounded-none border border-[#FF4654]/10 dark:border-[#DCFF37]/10"
            >
              <CardBody className="gap-3 p-6">
                <Icon
                  icon={stream.icon}
                  width={22}
                  className="text-[#FF4654] dark:text-[#DCFF37]"
                />
                <h3 className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1]">
                  {stream.title}
                </h3>
                <p className="text-sm text-default-500">{stream.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
            <CardBody className="gap-5 p-6 lg:p-8">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                  {copy.sections.unitEconomics}
                </h3>
                <Chip className="rounded-none bg-[#FF4654]/10 text-[#FF4654] dark:bg-[#DCFF37]/10 dark:text-[#DCFF37]">
                  {copy.sections.expansionRevenueChip}
                </Chip>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {unitEconomics.map((item) => (
                  <div
                    key={item.label}
                    className="border border-default-200 p-4 dark:border-default-100/10"
                  >
                    <Icon
                      icon={item.icon}
                      width={20}
                      className="text-[#FF4654] dark:text-[#DCFF37]"
                    />
                    <div className="mt-3 text-sm text-default-500">
                      {item.label}
                    </div>
                    <div className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-bold text-[#34445C] dark:text-[#F5F0E1]">
                  {copy.sections.expansionRevenueTitle}
                </h4>
                <p className="mt-2 text-sm text-default-500">
                  {copy.sections.expansionRevenueBody}
                </p>
                <p className="mt-3 text-xs uppercase tracking-wider text-default-400">
                  {copy.sections.financialNote}
                </p>
              </div>
            </CardBody>
          </Card>

          <UseOfFunds />
        </div>
      </section>

      <section className="w-full max-w-7xl space-y-10">
        <div className="text-center">
          <Chip className="mb-4 rounded-none bg-[#FF4654]/10 text-[#FF4654] dark:bg-[#DCFF37]/10 dark:text-[#DCFF37]">
            {copy.sections.progressEyebrow}
          </Chip>
          <h2
            className={title({
              size: "md",
              class: "text-[#34445C] dark:text-[#F5F0E1]",
            })}
          >
            {copy.sections.progressTitle}
          </h2>
          <p className={subtitle({ class: "mx-auto mt-4 max-w-3xl" })}>
            {copy.sections.progressBody}
          </p>
        </div>
        <ProductStatus />
      </section>

      <section className="w-full max-w-7xl space-y-10">
        <div className="text-center">
          <Chip className="mb-4 rounded-none bg-[#FF4654]/10 text-[#FF4654] dark:bg-[#DCFF37]/10 dark:text-[#DCFF37]">
            {copy.sections.milestonesEyebrow}
          </Chip>
          <h2
            className={title({
              size: "md",
              class: "text-[#34445C] dark:text-[#F5F0E1]",
            })}
          >
            {copy.sections.milestonesTitle}
          </h2>
          <p className={subtitle({ class: "mx-auto mt-4 max-w-3xl" })}>
            {copy.sections.milestonesBody}
          </p>
        </div>
        <RoadmapTimeline />
      </section>

      <section className="w-full max-w-7xl space-y-10">
        <div className="text-center">
          <Chip className="mb-4 rounded-none bg-[#FF4654]/10 text-[#FF4654] dark:bg-[#DCFF37]/10 dark:text-[#DCFF37]">
            {copy.sections.kpisEyebrow}
          </Chip>
          <h2
            className={title({
              size: "md",
              class: "text-[#34445C] dark:text-[#F5F0E1]",
            })}
          >
            {copy.sections.kpisTitle}
          </h2>
          <p className={subtitle({ class: "mx-auto mt-4 max-w-3xl" })}>
            {copy.sections.kpisBody}
          </p>
        </div>
        <SuccessMetrics />
      </section>

      <section className="w-full max-w-7xl space-y-10">
        <div className="text-center">
          <Chip className="mb-4 rounded-none bg-[#FF4654]/10 text-[#FF4654] dark:bg-[#DCFF37]/10 dark:text-[#DCFF37]">
            {copy.sections.leadershipEyebrow}
          </Chip>
          <h2
            className={title({
              size: "md",
              class: "text-[#34445C] dark:text-[#F5F0E1]",
            })}
          >
            {copy.sections.leadershipTitle}
          </h2>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
            <CardBody className="gap-5 p-6 lg:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] text-[#F5F0E1] dark:from-[#DCFF37] dark:to-[#34445C] dark:text-[#34445C]">
                  <Icon icon="solar:user-id-bold" width={28} />
                </div>
                <div>
                  <div className="text-sm uppercase tracking-wider text-default-400">
                    {copy.founderRole}
                  </div>
                  <div className="text-xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                    Pascal Savelis
                  </div>
                </div>
              </div>
              <p className="text-default-500">{copy.founderDescription}</p>
              <div className="flex flex-wrap gap-2">
                {copy.founderSkills.map((skill) => (
                  <Chip
                    key={skill}
                    size="sm"
                    className="rounded-none bg-default-100 dark:bg-default-50/10 text-default-600 dark:text-default-300"
                  >
                    {skill}
                  </Chip>
                ))}
              </div>
            </CardBody>
          </Card>

          <div className="grid gap-4">
            {advisorSlots.map((advisor) => (
              <Card
                key={advisor.role}
                className="rounded-none border border-[#FF4654]/10 dark:border-[#DCFF37]/10"
              >
                <CardBody className="gap-3 p-5">
                  <div className="flex items-center gap-3">
                    <Icon
                      icon={advisor.icon}
                      width={20}
                      className="text-[#FF4654] dark:text-[#DCFF37]"
                    />
                    <h3 className="font-bold text-[#34445C] dark:text-[#F5F0E1]">
                      {advisor.role}
                    </h3>
                  </div>
                  <p className="text-sm text-default-500">
                    {advisor.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {advisor.skills.map((skill) => (
                      <Chip
                        key={skill}
                        size="sm"
                        className="rounded-none bg-default-100 dark:bg-default-50/10 text-default-600 dark:text-default-300"
                      >
                        {skill}
                      </Chip>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        <Card className="rounded-none border border-[#FF4654]/20 bg-[#FF4654]/5 dark:border-[#DCFF37]/20 dark:bg-[#DCFF37]/5">
          <CardBody className="gap-3 p-6 lg:p-8">
            <h3 className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
              {copy.sections.growthTitle}
            </h3>
            <p className="text-default-500">{copy.sections.growthBody}</p>
          </CardBody>
        </Card>
      </section>

      <section className="w-full max-w-7xl">
        <Card className="rounded-none border border-[#FF4654]/20 bg-gradient-to-br from-[#34445C] to-[#1e2a38] dark:border-[#DCFF37]/20">
          <CardBody className="gap-8 p-8 lg:p-10">
            <div className="text-center">
              <h2 className={title({ size: "md", class: "text-[#F5F0E1]" })}>
                {copy.sections.finalTitle}{" "}
                <span className="text-[#DCFF37]">
                  {copy.sections.finalTitleAccent}
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-[#F5F0E1]/75">
                {copy.sections.finalBody}
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="rounded-none border border-white/10 bg-white/5">
                <CardBody className="gap-3 p-6">
                  <h3 className="text-lg font-bold text-[#F5F0E1]">
                    {copy.sections.finalCards.downloadTitle}
                  </h3>
                  <p className="text-sm text-[#F5F0E1]/70">
                    {copy.sections.finalCards.downloadBody}
                  </p>
                  <PdfDownloadButton
                    variant="action"
                    onBeforeDownload={() => (setIsModalOpen(true), false)}
                  />
                </CardBody>
              </Card>

              <Card className="rounded-none border border-white/10 bg-white/5">
                <CardBody className="gap-3 p-6">
                  <h3 className="text-lg font-bold text-[#F5F0E1]">
                    {copy.sections.finalCards.meetingTitle}
                  </h3>
                  <p className="text-sm text-[#F5F0E1]/70">
                    {copy.sections.finalCards.meetingBody}
                  </p>
                  <EsportsButton
                    variant="primary"
                    onClick={() =>
                      window.open(CALENDLY_URL, "_blank", "noopener,noreferrer")
                    }
                  >
                    {copy.sections.finalCards.meetingButton}
                  </EsportsButton>
                </CardBody>
              </Card>

              <Card className="rounded-none border border-white/10 bg-white/5">
                <CardBody className="gap-3 p-6">
                  <h3 className="text-lg font-bold text-[#F5F0E1]">
                    {copy.sections.finalCards.emailTitle}
                  </h3>
                  <p className="text-sm text-[#F5F0E1]/70">
                    {copy.sections.finalCards.emailBody}
                  </p>
                  <EsportsButton
                    as="a"
                    href={`mailto:${CONTACT_EMAIL}`}
                    variant="ghost"
                  >
                    {CONTACT_EMAIL}
                  </EsportsButton>
                </CardBody>
              </Card>
            </div>
          </CardBody>
        </Card>
      </section>

      <EmailCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
