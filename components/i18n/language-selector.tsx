"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Button,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { locales, localeInfo, Locale } from "@/lib/i18n";

interface LanguageSelectorProps {
  variant?: "flat" | "bordered" | "faded" | "shadow";
  size?: "sm" | "md" | "lg";
  showFlag?: boolean;
  showName?: boolean;
}

export function LanguageSelector({
  variant = "flat",
  size = "sm",
  showFlag = true,
  showName = false,
}: LanguageSelectorProps) {
  const { locale, changeLocale, currentLocale, isLoading, t } =
    useTranslation();
  const [mounted, setMounted] = useState(false);
  const selectedKeys = useMemo(() => new Set([locale]), [locale]);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Group locales by region
  const groupedLocales = locales.reduce(
    (acc, loc) => {
      const info = localeInfo[loc];
      if (!acc[info.region]) {
        acc[info.region] = [];
      }
      acc[info.region].push(loc);
      return acc;
    },
    {} as Record<string, Locale[]>,
  );

  const regionLabels: Record<string, string> = {
    Americas: t("regions.americas"),
    Europe: t("regions.europe"),
    Asia: t("regions.asia"),
    "Middle East": t("regions.middleEast"),
  };

  const handleLocaleChange = (key: React.Key) => {
    const selected = String(key) as Locale;
    if (selected !== locale) {
      changeLocale(selected);
    }
  };

  // Show a placeholder during SSR/loading to avoid hydration mismatch
  if (!mounted || isLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        className="rounded-none min-w-unit-10 border border-[#34445C]/30 dark:border-[#DCFF37]/30"
        isDisabled
        aria-label={t("common.changeLanguage")}
      >
        <Icon
          icon="solar:global-bold"
          width={18}
          className="text-[#34445C] dark:text-[#DCFF37]"
        />
      </Button>
    );
  }

  return (
    <Dropdown
      classNames={{
        content:
          "rounded-none border-2 border-[#FF4654]/30 dark:border-[#DCFF37]/30 bg-[#F5F0E1] dark:bg-[#1a1a1a] shadow-lg",
      }}
    >
      <DropdownTrigger>
        <Button
          variant={variant}
          size={size}
          data-testid="language-selector-trigger"
          aria-label={t("common.changeLanguage")}
          className="rounded-none min-w-unit-10 border border-[#34445C]/30 dark:border-[#DCFF37]/30 hover:bg-[#34445C]/10 dark:hover:bg-[#DCFF37]/10 transition-colors"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)",
          }}
          startContent={
            showFlag && <span className="text-base">{currentLocale.flag}</span>
          }
        >
          {showName && (
            <span className="ml-1 text-[#34445C] dark:text-[#DCFF37]">
              {currentLocale.nativeName}
            </span>
          )}
          {!showName && !showFlag && (
            <Icon
              icon="solar:global-bold"
              width={18}
              className="text-[#34445C] dark:text-[#DCFF37]"
            />
          )}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        data-testid="language-selector-menu"
        aria-label={t("common.selectLanguage")}
        selectionMode="single"
        disallowEmptySelection
        closeOnSelect
        selectedKeys={selectedKeys}
        onAction={handleLocaleChange}
        classNames={{
          base: "rounded-none p-0",
          list: "max-h-[400px] overflow-y-auto",
        }}
        itemClasses={{
          base: [
            "rounded-none",
            "data-[hover=true]:bg-[#FF4654]/10 dark:data-[hover=true]:bg-[#DCFF37]/10",
            "data-[selected=true]:bg-[#34445C]/20 dark:data-[selected=true]:bg-[#DCFF37]/20",
            "data-[selected=true]:text-[#34445C] dark:data-[selected=true]:text-[#DCFF37]",
            "data-[selected=true]:font-semibold",
            "transition-colors",
          ].join(" "),
          title: "text-[#34445C] dark:text-[#F5F0E1]",
          description: "text-[#34445C]/70 dark:text-[#F5F0E1]/70",
        }}
      >
        {Object.entries(groupedLocales).map(([region, regionLocales]) => (
          <DropdownSection
            key={region}
            title={regionLabels[region] ?? region}
            showDivider
            classNames={{
              heading:
                "text-xs font-bold uppercase tracking-wider text-[#FF4654] dark:text-[#DCFF37] px-2 py-1",
              divider: "bg-[#34445C]/20 dark:bg-[#DCFF37]/20",
            }}
          >
            {regionLocales.map((loc) => {
              const info = localeInfo[loc];
              const isSelected = loc === locale;
              return (
                <DropdownItem
                  key={loc}
                  data-testid={`language-option-${loc}`}
                  textValue={info.nativeName}
                  startContent={
                    <span className="text-lg mr-2">{info.flag}</span>
                  }
                  endContent={
                    isSelected && (
                      <Icon
                        icon="solar:check-circle-bold"
                        width={18}
                        className="text-[#FF4654] dark:text-[#DCFF37]"
                      />
                    )
                  }
                  description={info.name}
                >
                  {info.nativeName}
                </DropdownItem>
              );
            })}
          </DropdownSection>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

export default LanguageSelector;
