"use client";

import React from "react";
import { Card, CardBody, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { title, subtitle } from "@/components/primitives";
import { EsportsButton } from "@/components/ui/esports-button";
import { InvestorSubNav } from "@/components/investors/investor-sub-nav";
import { getTierOneLocale } from "@/lib/i18n";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { investorUpdatesCopy } from "@/lib/investors/updates-copy";

const categoryMeta = {
  milestone: {
    icon: "solar:flag-bold",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  product: {
    icon: "solar:code-square-bold",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  funding: {
    icon: "solar:dollar-minimalistic-bold",
    color: "bg-[#FFC700]/10 text-[#FFC700]",
  },
  partnership: {
    icon: "solar:handshake-bold",
    color: "bg-[#FF4654]/10 text-[#FF4654] dark:text-[#DCFF37]",
  },
} as const;

export default function InvestorUpdatesPage() {
  const { locale } = useTranslation();
  const tierOneLocale = getTierOneLocale(locale);
  const copy = investorUpdatesCopy[tierOneLocale];
  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex w-full flex-col items-center gap-12 px-4 py-8 md:gap-16 md:py-12 sm:px-6 lg:px-12 xl:px-24 2xl:px-32">
      <InvestorSubNav />

      <motion.div
        className="w-full max-w-4xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]">
          <Icon
            icon="solar:document-text-bold"
            className="text-[#F5F0E1] dark:text-[#34445C]"
            width={32}
          />
        </div>
        <h1
          className={title({
            size: "lg",
            class:
              "text-[#34445C] dark:text-[#F5F0E1] text-3xl md:text-4xl lg:text-5xl",
          })}
        >
          {copy.title}
        </h1>
        <p className={subtitle({ class: "mt-3 max-w-2xl mx-auto" })}>
          {copy.subtitle}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="rounded-none border border-[#FF4654]/20 bg-gradient-to-r from-[#FF4654]/5 to-[#FFC700]/5 dark:border-[#DCFF37]/20 dark:from-[#DCFF37]/5 dark:to-[#34445C]/5">
          <CardBody className="flex flex-col items-center gap-4 p-6 sm:flex-row">
            <Icon
              icon="solar:bell-bold"
              className="text-[#FF4654] dark:text-[#DCFF37]"
              width={24}
            />
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-sm font-bold text-[#34445C] dark:text-[#F5F0E1]">
                {copy.stayUpdatedTitle}
              </h3>
              <p className="text-xs text-default-500">{copy.stayUpdatedBody}</p>
            </div>
            <EsportsButton
              variant="primary"
              size="sm"
              as="a"
              href={`mailto:investors@leetgaming.pro?subject=${encodeURIComponent(copy.subscribeSubject)}`}
              startContent={<Icon icon="solar:letter-bold" width={16} />}
            >
              {copy.subscribe}
            </EsportsButton>
          </CardBody>
        </Card>
      </motion.div>

      <div className="w-full max-w-4xl">
        <div className="relative">
          <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-gradient-to-b from-[#FF4654] via-[#FFC700] to-[#DCFF37] dark:from-[#DCFF37] dark:via-[#FFC700] dark:to-[#FF4654] md:left-8" />

          {copy.updates.map((update, index) => {
            const category = categoryMeta[update.category];
            return (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                className="relative pb-10 pl-12 last:pb-0 md:pl-20"
              >
                <div className="absolute left-2 z-10 h-5 w-5 bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] md:left-6" />

                <Card className="rounded-none border border-[#FF4654]/10 transition-colors hover:border-[#FF4654]/30 dark:border-[#DCFF37]/10 dark:hover:border-[#DCFF37]/30">
                  <CardBody className="p-5 lg:p-6">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2">
                        <Chip size="sm" className={category.color}>
                          <span className="flex items-center gap-1">
                            <Icon icon={category.icon} width={12} />
                            {copy.categories[update.category]}
                          </span>
                        </Chip>
                        <span className="text-xs font-mono text-default-400">
                          {formatter.format(new Date(update.date))}
                        </span>
                      </div>
                    </div>

                    <h3 className="mb-2 text-lg font-bold text-[#34445C] dark:text-[#F5F0E1]">
                      {update.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-default-500">
                      {update.summary}
                    </p>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {update.highlights.map((highlight) => (
                        <div
                          key={highlight}
                          className="flex items-start gap-2 text-sm text-default-600 dark:text-default-400"
                        >
                          <Icon
                            icon="solar:check-circle-bold"
                            width={16}
                            className="mt-0.5 text-[#FF4654] dark:text-[#DCFF37]"
                          />
                          <span>{highlight}</span>
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

      <Card className="w-full max-w-4xl rounded-none border border-[#FF4654]/20 bg-[#FF4654]/5 dark:border-[#DCFF37]/20 dark:bg-[#DCFF37]/5">
        <CardBody className="flex flex-col items-center justify-between gap-4 p-6 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="text-base font-bold text-[#34445C] dark:text-[#F5F0E1]">
              {copy.questions}
            </h3>
          </div>
          <EsportsButton
            as="a"
            href="mailto:investors@leetgaming.pro"
            variant="ghost"
          >
            investors@leetgaming.pro
          </EsportsButton>
        </CardBody>
      </Card>
    </div>
  );
}
