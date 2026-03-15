"use client";

/**
 * Live Tournament Page
 * Real-time tournament bracket with auto-refresh and match updates
 */

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Skeleton,
  Progress,
  Divider,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { PageContainer } from "@/components/layouts/centered-content";
import { EsportsButton } from "@/components/ui/esports-button";
import {
  TournamentBracket,
  BracketMatch,
} from "@/components/tournaments/tournament-bracket";
import { logger } from "@/lib/logger";
import { useSDK } from "@/contexts/sdk-context";
import type { Tournament } from "@/types/replay-api/tournament.types";
import {
  TOURNAMENT_STATUS_CONFIG,
  formatPrizePool,
  getTimeUntilStart,
} from "@/types/replay-api/tournament.types";

const REFRESH_INTERVAL = 15_000; // 15 seconds

export default function TournamentLivePage() {
  const params = useParams();
  const router = useRouter();
  const { sdk, isReady } = useSDK();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  const fetchTournament = useCallback(async () => {
    if (!isReady) return;
    try {
      const data = await sdk.tournaments.getTournament(tournamentId);
      if (data) {
        setTournament(data);
        setError(null);
      } else {
        setError("Tournament not found");
      }
    } catch (err) {
      logger.error("Failed to load live tournament", err);
      setError(err instanceof Error ? err.message : "Failed to load tournament");
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [tournamentId, sdk, isReady]);

  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  // Auto-refresh
  useEffect(() => {
    if (!isAutoRefresh) return;
    const interval = setInterval(fetchTournament, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [isAutoRefresh, fetchTournament]);

  const bracketMatches: BracketMatch[] =
    tournament?.matches?.map((m) => ({
      id: m.match_id,
      round: m.round,
      position: 1,
      team1: { id: m.player1_id, name: m.player1_id },
      team2: { id: m.player2_id, name: m.player2_id },
      winner: m.winner_id,
      status:
        m.status === "completed"
          ? "completed"
          : m.status === "in_progress"
            ? "ongoing"
            : "pending",
      scheduledAt: m.scheduled_at,
      playedAt: m.completed_at,
    })) || [];

  const totalMatches = bracketMatches.length;
  const completedMatches = bracketMatches.filter((m) => m.status === "completed").length;
  const liveMatches = bracketMatches.filter((m) => m.status === "ongoing");
  const progress = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

  if (loading) {
    return (
      <PageContainer maxWidth="7xl">
        <div className="space-y-6">
          <Skeleton className="w-full h-24 rounded-none" />
          <Skeleton className="w-full h-96 rounded-none" />
        </div>
      </PageContainer>
    );
  }

  if (error || !tournament) {
    return (
      <PageContainer maxWidth="7xl">
        <Card className="rounded-none border border-danger/30">
          <CardBody className="text-center py-12">
            <div
              className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-danger/10"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)" }}
            >
              <Icon icon="solar:danger-triangle-bold" width={32} className="text-danger" />
            </div>
            <p className="text-lg text-danger">{error || "Tournament not found"}</p>
            <EsportsButton
              variant="ghost"
              className="mt-4"
              onClick={() => router.push("/tournaments")}
            >
              Back to Tournaments
            </EsportsButton>
          </CardBody>
        </Card>
      </PageContainer>
    );
  }

  const statusConfig = TOURNAMENT_STATUS_CONFIG[tournament.status];

  return (
    <PageContainer maxWidth="7xl">
      {/* Live Header */}
      <Card className="mb-6 rounded-none bg-gradient-to-r from-[#FF4654]/10 to-[#FFC700]/10 dark:from-[#DCFF37]/10 dark:to-[#34445C]/10 border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
        <CardBody className="p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button isIconOnly variant="light" size="sm" onPress={() => router.back()}>
                <Icon icon="solar:arrow-left-linear" className="text-xl" />
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {tournament.status === "in_progress" && (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-danger" />
                    </span>
                  )}
                  <h1 className="text-xl font-bold">{tournament.name}</h1>
                  <Chip size="sm" color={statusConfig.color} variant="flat">
                    {statusConfig.label}
                  </Chip>
                </div>
                <div className="flex items-center gap-4 text-sm text-default-500">
                  <span>
                    <Icon icon="solar:cup-star-bold" className="inline mr-1 text-warning" width={16} />
                    {formatPrizePool(tournament.prize_pool, tournament.currency)}
                  </span>
                  <span>
                    <Icon icon="solar:users-group-rounded-bold" className="inline mr-1" width={16} />
                    {tournament.participants?.length || 0}/{tournament.max_participants}
                  </span>
                  <span>
                    <Icon icon="solar:map-point-bold" className="inline mr-1" width={16} />
                    {tournament.region}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="flat"
                startContent={<Icon icon="solar:refresh-linear" />}
                onPress={fetchTournament}
              >
                Refresh
              </Button>
              <Button
                size="sm"
                variant={isAutoRefresh ? "solid" : "flat"}
                color={isAutoRefresh ? "primary" : "default"}
                startContent={<Icon icon={isAutoRefresh ? "solar:pause-linear" : "solar:play-linear"} />}
                onPress={() => setIsAutoRefresh(!isAutoRefresh)}
              >
                {isAutoRefresh ? "Auto" : "Paused"}
              </Button>
              <Button
                size="sm"
                variant="flat"
                onPress={() => router.push(`/tournaments/${tournamentId}`)}
              >
                Full Details
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-default-500 mb-1">
              <span>{completedMatches}/{totalMatches} matches completed</span>
              <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
            </div>
            <Progress value={progress} color="primary" size="sm" />
          </div>
        </CardBody>
      </Card>

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <Card className="mb-6 rounded-none border border-[#FF4654]/30 dark:border-[#DCFF37]/30">
          <CardHeader className="flex gap-2 border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4654] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF4654]" />
            </span>
            <h2 className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1]">Live Matches ({liveMatches.length})</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveMatches.map((match) => (
                <Card key={match.id} className="rounded-none bg-[#FF4654]/5 dark:bg-[#DCFF37]/5 border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{match.team1?.name || "TBD"}</p>
                      </div>
                      <div className="px-4">
                        <Chip color="danger" size="sm" variant="flat" className="rounded-none">
                          VS
                        </Chip>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="font-semibold">{match.team2?.name || "TBD"}</p>
                      </div>
                    </div>
                    <p className="text-xs text-center text-default-400 mt-2">
                      Round {match.round}
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tournament Not Started */}
      {tournament.status === "registration" || tournament.status === "ready" ? (
        <Card className="mb-6">
          <CardBody className="text-center py-12">
            <Icon icon="solar:clock-circle-bold" width={48} className="mx-auto mb-4 text-warning" />
            <h2 className="text-xl font-bold mb-2">Tournament hasn&apos;t started yet</h2>
            <p className="text-default-500 mb-4">
              Starts in {getTimeUntilStart(tournament.start_time)}
            </p>
            {tournament.status === "registration" && (
              <Button
                color="primary"
                onPress={() => router.push(`/tournaments/${tournamentId}`)}
                startContent={<Icon icon="solar:user-plus-bold" />}
              >
                Register Now
              </Button>
            )}
          </CardBody>
        </Card>
      ) : null}

      {/* Bracket */}
      <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
        <CardHeader className="border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
          <h2 className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1]">Tournament Bracket</h2>
        </CardHeader>
        <Divider />
        <CardBody className="p-6 overflow-x-auto">
          {bracketMatches.length > 0 ? (
            <TournamentBracket
              matches={bracketMatches}
              type={
                tournament.format === "double_elimination"
                  ? "double-elimination"
                  : "single-elimination"
              }
              rounds={Math.ceil(Math.log2(tournament.max_participants))}
              title=""
              onMatchClick={(match) => logger.debug("Match clicked", match)}
            />
          ) : (
            <div className="text-center py-12 text-default-400">
              <Icon icon="solar:widget-5-bold" width={48} className="mx-auto mb-4" />
              <p>Bracket will be generated when the tournament starts</p>
            </div>
          )}
        </CardBody>
      </Card>
    </PageContainer>
  );
}
