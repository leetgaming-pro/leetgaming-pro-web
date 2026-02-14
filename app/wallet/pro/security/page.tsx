"use client";

/**
 * Pro Wallet - Security Center Page
 * Full security management dashboard with MPC visualization, device management, and audit logs
 */

import React from "react";
import { useRequireAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/toast/toast-provider";
import { SecurityCenter } from "@/components/wallet/security/security-center";
import { EsportsButton } from "@/components/ui/esports-button";
import { Icon } from "@iconify/react";
import Link from "next/link";
import type { CustodialWalletStatus } from "@/types/replay-api/escrow-wallet.types";
import type { ChainID } from "@/types/replay-api/blockchain.types";

// Placeholder wallet data until Wallet Security API is implemented.
// Will be replaced with real data from GET /api/wallet/security-status.
const mockWallet: CustodialWalletStatus = {
  wallet_id: "wallet-123",
  user_id: "user-456",
  wallet_type: "semi_custodial",
  addresses: [
    {
      chain_id: "eip155:137" as ChainID,
      address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      is_smart_wallet: false,
    },
    {
      chain_id: "solana:mainnet" as ChainID,
      address: "DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy",
      is_smart_wallet: false,
    },
  ],
  mpc_config: {
    wallet_id: "wallet-123",
    threshold: 2,
    total_shards: 3,
    shards: [
      {
        shard_id: "shard-1",
        holder: "user",
        holder_name: "User Device",
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        is_available: true,
        backup_method: "local",
        security_level: "high",
      },
      {
        shard_id: "shard-2",
        holder: "platform",
        holder_name: "LeetGaming HSM",
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        is_available: true,
        security_level: "high",
      },
      {
        shard_id: "shard-3",
        holder: "recovery_service",
        holder_name: "Recovery Contact",
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        is_available: true,
        backup_method: "social_recovery",
        security_level: "medium",
      },
    ],
    signing_protocol: "gg20",
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    recovery_enabled: true,
    recovery_contacts: [
      {
        contact_id: "contact-1",
        name: "John Doe",
        email_masked: "j***@example.com",
        shard_holder: true,
        verified_at: new Date(Date.now() - 86400000 * 25).toISOString(),
      },
    ],
  },
  security_score: 82,
  security_factors: [
    {
      factor: "password",
      enabled: true,
      weight: 20,
      description: "Strong password enabled",
    },
    {
      factor: "email_verified",
      enabled: true,
      weight: 15,
      description: "Email verified",
    },
    {
      factor: "2fa",
      enabled: true,
      weight: 25,
      description: "Two-factor authentication enabled",
    },
    {
      factor: "mpc_shards",
      enabled: true,
      weight: 30,
      description: "MPC key shards configured",
    },
    {
      factor: "passkey",
      enabled: false,
      weight: 10,
      description: "Passkey not configured",
      recommendation: "Add a passkey for passwordless authentication",
    },
  ],
  daily_withdrawal_limit: {
    cents: 1000000,
    dollars: 10000,
  },
  daily_withdrawal_used: {
    cents: 50000,
    dollars: 500,
  },
  single_tx_limit: {
    cents: 500000,
    dollars: 5000,
  },
  features_enabled: [
    "match_escrow",
    "tournament_entry",
    "prize_claim",
    "p2p_transfer",
    "fiat_onramp",
  ],
  kyc_level: "verified",
  kyc_expires_at: new Date(Date.now() + 86400000 * 365).toISOString(),
  created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
  updated_at: new Date().toISOString(),
};

export default function SecurityPage() {
  const { isAuthenticated, isLoading: isAuthLoading, isRedirecting } = useRequireAuth({
    callbackUrl: '/wallet/pro/security'
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-default-500 mb-6">
        <Link
          href="/wallet/pro"
          className="hover:text-[#FF4654] dark:hover:text-[#DCFF37] transition-colors"
        >
          Pro Wallet
        </Link>
        <Icon icon="solar:alt-arrow-right-linear" width={16} />
        <span className="text-[#34445C] dark:text-white">Security Center</span>
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

      {/* Security Center Component */}
      <SecurityCenter
        wallet={mockWallet}
        onRevokeDevice={(_deviceId: string) => {
          showToast("Device revocation coming soon", "info");
        }}
        onRevokeSession={(_sessionId: string) => {
          showToast("Session revocation coming soon", "info");
        }}
        onAddWithdrawalAddress={
          (_address: string, _label: string, _chainId: string) => {
            showToast("Withdrawal address management coming soon", "info");
          }
        }
        onRemoveWithdrawalAddress={(_address: string) => {
          showToast("Withdrawal address management coming soon", "info");
        }}
        onRotateKeys={() => {
          showToast("Key rotation is not yet available", "warning");
        }}
        onEmergencyFreeze={() => {
          showToast("Emergency freeze is not yet available", "warning");
        }}
        onUpdateSecuritySettings={(_settings) => {
          showToast("Security settings update coming soon", "info");
        }}
      />
    </div>
  );
}
