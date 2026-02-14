"use client";

/**
 * Wallet Type Switcher
 * Allows users to view, compare, and upgrade their wallet custody model
 * Supports: Leet Wallet → Leet Wallet Pro (MPC) → DeFi Wallet
 */

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Progress,
  Checkbox,
  Button,
} from "@nextui-org/react";
import { EsportsButton } from "@/components/ui/esports-button";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@nextui-org/react";
import type { CustodialWalletType } from "@/types/replay-api/escrow-wallet.types";

interface WalletTypeInfo {
  type: CustodialWalletType;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  features: { name: string; included: boolean; highlight?: boolean }[];
  requirements: string[];
  upgradeTime: string;
  securityLevel: number;
}

interface WalletTypeSwitcherProps {
  currentType: CustodialWalletType;
  kycLevel: "none" | "basic" | "verified" | "premium";
  hasExternalWallet: boolean;
  onUpgrade: (newType: CustodialWalletType) => Promise<void>;
  onConnectExternalWallet?: () => void;
}

const WALLET_TYPES: WalletTypeInfo[] = [
  {
    type: "full_custodial",
    name: "Leet Wallet",
    shortName: "Leet",
    description:
      "The easiest way to start competing. Platform-secured with instant transactions and zero gas fees.",
    icon: "solar:wallet-bold",
    color: "primary",
    securityLevel: 70,
    upgradeTime: "Instant",
    features: [
      { name: "Password recovery", included: true, highlight: true },
      { name: "Instant transactions", included: true, highlight: true },
      { name: "Zero gas fees", included: true, highlight: true },
      { name: "Fiat on/off ramp", included: true },
      { name: "Auto prize claiming", included: true },
      { name: "MPC threshold signing", included: false },
      { name: "Hardware wallet support", included: false },
      { name: "Full key control", included: false },
      { name: "External wallet connection", included: false },
    ],
    requirements: ["Email verified", "Phone verified (for withdrawals)"],
  },
  {
    type: "semi_custodial",
    name: "Leet Wallet Pro",
    shortName: "Pro",
    description:
      "Tournament-grade security with MPC technology. Your keys, your control, our protection.",
    icon: "solar:shield-keyhole-bold",
    color: "secondary",
    securityLevel: 92,
    upgradeTime: "~2 minutes",
    features: [
      { name: "Social recovery", included: true, highlight: true },
      { name: "Instant transactions", included: true },
      { name: "Zero gas fees", included: true },
      { name: "Fiat on/off ramp", included: true },
      { name: "Auto prize claiming", included: true },
      { name: "MPC threshold signing", included: true, highlight: true },
      { name: "Hardware wallet support", included: true, highlight: true },
      { name: "Full key control", included: false },
      { name: "External wallet connection", included: false },
    ],
    requirements: [
      "KYC verified (Basic+)",
      "Trusted device registered",
      "Recovery contacts (recommended)",
    ],
  },
  {
    type: "non_custodial",
    name: "DeFi Wallet",
    shortName: "DeFi",
    description:
      "True ownership for crypto natives. Connect MetaMask, Phantom, or Ledger for full control.",
    icon: "solar:key-bold",
    color: "success",
    securityLevel: 98,
    upgradeTime: "~1 minute",
    features: [
      { name: "Social recovery", included: false },
      { name: "Instant transactions", included: false },
      { name: "Zero gas fees", included: false },
      { name: "Fiat on/off ramp", included: true },
      { name: "Auto prize claiming", included: false },
      { name: "MPC threshold signing", included: false },
      { name: "Hardware wallet support", included: true, highlight: true },
      { name: "Full key control", included: true, highlight: true },
      { name: "External wallet connection", included: true, highlight: true },
    ],
    requirements: [
      "External wallet (MetaMask, Phantom, Ledger)",
      "Seed phrase securely backed up",
      "Understanding of self-custody",
    ],
  },
];

// Feature comparison row
function FeatureRow({
  feature,
  types,
}: {
  feature: string;
  types: { included: boolean; highlight?: boolean }[];
}) {
  return (
    <div className="flex items-center py-2 border-b border-default-100">
      <span className="flex-1 text-sm text-default-600">{feature}</span>
      {types.map((type, index) => (
        <div key={index} className="w-24 text-center">
          {type.included ? (
            <Icon
              icon="solar:check-circle-bold"
              className={cn(
                "mx-auto",
                type.highlight ? "text-[#DCFF37]" : "text-success",
              )}
              width={20}
            />
          ) : (
            <Icon
              icon="solar:close-circle-bold"
              className="text-default-300 mx-auto"
              width={20}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Upgrade step component
function UpgradeStep({
  step,
  title,
  description,
  isComplete,
  isActive,
}: {
  step: number;
  title: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
          isComplete
            ? "bg-success text-white"
            : isActive
              ? "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-white dark:text-[#34445C]"
              : "bg-default-200 text-default-500",
        )}
      >
        {isComplete ? <Icon icon="solar:check-bold" width={16} /> : step}
      </div>
      <div className="flex-1">
        <p
          className={cn(
            "font-medium",
            isActive ? "text-[#34445C] dark:text-white" : "text-default-500",
          )}
        >
          {title}
        </p>
        <p className="text-xs text-default-400">{description}</p>
      </div>
    </div>
  );
}

export function WalletTypeSwitcher({
  currentType,
  kycLevel,
  hasExternalWallet,
  onUpgrade,
  onConnectExternalWallet,
}: WalletTypeSwitcherProps) {
  const [selectedType, setSelectedType] = useState<CustodialWalletType | null>(
    null,
  );
  const [upgradeStep, setUpgradeStep] = useState(0);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const currentTypeInfo =
    WALLET_TYPES.find((t) => t.type === currentType) ?? WALLET_TYPES[0];
  const selectedTypeInfo = selectedType
    ? WALLET_TYPES.find((t) => t.type === selectedType)
    : null;

  const canUpgradeTo = (
    type: CustodialWalletType,
  ): { allowed: boolean; reason?: string } => {
    if (type === currentType) {
      return { allowed: false, reason: "Already using this wallet type" };
    }

    // Check KYC requirements
    if (type === "semi_custodial" && kycLevel === "none") {
      return { allowed: false, reason: "Basic KYC required" };
    }

    // Check external wallet for DeFi wallet
    if (type === "non_custodial" && !hasExternalWallet) {
      return { allowed: false, reason: "Connect external wallet first" };
    }

    // Prevent downgrade from DeFi wallet to Leet wallet (different flow)
    if (currentType === "non_custodial" && type !== "non_custodial") {
      return { allowed: false, reason: "Cannot downgrade from self-custody" };
    }

    return { allowed: true };
  };

  const handleSelectUpgrade = (type: CustodialWalletType) => {
    const check = canUpgradeTo(type);
    if (check.allowed) {
      setSelectedType(type);
      setUpgradeStep(0);
      setAgreedToTerms(false);
      onOpen();
    }
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedType) return;

    setIsUpgrading(true);
    try {
      // Simulate upgrade steps
      setUpgradeStep(1);
      await new Promise((r) => setTimeout(r, 1000));
      setUpgradeStep(2);
      await new Promise((r) => setTimeout(r, 1500));
      setUpgradeStep(3);

      await onUpgrade(selectedType);

      setUpgradeStep(4);
      await new Promise((r) => setTimeout(r, 500));

      onClose();
    } catch (error) {
      console.error("Upgrade failed:", error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const upgradeSteps =
    selectedType === "semi_custodial"
      ? [
          { title: "Verify Identity", description: "Confirm your KYC status" },
          {
            title: "Generate Key Shards",
            description: "Creating MPC key distribution",
          },
          {
            title: "Secure Device Shard",
            description: "Storing your shard securely",
          },
          { title: "Complete", description: "Your MPC wallet is ready" },
        ]
      : [
          { title: "Connect Wallet", description: "Link your external wallet" },
          {
            title: "Verify Ownership",
            description: "Sign a message to prove ownership",
          },
          {
            title: "Migrate Assets",
            description: "Transfer balance to your wallet",
          },
          { title: "Complete", description: "Self-custody activated" },
        ];

  return (
    <div className="space-y-6">
      {/* Current Wallet Status */}
      <Card className="rounded-none border-2 border-[#34445C]/20 dark:border-[#DCFF37]/20">
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] flex items-center justify-center"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
                }}
              >
                <Icon
                  icon={currentTypeInfo.icon}
                  className="text-white dark:text-[#34445C]"
                  width={28}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#34445C] dark:text-white">
                    {currentTypeInfo.name}
                  </h2>
                  <Chip
                    size="sm"
                    color="success"
                    variant="flat"
                    className="rounded-none"
                  >
                    Active
                  </Chip>
                </div>
                <p className="text-default-500 text-sm">
                  {currentTypeInfo.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-default-500">Security Level</p>
              <p className="text-2xl font-bold text-[#34445C] dark:text-white">
                {currentTypeInfo.securityLevel}%
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Wallet Types Comparison */}
      <Card className="rounded-none">
        <CardHeader>
          <span className="font-semibold text-[#34445C] dark:text-white">
            Compare Wallet Types
          </span>
        </CardHeader>
        <CardBody className="p-0">
          {/* Header Row */}
          <div className="flex items-center p-4 bg-[#34445C]/5 dark:bg-[#DCFF37]/5 border-b border-default-200">
            <span className="flex-1 font-medium text-[#34445C] dark:text-white">
              Features
            </span>
            {WALLET_TYPES.map((type) => (
              <div key={type.type} className="w-24 text-center">
                <Chip
                  size="sm"
                  color={type.type === currentType ? "success" : "default"}
                  variant={type.type === currentType ? "solid" : "flat"}
                  className="rounded-none"
                >
                  {type.shortName}
                </Chip>
              </div>
            ))}
          </div>

          {/* Feature Rows */}
          <div className="p-4">
            {WALLET_TYPES[0].features.map((feature, index) => (
              <FeatureRow
                key={feature.name}
                feature={feature.name}
                types={WALLET_TYPES.map((t) => t.features[index])}
              />
            ))}
          </div>

          {/* Upgrade Buttons */}
          <div className="flex items-center p-4 border-t border-default-200">
            <span className="flex-1 text-sm font-medium text-default-500">
              Upgrade
            </span>
            {WALLET_TYPES.map((type) => {
              const check = canUpgradeTo(type.type);
              return (
                <div key={type.type} className="w-24 text-center">
                  {type.type === currentType ? (
                    <span className="text-xs text-success">Current</span>
                  ) : (
                    <Button
                      size="sm"
                      variant={check.allowed ? "flat" : "light"}
                      className={cn(
                        "rounded-none text-xs",
                        check.allowed && "bg-[#34445C]/10 dark:bg-[#DCFF37]/10",
                      )}
                      isDisabled={!check.allowed}
                      onPress={() => handleSelectUpgrade(type.type)}
                    >
                      {check.allowed ? "Upgrade" : "N/A"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Upgrade Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {WALLET_TYPES.map((type) => {
          const check = canUpgradeTo(type.type);
          const isCurrent = type.type === currentType;

          return (
            <Card
              key={type.type}
              className={cn(
                "rounded-none border-2 transition-all",
                isCurrent
                  ? "border-success/50 bg-success/5"
                  : check.allowed
                    ? "border-[#34445C]/20 dark:border-[#DCFF37]/20 hover:border-[#34445C]/40 dark:hover:border-[#DCFF37]/40 cursor-pointer"
                    : "border-default-200 opacity-60",
              )}
              isPressable={!isCurrent && check.allowed}
              onPress={() => !isCurrent && handleSelectUpgrade(type.type)}
            >
              <CardBody className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Icon
                    icon={type.icon}
                    width={24}
                    className="text-[#FF4654] dark:text-[#DCFF37]"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-[#34445C] dark:text-white">
                      {type.name}
                    </p>
                    {isCurrent && (
                      <Chip
                        size="sm"
                        color="success"
                        variant="flat"
                        className="rounded-none mt-1"
                      >
                        Current
                      </Chip>
                    )}
                  </div>
                </div>
                <p className="text-xs text-default-500 mb-3">
                  {type.description}
                </p>
                <Divider className="my-3" />
                <p className="text-xs font-medium text-default-600 mb-2">
                  Requirements:
                </p>
                <ul className="space-y-1">
                  {type.requirements.map((req, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-xs text-default-500"
                    >
                      <Icon icon="solar:check-circle-linear" width={14} />
                      {req}
                    </li>
                  ))}
                </ul>
                {!isCurrent && !check.allowed && check.reason && (
                  <div className="mt-3 p-2 rounded bg-warning/10 text-xs text-warning">
                    {check.reason}
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Connect External Wallet Button */}
      {!hasExternalWallet && (
        <Card className="rounded-none border-2 border-dashed border-[#34445C]/30 dark:border-[#DCFF37]/30">
          <CardBody className="p-6 text-center">
            <Icon
              icon="solar:wallet-bold-duotone"
              width={48}
              className="mx-auto text-default-300 mb-4"
            />
            <h3 className="font-semibold text-[#34445C] dark:text-white mb-2">
              Connect External Wallet
            </h3>
            <p className="text-sm text-default-500 mb-4">
              To upgrade to Self-Custody, connect your external wallet
              (MetaMask, Phantom, etc.)
            </p>
            <EsportsButton
              variant="primary"
              glow
              startContent={<Icon icon="solar:plug-circle-bold" width={18} />}
              onClick={onConnectExternalWallet}
            >
              Connect Wallet
            </EsportsButton>
          </CardBody>
        </Card>
      )}

      {/* Upgrade Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        isDismissable={!isUpgrading}
      >
        <ModalContent className="rounded-none">
          {selectedTypeInfo && (
            <>
              <ModalHeader className="flex items-center gap-3 bg-[#34445C]/5 dark:bg-[#DCFF37]/5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] flex items-center justify-center">
                  <Icon
                    icon={selectedTypeInfo.icon}
                    className="text-white dark:text-[#34445C]"
                    width={20}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#34445C] dark:text-white">
                    Upgrade to {selectedTypeInfo.name}
                  </h3>
                  <p className="text-sm text-default-500">
                    {selectedTypeInfo.description}
                  </p>
                </div>
              </ModalHeader>

              <ModalBody className="py-6">
                <AnimatePresence mode="wait">
                  {!isUpgrading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {/* Benefits */}
                      <div>
                        <p className="text-sm font-medium text-[#34445C] dark:text-white mb-2">
                          What you&apos;ll get:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedTypeInfo.features
                            .filter((f) => f.included && f.highlight)
                            .map((feature) => (
                              <div
                                key={feature.name}
                                className="flex items-center gap-2 p-2 rounded bg-success/10"
                              >
                                <Icon
                                  icon="solar:check-circle-bold"
                                  className="text-success"
                                  width={16}
                                />
                                <span className="text-xs">{feature.name}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* What you'll lose (if any) */}
                      {currentTypeInfo.features.some(
                        (f, i) =>
                          f.included && !selectedTypeInfo.features[i].included,
                      ) && (
                        <div>
                          <p className="text-sm font-medium text-warning mb-2">
                            Features that will change:
                          </p>
                          <div className="space-y-1">
                            {currentTypeInfo.features
                              .filter(
                                (f, i) =>
                                  f.included &&
                                  !selectedTypeInfo.features[i].included,
                              )
                              .map((feature) => (
                                <div
                                  key={feature.name}
                                  className="flex items-center gap-2 text-xs text-warning"
                                >
                                  <Icon
                                    icon="solar:info-circle-bold"
                                    width={14}
                                  />
                                  {feature.name} will no longer be available
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Terms */}
                      <div className="p-4 rounded-lg bg-default-100">
                        <Checkbox
                          isSelected={agreedToTerms}
                          onValueChange={setAgreedToTerms}
                          classNames={{ wrapper: "rounded-none" }}
                        >
                          <span className="text-sm">
                            I understand the changes and agree to the{" "}
                            <a
                              href="/legal/terms"
                              className="text-[#FF4654] dark:text-[#DCFF37] underline"
                            >
                              Terms of Service
                            </a>
                          </span>
                        </Checkbox>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      {/* Progress */}
                      <div className="text-center mb-6">
                        <p className="font-semibold text-[#34445C] dark:text-white mb-2">
                          Upgrading your wallet...
                        </p>
                        <Progress
                          value={(upgradeStep / upgradeSteps.length) * 100}
                          classNames={{
                            track: "rounded-none",
                            indicator:
                              "rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]",
                          }}
                        />
                      </div>

                      {/* Steps */}
                      <div className="space-y-4">
                        {upgradeSteps.map((step, index) => (
                          <UpgradeStep
                            key={index}
                            step={index + 1}
                            title={step.title}
                            description={step.description}
                            isComplete={upgradeStep > index}
                            isActive={upgradeStep === index}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </ModalBody>

              <ModalFooter>
                {!isUpgrading && (
                  <>
                    <EsportsButton variant="ghost" onClick={onClose}>
                      Cancel
                    </EsportsButton>
                    <EsportsButton
                      variant="primary"
                      glow
                      disabled={!agreedToTerms}
                      startContent={
                        <Icon icon="solar:arrow-up-bold" width={18} />
                      }
                      onClick={handleConfirmUpgrade}
                    >
                      Upgrade Now
                    </EsportsButton>
                  </>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default WalletTypeSwitcher;
