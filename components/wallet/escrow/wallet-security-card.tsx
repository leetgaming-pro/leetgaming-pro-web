"use client";

/**
 * Wallet Security Card Component
 * Displays MPC wallet security status with key shard visualization,
 * security score, and recovery options
 * Features award-winning LeetGaming branding
 */

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Progress,
  Tooltip,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { cn } from "@nextui-org/react";
import type {
  CustodialWalletStatus,
  MPCKeyShard,
  SecurityFactor,
} from "@/types/replay-api/escrow-wallet.types";
import { getSecurityScoreColor } from "@/types/replay-api/escrow-wallet.types";

interface WalletSecurityCardProps {
  wallet: CustodialWalletStatus;
  onSetupRecovery?: () => void;
  onRotateKeys?: () => void;
  onViewActivity?: () => void;
  compact?: boolean;
  className?: string;
}

// Shard holder icons and colors
const SHARD_CONFIG: Record<
  string,
  { icon: string; color: string; label: string }
> = {
  user: {
    icon: "solar:user-bold-duotone",
    color: "bg-gradient-to-br from-[#DCFF37] to-[#DCFF37]/70",
    label: "Your Device",
  },
  platform: {
    icon: "solar:server-bold-duotone",
    color: "bg-gradient-to-br from-[#34445C] to-[#34445C]/70",
    label: "LeetGaming Secure",
  },
  recovery_service: {
    icon: "solar:shield-check-bold-duotone",
    color: "bg-gradient-to-br from-[#FF4654] to-[#FF4654]/70",
    label: "Recovery Service",
  },
  hardware_device: {
    icon: "solar:usb-bold-duotone",
    color: "bg-gradient-to-br from-[#FFC700] to-[#FFC700]/70",
    label: "Hardware Key",
  },
};

// Security factor icons
const FACTOR_ICONS: Record<string, string> = {
  mpc_enabled: "solar:key-minimalistic-square-2-bold",
  biometric_auth: "solar:fingerprint-bold",
  two_factor_auth: "solar:smartphone-bold",
  recovery_setup: "solar:shield-user-bold",
  hardware_key: "solar:usb-bold",
  email_verified: "solar:letter-bold",
  kyc_verified: "solar:verified-check-bold",
  withdrawal_whitelist: "solar:checklist-bold",
  session_management: "solar:monitor-smartphone-bold",
  ip_whitelist: "solar:global-bold",
};

// Animated Key Shard Visualization
function KeyShardVisualization({
  shards,
  threshold,
  totalShards,
}: {
  shards: MPCKeyShard[];
  threshold: number;
  totalShards: number;
}) {
  return (
    <div className="relative flex items-center justify-center py-6">
      {/* Central Key Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="absolute z-10 w-16 h-16 rounded-full bg-gradient-to-br from-[#DCFF37] to-[#34445C] flex items-center justify-center shadow-lg shadow-[#DCFF37]/30"
      >
        <Icon
          icon="solar:key-bold"
          className="w-8 h-8 text-[#34445C] dark:text-white"
        />
      </motion.div>

      {/* Orbital Shards */}
      <div className="relative w-48 h-48">
        {shards.map((shard, index) => {
          const angle = (index * 360) / shards.length - 90;
          const radius = 80;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;
          const config = SHARD_CONFIG[shard.holder] || SHARD_CONFIG.user;

          return (
            <motion.div
              key={shard.shard_id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
              className="absolute"
              style={{
                left: `calc(50% + ${x}px - 24px)`,
                top: `calc(50% + ${y}px - 24px)`,
              }}
            >
              <Tooltip
                content={
                  <div className="p-2">
                    <p className="font-semibold">{config.label}</p>
                    <p className="text-xs text-default-500">
                      {shard.is_available ? "Available" : "Unavailable"}
                    </p>
                    {shard.last_verified_at && (
                      <p className="text-xs text-default-400">
                        Verified:{" "}
                        {new Date(shard.last_verified_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                }
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-shadow",
                    config.color,
                    shard.is_available
                      ? "shadow-lg ring-2 ring-white/50"
                      : "opacity-50 grayscale",
                  )}
                >
                  <Icon icon={config.icon} className="w-6 h-6 text-white" />
                </motion.div>
              </Tooltip>

              {/* Connection Line to Center */}
              <svg
                className="absolute pointer-events-none"
                style={{
                  left: "24px",
                  top: "24px",
                  width: `${Math.abs(x)}px`,
                  height: `${Math.abs(y)}px`,
                  transform: `translate(${x < 0 ? x : 0}px, ${y < 0 ? y : 0}px)`,
                }}
              >
                <motion.line
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  x1={x < 0 ? Math.abs(x) : 0}
                  y1={y < 0 ? Math.abs(y) : 0}
                  x2={x < 0 ? 0 : Math.abs(x)}
                  y2={y < 0 ? 0 : Math.abs(y)}
                  stroke={shard.is_available ? "#DCFF37" : "#666"}
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity={0.5}
                />
              </svg>
            </motion.div>
          );
        })}
      </div>

      {/* Threshold Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
      >
        <Chip
          size="sm"
          variant="flat"
          color="secondary"
          className="rounded-none"
          startContent={<Icon icon="solar:shield-check-bold" width={14} />}
        >
          {threshold} of {totalShards} required
        </Chip>
      </motion.div>
    </div>
  );
}

// Security Score Ring
function SecurityScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = getSecurityScoreColor(score);
  const colorClass = {
    danger: "#FF4654",
    warning: "#FFC700",
    success: "#DCFF37",
  }[color];

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90">
        {/* Background Circle */}
        <circle
          cx="56"
          cy="56"
          r="45"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-default-200"
        />
        {/* Progress Circle */}
        <motion.circle
          cx="56"
          cy="56"
          r="45"
          stroke={colorClass}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold text-[#34445C] dark:text-white"
        >
          {score}
        </motion.span>
        <span className="text-xs text-default-500">Security</span>
      </div>
    </div>
  );
}

// Security Factor Item
function SecurityFactorItem({ factor }: { factor: SecurityFactor }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg transition-colors",
        factor.enabled
          ? "bg-[#DCFF37]/10 dark:bg-[#DCFF37]/5"
          : "bg-default-100/50",
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          factor.enabled
            ? "bg-[#DCFF37]/20 text-[#34445C] dark:text-[#DCFF37]"
            : "bg-default-200 text-default-400",
        )}
      >
        <Icon
          icon={FACTOR_ICONS[factor.factor] || "solar:shield-bold"}
          width={18}
        />
      </div>
      <div className="flex-1">
        <p
          className={cn(
            "text-sm font-medium",
            factor.enabled
              ? "text-[#34445C] dark:text-white"
              : "text-default-500",
          )}
        >
          {factor.description}
        </p>
        {factor.recommendation && !factor.enabled && (
          <p className="text-xs text-warning-500">{factor.recommendation}</p>
        )}
      </div>
      <Icon
        icon={
          factor.enabled ? "solar:check-circle-bold" : "solar:close-circle-bold"
        }
        className={factor.enabled ? "text-success" : "text-default-300"}
        width={20}
      />
    </motion.div>
  );
}

export function WalletSecurityCard({
  wallet,
  onSetupRecovery,
  onRotateKeys,
  onViewActivity,
  compact = false,
  className,
}: WalletSecurityCardProps) {
  const [showAllFactors, setShowAllFactors] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const mpcConfig = wallet.mpc_config;
  const enabledFactors = wallet.security_factors.filter(
    (f) => f.enabled,
  ).length;
  const totalFactors = wallet.security_factors.length;

  // Wallet type badge with enhanced branding
  const walletTypeBadge = {
    full_custodial: {
      label: "Leet Wallet",
      icon: "solar:wallet-bold",
      color: "primary" as const,
      description: "Platform-secured",
    },
    semi_custodial: {
      label: "Leet Wallet Pro",
      icon: "solar:shield-keyhole-bold",
      color: "secondary" as const,
      description: "MPC secured",
    },
    non_custodial: {
      label: "DeFi Wallet",
      icon: "solar:key-bold",
      color: "success" as const,
      description: "Self-custody",
    },
  }[wallet.wallet_type];

  return (
    <>
      <Card
        className={cn(
          "bg-gradient-to-br from-[#34445C]/5 to-[#DCFF37]/5 dark:from-[#DCFF37]/5 dark:to-[#34445C]/10",
          "border-2 border-[#34445C]/20 dark:border-[#DCFF37]/20 rounded-none overflow-hidden",
          className,
        )}
        style={{
          clipPath: compact
            ? "none"
            : "polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))",
        }}
      >
        {/* Header */}
        <CardHeader className="flex items-center justify-between bg-[#34445C]/5 dark:bg-[#DCFF37]/5 pb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Icon
                icon="solar:shield-keyhole-bold-duotone"
                width={24}
                className="text-[#FF4654] dark:text-[#DCFF37]"
              />
            </motion.div>
            <span className="font-semibold text-[#34445C] dark:text-white">
              Wallet Security
            </span>
          </div>
          <Chip
            size="sm"
            variant="flat"
            color={walletTypeBadge.color}
            startContent={<Icon icon={walletTypeBadge.icon} width={14} />}
            className="rounded-none"
          >
            {walletTypeBadge.label}
          </Chip>
        </CardHeader>

        <CardBody className="gap-4">
          {/* Security Score & MPC Visualization */}
          <div className="flex items-center justify-between">
            <SecurityScoreRing score={wallet.security_score} />

            {/* Quick Stats */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:check-circle-bold"
                  className="text-success w-4 h-4"
                />
                <span className="text-sm text-[#34445C] dark:text-white">
                  {enabledFactors}/{totalFactors} factors enabled
                </span>
              </div>
              {mpcConfig && (
                <div className="flex items-center gap-2">
                  <Icon
                    icon="solar:key-bold"
                    className="text-[#DCFF37] w-4 h-4"
                  />
                  <span className="text-sm text-[#34445C] dark:text-white">
                    {mpcConfig.threshold}/{mpcConfig.total_shards} MPC threshold
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Icon
                  icon={
                    wallet.kyc_level !== "none"
                      ? "solar:verified-check-bold"
                      : "solar:info-circle-bold"
                  }
                  className={
                    wallet.kyc_level !== "none"
                      ? "text-success w-4 h-4"
                      : "text-warning w-4 h-4"
                  }
                />
                <span className="text-sm text-[#34445C] dark:text-white capitalize">
                  KYC: {wallet.kyc_level}
                </span>
              </div>
            </div>
          </div>

          {/* MPC Key Shards - Only for Leet Wallet Pro */}
          {mpcConfig && !compact && (
            <>
              <Divider />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#34445C] dark:text-white">
                    MPC Key Shards
                  </span>
                  <Button
                    size="sm"
                    variant="light"
                    className="text-xs"
                    onPress={onOpen}
                  >
                    Learn More
                  </Button>
                </div>
                <KeyShardVisualization
                  shards={mpcConfig.shards}
                  threshold={mpcConfig.threshold}
                  totalShards={mpcConfig.total_shards}
                />
              </div>
            </>
          )}

          {/* Security Factors */}
          <Divider />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[#34445C] dark:text-white">
                Security Factors
              </span>
              <Button
                size="sm"
                variant="light"
                className="text-xs"
                onPress={() => setShowAllFactors(!showAllFactors)}
                endContent={
                  <Icon
                    icon={
                      showAllFactors
                        ? "solar:alt-arrow-up-bold"
                        : "solar:alt-arrow-down-bold"
                    }
                    width={14}
                  />
                }
              >
                {showAllFactors ? "Show Less" : "Show All"}
              </Button>
            </div>

            <div className="space-y-2">
              {wallet.security_factors
                .slice(0, showAllFactors ? undefined : 3)
                .map((factor) => (
                  <SecurityFactorItem key={factor.factor} factor={factor} />
                ))}
            </div>
          </div>

          {/* Withdrawal Limits */}
          <Divider />
          <div className="space-y-2">
            <span className="text-sm font-semibold text-[#34445C] dark:text-white">
              Daily Withdrawal Limit
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xs text-default-500">
                ${wallet.daily_withdrawal_used.dollars.toFixed(2)} / $
                {wallet.daily_withdrawal_limit.dollars.toFixed(2)}
              </span>
              <span className="text-xs text-default-500">
                {Math.round(
                  (wallet.daily_withdrawal_used.dollars /
                    wallet.daily_withdrawal_limit.dollars) *
                    100,
                )}
                %
              </span>
            </div>
            <Progress
              size="sm"
              value={
                (wallet.daily_withdrawal_used.dollars /
                  wallet.daily_withdrawal_limit.dollars) *
                100
              }
              color={
                wallet.daily_withdrawal_used.dollars /
                  wallet.daily_withdrawal_limit.dollars >
                0.8
                  ? "danger"
                  : "success"
              }
              classNames={{
                track: "rounded-none bg-default-200",
                indicator: "rounded-none",
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {!wallet.mpc_config?.recovery_enabled && (
              <Button
                fullWidth
                size="sm"
                variant="flat"
                color="warning"
                className="rounded-none"
                startContent={<Icon icon="solar:shield-plus-bold" width={16} />}
                onPress={onSetupRecovery}
              >
                Setup Recovery
              </Button>
            )}
            {wallet.mpc_config && (
              <Button
                fullWidth
                size="sm"
                variant="flat"
                className="rounded-none"
                startContent={<Icon icon="solar:refresh-bold" width={16} />}
                onPress={onRotateKeys}
              >
                Rotate Keys
              </Button>
            )}
            <Button
              fullWidth
              size="sm"
              variant="bordered"
              className="rounded-none border-[#34445C]/30 dark:border-[#DCFF37]/30"
              startContent={<Icon icon="solar:history-bold" width={16} />}
              onPress={onViewActivity}
            >
              Activity
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* MPC Explainer Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent className="rounded-none">
          <ModalHeader className="flex items-center gap-2 bg-[#34445C]/5 dark:bg-[#DCFF37]/5">
            <Icon
              icon="solar:key-bold-duotone"
              className="text-[#DCFF37]"
              width={24}
            />
            <span>Multi-Party Computation (MPC) Security</span>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-4">
              <p className="text-default-600">
                Your wallet is protected by <strong>MPC technology</strong>,
                which splits your private key into multiple encrypted shards
                distributed across different secure locations.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <Card className="rounded-none bg-[#DCFF37]/10 dark:bg-[#DCFF37]/5">
                  <CardBody className="gap-2">
                    <Icon
                      icon="solar:shield-check-bold"
                      className="text-success"
                      width={24}
                    />
                    <p className="font-semibold text-sm">
                      No Single Point of Failure
                    </p>
                    <p className="text-xs text-default-500">
                      Even if one shard is compromised, your funds remain secure
                    </p>
                  </CardBody>
                </Card>
                <Card className="rounded-none bg-[#DCFF37]/10 dark:bg-[#DCFF37]/5">
                  <CardBody className="gap-2">
                    <Icon
                      icon="solar:lock-keyhole-bold"
                      className="text-success"
                      width={24}
                    />
                    <p className="font-semibold text-sm">Threshold Signing</p>
                    <p className="text-xs text-default-500">
                      Transactions require {mpcConfig?.threshold} of{" "}
                      {mpcConfig?.total_shards} shards to sign
                    </p>
                  </CardBody>
                </Card>
              </div>

              <Divider />

              <div>
                <p className="font-semibold mb-2">Your Key Shards:</p>
                <div className="space-y-2">
                  {mpcConfig?.shards.map((shard) => {
                    const config =
                      SHARD_CONFIG[shard.holder] || SHARD_CONFIG.user;
                    return (
                      <div
                        key={shard.shard_id}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            config.color,
                          )}
                        >
                          <Icon
                            icon={config.icon}
                            className="text-white"
                            width={16}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{config.label}</p>
                          <p className="text-xs text-default-500">
                            {shard.backup_method
                              ? `Backup: ${shard.backup_method}`
                              : "No backup configured"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Close
            </Button>
            <Button
              color="primary"
              className="rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-white dark:text-[#34445C]"
              startContent={<Icon icon="solar:settings-bold" width={16} />}
            >
              Manage Security
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default WalletSecurityCard;
