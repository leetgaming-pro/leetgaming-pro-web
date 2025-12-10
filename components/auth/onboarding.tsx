"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Progress, Checkbox, RadioGroup, Radio, Input } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { EsportsButton } from "../ui/esports-button";
import { AuthBackground } from "./auth-background";

interface Game {
  id: string;
  name: string;
  icon: string;
  logo?: string;
}

const SUPPORTED_GAMES: Game[] = [
  { id: "cs2", name: "Counter-Strike 2", icon: "🎯", logo: "/cs2/cs2-logo-icon.png" },
  { id: "valorant", name: "VALORANT", icon: "💜", logo: "/vlrntlogo.png" },
  { id: "lol", name: "League of Legends", icon: "⚔️" },
  { id: "dota2", name: "Dota 2", icon: "🔮" },
  { id: "pubg", name: "PUBG", icon: "🪖" },
  { id: "freefire", name: "Free Fire", icon: "🔥" },
  { id: "r6", name: "Rainbow Six Siege", icon: "🛡️" },
  { id: "apex", name: "Apex Legends", icon: "🚀" },
];

const REGIONS = [
  { id: "na", name: "North America", flag: "🇺🇸" },
  { id: "eu", name: "Europe", flag: "🇪🇺" },
  { id: "sa", name: "South America", flag: "🇧🇷" },
  { id: "asia", name: "Asia Pacific", flag: "🇯🇵" },
  { id: "oce", name: "Oceania", flag: "🇦🇺" },
];

const SKILL_LEVELS = [
  { id: "beginner", name: "Beginner", description: "Just starting out" },
  { id: "casual", name: "Casual", description: "Play for fun" },
  { id: "competitive", name: "Competitive", description: "Want to improve" },
  { id: "semi-pro", name: "Semi-Pro", description: "Tournament experience" },
  { id: "professional", name: "Professional", description: "Full-time competitor" },
];

const INTERESTS = [
  { id: "ranked", name: "Ranked Matches", icon: "solar:ranking-bold" },
  { id: "tournaments", name: "Tournaments", icon: "solar:cup-star-bold" },
  { id: "coaching", name: "Coaching", icon: "solar:users-group-rounded-bold" },
  { id: "teams", name: "Team Play", icon: "solar:people-nearby-bold" },
  { id: "replay-analysis", name: "Replay Analysis", icon: "solar:play-bold" },
  { id: "betting", name: "Predictions", icon: "solar:chart-bold" },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState("");
  
  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleGameToggle = (gameId: string) => {
    setSelectedGames((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedGames.length > 0;
      case 2:
        return selectedRegion !== "";
      case 3:
        return skillLevel !== "";
      case 4:
        return selectedInterests.length > 0;
      case 5:
        return displayName.length >= 3;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    // Save preferences to API
    try {
      await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          games: selectedGames,
          region: selectedRegion,
          skillLevel,
          interests: selectedInterests,
          displayName,
        }),
      });
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
    router.push("/match-making");
  };

  const handleSkip = () => {
    router.push("/match-making");
  };

  return (
    <AuthBackground variant="onboarding">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-fox-mini.png"
              alt="LeetGaming"
              width={40}
              height={40}
              className="drop-shadow-[0_0_10px_rgba(255,199,0,0.5)]"
            />
            <span className="text-xl font-bold text-white">
              LeetGaming<span className="text-[#FFC700]">.PRO</span>
            </span>
          </div>
          <Button
            variant="light"
            className="text-white/50 hover:text-white"
            onClick={handleSkip}
          >
            Skip for now
          </Button>
        </header>

        {/* Progress */}
        <div className="px-6 pb-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between text-sm text-white/50 mb-2">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress
              value={progress}
              color="warning"
              size="sm"
              className="h-1"
            />
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              {/* Step 1: Select Games */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      What do you play?
                    </h1>
                    <p className="text-white/60">
                      Select the games you want to compete in
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {SUPPORTED_GAMES.map((game) => (
                      <button
                        key={game.id}
                        onClick={() => handleGameToggle(game.id)}
                        className={`
                          relative p-4 border-2 transition-all duration-200
                          ${
                            selectedGames.includes(game.id)
                              ? "border-[#FFC700] bg-[#FFC700]/10"
                              : "border-white/10 bg-white/5 hover:border-white/30"
                          }
                        `}
                        style={{
                          clipPath:
                            "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
                        }}
                      >
                        {selectedGames.includes(game.id) && (
                          <div className="absolute top-2 right-2">
                            <Icon
                              icon="solar:check-circle-bold"
                              className="text-[#FFC700] text-xl"
                            />
                          </div>
                        )}
                        <div className="text-3xl mb-2">
                          {game.logo ? (
                            <Image
                              src={game.logo}
                              alt={game.name}
                              width={40}
                              height={40}
                              className="mx-auto"
                            />
                          ) : (
                            game.icon
                          )}
                        </div>
                        <div className="text-white text-sm font-medium">
                          {game.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Select Region */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Where are you located?
                    </h1>
                    <p className="text-white/60">
                      Select your primary gaming region for best matchmaking
                    </p>
                  </div>

                  <RadioGroup
                    value={selectedRegion}
                    onValueChange={setSelectedRegion}
                    className="gap-4"
                  >
                    {REGIONS.map((region) => (
                      <Radio
                        key={region.id}
                        value={region.id}
                        classNames={{
                          base: `
                            max-w-full w-full p-4 border-2 cursor-pointer
                            ${
                              selectedRegion === region.id
                                ? "border-[#FFC700] bg-[#FFC700]/10"
                                : "border-white/10 bg-white/5 hover:border-white/30"
                            }
                          `,
                          wrapper: "hidden",
                          label: "w-full",
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{region.flag}</span>
                          <span className="text-white font-medium">
                            {region.name}
                          </span>
                          {selectedRegion === region.id && (
                            <Icon
                              icon="solar:check-circle-bold"
                              className="text-[#FFC700] text-xl ml-auto"
                            />
                          )}
                        </div>
                      </Radio>
                    ))}
                  </RadioGroup>
                </motion.div>
              )}

              {/* Step 3: Skill Level */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      What&apos;s your skill level?
                    </h1>
                    <p className="text-white/60">
                      This helps us match you with similar players
                    </p>
                  </div>

                  <RadioGroup
                    value={skillLevel}
                    onValueChange={setSkillLevel}
                    className="gap-3"
                  >
                    {SKILL_LEVELS.map((level) => (
                      <Radio
                        key={level.id}
                        value={level.id}
                        classNames={{
                          base: `
                            max-w-full w-full p-4 border-2 cursor-pointer
                            ${
                              skillLevel === level.id
                                ? "border-[#FFC700] bg-[#FFC700]/10"
                                : "border-white/10 bg-white/5 hover:border-white/30"
                            }
                          `,
                          wrapper: "hidden",
                          label: "w-full",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">
                              {level.name}
                            </div>
                            <div className="text-white/50 text-sm">
                              {level.description}
                            </div>
                          </div>
                          {skillLevel === level.id && (
                            <Icon
                              icon="solar:check-circle-bold"
                              className="text-[#FFC700] text-xl"
                            />
                          )}
                        </div>
                      </Radio>
                    ))}
                  </RadioGroup>
                </motion.div>
              )}

              {/* Step 4: Interests */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      What interests you?
                    </h1>
                    <p className="text-white/60">
                      Select features you want to explore
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {INTERESTS.map((interest) => (
                      <Checkbox
                        key={interest.id}
                        isSelected={selectedInterests.includes(interest.id)}
                        onValueChange={() => handleInterestToggle(interest.id)}
                        classNames={{
                          base: `
                            max-w-full w-full m-0 p-4 border-2 cursor-pointer
                            ${
                              selectedInterests.includes(interest.id)
                                ? "border-[#FFC700] bg-[#FFC700]/10"
                                : "border-white/10 bg-white/5 hover:border-white/30"
                            }
                          `,
                          wrapper: "hidden",
                          label: "w-full",
                        }}
                      >
                        <div className="flex flex-col items-center text-center gap-2">
                          <Icon
                            icon={interest.icon}
                            className={`text-2xl ${
                              selectedInterests.includes(interest.id)
                                ? "text-[#FFC700]"
                                : "text-white/50"
                            }`}
                          />
                          <span className="text-white text-sm font-medium">
                            {interest.name}
                          </span>
                        </div>
                      </Checkbox>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Display Name */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Choose your display name
                    </h1>
                    <p className="text-white/60">
                      This is how other players will see you
                    </p>
                  </div>

                  <div className="max-w-md mx-auto space-y-6">
                    <Input
                      label="Display Name"
                      placeholder="Enter your gamertag"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      size="lg"
                      classNames={{
                        inputWrapper:
                          "rounded-none border-white/20 bg-white/5 group-data-[focus=true]:border-[#FFC700] data-[hover=true]:border-white/40",
                        input: "text-white placeholder:text-white/30 text-center text-xl",
                        label: "text-white/70",
                      }}
                    />

                    {displayName.length >= 3 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                      >
                        <div className="text-white/40 text-sm mb-2">Preview</div>
                        <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#FFC700] to-[#FF4654] flex items-center justify-center text-xl font-bold text-black">
                            {displayName[0].toUpperCase()}
                          </div>
                          <div className="text-left">
                            <div className="text-white font-bold text-lg">
                              {displayName}
                            </div>
                            <div className="text-white/40 text-sm">
                              {SKILL_LEVELS.find((l) => l.id === skillLevel)?.name || "Player"}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Footer Navigation */}
        <footer className="p-6">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button
              variant="light"
              className="text-white/50 hover:text-white"
              onClick={handleBack}
              isDisabled={step === 1}
              startContent={<Icon icon="solar:arrow-left-linear" />}
            >
              Back
            </Button>

            <EsportsButton
              variant="primary"
              size="lg"
              onClick={handleNext}
              disabled={!canProceed()}
              loading={isLoading}
            >
              {step === totalSteps ? "Get Started" : "Continue"}
              {step !== totalSteps && (
                <Icon icon="solar:arrow-right-linear" className="ml-2" />
              )}
            </EsportsButton>
          </div>
        </footer>
      </div>
    </AuthBackground>
  );
}
