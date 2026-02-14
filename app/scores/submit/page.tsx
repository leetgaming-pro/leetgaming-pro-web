"use client";

/**
 * Submit Match Result Page
 * Form for tournament admins and authorized users to submit match results manually
 */

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRequireAuth } from "@/hooks/use-auth";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Divider,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useSDK } from "@/contexts/sdk-context";
import { PageContainer, Section } from "@/components/layout/page-container";
import { BreadcrumbBar } from "@/components/breadcrumb/breadcrumb-bar";
import { EsportsButton } from "@/components/ui/esports-button";
import { ErrorState } from "@/components/ui/empty-states";
import clsx from "clsx";
import { electrolize } from "@/config/fonts";
import { logger } from "@/lib/logger";
import type {
  ScoreSource,
  SubmitMatchResultRequest,
  TeamResult,
} from "@/types/replay-api/scores.types";
import { SOURCE_LABELS } from "@/types/replay-api/scores.types";

interface TeamInput {
  team_name: string;
  score: string;
}

export default function SubmitMatchResultPage() {
  return (
    <Suspense
      fallback={
        <PageContainer maxWidth="xl" animate animationVariant="slideUp">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-default-400">Loading...</div>
          </div>
        </PageContainer>
      }
    >
      <SubmitMatchResultContent />
    </Suspense>
  );
}

function SubmitMatchResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useRequireAuth({
    callbackUrl: "/scores/submit",
  });
  const { sdk, isReady } = useSDK();

  // Pre-populate from URL params (e.g., coming from match detail page)
  const preMatchId = searchParams?.get("match_id") || "";
  const preGameId = searchParams?.get("game_id") || "cs2";
  const preMapName = searchParams?.get("map") || "";
  const preSessionId = searchParams?.get("session_id") || "";

  // Form state
  const [matchId, setMatchId] = useState(preMatchId);
  const [tournamentId, setTournamentId] = useState("");
  const [gameId, setGameId] = useState(preGameId);
  const [mapName, setMapName] = useState(preMapName);
  const [mode, setMode] = useState("5v5");
  const [source, setSource] = useState<ScoreSource>(
    preMatchId ? "matchmaking" : "tournament_admin",
  );
  const [roundsPlayed, setRoundsPlayed] = useState("");
  const [duration, setDuration] = useState("");
  const [matchmakingSessionId] = useState(preSessionId);

  // Sync URL params on mount (for client-side navigation)
  useEffect(() => {
    if (preMatchId && !matchId) setMatchId(preMatchId);
    if (preGameId && gameId === "cs2" && preGameId !== "cs2")
      setGameId(preGameId);
    if (preMapName && !mapName) setMapName(preMapName);
  }, [preMatchId, preGameId, preMapName]); // eslint-disable-line react-hooks/exhaustive-deps

  const [teams, setTeams] = useState<TeamInput[]>([
    { team_name: "", score: "" },
    { team_name: "", score: "" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateTeam = (index: number, field: keyof TeamInput, value: string) => {
    setTeams((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!isReady || !isAuthenticated) return;

    // Validation
    if (!matchId.trim()) {
      setError("Match ID is required");
      return;
    }
    if (teams.some((t) => !t.team_name.trim())) {
      setError("All team names are required");
      return;
    }
    if (teams.some((t) => t.score === "" || isNaN(Number(t.score)))) {
      setError("Valid scores are required for all teams");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const teamResults: TeamResult[] = teams
        .map((t, _idx) => ({
          team_id: crypto.randomUUID(),
          team_name: t.team_name.trim(),
          score: Number(t.score),
          position: 0, // determined by backend
          players: [],
        }))
        .sort((a, b) => b.score - a.score)
        .map((t, idx) => ({ ...t, position: idx + 1 }));

      const request: SubmitMatchResultRequest = {
        match_id: matchId.trim(),
        tournament_id: tournamentId.trim() || undefined,
        matchmaking_session_id: matchmakingSessionId.trim() || undefined,
        game_id: gameId,
        map_name: mapName.trim(),
        mode: mode.trim(),
        source,
        team_results: teamResults,
        player_results: [],
        played_at: new Date().toISOString(),
        duration: Number(duration) || 0,
        rounds_played: Number(roundsPlayed) || 0,
      };

      const result = await sdk.scores.submitMatchResult(request);

      if (result) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/scores/${result.id}`);
        }, 1500);
      } else {
        setError("Failed to submit match result. Please try again.");
      }
    } catch (err) {
      logger.error("[SubmitMatchResult] Error", err);
      setError(
        err instanceof Error ? err.message : "Failed to submit match result",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <ErrorState
        title="Authentication Required"
        message="You must be signed in to submit match results."
      />
    );
  }

  return (
    <PageContainer maxWidth="xl" animate animationVariant="slideUp">
      <BreadcrumbBar />

      <Section className="mt-4 mb-6">
        <h1
          className={clsx(
            "text-2xl font-bold text-foreground",
            electrolize.className,
          )}
        >
          <Icon
            icon="solar:clipboard-add-bold-duotone"
            width={28}
            className="inline-block mr-2 text-[#DCFF37]"
          />
          Submit Match Result
        </h1>
        <p className="text-default-500 mt-1">
          Manually submit match scores for tournament matches or competitive
          games.
        </p>
      </Section>

      {/* Success Overlay */}
      {success && (
        <Section>
          <Card className="bg-success/10 border border-success/30">
            <CardBody className="flex flex-row items-center gap-3 py-6">
              <Icon
                icon="solar:check-circle-bold-duotone"
                width={32}
                className="text-success"
              />
              <div>
                <p
                  className={clsx(
                    "text-lg font-bold text-success",
                    electrolize.className,
                  )}
                >
                  Result Submitted Successfully!
                </p>
                <p className="text-sm text-default-500">
                  Redirecting to result details...
                </p>
              </div>
            </CardBody>
          </Card>
        </Section>
      )}

      {!success && (
        <Section>
          <Card
            className="bg-content1/80 backdrop-blur-sm border border-default-200/30"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
            }}
          >
            <CardHeader>
              <h2
                className={clsx(
                  "text-sm font-semibold text-default-600 uppercase tracking-wider",
                  electrolize.className,
                )}
              >
                Match Information
              </h2>
            </CardHeader>
            <CardBody className="space-y-6">
              {/* Match & Tournament IDs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Match ID"
                  placeholder="Enter match identifier"
                  value={matchId}
                  onValueChange={setMatchId}
                  variant="bordered"
                  isRequired
                  isReadOnly={!!preMatchId}
                  description={preMatchId ? "Pre-filled from match" : undefined}
                  startContent={
                    <Icon
                      icon="solar:hashtag-bold-duotone"
                      width={16}
                      className="text-default-400"
                    />
                  }
                />
                <Input
                  label="Tournament ID (Optional)"
                  placeholder="Link to a tournament"
                  value={tournamentId}
                  onValueChange={setTournamentId}
                  variant="bordered"
                  startContent={
                    <Icon
                      icon="solar:cup-bold-duotone"
                      width={16}
                      className="text-default-400"
                    />
                  }
                />
              </div>

              {/* Game & Map */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Game"
                  selectedKeys={[gameId]}
                  onSelectionChange={(keys) =>
                    setGameId(Array.from(keys)[0] as string)
                  }
                  variant="bordered"
                >
                  <SelectItem key="cs2">CS2</SelectItem>
                  <SelectItem key="valorant">VALORANT</SelectItem>
                  <SelectItem key="dota2">Dota 2</SelectItem>
                  <SelectItem key="lol">League of Legends</SelectItem>
                </Select>
                <Input
                  label="Map"
                  placeholder="e.g. de_dust2"
                  value={mapName}
                  onValueChange={setMapName}
                  variant="bordered"
                  startContent={
                    <Icon
                      icon="solar:map-bold-duotone"
                      width={16}
                      className="text-default-400"
                    />
                  }
                />
                <Input
                  label="Mode"
                  placeholder="e.g. 5v5"
                  value={mode}
                  onValueChange={setMode}
                  variant="bordered"
                />
              </div>

              {/* Source */}
              <Select
                label="Score Source"
                selectedKeys={[source]}
                onSelectionChange={(keys) =>
                  setSource(Array.from(keys)[0] as ScoreSource)
                }
                variant="bordered"
                className="max-w-xs"
              >
                {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                  <SelectItem key={key}>{label}</SelectItem>
                ))}
              </Select>

              {/* Rounds & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Rounds Played"
                  placeholder="e.g. 24"
                  value={roundsPlayed}
                  onValueChange={setRoundsPlayed}
                  variant="bordered"
                  startContent={
                    <Icon
                      icon="solar:refresh-circle-bold-duotone"
                      width={16}
                      className="text-default-400"
                    />
                  }
                />
                <Input
                  type="number"
                  label="Duration (seconds)"
                  placeholder="e.g. 2400"
                  value={duration}
                  onValueChange={setDuration}
                  variant="bordered"
                  startContent={
                    <Icon
                      icon="solar:clock-circle-bold-duotone"
                      width={16}
                      className="text-default-400"
                    />
                  }
                />
              </div>

              <Divider />

              {/* Team Scores */}
              <div>
                <h3
                  className={clsx(
                    "text-sm font-semibold text-default-600 uppercase tracking-wider mb-4",
                    electrolize.className,
                  )}
                >
                  <Icon
                    icon="solar:shield-bold-duotone"
                    width={16}
                    className="inline mr-1"
                  />
                  Team Scores
                </h3>
                <div className="space-y-4">
                  {teams.map((team, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 rounded-xl border border-default-200/50 bg-default-50/30"
                    >
                      <div
                        className={clsx(
                          "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0",
                          electrolize.className,
                          idx === 0
                            ? "bg-[#FF4654]/20 text-[#FF4654]"
                            : "bg-[#00A8FF]/20 text-[#00A8FF]",
                        )}
                      >
                        {idx + 1}
                      </div>
                      <Input
                        placeholder={`Team ${idx + 1} name`}
                        value={team.team_name}
                        onValueChange={(v) => updateTeam(idx, "team_name", v)}
                        variant="bordered"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Score"
                        value={team.score}
                        onValueChange={(v) => updateTeam(idx, "score", v)}
                        variant="bordered"
                        className="w-24"
                        classNames={{
                          input: clsx(
                            "text-center font-bold",
                            electrolize.className,
                          ),
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                  <Icon icon="solar:danger-circle-bold-duotone" width={18} />
                  {error}
                </div>
              )}

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-2">
                <EsportsButton
                  variant="ghost"
                  onClick={() => router.push("/scores")}
                >
                  Cancel
                </EsportsButton>
                <EsportsButton
                  onClick={handleSubmit}
                  loading={submitting}
                  startContent={
                    <Icon icon="solar:check-circle-bold-duotone" width={18} />
                  }
                >
                  Submit Result
                </EsportsButton>
              </div>
            </CardBody>
          </Card>
        </Section>
      )}
    </PageContainer>
  );
}
