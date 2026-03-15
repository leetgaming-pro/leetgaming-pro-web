"use client";

/**
 * Create Tournament Page
 * Multi-step wizard for tournament creation (requires auth + Pro/Elite plan)
 */

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Switch,
  Divider,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { PageContainer } from "@/components/layouts/centered-content";
import { EsportsButton } from "@/components/ui/esports-button";
import { useRequireAuth } from "@/hooks/use-auth";
import { useSDK } from "@/contexts/sdk-context";
import { logger } from "@/lib/logger";
import type { TournamentFormat } from "@/types/replay-api/tournament.types";

const GAMES = [
  { id: "cs2", name: "Counter-Strike 2", icon: "game-icons:mp5" },
  { id: "valorant", name: "Valorant", icon: "game-icons:crosshair" },
];

const TOURNAMENT_TYPES = [
  { id: "single-elimination", name: "Single Elimination", description: "Lose once and you're out" },
  { id: "double-elimination", name: "Double Elimination", description: "Two losses to be eliminated" },
  { id: "round-robin", name: "Round Robin", description: "Everyone plays everyone" },
  { id: "swiss", name: "Swiss System", description: "Paired by similar records" },
];

const TEAM_SIZES = [
  { id: "1v1", name: "1v1", players: 1 },
  { id: "2v2", name: "2v2", players: 2 },
  { id: "5v5", name: "5v5", players: 5 },
];

interface TournamentFormData {
  name: string;
  game: string;
  type: string;
  description: string;
  teamSize: string;
  maxTeams: number;
  entryFee: number;
  prizePool: number;
  startDate: string;
  startTime: string;
  registrationDeadline: string;
  rules: string;
  isPublic: boolean;
  region: string;
}

export default function CreateTournamentPage() {
  const router = useRouter();
  const { isLoading: isAuthLoading, isRedirecting } = useRequireAuth();
  const { sdk, isReady } = useSDK();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TournamentFormData>({
    name: "",
    game: "",
    type: "single-elimination",
    description: "",
    teamSize: "5v5",
    maxTeams: 16,
    entryFee: 0,
    prizePool: 0,
    startDate: "",
    startTime: "",
    registrationDeadline: "",
    rules: "",
    isPublic: true,
    region: "na-east",
  });

  const totalSteps = 4;

  const updateField = useCallback(
    <K extends keyof TournamentFormData>(key: K, value: TournamentFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (!isReady) {
        throw new Error("SDK not ready");
      }
      const startTime = `${formData.startDate}T${formData.startTime || "00:00"}:00Z`;
      const regDeadline = formData.registrationDeadline
        ? `${formData.registrationDeadline}T23:59:59Z`
        : startTime;

      const result = await sdk.tournaments.createTournament({
        name: formData.name,
        description: formData.description,
        game_id: formData.game,
        game_mode: formData.teamSize,
        region: formData.region,
        format: formData.type.replace("-", "_") as TournamentFormat,
        max_participants: formData.maxTeams,
        min_participants: Math.min(4, formData.maxTeams),
        entry_fee: formData.entryFee,
        currency: "USD",
        start_time: startTime,
        registration_open: new Date().toISOString(),
        registration_close: regDeadline,
        rules: {
          best_of: 1,
          ban_pick_enabled: false,
          check_in_required: true,
          check_in_window_mins: 15,
          match_timeout_mins: 60,
          disconnect_grace_mins: 5,
        },
      });

      if (result?.id) {
        router.push(`/tournaments/${result.id}?created=true`);
      } else {
        throw new Error("Failed to create tournament");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tournament");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || isRedirecting) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-default-400">Loading...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto py-8">
        {/* Background Decorations */}
        <div className="fixed top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FF4654]/5 to-transparent dark:from-[#DCFF37]/5 pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#FFC700]/5 to-transparent dark:from-[#34445C]/10 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            isIconOnly
            variant="bordered"
            className="rounded-none border-[#FF4654]/30 dark:border-[#DCFF37]/30"
            onPress={() => router.back()}
          >
            <Icon icon="solar:arrow-left-linear" className="text-xl" />
          </Button>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)" }}
            >
              <Icon icon="solar:cup-star-bold" width={24} className="text-[#F5F0E1] dark:text-[#34445C]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">Create Tournament</h1>
              <p className="text-[#FF4654] dark:text-[#DCFF37] text-sm font-medium">
                Step {step} of {totalSteps}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 transition-all duration-300 ${
                i + 1 <= step
                  ? "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                  : "bg-[#34445C]/10 dark:bg-[#DCFF37]/10"
              }`}
              style={i + 1 <= step ? { clipPath: "polygon(0 0, 100% 0, 100% 100%, calc(100% - 2px) 100%, 0 100%)" } : undefined}
            />
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between mb-6 text-xs font-semibold uppercase tracking-wider">
          {["Details", "Prizes", "Schedule", "Review"].map((label, i) => (
            <span
              key={label}
              className={i + 1 <= step ? "text-[#FF4654] dark:text-[#DCFF37]" : "text-default-400"}
            >
              {label}
            </span>
          ))}
        </div>

        {error && (
          <Card className="mb-4 rounded-none border border-danger/30 bg-danger/5">
            <CardBody className="text-danger text-sm flex flex-row items-center gap-2">
              <Icon icon="solar:danger-triangle-bold" width={18} />
              {error}
            </CardBody>
          </Card>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardHeader className="flex flex-col items-start gap-1 border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                      style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}
                    >
                      <Icon icon="solar:document-bold" width={16} className="text-[#F5F0E1] dark:text-[#34445C]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">Tournament Details</h2>
                      <p className="text-default-500 text-sm">Name, game, and format</p>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="gap-4">
                  <Input
                    label="Tournament Name"
                    placeholder="e.g., Weekly Pro Cup #12"
                    value={formData.name}
                    onValueChange={(v) => updateField("name", v)}
                    isRequired
                  />
                  <Select
                    label="Game"
                    placeholder="Select game"
                    selectedKeys={formData.game ? [formData.game] : []}
                    onSelectionChange={(keys) =>
                      updateField("game", Array.from(keys)[0] as string)
                    }
                    isRequired
                  >
                    {GAMES.map((g) => (
                      <SelectItem key={g.id} startContent={<Icon icon={g.icon} />}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="Tournament Format"
                    selectedKeys={[formData.type]}
                    onSelectionChange={(keys) =>
                      updateField("type", Array.from(keys)[0] as string)
                    }
                  >
                    {TOURNAMENT_TYPES.map((t) => (
                      <SelectItem key={t.id} description={t.description}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="Team Size"
                    selectedKeys={[formData.teamSize]}
                    onSelectionChange={(keys) =>
                      updateField("teamSize", Array.from(keys)[0] as string)
                    }
                  >
                    {TEAM_SIZES.map((s) => (
                      <SelectItem key={s.id}>{s.name}</SelectItem>
                    ))}
                  </Select>
                  <Textarea
                    label="Description"
                    placeholder="Describe your tournament..."
                    value={formData.description}
                    onValueChange={(v) => updateField("description", v)}
                    minRows={3}
                  />
                </CardBody>
              </Card>
            )}

            {/* Step 2: Prizes & Entry */}
            {step === 2 && (
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardHeader className="flex flex-col items-start gap-1 border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                      style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}
                    >
                      <Icon icon="solar:cup-star-bold" width={16} className="text-[#F5F0E1] dark:text-[#34445C]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">Prize Pool & Entry</h2>
                      <p className="text-default-500 text-sm">Set fees and prize distribution</p>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="gap-4">
                  <Input
                    type="number"
                    label="Max Teams"
                    value={String(formData.maxTeams)}
                    onValueChange={(v) => updateField("maxTeams", parseInt(v) || 8)}
                    min={4}
                    max={256}
                  />
                  <Input
                    type="number"
                    label="Entry Fee (USD)"
                    value={String(formData.entryFee)}
                    onValueChange={(v) => updateField("entryFee", parseFloat(v) || 0)}
                    startContent={<span className="text-default-400">$</span>}
                    description="Set to 0 for free entry"
                    min={0}
                  />
                  <Input
                    type="number"
                    label="Prize Pool (USD)"
                    value={String(formData.prizePool)}
                    onValueChange={(v) => updateField("prizePool", parseFloat(v) || 0)}
                    startContent={<span className="text-default-400">$</span>}
                    description="Total prize pool amount. Auto-calculated from entry fees if left at 0."
                    min={0}
                  />
                  {formData.entryFee > 0 && formData.prizePool === 0 && (
                    <Chip color="primary" variant="flat" size="sm">
                      Estimated prize pool: ${(formData.entryFee * formData.maxTeams * 0.9).toFixed(2)} (90% of entry fees)
                    </Chip>
                  )}
                </CardBody>
              </Card>
            )}

            {/* Step 3: Schedule */}
            {step === 3 && (
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardHeader className="flex flex-col items-start gap-1 border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                      style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}
                    >
                      <Icon icon="solar:calendar-bold" width={16} className="text-[#F5F0E1] dark:text-[#34445C]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">Schedule & Settings</h2>
                      <p className="text-default-500 text-sm">When does your tournament start?</p>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="gap-4">
                  <Input
                    type="date"
                    label="Start Date"
                    value={formData.startDate}
                    onValueChange={(v) => updateField("startDate", v)}
                    isRequired
                  />
                  <Input
                    type="time"
                    label="Start Time (UTC)"
                    value={formData.startTime}
                    onValueChange={(v) => updateField("startTime", v)}
                    isRequired
                  />
                  <Input
                    type="date"
                    label="Registration Deadline"
                    value={formData.registrationDeadline}
                    onValueChange={(v) => updateField("registrationDeadline", v)}
                    description="Leave empty to close registration at start time"
                  />
                  <Select
                    label="Region"
                    selectedKeys={[formData.region]}
                    onSelectionChange={(keys) =>
                      updateField("region", Array.from(keys)[0] as string)
                    }
                  >
                    <SelectItem key="na-east">NA East</SelectItem>
                    <SelectItem key="na-west">NA West</SelectItem>
                    <SelectItem key="eu-west">EU West</SelectItem>
                    <SelectItem key="eu-north">EU North</SelectItem>
                    <SelectItem key="sa-east">SA East</SelectItem>
                    <SelectItem key="asia-east">Asia East</SelectItem>
                  </Select>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Public Tournament</p>
                      <p className="text-xs text-default-400">Visible to all players</p>
                    </div>
                    <Switch
                      isSelected={formData.isPublic}
                      onValueChange={(v) => updateField("isPublic", v)}
                    />
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Step 4: Review & Create */}
            {step === 4 && (
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardHeader className="flex flex-col items-start gap-1 border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                      style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}
                    >
                      <Icon icon="solar:checklist-bold" width={16} className="text-[#F5F0E1] dark:text-[#34445C]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">Review Tournament</h2>
                      <p className="text-default-500 text-sm">Confirm all details before creating</p>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-default-400 uppercase">Name</p>
                        <p className="font-medium">{formData.name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-default-400 uppercase">Game</p>
                        <p className="font-medium capitalize">{formData.game || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-default-400 uppercase">Format</p>
                        <p className="font-medium">
                          {TOURNAMENT_TYPES.find((t) => t.id === formData.type)?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-default-400 uppercase">Team Size</p>
                        <p className="font-medium">{formData.teamSize}</p>
                      </div>
                      <div>
                        <p className="text-xs text-default-400 uppercase">Max Teams</p>
                        <p className="font-medium">{formData.maxTeams}</p>
                      </div>
                      <div>
                        <p className="text-xs text-default-400 uppercase">Entry Fee</p>
                        <p className="font-medium">
                          {formData.entryFee > 0 ? `$${formData.entryFee}` : "Free"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-default-400 uppercase">Prize Pool</p>
                        <p className="font-medium">
                          {formData.prizePool > 0
                            ? `$${formData.prizePool}`
                            : formData.entryFee > 0
                              ? `~$${(formData.entryFee * formData.maxTeams * 0.9).toFixed(0)}`
                              : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-default-400 uppercase">Start</p>
                        <p className="font-medium">
                          {formData.startDate
                            ? `${formData.startDate} ${formData.startTime || ""}`
                            : "—"}
                        </p>
                      </div>
                    </div>
                    {formData.description && (
                      <>
                        <Divider />
                        <div>
                          <p className="text-xs text-default-400 uppercase mb-1">Description</p>
                          <p className="text-sm text-default-600">{formData.description}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <EsportsButton
            variant="ghost"
            onClick={step === 1 ? () => router.back() : () => setStep((s) => s - 1)}
            startContent={<Icon icon="solar:arrow-left-linear" />}
          >
            {step === 1 ? "Cancel" : "Back"}
          </EsportsButton>
          {step < totalSteps ? (
            <EsportsButton
              variant="primary"
              onClick={() => setStep((s) => s + 1)}
              disabled={
                (step === 1 && (!formData.name || !formData.game)) ||
                (step === 3 && (!formData.startDate || !formData.startTime))
              }
            >
              Continue
              <Icon icon="solar:arrow-right-linear" />
            </EsportsButton>
          ) : (
            <EsportsButton
              variant="action"
              onClick={handleSubmit}
              loading={isSubmitting}
            >
              <Icon icon="solar:trophy-bold" />
              Create Tournament
            </EsportsButton>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
