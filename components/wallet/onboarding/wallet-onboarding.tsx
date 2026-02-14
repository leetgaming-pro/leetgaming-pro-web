"use client";

/**
 * Wallet Onboarding Component
 * Multi-step wizard for MPC wallet setup with key shard distribution,
 * recovery contact configuration, and security factor setup
 */

import React, { useState, useCallback } from "react";
import {
  Card,
  CardBody,
  Input,
  Progress,
  Chip,
  Divider,
  Checkbox,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@nextui-org/react";
import type { MPCWalletConfig } from "@/types/replay-api/escrow-wallet.types";

// Local types for onboarding
type WalletType = "custodial" | "semi_custodial" | "non_custodial";
type MPCProtocol = MPCWalletConfig["signing_protocol"];
type ChainID = string;

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface WalletOnboardingProps {
  onComplete: (config: WalletSetupConfig) => void;
  onSkip?: () => void;
  defaultChains?: ChainID[];
  isOpen?: boolean;
  onClose?: () => void;
}

interface WalletSetupConfig {
  walletType: WalletType;
  mpcProtocol: MPCProtocol;
  enabledChains: ChainID[];
  recoveryEmail?: string;
  recoveryPhone?: string;
  backupEncryptionKey: boolean;
  enableTwoFactor: boolean;
  dailyLimit: number;
  agreedToTerms: boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Pro Wallet",
    description: "Your secure gateway to competitive gaming",
    icon: "solar:wallet-bold-duotone",
  },
  {
    id: "type",
    title: "Choose Wallet Type",
    description: "Select your preferred security model",
    icon: "solar:shield-keyhole-bold-duotone",
  },
  {
    id: "chains",
    title: "Select Blockchains",
    description: "Choose which chains to enable",
    icon: "solar:link-circle-bold-duotone",
  },
  {
    id: "recovery",
    title: "Recovery Setup",
    description: "Configure your backup options",
    icon: "solar:key-bold-duotone",
  },
  {
    id: "security",
    title: "Security Settings",
    description: "Set your protection preferences",
    icon: "solar:lock-bold-duotone",
  },
  {
    id: "complete",
    title: "All Set!",
    description: "Your wallet is ready",
    icon: "solar:check-circle-bold-duotone",
  },
];

const WALLET_TYPES: {
  type: WalletType;
  name: string;
  description: string;
  features: string[];
  recommended?: boolean;
  badge?: string;
}[] = [
  {
    type: "semi_custodial",
    name: "Leet Wallet Pro",
    description: "Tournament-grade security with MPC technology",
    features: [
      "🔐 Multi-party computation (2-of-3 signing)",
      "⚡ Zero gas fees on all transactions",
      "🛡️ No single point of failure",
      "🏆 Auto-claim tournament prizes",
    ],
    recommended: true,
    badge: "RECOMMENDED",
  },
  {
    type: "custodial",
    name: "Leet Wallet",
    description: "The easiest way to get started",
    features: [
      "✨ Simple password recovery",
      "⚡ Instant transactions",
      "💳 Fiat deposits & withdrawals",
      "🎮 Perfect for casual players",
    ],
  },
  {
    type: "non_custodial",
    name: "DeFi Wallet",
    description: "Full control for crypto natives",
    features: [
      "🔑 Your keys, your crypto",
      "🦊 Connect MetaMask or Phantom",
      "💎 Hardware wallet support",
      "⚠️ Advanced users only",
    ],
  },
];

const CHAIN_OPTIONS: {
  id: ChainID;
  name: string;
  icon: string;
  layer: "L1" | "L2" | "solana";
  popular?: boolean;
}[] = [
  {
    id: "evm:1",
    name: "Ethereum",
    icon: "cryptocurrency:eth",
    layer: "L1",
    popular: true,
  },
  {
    id: "evm:137",
    name: "Polygon",
    icon: "cryptocurrency:matic",
    layer: "L2",
    popular: true,
  },
  {
    id: "evm:8453",
    name: "Base",
    icon: "simple-icons:coinbase",
    layer: "L2",
    popular: true,
  },
  {
    id: "evm:42161",
    name: "Arbitrum",
    icon: "simple-icons:arbitrum",
    layer: "L2",
  },
  {
    id: "evm:10",
    name: "Optimism",
    icon: "simple-icons:optimism",
    layer: "L2",
  },
  {
    id: "solana:mainnet",
    name: "Solana",
    icon: "cryptocurrency:sol",
    layer: "solana",
    popular: true,
  },
];

// Animated Key Shard Generation Visual
function KeyShardGenerationVisual({
  isGenerating,
  progress,
}: {
  isGenerating: boolean;
  progress: number;
}) {
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Central Orb */}
      <motion.div
        className="absolute inset-1/4 rounded-full bg-gradient-to-br from-[#DCFF37] to-[#34445C]"
        animate={
          isGenerating
            ? {
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 0 20px rgba(220, 255, 55, 0.3)",
                  "0 0 40px rgba(220, 255, 55, 0.5)",
                  "0 0 20px rgba(220, 255, 55, 0.3)",
                ],
              }
            : {}
        }
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <Icon icon="solar:key-bold" className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      {/* Orbiting Shards */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-12 h-12"
          style={{
            top: "50%",
            left: "50%",
            marginTop: -24,
            marginLeft: -24,
          }}
          animate={
            isGenerating
              ? {
                  rotate: 360,
                  x: Math.cos((i * 2 * Math.PI) / 3) * 80,
                  y: Math.sin((i * 2 * Math.PI) / 3) * 80,
                  opacity: progress > (i + 1) * 33 ? 1 : 0.3,
                }
              : {
                  x: Math.cos((i * 2 * Math.PI) / 3) * 80,
                  y: Math.sin((i * 2 * Math.PI) / 3) * 80,
                  opacity: 0.3,
                }
          }
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <div
            className={cn(
              "w-full h-full rounded-lg flex items-center justify-center transition-colors",
              progress > (i + 1) * 33
                ? "bg-gradient-to-br from-[#FF4654] to-[#FFC700]"
                : "bg-default-200",
            )}
          >
            <Icon
              icon="solar:shield-keyhole-minimalistic-bold"
              className={cn(
                "w-6 h-6",
                progress > (i + 1) * 33 ? "text-white" : "text-default-400",
              )}
            />
          </div>
        </motion.div>
      ))}

      {/* Connecting Lines */}
      <svg className="absolute inset-0" viewBox="0 0 256 256">
        {[0, 1, 2].map((i) => {
          const angle = (i * 2 * Math.PI) / 3;
          const nextAngle = ((i + 1) * 2 * Math.PI) / 3;
          const x1 = 128 + Math.cos(angle) * 80;
          const y1 = 128 + Math.sin(angle) * 80;
          const x2 = 128 + Math.cos(nextAngle) * 80;
          const y2 = 128 + Math.sin(nextAngle) * 80;

          return (
            <motion.line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isGenerating ? "#DCFF37" : "#d4d4d4"}
              strokeWidth={2}
              strokeDasharray="4"
              animate={isGenerating ? { strokeDashoffset: [0, 8] } : {}}
              transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
            />
          );
        })}
      </svg>
    </div>
  );
}

export function WalletOnboarding({
  onComplete,
  onSkip,
  defaultChains = ["evm:137", "solana:mainnet"],
  isOpen = true,
  onClose,
}: WalletOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<WalletSetupConfig>({
    walletType: "semi_custodial",
    mpcProtocol: "cmp",
    enabledChains: defaultChains,
    backupEncryptionKey: false,
    enableTwoFactor: true,
    dailyLimit: 1000,
    agreedToTerms: false,
  });
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const [keyGenProgress, setKeyGenProgress] = useState(0);

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const _progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = useCallback(() => {
    if (currentStep === ONBOARDING_STEPS.length - 2) {
      // Start key generation before showing complete
      setIsGeneratingKeys(true);
      setKeyGenProgress(0);

      const interval = setInterval(() => {
        setKeyGenProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsGeneratingKeys(false);
            setCurrentStep((s) => s + 1);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
    } else if (currentStep === ONBOARDING_STEPS.length - 1) {
      onComplete(config);
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, config, onComplete]);

  const handleBack = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const updateConfig = useCallback((updates: Partial<WalletSetupConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const canProceed = useCallback(() => {
    switch (currentStepData.id) {
      case "type":
        return !!config.walletType;
      case "chains":
        return config.enabledChains.length > 0;
      case "recovery":
        return (
          config.walletType === "non_custodial" ||
          config.recoveryEmail ||
          config.recoveryPhone
        );
      case "security":
        return config.agreedToTerms;
      default:
        return true;
    }
  }, [currentStepData.id, config]);

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case "welcome":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div
              className="w-32 h-32 mx-auto bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] flex items-center justify-center"
              style={{
                clipPath:
                  "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
              }}
            >
              <Icon
                icon="solar:wallet-bold-duotone"
                className="w-16 h-16 text-white dark:text-[#34445C]"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#34445C] dark:text-white mb-2">
                Welcome to Pro Wallet
              </h2>
              <p className="text-default-500">
                Set up your secure gaming wallet in just a few steps
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {[
                { icon: "solar:shield-check-bold", label: "MPC Security" },
                { icon: "solar:link-circle-bold", label: "Multi-Chain" },
                { icon: "solar:bolt-bold", label: "Instant Escrow" },
              ].map((feature) => (
                <div key={feature.label} className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-[#34445C]/10 dark:bg-[#DCFF37]/10 flex items-center justify-center mb-2">
                    <Icon
                      icon={feature.icon}
                      className="w-6 h-6 text-[#FF4654] dark:text-[#DCFF37]"
                    />
                  </div>
                  <p className="text-xs text-default-500">{feature.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case "type":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {WALLET_TYPES.map((wallet) => (
              <Card
                key={wallet.type}
                isPressable
                onPress={() => updateConfig({ walletType: wallet.type })}
                className={cn(
                  "rounded-none border-2 transition-all",
                  config.walletType === wallet.type
                    ? "border-[#DCFF37] bg-[#DCFF37]/5"
                    : "border-default-200 hover:border-default-300",
                )}
              >
                <CardBody className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-[#34445C] dark:text-white">
                          {wallet.name}
                        </h4>
                        {wallet.recommended && (
                          <Chip
                            size="sm"
                            color="success"
                            variant="flat"
                            className="rounded-none"
                          >
                            Recommended
                          </Chip>
                        )}
                      </div>
                      <p className="text-sm text-default-500 mb-3">
                        {wallet.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {wallet.features.map((feature) => (
                          <Chip
                            key={feature}
                            size="sm"
                            variant="flat"
                            className="rounded-none text-xs"
                          >
                            {feature}
                          </Chip>
                        ))}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        config.walletType === wallet.type
                          ? "border-[#DCFF37] bg-[#DCFF37]"
                          : "border-default-300",
                      )}
                    >
                      {config.walletType === wallet.type && (
                        <Icon
                          icon="solar:check-bold"
                          className="w-4 h-4 text-[#34445C]"
                        />
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </motion.div>
        );

      case "chains":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-sm text-default-500">
              Select the blockchains you want to use. You can add more later.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CHAIN_OPTIONS.map((chain) => {
                const isSelected = config.enabledChains.includes(chain.id);
                return (
                  <Card
                    key={chain.id}
                    isPressable
                    onPress={() => {
                      updateConfig({
                        enabledChains: isSelected
                          ? config.enabledChains.filter((c) => c !== chain.id)
                          : [...config.enabledChains, chain.id],
                      });
                    }}
                    className={cn(
                      "rounded-none border-2 transition-all",
                      isSelected
                        ? "border-[#DCFF37] bg-[#DCFF37]/5"
                        : "border-default-200 hover:border-default-300",
                    )}
                  >
                    <CardBody className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-default-100 flex items-center justify-center">
                          <Icon icon={chain.icon} className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#34445C] dark:text-white">
                              {chain.name}
                            </span>
                            {chain.popular && (
                              <Icon
                                icon="solar:fire-bold"
                                className="w-4 h-4 text-[#FF4654]"
                              />
                            )}
                          </div>
                          <span className="text-xs text-default-500">
                            {chain.layer}
                          </span>
                        </div>
                        <Checkbox
                          isSelected={isSelected}
                          onValueChange={() => {}}
                          classNames={{ wrapper: "rounded-none" }}
                        />
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        );

      case "recovery":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {config.walletType === "non_custodial" ? (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-start gap-3">
                  <Icon
                    icon="solar:danger-triangle-bold"
                    className="w-6 h-6 text-warning mt-0.5"
                  />
                  <div>
                    <p className="font-semibold text-warning-700 dark:text-warning">
                      Self-Custody Mode
                    </p>
                    <p className="text-sm text-warning-600 dark:text-warning-400 mt-1">
                      You are fully responsible for your keys. Make sure to
                      backup your seed phrase securely.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-default-500">
                  Add recovery options so you can regain access if you lose your
                  device.
                </p>
                <Input
                  type="email"
                  label="Recovery Email"
                  placeholder="your@email.com"
                  value={config.recoveryEmail || ""}
                  onValueChange={(v) => updateConfig({ recoveryEmail: v })}
                  startContent={
                    <Icon
                      icon="solar:letter-bold"
                      className="text-default-400"
                      width={18}
                    />
                  }
                  classNames={{ inputWrapper: "rounded-none" }}
                />
                <Input
                  type="tel"
                  label="Recovery Phone (Optional)"
                  placeholder="+1 234 567 8900"
                  value={config.recoveryPhone || ""}
                  onValueChange={(v) => updateConfig({ recoveryPhone: v })}
                  startContent={
                    <Icon
                      icon="solar:phone-bold"
                      className="text-default-400"
                      width={18}
                    />
                  }
                  classNames={{ inputWrapper: "rounded-none" }}
                />
                <Checkbox
                  isSelected={config.backupEncryptionKey}
                  onValueChange={(v) =>
                    updateConfig({ backupEncryptionKey: v })
                  }
                  classNames={{ wrapper: "rounded-none" }}
                >
                  <span className="text-sm">
                    Encrypt backup with additional password
                  </span>
                </Checkbox>
              </>
            )}
          </motion.div>
        );

      case "security":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {isGeneratingKeys ? (
              <div className="text-center py-8">
                <KeyShardGenerationVisual
                  isGenerating={true}
                  progress={keyGenProgress}
                />
                <div className="mt-6 space-y-2">
                  <p className="font-semibold text-[#34445C] dark:text-white">
                    Generating MPC Key Shards...
                  </p>
                  <Progress
                    value={keyGenProgress}
                    classNames={{
                      track: "rounded-none",
                      indicator:
                        "rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]",
                    }}
                  />
                  <p className="text-sm text-default-500">
                    {keyGenProgress < 33 && "Creating device shard..."}
                    {keyGenProgress >= 33 &&
                      keyGenProgress < 66 &&
                      "Creating platform shard..."}
                    {keyGenProgress >= 66 &&
                      keyGenProgress < 100 &&
                      "Creating recovery shard..."}
                    {keyGenProgress >= 100 && "Complete!"}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Checkbox
                  isSelected={config.enableTwoFactor}
                  onValueChange={(v) => updateConfig({ enableTwoFactor: v })}
                  classNames={{ wrapper: "rounded-none" }}
                >
                  <div>
                    <span className="font-medium">
                      Enable Two-Factor Authentication
                    </span>
                    <p className="text-xs text-default-500">
                      Require 2FA for all transactions (recommended)
                    </p>
                  </div>
                </Checkbox>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Daily Transaction Limit
                  </label>
                  <Select
                    selectedKeys={[String(config.dailyLimit)]}
                    onSelectionChange={(keys) => {
                      const val = Array.from(keys)[0];
                      if (val) updateConfig({ dailyLimit: Number(val) });
                    }}
                    classNames={{ trigger: "rounded-none" }}
                  >
                    <SelectItem key="500">$500 / day</SelectItem>
                    <SelectItem key="1000">$1,000 / day</SelectItem>
                    <SelectItem key="5000">$5,000 / day</SelectItem>
                    <SelectItem key="10000">$10,000 / day</SelectItem>
                    <SelectItem key="0">No limit</SelectItem>
                  </Select>
                  <p className="text-xs text-default-500 mt-1">
                    Transactions above this require additional verification
                  </p>
                </div>

                <Divider className="my-4" />

                <Checkbox
                  isSelected={config.agreedToTerms}
                  onValueChange={(v) => updateConfig({ agreedToTerms: v })}
                  classNames={{ wrapper: "rounded-none" }}
                >
                  <span className="text-sm">
                    I agree to the{" "}
                    <a
                      href="/legal/terms"
                      className="text-[#FF4654] dark:text-[#DCFF37] underline"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/legal/privacy"
                      className="text-[#FF4654] dark:text-[#DCFF37] underline"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </Checkbox>
              </>
            )}
          </motion.div>
        );

      case "complete":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#DCFF37] to-[#34445C] flex items-center justify-center"
            >
              <Icon
                icon="solar:check-circle-bold"
                className="w-12 h-12 text-white"
              />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-[#34445C] dark:text-white mb-2">
                Wallet Created!
              </h2>
              <p className="text-default-500">
                Your Pro Wallet is ready. Start competing!
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto text-center">
              <div>
                <p className="text-2xl font-bold text-[#FF4654] dark:text-[#DCFF37]">
                  {config.enabledChains.length}
                </p>
                <p className="text-xs text-default-500">Chains</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#FF4654] dark:text-[#DCFF37]">
                  3
                </p>
                <p className="text-xs text-default-500">Key Shards</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#FF4654] dark:text-[#DCFF37]">
                  2/3
                </p>
                <p className="text-xs text-default-500">Threshold</p>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      hideCloseButton={currentStep === 0}
      isDismissable={false}
    >
      <ModalContent className="rounded-none">
        {/* Progress Bar */}
        <div className="p-4 pb-0">
          <div className="flex items-center gap-2 mb-2">
            {ONBOARDING_STEPS.map((step, i) => (
              <div
                key={step.id}
                className={cn(
                  "flex-1 h-1 rounded-full transition-colors",
                  i < currentStep
                    ? "bg-[#DCFF37]"
                    : i === currentStep
                      ? "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                      : "bg-default-200",
                )}
              />
            ))}
          </div>
          <p className="text-xs text-default-500 text-center">
            Step {currentStep + 1} of {ONBOARDING_STEPS.length}
          </p>
        </div>

        <ModalHeader className="flex flex-col items-center gap-1 pt-2">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#34445C]/10 to-[#FF4654]/10 dark:from-[#DCFF37]/10 dark:to-[#34445C]/10 flex items-center justify-center mb-2">
            <Icon
              icon={currentStepData.icon}
              className="w-6 h-6 text-[#FF4654] dark:text-[#DCFF37]"
            />
          </div>
          <h3 className="text-xl font-bold text-[#34445C] dark:text-white">
            {currentStepData.title}
          </h3>
          <p className="text-sm text-default-500">
            {currentStepData.description}
          </p>
        </ModalHeader>

        <ModalBody className="py-6">
          <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
        </ModalBody>

        <ModalFooter className="gap-2">
          {currentStep > 0 &&
            currentStepData.id !== "complete" &&
            !isGeneratingKeys && (
              <Button
                variant="flat"
                className="rounded-none"
                onPress={handleBack}
              >
                Back
              </Button>
            )}
          {currentStep === 0 && onSkip && (
            <Button variant="light" className="rounded-none" onPress={onSkip}>
              Skip for now
            </Button>
          )}
          {!isGeneratingKeys && (
            <Button
              className="rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-white dark:text-[#34445C]"
              isDisabled={!canProceed()}
              onPress={handleNext}
              endContent={
                currentStepData.id !== "complete" && (
                  <Icon icon="solar:arrow-right-bold" width={18} />
                )
              }
            >
              {currentStepData.id === "complete"
                ? "Start Playing"
                : currentStepData.id === "security"
                  ? "Create Wallet"
                  : "Continue"}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default WalletOnboarding;
