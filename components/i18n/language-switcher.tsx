/**
 * Language Switcher Component
 * UI component for switching between supported locales
 * Per PRD E.10 - Tier 1 Languages: EN, PT-BR, ES-LATAM, ZH-CN
 */

"use client";

import React, { useState } from "react";
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
import { Locale, localeInfo, locales } from "@/lib/i18n";

interface LanguageSwitcherProps {
  variant?: "compact" | "full";
  className?: string;
}

// Group locales by region
const groupedLocales = locales.reduce((acc, locale) => {
  const region = localeInfo[locale].region;
  if (!acc[region]) {
    acc[region] = [];
  }
  acc[region].push(locale);
  return acc;
}, {} as Record<string, Locale[]>);

const regionOrder = ["Americas", "Europe", "Asia", "Middle East"];

export function LanguageSwitcher({
  variant = "compact",
  className = "",
}: LanguageSwitcherProps) {
  const { locale, changeLocale, currentLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (newLocale: Locale) => {
    changeLocale(newLocale);
    setIsOpen(false);
  };

  if (variant === "compact") {
    return (
      <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
        <DropdownTrigger>
          <Button
            variant="light"
            isIconOnly
            className={className}
            aria-label="Change language"
          >
            <span className="text-lg">{currentLocale.flag}</span>
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Language selection"
          selectionMode="single"
          selectedKeys={new Set([locale])}
        >
          {regionOrder.map((region) => (
            <DropdownSection key={region} title={region} showDivider>
              {(groupedLocales[region] || []).map((loc) => (
                <DropdownItem
                  key={loc}
                  startContent={
                    <span className="text-lg">{localeInfo[loc].flag}</span>
                  }
                  description={localeInfo[loc].nativeName}
                  onPress={() => handleSelect(loc)}
                >
                  {localeInfo[loc].name}
                </DropdownItem>
              ))}
            </DropdownSection>
          ))}
        </DropdownMenu>
      </Dropdown>
    );
  }

  // Full variant with label
  return (
    <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
      <DropdownTrigger>
        <Button
          variant="bordered"
          startContent={<span className="text-lg">{currentLocale.flag}</span>}
          endContent={
            <Icon icon="solar:alt-arrow-down-linear" className="w-4 h-4" />
          }
          className={className}
        >
          {currentLocale.nativeName}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Language selection"
        selectionMode="single"
        selectedKeys={new Set([locale])}
        className="min-w-[200px]"
      >
        {regionOrder.map((region) => (
          <DropdownSection key={region} title={region} showDivider>
            {(groupedLocales[region] || []).map((loc) => (
              <DropdownItem
                key={loc}
                startContent={
                  <span className="text-lg">{localeInfo[loc].flag}</span>
                }
                description={localeInfo[loc].nativeName}
                onPress={() => handleSelect(loc)}
              >
                {localeInfo[loc].name}
              </DropdownItem>
            ))}
          </DropdownSection>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

/**
 * Mini language selector for mobile/compact views
 */
export function LanguageSwitcherMini({
  className = "",
}: {
  className?: string;
}) {
  const { locale, changeLocale, currentLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Tier 1 languages only for mini view
  const tier1Locales: Locale[] = ["en-US", "pt-BR", "es-LA", "zh-CN"];

  return (
    <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
      <DropdownTrigger>
        <Button variant="flat" size="sm" className={className}>
          {currentLocale.flag} {locale.split("-")[0].toUpperCase()}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Language selection"
        selectionMode="single"
        selectedKeys={new Set([locale])}
      >
        {tier1Locales.map((loc) => (
          <DropdownItem
            key={loc}
            startContent={<span>{localeInfo[loc].flag}</span>}
            onPress={() => {
              changeLocale(loc);
              setIsOpen(false);
            }}
          >
            {localeInfo[loc].nativeName}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

/**
 * Language preference settings card
 */
export function LanguageSettings() {
  const { t, locale, changeLocale } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">{t("settings.language")}</h3>
        <p className="text-sm text-default-500">
          Choose your preferred language for the interface
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {locales.map((loc) => {
          const info = localeInfo[loc];
          const isSelected = locale === loc;

          return (
            <button
              key={loc}
              onClick={() => changeLocale(loc)}
              className={`
                flex items-center gap-3 p-3 rounded-lg border transition-all
                ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-default-200 hover:border-primary/50 hover:bg-default-100"
                }
              `}
            >
              <span className="text-2xl">{info.flag}</span>
              <div className="text-left">
                <p
                  className={`text-sm font-medium ${
                    isSelected ? "text-primary" : ""
                  }`}
                >
                  {info.nativeName}
                </p>
                <p className="text-xs text-default-500">{info.name}</p>
              </div>
              {isSelected && (
                <Icon
                  icon="solar:check-circle-bold"
                  className="w-5 h-5 text-primary ml-auto"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default LanguageSwitcher;
