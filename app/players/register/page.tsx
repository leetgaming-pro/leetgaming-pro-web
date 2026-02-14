"use client";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🏆 LEETGAMING - PLAYER PROFILE REGISTRATION PAGE                            ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Award-winning multi-step player registration with LeetGaming branding       ║
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
  Select,
  SelectItem,
  Textarea,
  Avatar,
  Chip,
  Switch,
  Spinner,
  Autocomplete,
  AutocompleteItem,
  Divider,
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
import { GameTitle, PlayerVisibility } from "@/types/replay-api/player.types";

// Initialize SDK (uses /api proxy for client-side requests)
const sdk = new ReplayAPISDK(
  { ...ReplayApiSettingsMock, baseUrl: "/api" },
  logger,
);

// ============================================================================
// Constants
// ============================================================================

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

const ROLES: Record<string, string[]> = {
  cs2: [
    "AWPer",
    "Entry Fragger",
    "Support",
    "In-Game Leader (IGL)",
    "Lurker",
    "Rifler",
  ],
  valorant: ["Duelist", "Controller", "Initiator", "Sentinel", "Flex"],
  lol: ["Top", "Jungle", "Mid", "ADC", "Support"],
  dota2: ["Carry", "Mid", "Offlane", "Soft Support", "Hard Support"],
  default: ["Player", "Captain", "Coach", "Analyst"],
};

const RANKS: Record<string, string[]> = {
  cs2: [
    "Silver",
    "Gold Nova",
    "Master Guardian",
    "Legendary Eagle",
    "Supreme",
    "Global Elite",
  ],
  valorant: [
    "Iron",
    "Bronze",
    "Silver",
    "Gold",
    "Platinum",
    "Diamond",
    "Ascendant",
    "Immortal",
    "Radiant",
  ],
  lol: [
    "Iron",
    "Bronze",
    "Silver",
    "Gold",
    "Platinum",
    "Diamond",
    "Master",
    "Grandmaster",
    "Challenger",
  ],
  dota2: [
    "Herald",
    "Guardian",
    "Crusader",
    "Archon",
    "Legend",
    "Ancient",
    "Divine",
    "Immortal",
  ],
  default: ["Beginner", "Intermediate", "Advanced", "Expert", "Pro"],
};

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
];

// ============================================================================
// Component
// ============================================================================

export default function PlayerRegistrationPage() {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    isRedirecting,
    user: _user,
  } = useRequireAuth({
    callbackUrl: "/players/register",
  });
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    game: "" as GameTitle | "",
    displayName: "",
    slug: "",
    avatarFile: null as File | null,
    avatarUrl: "",
    role: "",
    rank: "",
    bio: "",
    lookingForTeam: true,
    visibility: PlayerVisibility.PUBLIC,
    country: "US",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    discordUsername: "",
    twitchUsername: "",
    twitterUsername: "",
    steamId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingProfiles, setExistingProfiles] = useState<string[]>([]);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  // Get pre-selected game from URL params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const gameParam = urlParams.get("game");
      if (
        gameParam &&
        Object.values(GameTitle).includes(gameParam as GameTitle)
      ) {
        setFormData((prev) => ({ ...prev, game: gameParam as GameTitle }));
      }
    }
  }, []);

  // Check for existing profiles (multi-profile support)
  useEffect(() => {
    if (isAuthenticated) {
      sdk.playerProfiles
        .getMyProfiles()
        .then((profiles) => {
          if (profiles && profiles.length > 0) {
            // Store games user already has profiles for
            const existingGames = profiles.map(
              (p) => p.game_id?.toLowerCase() || "",
            );
            setExistingProfiles(existingGames);

            // If user already has ALL games, redirect to their profile page
            const allGamesCovered = GAMES.every((g) =>
              existingGames.includes(g.id.toLowerCase()),
            );
            if (allGamesCovered) {
              router.push(`/players/${profiles[0].id}`);
            }
          }
        })
        .catch(() => {
          // No profiles exist, continue with registration
        });
    }
  }, [isAuthenticated, router]);

  // Debounced slug availability check
  useEffect(() => {
    if (!formData.slug || formData.slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      const available = await sdk.playerProfiles.checkSlugAvailability(
        formData.slug,
      );
      setSlugAvailable(available);
      setIsCheckingSlug(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.slug]);

  // Filter out games user already has profiles for
  const availableGames = GAMES.filter(
    (g) => !existingProfiles.includes(g.id.toLowerCase()),
  );

  const handleDisplayNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      displayName: value,
      slug: value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.game) newErrors.game = "Please select a game";
      // Check if user already has profile for this game
      if (
        formData.game &&
        existingProfiles.includes(formData.game.toLowerCase())
      ) {
        newErrors.game = "You already have a profile for this game";
      }
      if (!formData.displayName)
        newErrors.displayName = "Display name is required";
      if (formData.displayName.length < 3)
        newErrors.displayName = "Display name must be at least 3 characters";
      if (!formData.slug) newErrors.slug = "Profile URL is required";
      if (formData.slug.length < 3)
        newErrors.slug = "Profile URL must be at least 3 characters";
      if (slugAvailable === false) newErrors.slug = "This URL is already taken";
    }

    if (currentStep === 2) {
      if (!formData.role) newErrors.role = "Please select your primary role";
      if (!formData.bio || formData.bio.length < 20)
        newErrors.bio = "Bio must be at least 20 characters";
    }

    if (currentStep === 3) {
      if (!formData.country) newErrors.country = "Please select your country";
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
      // Upload avatar if present
      let avatarUrl: string | undefined = formData.avatarUrl || undefined;
      if (formData.avatarFile) {
        const uploaded = await sdk.playerProfiles.uploadAvatar(
          formData.avatarFile,
        );
        avatarUrl = uploaded || undefined;
      }

      const profile = await sdk.playerProfiles.createPlayerProfile({
        game_id: formData.game,
        nickname: formData.displayName,
        slug_uri: formData.slug,
        avatar_uri: avatarUrl,
        description: formData.bio,
        roles: formData.role ? [formData.role] : undefined,
        // Include all form data collected across registration steps
        rank: formData.rank || undefined,
        country: formData.country || undefined,
        timezone: formData.timezone || undefined,
        looking_for_team: formData.lookingForTeam || false,
        visibility: formData.visibility || "public",
        social_links: {
          discord: formData.discordUsername || undefined,
          twitch: formData.twitchUsername || undefined,
          twitter: formData.twitterUsername || undefined,
          steam_id: formData.steamId || undefined,
        },
      });

      if (!profile) {
        throw new Error("Failed to create profile");
      }

      router.push(`/players/${profile.id}?welcome=true`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create profile";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading/Auth checks - useRequireAuth handles redirect
  if (isAuthLoading || isRedirecting) {
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
    return null; // useRequireAuth handles redirect
  }

  const selectedGame = GAMES.find((g) => g.id === formData.game);
  const availableRoles = formData.game
    ? ROLES[formData.game] || ROLES.default
    : ROLES.default;
  const availableRanks = formData.game
    ? RANKS[formData.game] || RANKS.default
    : RANKS.default;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#FF4654]/5 to-transparent dark:from-[#DCFF37]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[#FFC700]/5 to-transparent dark:from-[#34445C]/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Icon
              icon="solar:user-bold-duotone"
              className="w-10 h-10 sm:w-12 sm:h-12 text-[#FF4654] dark:text-[#DCFF37]"
            />
            <h1
              className={cn(
                title({ color: isDark ? "battleLime" : "battleNavy" }),
                "text-3xl sm:text-4xl",
              )}
            >
              Create Your Profile
            </h1>
          </div>
          <p className="text-[#34445C]/70 dark:text-white/60 text-sm sm:text-base">
            Join the competitive gaming community
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
          className="flex justify-center gap-2 sm:gap-4 mb-8"
        >
          {["Basic Info", "Gaming", "Location", "Review"].map(
            (label, index) => (
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
            ),
          )}
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            className={cn(
              "border-2 rounded-none mb-6",
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
                        Basic Information
                      </h2>
                    </div>

                    {/* Existing Profiles Notice */}
                    {existingProfiles.length > 0 && (
                      <div className="p-4 bg-[#DCFF37]/10 dark:bg-[#DCFF37]/5 border border-[#DCFF37]/30 rounded-none">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon
                            icon="solar:info-circle-bold"
                            className="text-[#DCFF37]"
                            width={20}
                          />
                          <span className="font-semibold text-sm text-[#34445C] dark:text-[#DCFF37]">
                            Creating Additional Profile
                          </span>
                        </div>
                        <p className="text-xs text-[#34445C]/70 dark:text-white/60">
                          You already have profile(s) for:{" "}
                          {existingProfiles
                            .map((g) => g.toUpperCase())
                            .join(", ")}
                          . Select a different game below to create another
                          profile.
                        </p>
                      </div>
                    )}

                    {/* Game Selection */}
                    <Select
                      label="Primary Game"
                      placeholder="Select your main game"
                      selectedKeys={formData.game ? [formData.game] : []}
                      onSelectionChange={(keys) => {
                        const game = Array.from(keys)[0] as GameTitle;
                        setFormData((prev) => ({
                          ...prev,
                          game,
                          role: "",
                          rank: "",
                        }));
                      }}
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
                        selectedGame && (
                          <Icon icon={selectedGame.icon} className="w-5 h-5" />
                        )
                      }
                    >
                      {availableGames.map((game) => (
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

                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-[#34445C]/20 dark:border-[#DCFF37]/20 rounded-none">
                      <AvatarUploader
                        onUpload={(file) =>
                          setFormData((prev) => ({ ...prev, avatarFile: file }))
                        }
                      />
                      <p className="text-xs text-[#34445C]/50 dark:text-white/40">
                        Optional: 400x400px recommended
                      </p>
                    </div>

                    {/* Display Name & Slug */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Display Name"
                        placeholder="Your gaming name"
                        value={formData.displayName}
                        onValueChange={handleDisplayNameChange}
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
                            icon="solar:user-bold"
                            className="text-[#34445C]/50 dark:text-white/50"
                          />
                        }
                        isRequired
                      />

                      <Input
                        label="Profile URL"
                        placeholder="your-profile-url"
                        value={formData.slug}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, slug: value }))
                        }
                        isInvalid={!!errors.slug}
                        errorMessage={errors.slug}
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
                          <span className="text-xs text-[#34445C]/50 dark:text-white/50">
                            leetgaming.pro/
                          </span>
                        }
                        endContent={
                          isCheckingSlug ? (
                            <Spinner size="sm" />
                          ) : slugAvailable === true ? (
                            <Icon
                              icon="solar:check-circle-bold"
                              className="text-green-500 w-5 h-5"
                            />
                          ) : slugAvailable === false ? (
                            <Icon
                              icon="solar:close-circle-bold"
                              className="text-red-500 w-5 h-5"
                            />
                          ) : null
                        }
                        isRequired
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Gaming Info */}
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
                        icon="solar:star-bold"
                        className="w-6 h-6 text-[#FF4654] dark:text-[#DCFF37]"
                      />
                      <h2 className="text-lg font-bold text-[#34445C] dark:text-white">
                        Gaming Details
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Autocomplete
                        label="Primary Role"
                        placeholder="Select your main role"
                        selectedKey={formData.role}
                        onSelectionChange={(key) =>
                          setFormData((prev) => ({
                            ...prev,
                            role: key as string,
                          }))
                        }
                        isInvalid={!!errors.role}
                        errorMessage={errors.role}
                        isRequired
                        classNames={{
                          base: "rounded-none",
                        }}
                        inputProps={{
                          classNames: {
                            inputWrapper: cn(
                              "rounded-none border-2",
                              "border-[#34445C]/20 dark:border-[#DCFF37]/20",
                              "hover:border-[#FF4654]/50 dark:hover:border-[#DCFF37]/50",
                              "focus-within:border-[#FF4654] dark:focus-within:border-[#DCFF37]",
                              "bg-white dark:bg-[#1a1a1a]",
                            ),
                          },
                        }}
                      >
                        {availableRoles.map((role) => (
                          <AutocompleteItem key={role}>{role}</AutocompleteItem>
                        ))}
                      </Autocomplete>

                      <Select
                        label="Current Rank"
                        placeholder="Select your rank"
                        selectedKeys={formData.rank ? [formData.rank] : []}
                        onSelectionChange={(keys) =>
                          setFormData((prev) => ({
                            ...prev,
                            rank: Array.from(keys)[0] as string,
                          }))
                        }
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
                      >
                        {availableRanks.map((rank) => (
                          <SelectItem key={rank}>{rank}</SelectItem>
                        ))}
                      </Select>
                    </div>

                    <Textarea
                      label="About You"
                      placeholder="Tell teams about your playstyle, experience, achievements, and what you're looking for..."
                      value={formData.bio}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, bio: value }))
                      }
                      minRows={4}
                      maxLength={500}
                      isInvalid={!!errors.bio}
                      errorMessage={errors.bio}
                      description={`${formData.bio.length}/500 characters`}
                      isRequired
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
                        description: "text-[#34445C]/50 dark:text-white/40",
                      }}
                    />

                    <Card
                      className={cn(
                        "border-2 rounded-none",
                        "border-[#34445C]/10 dark:border-[#DCFF37]/10",
                        "bg-[#34445C]/5 dark:bg-[#DCFF37]/5",
                      )}
                    >
                      <CardBody className="p-4">
                        <Switch
                          isSelected={formData.lookingForTeam}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              lookingForTeam: value,
                            }))
                          }
                          classNames={{
                            wrapper:
                              "group-data-[selected=true]:bg-[#FF4654] dark:group-data-[selected=true]:bg-[#DCFF37]",
                          }}
                        >
                          <div>
                            <p className="font-semibold text-[#34445C] dark:text-white">
                              Looking for Team
                            </p>
                            <p className="text-xs text-[#34445C]/50 dark:text-white/40">
                              Appear in team searches and receive invitations
                            </p>
                          </div>
                        </Switch>
                      </CardBody>
                    </Card>
                  </motion.div>
                )}
                {/* Step 3: Location & Social */}
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
                        icon="solar:earth-bold"
                        className="w-6 h-6 text-[#FF4654] dark:text-[#DCFF37]"
                      />
                      <h2 className="text-lg font-bold text-[#34445C] dark:text-white">
                        Location & Social
                      </h2>
                    </div>

                    <Select
                      label="Country"
                      placeholder="Select your country"
                      selectedKeys={formData.country ? [formData.country] : []}
                      onSelectionChange={(keys) =>
                        setFormData((prev) => ({
                          ...prev,
                          country: Array.from(keys)[0] as string,
                        }))
                      }
                      isInvalid={!!errors.country}
                      errorMessage={errors.country}
                      isRequired
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
                    >
                      {COUNTRIES.map((country) => (
                        <SelectItem
                          key={country.code}
                          startContent={
                            <span className="text-lg">{country.flag}</span>
                          }
                        >
                          {country.name}
                        </SelectItem>
                      ))}
                    </Select>

                    <Divider className="bg-[#34445C]/10 dark:bg-[#DCFF37]/10" />

                    <div className="space-y-4">
                      <h3 className="font-semibold text-[#34445C] dark:text-white">
                        Social Links (Optional)
                      </h3>

                      <Input
                        label="Discord"
                        placeholder="username#1234"
                        value={formData.discordUsername}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            discordUsername: value,
                          }))
                        }
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
                            icon="ic:baseline-discord"
                            className="text-[#5865F2]"
                          />
                        }
                      />

                      <Input
                        label="Twitch"
                        placeholder="username"
                        value={formData.twitchUsername}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            twitchUsername: value,
                          }))
                        }
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
                          <Icon icon="mdi:twitch" className="text-[#9146FF]" />
                        }
                      />

                      <Input
                        label="Twitter/X"
                        placeholder="@username"
                        value={formData.twitterUsername}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            twitterUsername: value,
                          }))
                        }
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
                          <Icon icon="mdi:twitter" className="text-[#1DA1F2]" />
                        }
                      />

                      <Input
                        label="Steam ID"
                        placeholder="76561198..."
                        value={formData.steamId}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, steamId: value }))
                        }
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
                            icon="mdi:steam"
                            className="text-[#34445C]/50 dark:text-white/50"
                          />
                        }
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Review */}
                {step === 4 && (
                  <motion.div
                    key="step4"
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
                        Review Your Profile
                      </h2>
                    </div>

                    {/* Preview Card */}
                    <Card
                      className={cn(
                        "border-2 rounded-none",
                        "border-[#FF4654] dark:border-[#DCFF37]",
                        "bg-gradient-to-r from-[#FF4654]/5 to-[#FFC700]/5",
                        "dark:from-[#DCFF37]/5 dark:to-[#34445C]/5",
                      )}
                    >
                      <CardBody className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar
                            src={
                              formData.avatarFile
                                ? URL.createObjectURL(formData.avatarFile)
                                : undefined
                            }
                            showFallback
                            name={formData.displayName}
                            size="lg"
                            className="flex-shrink-0 ring-2 ring-[#FF4654] dark:ring-[#DCFF37]"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-[#34445C] dark:text-white">
                              {formData.displayName}
                            </h3>
                            <p className="text-sm text-[#34445C]/50 dark:text-white/40">
                              leetgaming.pro/players/{formData.slug}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-3">
                              {selectedGame && (
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  classNames={{
                                    base: "bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 border-0",
                                    content:
                                      "text-[#FF4654] dark:text-[#DCFF37] font-semibold text-xs",
                                  }}
                                  startContent={
                                    <Icon
                                      icon={selectedGame.icon}
                                      className="w-3 h-3"
                                    />
                                  }
                                >
                                  {selectedGame.name}
                                </Chip>
                              )}
                              {formData.role && (
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  classNames={{
                                    base: "bg-[#34445C]/10 dark:bg-white/10 border-0",
                                    content:
                                      "text-[#34445C] dark:text-white font-semibold text-xs",
                                  }}
                                >
                                  {formData.role}
                                </Chip>
                              )}
                              {formData.rank && (
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  classNames={{
                                    base: "bg-[#FFC700]/20 border-0",
                                    content:
                                      "text-[#FFC700] font-semibold text-xs",
                                  }}
                                >
                                  {formData.rank}
                                </Chip>
                              )}
                              {formData.lookingForTeam && (
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  classNames={{
                                    base: "bg-green-500/20 border-0",
                                    content:
                                      "text-green-500 font-semibold text-xs",
                                  }}
                                >
                                  Looking for Team
                                </Chip>
                              )}
                            </div>

                            {formData.bio && (
                              <p className="text-sm text-[#34445C]/70 dark:text-white/60 mt-3 line-clamp-3">
                                {formData.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Privacy Setting */}
                    <Card
                      className={cn(
                        "border-2 rounded-none",
                        "border-[#34445C]/10 dark:border-[#DCFF37]/10",
                        "bg-white dark:bg-[#1a1a1a]",
                      )}
                    >
                      <CardBody className="p-4">
                        <Select
                          label="Profile Visibility"
                          selectedKeys={[formData.visibility]}
                          onSelectionChange={(keys) =>
                            setFormData((prev) => ({
                              ...prev,
                              visibility: Array.from(
                                keys,
                              )[0] as PlayerVisibility,
                            }))
                          }
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
                        >
                          <SelectItem
                            key={PlayerVisibility.PUBLIC}
                            startContent={
                              <Icon
                                icon="solar:earth-bold"
                                className="text-green-500"
                              />
                            }
                          >
                            Public - Anyone can view
                          </SelectItem>
                          <SelectItem
                            key={PlayerVisibility.RESTRICTED}
                            startContent={
                              <Icon
                                icon="solar:users-group-rounded-bold"
                                className="text-[#FFC700]"
                              />
                            }
                          >
                            Restricted - Teams only
                          </SelectItem>
                          <SelectItem
                            key={PlayerVisibility.PRIVATE}
                            startContent={
                              <Icon
                                icon="solar:lock-bold"
                                className="text-red-500"
                              />
                            }
                          >
                            Private - Only you
                          </SelectItem>
                        </Select>
                      </CardBody>
                    </Card>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-none border-2 border-red-500/50 bg-red-500/10"
                      >
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="solar:danger-triangle-bold"
                            className="text-red-500 w-5 h-5"
                          />
                          <p className="text-red-500 font-medium">{error}</p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardBody>
          </Card>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <EsportsButton
            variant="ghost"
            size="lg"
            onClick={step === 1 ? () => router.back() : handleBack}
            disabled={isSubmitting}
            className="flex-1"
          >
            <Icon icon="solar:arrow-left-linear" className="w-5 h-5 mr-2" />
            {step === 1 ? "Cancel" : "Back"}
          </EsportsButton>

          {step < totalSteps ? (
            <EsportsButton
              variant="primary"
              size="lg"
              onClick={handleNext}
              className="flex-1"
            >
              Continue
              <Icon icon="solar:arrow-right-linear" className="w-5 h-5 ml-2" />
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
              {!isSubmitting && (
                <Icon icon="solar:check-circle-bold" className="w-5 h-5 mr-2" />
              )}
              {isSubmitting ? "Creating Profile..." : "Create Profile"}
            </EsportsButton>
          )}
        </div>
      </div>
    </div>
  );
}
