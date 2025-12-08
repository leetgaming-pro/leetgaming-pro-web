'use client';

import React from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Button,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { locales, localeInfo, Locale } from '@/lib/i18n';

interface LanguageSelectorProps {
  variant?: 'flat' | 'bordered' | 'faded' | 'shadow';
  size?: 'sm' | 'md' | 'lg';
  showFlag?: boolean;
  showName?: boolean;
}

export function LanguageSelector({ 
  variant = 'flat', 
  size = 'sm',
  showFlag = true,
  showName = false,
}: LanguageSelectorProps) {
  const { locale, changeLocale, currentLocale } = useTranslation();

  // Group locales by region
  const groupedLocales = locales.reduce((acc, loc) => {
    const info = localeInfo[loc];
    if (!acc[info.region]) {
      acc[info.region] = [];
    }
    acc[info.region].push(loc);
    return acc;
  }, {} as Record<string, Locale[]>);

  return (
    <Dropdown
      classNames={{
        content: "rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20",
      }}
    >
      <DropdownTrigger>
        <Button
          variant={variant}
          size={size}
          className="rounded-none min-w-unit-10"
          startContent={showFlag && <span className="text-lg">{currentLocale.flag}</span>}
        >
          {showName && <span className="ml-1">{currentLocale.nativeName}</span>}
          {!showName && !showFlag && <Icon icon="solar:global-bold" width={18} />}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Select Language"
        selectionMode="single"
        selectedKeys={[locale]}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as Locale;
          if (selected) changeLocale(selected);
        }}
        classNames={{
          base: "rounded-none",
          list: "max-h-[400px] overflow-y-auto",
        }}
        itemClasses={{
          base: "rounded-none data-[hover=true]:bg-[#FF4654]/10 dark:data-[hover=true]:bg-[#DCFF37]/10",
        }}
      >
        {Object.entries(groupedLocales).map(([region, regionLocales]) => (
          <DropdownSection key={region} title={region} showDivider>
            {regionLocales.map((loc) => {
              const info = localeInfo[loc];
              return (
                <DropdownItem
                  key={loc}
                  startContent={<span className="text-lg">{info.flag}</span>}
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

