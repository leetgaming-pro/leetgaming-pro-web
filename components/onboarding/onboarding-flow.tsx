"use client";

/**
 * Onboarding Flow Component
 * Multi-step onboarding experience for new users
 * Award-winning gaming brand experience
 */

import React from "react";
import { Card, CardBody, CardHeader, Progress } from "@nextui-org/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { EsportsButton } from "@/components/ui/esports-button";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { useOnboarding } from "./onboarding-context";
import { OnboardingStep } from "./types";
import { WelcomeStep } from "./steps/welcome-step";
import { ProfileStep } from "./steps/profile-step";
import { GamingPreferencesStep } from "./steps/gaming-preferences-step";
import { ConnectAccountsStep } from "./steps/connect-accounts-step";
import { SubscriptionStep } from "./steps/subscription-step";
import { CompleteStep } from "./steps/complete-step";

// ============================================================================
// Step Configuration
// ============================================================================

const STEP_CONFIG: Record<OnboardingStep, { title: string; icon: string }> = {
  [OnboardingStep.WELCOME]: { title: "Welcome", icon: "solar:hand-shake-bold" },
  [OnboardingStep.PROFILE]: { title: "Profile", icon: "solar:user-bold" },
  [OnboardingStep.GAMING_PREFERENCES]: {
    title: "Gaming",
    icon: "solar:gamepad-bold",
  },
  [OnboardingStep.CONNECT_ACCOUNTS]: {
    title: "Connect",
    icon: "solar:link-bold",
  },
  [OnboardingStep.SUBSCRIPTION]: { title: "Plan", icon: "solar:crown-bold" },
  [OnboardingStep.COMPLETE]: {
    title: "Complete",
    icon: "solar:check-circle-bold",
  },
};

// ============================================================================
// Component
// ============================================================================

export function OnboardingFlow() {
  const { currentStep, progress, isFirstStep, goToPreviousStep } =
    useOnboarding();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const renderStep = () => {
    switch (currentStep) {
      case OnboardingStep.WELCOME:
        return <WelcomeStep />;
      case OnboardingStep.PROFILE:
        return <ProfileStep />;
      case OnboardingStep.GAMING_PREFERENCES:
        return <GamingPreferencesStep />;
      case OnboardingStep.CONNECT_ACCOUNTS:
        return <ConnectAccountsStep />;
      case OnboardingStep.SUBSCRIPTION:
        return <SubscriptionStep />;
      case OnboardingStep.COMPLETE:
        return <CompleteStep />;
      default:
        return <WelcomeStep />;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Branded Background - Theme Aware */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? `linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)`
            : `linear-gradient(135deg, #F5F0E1 0%, #e8e3d4 50%, #F5F0E1 100%)`,
        }}
      />

      {/* Subtle gradient accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? `radial-gradient(ellipse 80% 50% at 50% 0%, rgba(220, 255, 55, 0.05) 0%, transparent 50%)`
            : `radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 70, 84, 0.05) 0%, transparent 50%)`,
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(rgba(220, 255, 55, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(220, 255, 55, 0.3) 1px, transparent 1px)`
            : `linear-gradient(rgba(52, 68, 92, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(52, 68, 92, 0.2) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header with Logo */}
      <header className="relative z-10 p-8 flex items-center justify-center">
        <Image
          src="/logo-red-only-text.png"
          alt="LeetGaming"
          width={220}
          height={50}
          style={{ objectFit: "contain" }}
        />
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center p-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className="w-full max-w-3xl bg-white/90 dark:bg-black/60 backdrop-blur-xl border border-[#34445C]/10 dark:border-white/10"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)",
            }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#FF4654]" />

            {/* Header with Progress */}
            <CardHeader className="flex flex-col gap-4 pb-0 pt-6">
              {currentStep !== OnboardingStep.COMPLETE && (
                <>
                  {/* Progress Bar */}
                  <div className="w-full">
                    <Progress
                      value={progress}
                      size="sm"
                      className="w-full h-1"
                      classNames={{
                        indicator:
                          "bg-gradient-to-r from-[#FFC700] to-[#DCFF37]",
                        track: "bg-[#F5F0E1]/10",
                      }}
                    />
                  </div>

                  {/* Step Indicators */}
                  <div className="flex items-center justify-between w-full px-2">
                    {Object.entries(STEP_CONFIG).map(
                      ([step, config], index) => {
                        const stepOrder = Object.keys(STEP_CONFIG);
                        const currentIndex = stepOrder.indexOf(currentStep);
                        const thisIndex = index;
                        const isCompleted = thisIndex < currentIndex;
                        const isCurrent = step === currentStep;

                        if (step === OnboardingStep.COMPLETE) return null;

                        return (
                          <div
                            key={step}
                            className={`flex flex-col items-center gap-1 transition-colors ${
                              isCurrent
                                ? "text-[#FFC700]"
                                : isCompleted
                                ? "text-[#DCFF37]"
                                : "text-[#F5F0E1]/30"
                            }`}
                          >
                            <div
                              className={`
                              w-10 h-10 flex items-center justify-center border-2 transition-all
                              ${
                                isCurrent
                                  ? "bg-[#FFC700]/20 border-[#FFC700]"
                                  : isCompleted
                                  ? "bg-[#DCFF37]/20 border-[#DCFF37]"
                                  : "bg-[#F5F0E1]/5 border-[#F5F0E1]/10"
                              }
                            `}
                              style={{
                                clipPath:
                                  "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                              }}
                            >
                              {isCompleted ? (
                                <Icon
                                  icon="solar:check-circle-bold"
                                  width={24}
                                />
                              ) : (
                                <Icon icon={config.icon} width={20} />
                              )}
                            </div>
                            <span className="text-xs font-medium hidden sm:block">
                              {config.title}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </>
              )}

              {/* Back Button */}
              {!isFirstStep && currentStep !== OnboardingStep.COMPLETE && (
                <EsportsButton
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousStep}
                  className="self-start"
                >
                  <Icon icon="solar:arrow-left-linear" width={18} />
                  Back
                </EsportsButton>
              )}
            </CardHeader>

            <CardBody className="p-6 md:p-8">{renderStep()}</CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
