"use client";

/**
 * Tournament Results Page
 * Final standings, prize distribution, and match history
 */

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Chip,
  Skeleton,
  Divider,
  Avatar,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { PageContainer } from "@/components/layouts/centered-content";
import {
  TournamentBracket,
  BracketMatch,
} from "@/components/tournaments/tournament-bracket";
import { logger } from "@/lib/logger";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import type { Tournament, TournamentWinner } from "@/types/replay-api/tournament.types";
import {
  formatPrizePool,
  formatTournamentDate,
  getPlacementDisplay,
} from "@/types/replay-api/tournament.types";

export default function TournamentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTournament() {
      try {
        setLoading(true);
        const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
        const data = await sdk.tournaments.getTournament(tournamentId);
        if (data) {
          setTournament(data);
        } else {
          setError("Tournament not found");
        }
      } catch (err) {
        logger.error("Failed to load tournament results", err);
        setError(err instanceof Error ? err.message : "Failed to load results");
      } finally {
        setLoading(false);
      }
    }
    fetchTournament();
  }, [tournamentId]);

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

  if (loading) {
    return (
      <PageContainer maxWidth="7xl">
        <div className="space-y-6">
          <Skeleton className="w-full h-32 rounded-xl" />
          <Skeleton className="w-full h-64 rounded-xl" />
          <Skeleton className="w-full h-96 rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  if (error || !tournament) {
    return (
      <PageContainer maxWidth="7xl">
        <Card>
          <CardBody className="text-center py-12">
            <Icon icon="solar:danger-triangle-bold" width={48} className="mx-auto mb-4 text-danger" />
            <p className="text-lg text-danger">{error || "Tournament not found"}</p>
            <Button className="mt-4" variant="flat" onPress={() => router.push("/tournaments")}>
              Back to Tournaments
            </Button>
          </CardBody>
        </Card>
      </PageContainer>
    );
  }

  const winners = tournament.winners || [];
  const isCompleted = tournament.status === "completed";

  // Placement medal colors
  const getPlacementStyle = (placement: number) => {
    switch (placement) {
      case 1:
        return { bg: "bg-warning/20", text: "text-warning", icon: "solar:cup-star-bold" };
      case 2:
        return { bg: "bg-default-300/30", text: "text-default-500", icon: "solar:medal-star-bold" };
      case 3:
        return { bg: "bg-warning-200/30", text: "text-warning-600", icon: "solar:medal-ribbons-star-bold" };
      default:
        return { bg: "bg-default-100", text: "text-default-400", icon: "solar:ranking-bold" };
    }
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* Header */}
      <Card className="mb-6 bg-gradient-to-br from-warning/10 to-primary/10 border border-warning/20">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button isIconOnly variant="light" size="sm" onPress={() => router.back()}>
                <Icon icon="solar:arrow-left-linear" className="text-xl" />
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{tournament.name}</h1>
                  <Chip
                    size="sm"
                    color={isCompleted ? "secondary" : "warning"}
                    variant="flat"
                  >
                    {isCompleted ? "Completed" : "In Progress"}
                  </Chip>
                </div>
                <div className="flex items-center gap-4 text-sm text-default-500">
                  <span>
                    <Icon icon="solar:cup-star-bold" className="inline mr-1 text-warning" width={16} />
                    {formatPrizePool(tournament.prize_pool, tournament.currency)}
                  </span>
                  <span>
                    <Icon icon="solar:users-group-rounded-bold" className="inline mr-1" width={16} />
                    {tournament.participants?.length || 0} participants
                  </span>
                  {tournament.end_time && (
                    <span>
                      <Icon icon="solar:calendar-bold" className="inline mr-1" width={16} />
                      Ended {formatTournamentDate(tournament.end_time)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="flat"
                startContent={<Icon icon="solar:share-bold" />}
                onPress={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator.share({
                      title: tournament.name,
                      text: `Check out the results of ${tournament.name}`,
                      url: window.location.href,
                    }).catch(() => {});
                  } else if (typeof navigator !== "undefined") {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
              >
                Share
              </Button>
              <Button
                variant="flat"
                onPress={() => router.push(`/tournaments/${tournamentId}`)}
                startContent={<Icon icon="solar:info-circle-linear" />}
              >
                Details
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Winners Podium */}
      {winners.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Icon icon="solar:cup-star-bold" className="text-warning" width={24} />
              Final Standings
            </h2>
          </CardHeader>
          <Divider />
          <CardBody>
            {/* Top 3 Podium */}
            <div className="flex items-end justify-center gap-4 mb-8 pt-4">
              {[2, 1, 3].map((placement) => {
                const winner = winners.find((w: TournamentWinner) => w.placement === placement);
                if (!winner) return <div key={placement} className="w-32" />;
                const style = getPlacementStyle(placement);
                const height = placement === 1 ? "h-32" : placement === 2 ? "h-24" : "h-16";

                return (
                  <div key={placement} className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full ${style.bg} flex items-center justify-center`}>
                      <Icon icon={style.icon} width={24} className={style.text} />
                    </div>
                    <p className="font-semibold text-sm text-center">{winner.player_id}</p>
                    <p className="text-xs text-success font-bold">
                      {formatPrizePool(winner.prize, tournament.currency)}
                    </p>
                    <div className={`w-24 ${height} ${style.bg} rounded-t-lg flex items-center justify-center`}>
                      <span className={`text-2xl font-bold ${style.text}`}>
                        {getPlacementDisplay(placement)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full Results Table */}
            {winners.length > 3 && (
              <>
                <Divider className="my-4" />
                <div className="space-y-2">
                  {winners
                    .filter((w: TournamentWinner) => w.placement > 3)
                    .sort((a: TournamentWinner, b: TournamentWinner) => a.placement - b.placement)
                    .map((winner: TournamentWinner) => (
                      <div
                        key={winner.player_id}
                        className="flex items-center justify-between p-3 bg-default-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-default-400 w-8">
                            {getPlacementDisplay(winner.placement)}
                          </span>
                          <Avatar name={winner.player_id} size="sm" />
                          <span className="font-medium">{winner.player_id}</span>
                        </div>
                        {winner.prize > 0 && (
                          <span className="text-sm font-semibold text-success">
                            {formatPrizePool(winner.prize, tournament.currency)}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </>
            )}
          </CardBody>
        </Card>
      )}

      {/* Not completed yet */}
      {!isCompleted && winners.length === 0 && (
        <Card className="mb-6">
          <CardBody className="text-center py-12">
            <Icon icon="solar:hourglass-bold" width={48} className="mx-auto mb-4 text-warning" />
            <h2 className="text-xl font-bold mb-2">Results Not Available Yet</h2>
            <p className="text-default-500 mb-4">
              This tournament is still {tournament.status === "in_progress" ? "in progress" : "upcoming"}.
              Check back when it&apos;s completed.
            </p>
            <Button
              color="warning"
              onPress={() => router.push(`/tournaments/${tournamentId}/live`)}
              startContent={<Icon icon="solar:eye-bold" />}
            >
              Watch Live
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Bracket & Match History */}
      <Tabs aria-label="Results tabs" size="lg" className="mb-6">
        <Tab key="bracket" title="Final Bracket">
          <Card>
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
                  title="Final Bracket"
                  onMatchClick={(match) => logger.debug("Match clicked", match)}
                />
              ) : (
                <div className="text-center py-12 text-default-400">
                  <Icon icon="solar:widget-5-bold" width={48} className="mx-auto mb-4" />
                  <p>No match data available</p>
                </div>
              )}
            </CardBody>
          </Card>
        </Tab>

        <Tab key="matches" title="Match History">
          <Card>
            <CardBody>
              {bracketMatches.length > 0 ? (
                <div className="space-y-3">
                  {bracketMatches
                    .filter((m) => m.status === "completed")
                    .sort((a, b) => {
                      const dateA = a.playedAt ? new Date(a.playedAt).getTime() : 0;
                      const dateB = b.playedAt ? new Date(b.playedAt).getTime() : 0;
                      return dateB - dateA;
                    })
                    .map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-4 bg-default-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <Chip size="sm" variant="flat" color="default">
                            R{match.round}
                          </Chip>
                          <div className="flex items-center gap-3 flex-1">
                            <span
                              className={`font-medium ${match.winner === match.team1?.id ? "text-success" : ""}`}
                            >
                              {match.team1?.name || "TBD"}
                              {match.winner === match.team1?.id && (
                                <Icon
                                  icon="solar:cup-star-bold"
                                  className="inline ml-1 text-warning"
                                  width={14}
                                />
                              )}
                            </span>
                            <span className="text-default-300">vs</span>
                            <span
                              className={`font-medium ${match.winner === match.team2?.id ? "text-success" : ""}`}
                            >
                              {match.team2?.name || "TBD"}
                              {match.winner === match.team2?.id && (
                                <Icon
                                  icon="solar:cup-star-bold"
                                  className="inline ml-1 text-warning"
                                  width={14}
                                />
                              )}
                            </span>
                          </div>
                        </div>
                        {match.playedAt && (
                          <span className="text-xs text-default-400">
                            {new Date(match.playedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  {bracketMatches.filter((m) => m.status === "completed").length === 0 && (
                    <div className="text-center py-8 text-default-400">
                      <p>No completed matches yet</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-default-400">
                  <p>No match data available</p>
                </div>
              )}
            </CardBody>
          </Card>
        </Tab>

        <Tab key="participants" title="Participants">
          <Card>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tournament.participants?.map((p) => {
                  const winner = winners.find((w: TournamentWinner) => w.player_id === p.player_id);
                  return (
                    <Card key={p.player_id} className="bg-default-50">
                      <CardBody className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={p.display_name} size="sm" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{p.display_name}</p>
                            {p.seed && (
                              <p className="text-xs text-default-400">Seed #{p.seed}</p>
                            )}
                          </div>
                          {winner && (
                            <Chip size="sm" color="warning" variant="flat">
                              {getPlacementDisplay(winner.placement)}
                            </Chip>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </PageContainer>
  );
}
