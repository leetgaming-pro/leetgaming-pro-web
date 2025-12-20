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
      {/* Branded Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(255, 199, 0, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, rgba(220, 255, 55, 0.08) 0%, transparent 50%),
            linear-gradient(180deg, #0a0a0a 0%, #1a1a0a 50%, #0a1a1a 100%)
          `,
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 199, 0, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 199, 0, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Animated glow */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 199, 0, 0.15) 0%, transparent 70%)",
          left: "-200px",
          top: "20%",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Header with Logo */}
      <header className="relative z-10 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-fox-mini.png"
            alt="LeetGaming"
            width={40}
            height={40}
            className="drop-shadow-[0_0_10px_rgba(255,199,0,0.5)]"
          />
          <span className="text-xl font-bold text-[#F5F0E1]">
            LeetGaming<span className="text-[#FFC700]">.PRO</span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center p-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className="w-full max-w-3xl bg-black/60 backdrop-blur-xl border border-white/10"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 24px), calc(100% - 24px) 100%, 0 100%)",
            }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFC700] via-[#FF4654] to-[#DCFF37]" />

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
