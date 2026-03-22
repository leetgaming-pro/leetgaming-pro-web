"use client";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🏆 LEETGAMING - TEAM CREATION PAGE                                          ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Award-winning team creation with LeetGaming branding                        ║
 * ║                                                                              ║
 * ║  Brand Colors:                                                               ║
 * ║  • Light: Battle Orange (#FF4654) to Gold (#FFC700) → Navy (#34445C)         ║
 * ║  • Dark: Lime (#DCFF37) accents on dark background                           ║
 * ║  • EsportsButton for all CTAs                                                ║
 * ║  • rounded-none for edgy aesthetic                                           ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  Input,
  Textarea,
  Spinner,
  Select,
  SelectItem,
  Chip,
  Avatar,
} from "@nextui-org/react";
import { cn } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { title } from "@/components/primitives";
import { EsportsButton } from "@/components/ui/esports-button";
import AvatarUploader from "@/components/avatar/avatar-uploader";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";
import { GameTitle } from "@/types/replay-api/player.types";
import { parseError } from "@/lib/errors/error-parser";

// Initialize SDK (uses /api proxy for client-side requests)
const sdk = new ReplayAPISDK(
  { ...ReplayApiSettingsMock, baseUrl: "/api" },
  logger,
);

// Game options
const GAMES = [
  {
    id: GameTitle.CS2,
    name: "Counter-Strike 2",
    icon: "simple-icons:counterstrike",
  },
  { id: GameTitle.VALORANT, name: "Valorant", icon: "simple-icons:valorant" },
  {
    id: GameTitle.LOL,
    name: "League of Legends",
    icon: "simple-icons:leagueoflegends",
  },
  { id: GameTitle.DOTA2, name: "Dota 2", icon: "simple-icons:dota2" },
];

// Visibility options
const VISIBILITY_OPTIONS = [
  {
    value: "public",
    label: "Public",
    icon: "solar:globe-bold",
    description: "Anyone can find and join",
  },
  {
    value: "private",
    label: "Private",
    icon: "solar:lock-bold",
    description: "Invite only",
  },
  {
    value: "unlisted",
    label: "Unlisted",
    icon: "solar:eye-closed-bold",
    description: "Hidden from search",
  },
];

/**
 * Team Creation Page
 * Full-featured squad creation with award-winning branding
 */
export default function CreateTeamPage() {
  const { isAuthenticated, isLoading, isRedirecting, user } = useRequireAuth({
    callbackUrl: "/teams/create",
  });
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Form state
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingSymbol, setIsCheckingSymbol] = useState(false);
  const [symbolAvailable, setSymbolAvailable] = useState<boolean | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    game: "" as GameTitle | "",
    displayName: "",
    symbol: "",
    slug: "",
    description: "",
    visibility: "public",
    avatarFile: null as File | null,
    avatarUrl: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  // Auto-generate symbol and slug from name
  const handleNameChange = (value: string) => {
    const autoSymbol = value
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 5);

    const autoSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50);

    setFormData((prev) => ({
      ...prev,
      displayName: value,
      symbol: prev.symbol || autoSymbol,
      slug: prev.slug || autoSlug,
    }));
  };

  // Check symbol availability (debounced)
  useEffect(() => {
    if (!formData.symbol || formData.symbol.length < 2) {
      setSymbolAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSymbol(true);
      try {
        // Search squads by name which searches both Name and Symbol fields.
        // Then filter results to check for an exact symbol match (case-insensitive).
        const existingSquads = await sdk.squads.searchSquads({
          name: formData.symbol,
          visibility: "public",
        });
        const exactMatch = existingSquads?.some(
          (s) =>
            s.symbol?.toUpperCase() === formData.symbol.toUpperCase(),
        );
        setSymbolAvailable(!exactMatch);
      } catch {
        setSymbolAvailable(null);
      }
      setIsCheckingSymbol(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.symbol]);

  // Check slug availability (debounced)
  useEffect(() => {
    if (!formData.slug || formData.slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        // Search for squads with this slug — filter for exact match
        const existingSquads = await sdk.squads.searchSquads({
          name: formData.slug,
        });
        const exactMatch = existingSquads?.some(
          (s) =>
            s.slug_uri?.toLowerCase() === formData.slug.toLowerCase(),
        );
        setSlugAvailable(!exactMatch);
      } catch {
        setSlugAvailable(null);
      }
      setIsCheckingSlug(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.slug]);

  // Validation
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.game) newErrors.game = "Please select a game";
      if (!formData.displayName)
        newErrors.displayName = "Team name is required";
      if (formData.displayName.length < 3)
        newErrors.displayName = "Team name must be at least 3 characters";
      if (!formData.symbol) newErrors.symbol = "Team tag is required";
      if (formData.symbol.length < 2)
        newErrors.symbol = "Team tag must be at least 2 characters";
      if (symbolAvailable === false)
        newErrors.symbol = "This tag is already taken";
      if (!formData.slug) newErrors.slug = "Team URL is required";
      if (formData.slug.length < 3)
        newErrors.slug = "Team URL must be at least 3 characters";
      if (slugAvailable === false)
        newErrors.slug = "This URL is already taken. Please choose a different one.";
    }

    if (currentStep === 2) {
      if (!formData.description || formData.description.length < 10) {
        newErrors.description = "Description must be at least 10 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(totalSteps, prev + 1));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Implement squad logo upload when /api/squads/logo endpoint is available
      // For now, logos will need to be added after team creation via the edit page
      const logoUri = formData.avatarUrl || undefined;

      // Create the squad
      const squad = await sdk.squads.createSquad({
        game_id: formData.game as GameTitle,
        name: formData.displayName,
        symbol: formData.symbol,
        slug_uri: formData.slug,
        description: formData.description,
        visibility_type: formData.visibility as
          | "public"
          | "private"
          | "unlisted",
        logo_uri: logoUri,
      });

      if (!squad) {
        throw new Error("Failed to create team");
      }

      // Redirect to the new team page using slug or fallback to id
      const teamPath = squad.slug_uri || squad.id;
      router.push(`/teams/${teamPath}?welcome=true`);
    } catch (err) {
      const parsed = parseError(err);
      setError(parsed.message);
      // Map field-specific errors to form fields for inline display
      if (parsed.fieldErrors) {
        setErrors((prev) => ({ ...prev, ...parsed.fieldErrors }));
      }
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <Spinner
              size="lg"
              classNames={{
                circle1: "border-b-[#FF4654]",
                circle2: "border-b-[#DCFF37]",
              }}
            />
            <div className="absolute inset-0 blur-xl bg-gradient-to-r from-[#FF4654]/30 to-[#FFC700]/30 dark:from-[#DCFF37]/20 dark:to-[#34445C]/20" />
          </div>
          <p className="mt-4 text-[#34445C]/60 dark:text-white/50 text-sm">
            Loading...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#FF4654]/5 to-transparent dark:from-[#DCFF37]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[#FFC700]/5 to-transparent dark:from-[#34445C]/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Icon
              icon="solar:shield-star-bold"
              className="w-10 h-10 sm:w-12 sm:h-12 text-[#FF4654] dark:text-[#DCFF37]"
            />
            <h1
              className={cn(
                title({ color: isDark ? "battleLime" : "battleNavy" }),
                "text-3xl sm:text-4xl",
              )}
            >
              Create Your Squad
            </h1>
          </div>
          <p className="text-[#34445C]/70 dark:text-white/60 text-sm sm:text-base">
            Build your elite team and dominate the competition
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#34445C]/60 dark:text-white/50 uppercase tracking-wide">
              Step {step} of {totalSteps}
            </span>
            <span className="text-xs font-bold text-[#FF4654] dark:text-[#DCFF37]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1 bg-[#34445C]/10 dark:bg-[#DCFF37]/10 rounded-none overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Step Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-4 mb-8"
        >
          {["Team Info", "Details", "Review"].map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 flex items-center justify-center text-sm font-bold",
                  "rounded-none border-2 transition-all",
                  index + 1 <= step
                    ? "border-[#FF4654] dark:border-[#DCFF37] bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 text-[#FF4654] dark:text-[#DCFF37]"
                    : "border-[#34445C]/20 dark:border-[#DCFF37]/20 text-[#34445C]/40 dark:text-white/40",
                )}
              >
                {index + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold hidden sm:block",
                  index + 1 <= step
                    ? "text-[#34445C] dark:text-white"
                    : "text-[#34445C]/40 dark:text-white/40",
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            className={cn(
              "border-2 rounded-none",
              "border-[#FF4654]/20 dark:border-[#DCFF37]/20",
              "bg-white/80 dark:bg-[#1a1a1a]/80",
              "backdrop-blur-sm",
            )}
          >
            <CardBody className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {/* Step 1: Basic Info */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon
                        icon="solar:gamepad-bold"
                        className="w-6 h-6 text-[#FF4654] dark:text-[#DCFF37]"
                      />
                      <h2 className="text-lg font-bold text-[#34445C] dark:text-white">
                        Team Information
                      </h2>
                    </div>

                    {/* Game Selection */}
                    <Select
                      label="Select Game"
                      placeholder="Choose your game"
                      selectedKeys={formData.game ? [formData.game] : []}
                      onSelectionChange={(keys) =>
                        setFormData((prev) => ({
                          ...prev,
                          game: Array.from(keys)[0] as GameTitle,
                        }))
                      }
                      isInvalid={!!errors.game}
                      errorMessage={errors.game}
                      classNames={{
                        trigger: cn(
                          "rounded-none border-2",
                          "border-[#34445C]/20 dark:border-[#DCFF37]/20",
                          "hover:border-[#FF4654]/50 dark:hover:border-[#DCFF37]/50",
                          "data-[focus=true]:border-[#FF4654] dark:data-[focus=true]:border-[#DCFF37]",
                          "bg-white dark:bg-[#1a1a1a]",
                        ),
                        label: "text-[#34445C]/70 dark:text-white/60",
                        value: "text-[#34445C] dark:text-white",
                      }}
                      startContent={
                        <Icon
                          icon="solar:gamepad-linear"
                          className="text-[#34445C]/50 dark:text-white/50"
                        />
                      }
                    >
                      {GAMES.map((game) => (
                        <SelectItem
                          key={game.id}
                          startContent={
                            <Icon icon={game.icon} className="w-5 h-5" />
                          }
                        >
                          {game.name}
                        </SelectItem>
                      ))}
                    </Select>

                    {/* Team Name */}
                    <Input
                      label="Team Name"
                      placeholder="Enter your team name"
                      value={formData.displayName}
                      onValueChange={handleNameChange}
                      isInvalid={!!errors.displayName}
                      errorMessage={errors.displayName}
                      classNames={{
                        inputWrapper: cn(
                          "rounded-none border-2",
                          "border-[#34445C]/20 dark:border-[#DCFF37]/20",
                          "hover:border-[#FF4654]/50 dark:hover:border-[#DCFF37]/50",
                          "focus-within:border-[#FF4654] dark:focus-within:border-[#DCFF37]",
                          "bg-white dark:bg-[#1a1a1a]",
                        ),
                        label: "text-[#34445C]/70 dark:text-white/60",
                        input: "text-[#34445C] dark:text-white",
                      }}
                      startContent={
                        <Icon
                          icon="solar:flag-bold"
                          className="text-[#34445C]/50 dark:text-white/50"
                        />
                      }
                    />

                    {/* Team Tag */}
                    <Input
                      label="Team Tag"
                      placeholder="e.g., TSM, NRG"
                      value={formData.symbol}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          symbol: value.toUpperCase().slice(0, 5),
                        }))
                      }
                      isInvalid={!!errors.symbol}
                      errorMessage={errors.symbol}
                      maxLength={5}
                      description="2-5 characters, appears next to player names"
                      classNames={{
                        inputWrapper: cn(
                          "rounded-none border-2",
                          "border-[#34445C]/20 dark:border-[#DCFF37]/20",
                          "hover:border-[#FF4654]/50 dark:hover:border-[#DCFF37]/50",
                          "focus-within:border-[#FF4654] dark:focus-within:border-[#DCFF37]",
                          "bg-white dark:bg-[#1a1a1a]",
                        ),
                        label: "text-[#34445C]/70 dark:text-white/60",
                        input:
                          "text-[#34445C] dark:text-white uppercase font-bold tracking-wider",
                        description: "text-[#34445C]/50 dark:text-white/40",
                      }}
                      startContent={
                        <Icon
                          icon="solar:hashtag-bold"
                          className="text-[#34445C]/50 dark:text-white/50"
                        />
                      }
                      endContent={
                        isCheckingSymbol ? (
                          <Spinner size="sm" />
                        ) : symbolAvailable === true ? (
                          <Icon
                            icon="solar:check-circle-bold"
                            className="text-green-500"
                          />
                        ) : symbolAvailable === false ? (
                          <Icon
                            icon="solar:close-circle-bold"
                            className="text-red-500"
                          />
                        ) : null
                      }
                    />

                    {/* URL Slug */}
                    <Input
                      label="Team URL"
                      placeholder="my-team-name"
                      value={formData.slug}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          slug: value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "")
                            .slice(0, 50),
                        }))
                      }
                      isInvalid={!!errors.slug}
                      errorMessage={errors.slug}
                      maxLength={50}
                      description="Your team's unique profile URL"
                      classNames={{
                        inputWrapper: cn(
                          "rounded-none border-2",
                          "border-[#34445C]/20 dark:border-[#DCFF37]/20",
                          "hover:border-[#FF4654]/50 dark:hover:border-[#DCFF37]/50",
                          "focus-within:border-[#FF4654] dark:focus-within:border-[#DCFF37]",
                          "bg-white dark:bg-[#1a1a1a]",
                        ),
                        label: "text-[#34445C]/70 dark:text-white/60",
                        input: "text-[#34445C] dark:text-white lowercase",
                        description: "text-[#34445C]/50 dark:text-white/40",
                      }}
                      startContent={
                        <span className="text-xs text-[#34445C]/50 dark:text-white/50 whitespace-nowrap">
                          leetgaming.pro/teams/
                        </span>
                      }
                      endContent={
                        isCheckingSlug ? (
                          <Spinner size="sm" />
                        ) : slugAvailable === true ? (
                          <Icon
                            icon="solar:check-circle-bold"
                            className="text-green-500"
                          />
                        ) : slugAvailable === false ? (
                          <Icon
                            icon="solar:close-circle-bold"
                            className="text-red-500"
                          />
                        ) : null
                      }
                    />
                  </motion.div>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon
                        icon="solar:document-text-bold"
                        className="w-6 h-6 text-[#FF4654] dark:text-[#DCFF37]"
                      />
                      <h2 className="text-lg font-bold text-[#34445C] dark:text-white">
                        Team Details
                      </h2>
                    </div>

                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-[#34445C]/20 dark:border-[#DCFF37]/20 rounded-none">
                      <AvatarUploader
                        currentAvatarUrl={formData.avatarUrl}
                        onAvatarChange={(file: File) =>
                          setFormData((prev) => ({ ...prev, avatarFile: file }))
                        }
                        size="lg"
                      />
                      <p className="text-xs text-[#34445C]/50 dark:text-white/40">
                        Click to upload team logo
                      </p>
                    </div>

                    {/* Description */}
                    <Textarea
                      label="Team Description"
                      placeholder="Tell others about your team's goals, playstyle, and achievements..."
                      value={formData.description}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, description: value }))
                      }
                      isInvalid={!!errors.description}
                      errorMessage={errors.description}
                      minRows={4}
                      classNames={{
                        inputWrapper: cn(
                          "rounded-none border-2",
                          "border-[#34445C]/20 dark:border-[#DCFF37]/20",
                          "hover:border-[#FF4654]/50 dark:hover:border-[#DCFF37]/50",
                          "focus-within:border-[#FF4654] dark:focus-within:border-[#DCFF37]",
                          "bg-white dark:bg-[#1a1a1a]",
                        ),
                        label: "text-[#34445C]/70 dark:text-white/60",
                        input: "text-[#34445C] dark:text-white",
                      }}
                    />

                    {/* Visibility */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-[#34445C]/70 dark:text-white/60">
                        Team Visibility
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {VISIBILITY_OPTIONS.map((option) => (
                          <motion.button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                visibility: option.value,
                              }))
                            }
                            className={cn(
                              "p-4 rounded-none border-2 transition-all text-left",
                              formData.visibility === option.value
                                ? "border-[#FF4654] dark:border-[#DCFF37] bg-[#FF4654]/5 dark:bg-[#DCFF37]/5"
                                : "border-[#34445C]/20 dark:border-[#DCFF37]/20 hover:border-[#FF4654]/50 dark:hover:border-[#DCFF37]/50",
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Icon
                              icon={option.icon}
                              className={cn(
                                "w-6 h-6 mb-2",
                                formData.visibility === option.value
                                  ? "text-[#FF4654] dark:text-[#DCFF37]"
                                  : "text-[#34445C]/50 dark:text-white/50",
                              )}
                            />
                            <p
                              className={cn(
                                "font-semibold text-sm",
                                formData.visibility === option.value
                                  ? "text-[#FF4654] dark:text-[#DCFF37]"
                                  : "text-[#34445C] dark:text-white",
                              )}
                            >
                              {option.label}
                            </p>
                            <p className="text-xs text-[#34445C]/50 dark:text-white/40">
                              {option.description}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Icon
                        icon="solar:check-read-bold"
                        className="w-6 h-6 text-[#FF4654] dark:text-[#DCFF37]"
                      />
                      <h2 className="text-lg font-bold text-[#34445C] dark:text-white">
                        Review & Create
                      </h2>
                    </div>

                    {/* Team Preview Card */}
                    <Card
                      className={cn(
                        "border-2 rounded-none",
                        "border-[#FF4654] dark:border-[#DCFF37]",
                        "bg-gradient-to-r from-[#FF4654]/5 to-[#FFC700]/5",
                        "dark:from-[#DCFF37]/5 dark:to-[#34445C]/5",
                      )}
                    >
                      <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                          <Avatar
                            src={
                              formData.avatarFile
                                ? URL.createObjectURL(formData.avatarFile)
                                : "/team-default.png"
                            }
                            size="lg"
                            className="ring-2 ring-[#FF4654] dark:ring-[#DCFF37]"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xl text-[#34445C] dark:text-white">
                                {formData.displayName || "Team Name"}
                              </span>
                              <Chip
                                size="sm"
                                variant="flat"
                                classNames={{
                                  base: "bg-[#FF4654]/20 dark:bg-[#DCFF37]/20 border-0",
                                  content:
                                    "text-[#FF4654] dark:text-[#DCFF37] font-bold text-xs",
                                }}
                              >
                                {formData.symbol || "TAG"}
                              </Chip>
                            </div>
                            <p className="text-sm text-[#34445C]/60 dark:text-white/50">
                              {GAMES.find((g) => g.id === formData.game)
                                ?.name || "Game"}{" "}
                              •{" "}
                              {
                                VISIBILITY_OPTIONS.find(
                                  (v) => v.value === formData.visibility,
                                )?.label
                              }
                            </p>
                          </div>
                        </div>
                        {formData.description && (
                          <p className="mt-4 text-sm text-[#34445C]/70 dark:text-white/60 line-clamp-3">
                            {formData.description}
                          </p>
                        )}
                      </CardBody>
                    </Card>

                    {/* Creator Info */}
                    <div className="p-4 rounded-none border border-[#34445C]/10 dark:border-[#DCFF37]/10 bg-[#34445C]/5 dark:bg-[#DCFF37]/5">
                      <div className="flex items-start gap-3">
                        <Icon
                          icon="solar:user-check-bold"
                          className="w-5 h-5 text-[#FF4654] dark:text-[#DCFF37] flex-shrink-0 mt-0.5"
                        />
                        <div className="text-sm text-[#34445C]/80 dark:text-white/70">
                          <p>
                            You (<strong>{user?.name || user?.email}</strong>)
                            will be the team owner with full admin permissions.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-none border-2 border-red-500/50 bg-red-500/10"
                      >
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="solar:danger-triangle-bold"
                            className="w-5 h-5 text-red-500"
                          />
                          <span className="text-red-500 font-medium">
                            {error}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <EsportsButton
                    variant="ghost"
                    size="lg"
                    onClick={handleBack}
                    className="flex-1"
                  >
                    <Icon
                      icon="solar:arrow-left-linear"
                      className="w-5 h-5 mr-2"
                    />
                    Back
                  </EsportsButton>
                )}
                {step < totalSteps ? (
                  <EsportsButton
                    variant="primary"
                    size="lg"
                    onClick={handleNext}
                    className="flex-1"
                  >
                    Next
                    <Icon
                      icon="solar:arrow-right-linear"
                      className="w-5 h-5 ml-2"
                    />
                  </EsportsButton>
                ) : (
                  <EsportsButton
                    variant="action"
                    size="lg"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                    className="flex-1"
                    glow
                  >
                    <Icon
                      icon="solar:shield-star-bold"
                      className="w-5 h-5 mr-2"
                    />
                    Create Squad
                  </EsportsButton>
                )}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Pro Tips Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card
            className={cn(
              "mt-6 border rounded-none",
              "border-[#34445C]/10 dark:border-[#DCFF37]/10",
              "bg-[#34445C]/5 dark:bg-[#DCFF37]/5",
            )}
          >
            <CardBody className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]">
                  <Icon
                    icon="solar:lightbulb-bolt-bold"
                    className="w-5 h-5 text-white dark:text-[#34445C]"
                  />
                </div>
                <div>
                  <h3 className="text-[#34445C] dark:text-white font-bold mb-2">
                    Pro Tips
                  </h3>
                  <ul className="text-[#34445C]/70 dark:text-white/60 text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <Icon
                        icon="solar:check-circle-bold"
                        className="w-4 h-4 text-[#FF4654] dark:text-[#DCFF37]"
                      />
                      Choose a memorable name that represents your squad&apos;s
                      identity
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon
                        icon="solar:check-circle-bold"
                        className="w-4 h-4 text-[#FF4654] dark:text-[#DCFF37]"
                      />
                      Keep your tag short – it appears in match results and
                      leaderboards
                    </li>
                    <li className="flex items-center gap-2">
                      <Icon
                        icon="solar:check-circle-bold"
                        className="w-4 h-4 text-[#FF4654] dark:text-[#DCFF37]"
                      />
                      You can invite members and manage roles after creating
                      your team
                    </li>
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
