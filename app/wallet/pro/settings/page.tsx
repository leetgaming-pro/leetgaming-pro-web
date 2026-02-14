"use client";

/**
 * Pro Wallet - Settings Page
 * Comprehensive wallet configuration, preferences, and advanced options
 */

import React from "react";
import { useRequireAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/toast/toast-provider";
import { WalletSettingsPanel } from "@/components/wallet/settings/wallet-settings-panel";
import { EsportsButton } from "@/components/ui/esports-button";
import { Icon } from "@iconify/react";
import Link from "next/link";

// Default settings
const defaultSettings = {
  // General
  defaultChain: "polygon" as const,
  currency: "usd",
  language: "en",
  timezone: "America/Sao_Paulo",

  // Transaction Settings
  autoClaimPrizes: true,
  autoCompoundEarnings: false,
  defaultGasPreset: "standard" as const,
  maxSlippage: 0.5,

  // Security
  requireMPCSignForWithdrawals: true,
  withdrawalDelay: 1,
  dailyWithdrawalLimit: 5000,
  weeklyWithdrawalLimit: 20000,

  // Notifications
  notifyOnDeposit: true,
  notifyOnWithdrawal: true,
  notifyOnEscrowLock: true,
  notifyOnMatchResult: true,
  notifyOnSecurityEvent: true,

  // Privacy
  hideBalances: false,
  hideTransactionHistory: false,
  publicProfile: true,

  // Advanced
  customRPC: {},
  gasBuffer: 10,
  nonceOverride: false,
  testMode: false,
};

export default function SettingsPage() {
  const { isAuthenticated, isLoading: isAuthLoading, isRedirecting } = useRequireAuth({
    callbackUrl: '/wallet/pro/settings'
  });
  const { showToast } = useToast();

  if (isAuthLoading || isRedirecting || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-default-500 mb-6">
        <Link
          href="/wallet/pro"
          className="hover:text-[#FF4654] dark:hover:text-[#DCFF37] transition-colors"
        >
          Pro Wallet
        </Link>
        <Icon icon="solar:alt-arrow-right-linear" width={16} />
        <span className="text-[#34445C] dark:text-white">Settings</span>
      </div>

      {/* Back Button */}
      <div className="mb-6">
        <EsportsButton
          as={Link}
          href="/wallet/pro"
          variant="ghost"
          startContent={<Icon icon="solar:arrow-left-bold" width={16} />}
        >
          Back to Wallet
        </EsportsButton>
      </div>

      {/* Settings Panel Component */}
      <WalletSettingsPanel
        walletType="semi_custodial"
        settings={defaultSettings}
        kycLevel="verified"
        onSaveSettings={async (_settings) => {
          showToast("Wallet settings management coming soon", "info");
        }}
        onResetSettings={async () => {
          showToast("Settings reset coming soon", "info");
        }}
        onExportData={async () => {
          showToast("Data export coming soon", "info");
        }}
        onDeleteWallet={async () => {
          showToast("Wallet deletion is not yet available", "warning");
        }}
      />
    </div>
  );
}
