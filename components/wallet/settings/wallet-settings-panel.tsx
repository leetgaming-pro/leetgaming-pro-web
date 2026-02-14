"use client";

/**
 * Wallet Settings Panel
 * Comprehensive settings for wallet configuration, preferences, and advanced options
 * Supports custodial, semi-custodial (MPC), and non-custodial wallet types
 */

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Chip,
  Divider,
  Switch,
  Input,
  Select,
  SelectItem,
  Slider,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Accordion,
  AccordionItem,
  Button,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { cn } from "@nextui-org/react";
import type {
  CustodialWalletType,
  SupportedChain,
} from "@/types/replay-api/escrow-wallet.types";

interface WalletSettings {
  // General
  defaultChain: SupportedChain;
  currency: string;
  language: string;
  timezone: string;

  // Transaction Settings
  autoClaimPrizes: boolean;
  autoCompoundEarnings: boolean;
  defaultGasPreset: "slow" | "standard" | "fast" | "instant";
  maxSlippage: number;

  // Security
  requireMPCSignForWithdrawals: boolean;
  withdrawalDelay: number;
  dailyWithdrawalLimit: number;
  weeklyWithdrawalLimit: number;

  // Notifications
  notifyOnDeposit: boolean;
  notifyOnWithdrawal: boolean;
  notifyOnEscrowLock: boolean;
  notifyOnMatchResult: boolean;
  notifyOnSecurityEvent: boolean;

  // Privacy
  hideBalances: boolean;
  hideTransactionHistory: boolean;
  publicProfile: boolean;

  // Advanced
  customRPC: { [chain: string]: string };
  gasBuffer: number;
  nonceOverride: boolean;
  testMode: boolean;
}

interface WalletSettingsProps {
  walletType: CustodialWalletType;
  settings: WalletSettings;
  kycLevel: "none" | "basic" | "verified" | "premium";
  onSaveSettings: (settings: Partial<WalletSettings>) => Promise<void>;
  onResetSettings: () => Promise<void>;
  onExportData: () => Promise<void>;
  onDeleteWallet?: () => Promise<void>;
}

// Chain options
const CHAINS: { key: SupportedChain; name: string; icon: string }[] = [
  { key: "ethereum", name: "Ethereum", icon: "token:eth" },
  { key: "polygon", name: "Polygon", icon: "token:matic" },
  { key: "base", name: "Base", icon: "simple-icons:coinbase" },
  { key: "arbitrum", name: "Arbitrum", icon: "simple-icons:arbitrum" },
  { key: "optimism", name: "Optimism", icon: "token:op" },
  { key: "solana", name: "Solana", icon: "token:sol" },
];

// Currency options
const CURRENCIES = [
  { key: "usd", name: "US Dollar", symbol: "$" },
  { key: "eur", name: "Euro", symbol: "€" },
  { key: "gbp", name: "British Pound", symbol: "£" },
  { key: "jpy", name: "Japanese Yen", symbol: "¥" },
  { key: "brl", name: "Brazilian Real", symbol: "R$" },
];

// Setting section component
function SettingSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-[#34445C]/10 dark:bg-[#DCFF37]/10 flex items-center justify-center">
            <Icon
              icon={icon}
              width={20}
              className="text-[#FF4654] dark:text-[#DCFF37]"
            />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-[#34445C] dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-default-500">{description}</p>
          )}
        </div>
      </div>
      <div className="pl-0 md:pl-[52px] space-y-4">{children}</div>
    </div>
  );
}

// Setting row component
function SettingRow({
  label,
  description,
  children,
  isPro,
  isDisabled,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  isPro?: boolean;
  isDisabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-3 border-b border-default-100 last:border-0",
        isDisabled && "opacity-50",
      )}
    >
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#34445C] dark:text-white">
            {label}
          </span>
          {isPro && (
            <Chip
              size="sm"
              color="warning"
              variant="flat"
              className="rounded-none"
            >
              PRO
            </Chip>
          )}
        </div>
        {description && (
          <p className="text-xs text-default-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export function WalletSettingsPanel({
  walletType,
  settings: initialSettings,
  kycLevel,
  onSaveSettings,
  onResetSettings,
  onExportData,
  onDeleteWallet,
}: WalletSettingsProps) {
  const [settings, setSettings] = useState<WalletSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState("general");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    isOpen: isResetOpen,
    onOpen: onResetOpen,
    onClose: onResetClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const updateSetting = <K extends keyof WalletSettings>(
    key: K,
    value: WalletSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSettings(settings);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    await onResetSettings();
    setSettings(initialSettings);
    setHasChanges(false);
    onResetClose();
  };

  const isMPC = walletType === "semi_custodial";
  // Unused but kept for potential future use
  const _isNonCustodial = walletType === "non_custodial";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#34445C] dark:text-white">
            Wallet Settings
          </h1>
          <p className="text-default-500">
            Configure your wallet preferences and security settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="flat"
            className="rounded-none"
            startContent={<Icon icon="solar:refresh-bold" width={16} />}
            onPress={onResetOpen}
          >
            Reset
          </Button>
          <Button
            className={cn(
              "rounded-none",
              hasChanges
                ? "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-white dark:text-[#34445C]"
                : "",
            )}
            isDisabled={!hasChanges}
            isLoading={isSaving}
            startContent={
              !isSaving && <Icon icon="solar:diskette-bold" width={16} />
            }
            onPress={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key as string)}
        classNames={{
          tab: "rounded-none",
          cursor: "rounded-none",
        }}
      >
        <Tab
          key="general"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:settings-bold" width={16} />
              General
            </div>
          }
        />
        <Tab
          key="transactions"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:transfer-horizontal-bold" width={16} />
              Transactions
            </div>
          }
        />
        <Tab
          key="security"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:shield-keyhole-bold" width={16} />
              Security
            </div>
          }
        />
        <Tab
          key="notifications"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:bell-bold" width={16} />
              Notifications
            </div>
          }
        />
        <Tab
          key="privacy"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:eye-closed-bold" width={16} />
              Privacy
            </div>
          }
        />
        <Tab
          key="advanced"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:code-bold" width={16} />
              Advanced
            </div>
          }
        />
      </Tabs>

      {/* Tab Content */}
      <Card className="rounded-none">
        <CardBody className="p-6">
          {activeTab === "general" && (
            <div className="space-y-8">
              <SettingSection
                title="Default Network"
                description="Choose your preferred blockchain for transactions"
                icon="solar:planet-bold"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CHAINS.map((chain) => (
                    <div
                      key={chain.key}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        settings.defaultChain === chain.key
                          ? "border-[#FF4654] dark:border-[#DCFF37] bg-[#FF4654]/5 dark:bg-[#DCFF37]/5"
                          : "border-default-200 hover:border-default-300",
                      )}
                      onClick={() => updateSetting("defaultChain", chain.key)}
                    >
                      <Icon icon={chain.icon} width={24} />
                      <span className="font-medium text-[#34445C] dark:text-white">
                        {chain.name}
                      </span>
                      {settings.defaultChain === chain.key && (
                        <Icon
                          icon="solar:check-circle-bold"
                          className="ml-auto text-success"
                          width={18}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </SettingSection>

              <Divider />

              <SettingSection
                title="Display Settings"
                description="Customize how values are displayed"
                icon="solar:monitor-bold"
              >
                <SettingRow
                  label="Display Currency"
                  description="Currency for showing fiat values"
                >
                  <Select
                    size="sm"
                    selectedKeys={[settings.currency]}
                    onChange={(e) => updateSetting("currency", e.target.value)}
                    className="w-40"
                    classNames={{ trigger: "rounded-none" }}
                  >
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.key} value={currency.key}>
                        {currency.symbol} {currency.name}
                      </SelectItem>
                    ))}
                  </Select>
                </SettingRow>

                <SettingRow label="Language" description="Interface language">
                  <Select
                    size="sm"
                    selectedKeys={[settings.language]}
                    onChange={(e) => updateSetting("language", e.target.value)}
                    className="w-40"
                    classNames={{ trigger: "rounded-none" }}
                  >
                    <SelectItem key="en" value="en">
                      English
                    </SelectItem>
                    <SelectItem key="pt" value="pt">
                      Português
                    </SelectItem>
                    <SelectItem key="es" value="es">
                      Español
                    </SelectItem>
                    <SelectItem key="ja" value="ja">
                      日本語
                    </SelectItem>
                    <SelectItem key="ko" value="ko">
                      한국어
                    </SelectItem>
                  </Select>
                </SettingRow>

                <SettingRow
                  label="Timezone"
                  description="For transaction timestamps"
                >
                  <Select
                    size="sm"
                    selectedKeys={[settings.timezone]}
                    onChange={(e) => updateSetting("timezone", e.target.value)}
                    className="w-48"
                    classNames={{ trigger: "rounded-none" }}
                  >
                    <SelectItem key="UTC" value="UTC">
                      UTC
                    </SelectItem>
                    <SelectItem key="America/New_York" value="America/New_York">
                      Eastern Time
                    </SelectItem>
                    <SelectItem
                      key="America/Los_Angeles"
                      value="America/Los_Angeles"
                    >
                      Pacific Time
                    </SelectItem>
                    <SelectItem
                      key="America/Sao_Paulo"
                      value="America/Sao_Paulo"
                    >
                      Brasília
                    </SelectItem>
                    <SelectItem key="Europe/London" value="Europe/London">
                      London
                    </SelectItem>
                    <SelectItem key="Asia/Tokyo" value="Asia/Tokyo">
                      Tokyo
                    </SelectItem>
                  </Select>
                </SettingRow>
              </SettingSection>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-8">
              <SettingSection
                title="Automation"
                description="Configure automatic transaction handling"
                icon="solar:automation-bold"
              >
                <SettingRow
                  label="Auto-claim Prizes"
                  description="Automatically claim prizes when matches complete"
                >
                  <Switch
                    isSelected={settings.autoClaimPrizes}
                    onValueChange={(v) => updateSetting("autoClaimPrizes", v)}
                    classNames={{ wrapper: "rounded-none" }}
                  />
                </SettingRow>

                <SettingRow
                  label="Auto-compound Earnings"
                  description="Reinvest staking rewards automatically"
                  isPro
                  isDisabled={kycLevel !== "premium"}
                >
                  <Switch
                    isSelected={settings.autoCompoundEarnings}
                    onValueChange={(v) =>
                      updateSetting("autoCompoundEarnings", v)
                    }
                    isDisabled={kycLevel !== "premium"}
                    classNames={{ wrapper: "rounded-none" }}
                  />
                </SettingRow>
              </SettingSection>

              <Divider />

              <SettingSection
                title="Gas Settings"
                description="Default gas preferences for transactions"
                icon="solar:gas-station-bold"
              >
                <SettingRow
                  label="Default Gas Preset"
                  description="Speed vs cost tradeoff for transactions"
                >
                  <Select
                    size="sm"
                    selectedKeys={[settings.defaultGasPreset]}
                    onChange={(e) =>
                      updateSetting(
                        "defaultGasPreset",
                        e.target.value as
                          | "slow"
                          | "standard"
                          | "fast"
                          | "instant",
                      )
                    }
                    className="w-32"
                    classNames={{ trigger: "rounded-none" }}
                  >
                    <SelectItem key="slow" value="slow">
                      Slow
                    </SelectItem>
                    <SelectItem key="standard" value="standard">
                      Standard
                    </SelectItem>
                    <SelectItem key="fast" value="fast">
                      Fast
                    </SelectItem>
                    <SelectItem key="instant" value="instant">
                      Instant
                    </SelectItem>
                  </Select>
                </SettingRow>

                <SettingRow
                  label="Max Slippage"
                  description="Maximum acceptable price impact for swaps"
                >
                  <div className="flex items-center gap-2 w-40">
                    <Slider
                      size="sm"
                      step={0.1}
                      minValue={0.1}
                      maxValue={5}
                      value={settings.maxSlippage}
                      onChange={(v) =>
                        updateSetting("maxSlippage", v as number)
                      }
                      classNames={{
                        track: "rounded-none",
                        thumb: "rounded-none",
                      }}
                    />
                    <span className="text-sm font-medium w-12 text-right">
                      {settings.maxSlippage}%
                    </span>
                  </div>
                </SettingRow>
              </SettingSection>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-8">
              {isMPC && (
                <>
                  <SettingSection
                    title="MPC Signing"
                    description="Multi-party computation settings"
                    icon="solar:shield-keyhole-bold"
                  >
                    <SettingRow
                      label="Require MPC Sign for Withdrawals"
                      description="All withdrawals require threshold signature"
                    >
                      <Switch
                        isSelected={settings.requireMPCSignForWithdrawals}
                        onValueChange={(v) =>
                          updateSetting("requireMPCSignForWithdrawals", v)
                        }
                        classNames={{ wrapper: "rounded-none" }}
                      />
                    </SettingRow>
                  </SettingSection>

                  <Divider />
                </>
              )}

              <SettingSection
                title="Withdrawal Limits"
                description="Set spending limits for security"
                icon="solar:shield-warning-bold"
              >
                <SettingRow
                  label="Withdrawal Delay"
                  description="Time delay before withdrawals process (0 = instant)"
                >
                  <Select
                    size="sm"
                    selectedKeys={[settings.withdrawalDelay.toString()]}
                    onChange={(e) =>
                      updateSetting("withdrawalDelay", parseInt(e.target.value))
                    }
                    className="w-32"
                    classNames={{ trigger: "rounded-none" }}
                  >
                    <SelectItem key="0" value="0">
                      Instant
                    </SelectItem>
                    <SelectItem key="1" value="1">
                      1 hour
                    </SelectItem>
                    <SelectItem key="6" value="6">
                      6 hours
                    </SelectItem>
                    <SelectItem key="24" value="24">
                      24 hours
                    </SelectItem>
                    <SelectItem key="72" value="72">
                      72 hours
                    </SelectItem>
                  </Select>
                </SettingRow>

                <SettingRow
                  label="Daily Withdrawal Limit"
                  description="Maximum amount withdrawable per day (USD)"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-default-400">$</span>
                    <Input
                      size="sm"
                      type="number"
                      value={settings.dailyWithdrawalLimit.toString()}
                      onValueChange={(v) =>
                        updateSetting("dailyWithdrawalLimit", parseInt(v) || 0)
                      }
                      className="w-28"
                      classNames={{ inputWrapper: "rounded-none" }}
                    />
                  </div>
                </SettingRow>

                <SettingRow
                  label="Weekly Withdrawal Limit"
                  description="Maximum amount withdrawable per week (USD)"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-default-400">$</span>
                    <Input
                      size="sm"
                      type="number"
                      value={settings.weeklyWithdrawalLimit.toString()}
                      onValueChange={(v) =>
                        updateSetting("weeklyWithdrawalLimit", parseInt(v) || 0)
                      }
                      className="w-28"
                      classNames={{ inputWrapper: "rounded-none" }}
                    />
                  </div>
                </SettingRow>
              </SettingSection>

              <Divider />

              <SettingSection
                title="Security Actions"
                description="Additional security features"
                icon="solar:shield-check-bold"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="flat"
                    className="rounded-none h-auto p-4 flex flex-col items-start"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon
                        icon="solar:key-bold"
                        width={20}
                        className="text-[#FF4654] dark:text-[#DCFF37]"
                      />
                      <span className="font-semibold text-[#34445C] dark:text-white">
                        Change Password
                      </span>
                    </div>
                    <span className="text-xs text-default-500 text-left">
                      Update your account password
                    </span>
                  </Button>

                  <Button
                    variant="flat"
                    className="rounded-none h-auto p-4 flex flex-col items-start"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon
                        icon="solar:shield-user-bold"
                        width={20}
                        className="text-[#FF4654] dark:text-[#DCFF37]"
                      />
                      <span className="font-semibold text-[#34445C] dark:text-white">
                        Two-Factor Authentication
                      </span>
                    </div>
                    <span className="text-xs text-default-500 text-left">
                      Configure 2FA for added security
                    </span>
                  </Button>

                  {isMPC && (
                    <Button
                      variant="flat"
                      className="rounded-none h-auto p-4 flex flex-col items-start"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon
                          icon="solar:refresh-bold"
                          width={20}
                          className="text-[#FF4654] dark:text-[#DCFF37]"
                        />
                        <span className="font-semibold text-[#34445C] dark:text-white">
                          Rotate Key Shards
                        </span>
                      </div>
                      <span className="text-xs text-default-500 text-left">
                        Generate new MPC key shards for security
                      </span>
                    </Button>
                  )}

                  <Button
                    variant="flat"
                    className="rounded-none h-auto p-4 flex flex-col items-start"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon
                        icon="solar:devices-bold"
                        width={20}
                        className="text-[#FF4654] dark:text-[#DCFF37]"
                      />
                      <span className="font-semibold text-[#34445C] dark:text-white">
                        Manage Devices
                      </span>
                    </div>
                    <span className="text-xs text-default-500 text-left">
                      View and revoke device access
                    </span>
                  </Button>
                </div>
              </SettingSection>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-8">
              <SettingSection
                title="Transaction Notifications"
                description="Get notified about wallet activity"
                icon="solar:bell-bold"
              >
                <SettingRow
                  label="Deposits"
                  description="Notify when funds are received"
                >
                  <Switch
                    isSelected={settings.notifyOnDeposit}
                    onValueChange={(v) => updateSetting("notifyOnDeposit", v)}
                    classNames={{ wrapper: "rounded-none" }}
                  />
                </SettingRow>

                <SettingRow
                  label="Withdrawals"
                  description="Notify when withdrawals are processed"
                >
                  <Switch
                    isSelected={settings.notifyOnWithdrawal}
                    onValueChange={(v) =>
                      updateSetting("notifyOnWithdrawal", v)
                    }
                    classNames={{ wrapper: "rounded-none" }}
                  />
                </SettingRow>

                <SettingRow
                  label="Escrow Locks"
                  description="Notify when funds are locked in escrow"
                >
                  <Switch
                    isSelected={settings.notifyOnEscrowLock}
                    onValueChange={(v) =>
                      updateSetting("notifyOnEscrowLock", v)
                    }
                    classNames={{ wrapper: "rounded-none" }}
                  />
                </SettingRow>

                <SettingRow
                  label="Match Results"
                  description="Notify when match outcomes are determined"
                >
                  <Switch
                    isSelected={settings.notifyOnMatchResult}
                    onValueChange={(v) =>
                      updateSetting("notifyOnMatchResult", v)
                    }
                    classNames={{ wrapper: "rounded-none" }}
                  />
                </SettingRow>
              </SettingSection>

              <Divider />

              <SettingSection
                title="Security Alerts"
                description="Critical security notifications (recommended)"
                icon="solar:shield-warning-bold"
              >
                <SettingRow
                  label="Security Events"
                  description="Login attempts, new devices, suspicious activity"
                >
                  <Switch
                    isSelected={settings.notifyOnSecurityEvent}
                    onValueChange={(v) =>
                      updateSetting("notifyOnSecurityEvent", v)
                    }
                    classNames={{ wrapper: "rounded-none" }}
                  />
                </SettingRow>
              </SettingSection>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-8">
              <SettingSection
                title="Display Privacy"
                description="Control what others can see"
                icon="solar:eye-closed-bold"
              >
                <SettingRow
                  label="Hide Balances"
                  description="Mask balance amounts with asterisks"
                >
                  <Switch
                    isSelected={settings.hideBalances}
                    onValueChange={(v) => updateSetting("hideBalances", v)}
                    classNames={{ wrapper: "rounded-none" }}
                  />
                </SettingRow>

                <SettingRow
                  label="Hide Transaction History"
                  description="Don't display transaction history on dashboard"
                >
                  <Switch
                    isSelected={settings.hideTransactionHistory}
                    onValueChange={(v) =>
                      updateSetting("hideTransactionHistory", v)
                    }
                    classNames={{ wrapper: "rounded-none" }}
                  />
                </SettingRow>

                <SettingRow
                  label="Public Profile"
                  description="Allow others to view your gaming stats"
                >
                  <Switch
                    isSelected={settings.publicProfile}
                    onValueChange={(v) => updateSetting("publicProfile", v)}
                    classNames={{ wrapper: "rounded-none" }}
                  />
                </SettingRow>
              </SettingSection>

              <Divider />

              <SettingSection
                title="Data Management"
                description="Control your personal data"
                icon="solar:database-bold"
              >
                <div className="space-y-4">
                  <Button
                    variant="flat"
                    className="rounded-none w-full justify-start"
                    startContent={
                      <Icon icon="solar:download-bold" width={18} />
                    }
                    onPress={onExportData}
                  >
                    Export All Data
                  </Button>

                  <Button
                    variant="flat"
                    color="danger"
                    className="rounded-none w-full justify-start"
                    startContent={
                      <Icon icon="solar:trash-bin-trash-bold" width={18} />
                    }
                    onPress={onDeleteOpen}
                  >
                    Delete Wallet
                  </Button>
                </div>
              </SettingSection>
            </div>
          )}

          {activeTab === "advanced" && (
            <div className="space-y-8">
              <Card className="rounded-none border-warning/50 bg-warning/5">
                <CardBody className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon
                      icon="solar:danger-triangle-bold"
                      className="text-warning mt-0.5"
                      width={20}
                    />
                    <div>
                      <p className="font-semibold text-warning">
                        Advanced Settings
                      </p>
                      <p className="text-sm text-warning/80">
                        These settings are for advanced users. Incorrect
                        configuration may result in transaction failures or lost
                        funds.
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <SettingSection
                title="Custom RPC Endpoints"
                description="Override default network connections"
                icon="solar:server-bold"
              >
                <Accordion className="px-0">
                  {CHAINS.map((chain) => (
                    <AccordionItem
                      key={chain.key}
                      title={
                        <div className="flex items-center gap-2">
                          <Icon icon={chain.icon} width={20} />
                          <span>{chain.name}</span>
                        </div>
                      }
                      classNames={{ title: "text-sm" }}
                    >
                      <Input
                        size="sm"
                        placeholder={`https://rpc.${chain.key}.example.com`}
                        value={settings.customRPC[chain.key] || ""}
                        onValueChange={(v) =>
                          updateSetting("customRPC", {
                            ...settings.customRPC,
                            [chain.key]: v,
                          })
                        }
                        classNames={{ inputWrapper: "rounded-none" }}
                      />
                    </AccordionItem>
                  ))}
                </Accordion>
              </SettingSection>

              <Divider />

              <SettingSection
                title="Transaction Overrides"
                description="Fine-tune transaction behavior"
                icon="solar:tuning-2-bold"
              >
                <SettingRow
                  label="Gas Buffer"
                  description="Extra gas percentage added to estimates"
                >
                  <div className="flex items-center gap-2 w-32">
                    <Slider
                      size="sm"
                      step={5}
                      minValue={0}
                      maxValue={50}
                      value={settings.gasBuffer}
                      onChange={(v) => updateSetting("gasBuffer", v as number)}
                      classNames={{
                        track: "rounded-none",
                        thumb: "rounded-none",
                      }}
                    />
                    <span className="text-sm font-medium w-10 text-right">
                      +{settings.gasBuffer}%
                    </span>
                  </div>
                </SettingRow>

                <SettingRow
                  label="Allow Nonce Override"
                  description="Manually override transaction nonce"
                >
                  <Switch
                    isSelected={settings.nonceOverride}
                    onValueChange={(v) => updateSetting("nonceOverride", v)}
                    classNames={{ wrapper: "rounded-none" }}
                  />
                </SettingRow>
              </SettingSection>

              <Divider />

              <SettingSection
                title="Developer Options"
                description="For testing and development"
                icon="solar:code-bold"
              >
                <SettingRow
                  label="Test Mode"
                  description="Use testnet networks instead of mainnet"
                >
                  <Switch
                    isSelected={settings.testMode}
                    onValueChange={(v) => updateSetting("testMode", v)}
                    classNames={{ wrapper: "rounded-none" }}
                  />
                </SettingRow>
              </SettingSection>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Reset Confirmation Modal */}
      <Modal isOpen={isResetOpen} onClose={onResetClose} size="sm">
        <ModalContent className="rounded-none">
          <ModalHeader>Reset Settings</ModalHeader>
          <ModalBody>
            <p className="text-default-500">
              Are you sure you want to reset all settings to their default
              values? This cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              className="rounded-none"
              onPress={onResetClose}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              className="rounded-none"
              onPress={handleReset}
            >
              Reset All
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Wallet Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md">
        <ModalContent className="rounded-none">
          <ModalHeader className="bg-danger/10">
            <div className="flex items-center gap-2 text-danger">
              <Icon icon="solar:trash-bin-trash-bold" width={20} />
              Delete Wallet
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-danger/10 border border-danger/20">
                <p className="text-danger font-semibold mb-2">
                  This action is irreversible!
                </p>
                <ul className="text-sm text-danger/80 space-y-1">
                  <li>• All wallet data will be permanently deleted</li>
                  <li>• Transaction history will be lost</li>
                  <li>• Any remaining balance must be withdrawn first</li>
                  <li>• Active escrows must be resolved first</li>
                </ul>
              </div>

              <div>
                <p className="text-sm text-default-500 mb-2">
                  Type{" "}
                  <span className="font-mono font-bold text-danger">
                    DELETE
                  </span>{" "}
                  to confirm:
                </p>
                <Input
                  value={deleteConfirmation}
                  onValueChange={setDeleteConfirmation}
                  placeholder="DELETE"
                  classNames={{ inputWrapper: "rounded-none" }}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              className="rounded-none"
              onPress={onDeleteClose}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              className="rounded-none"
              isDisabled={deleteConfirmation !== "DELETE"}
              onPress={() => {
                onDeleteWallet?.();
                onDeleteClose();
              }}
            >
              Delete Wallet
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default WalletSettingsPanel;
