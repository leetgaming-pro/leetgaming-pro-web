"use client";

/**
 * Match Result Detail Page
 * Displays comprehensive match result with team scores, player stats,
 * verification status, dispute history, and admin actions
 */

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useSDK } from "@/contexts/sdk-context";
import { useOptionalAuth } from "@/hooks/use-auth";
import { BreadcrumbBar } from "@/components/breadcrumb/breadcrumb-bar";
import { PageContainer, Section } from "@/components/layout/page-container";
import { PageLoadingState } from "@/components/ui/loading-states";
import { ErrorState } from "@/components/ui/empty-states";
import { EsportsButton } from "@/components/ui/esports-button";
import clsx from "clsx";
import { electrolize } from "@/config/fonts";
import { logger } from "@/lib/logger";
import type {
  MatchResult,
  TeamResult,
  PlayerResult,
  ResultStatus,
} from "@/types/replay-api/scores.types";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  SOURCE_LABELS,
  SOURCE_ICONS,
} from "@/types/replay-api/scores.types";
import type { PrizePool } from "@/types/replay-api/prize-pool.types";

// --- Status Flow Visualization ---
const STATUS_FLOW: ResultStatus[] = [
  "submitted",
  "under_review",
  "verified",
  "finalized",
];

function StatusTimeline({ currentStatus }: { currentStatus: ResultStatus }) {
  const isDisputed =
    currentStatus === "disputed" || currentStatus === "conciliated";
  const isCancelled = currentStatus === "cancelled";

  const flow = isCancelled
    ? (["submitted", "cancelled"] as ResultStatus[])
    : isDisputed
      ? ([
          "submitted",
          "under_review",
          "verified",
          "disputed",
          "conciliated",
          "finalized",
        ] as ResultStatus[])
      : STATUS_FLOW;

  const currentIdx = flow.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {flow.map((status, idx) => {
        const isPast = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const color = STATUS_COLORS[status];

        return (
          <React.Fragment key={status}>
            {idx > 0 && (
              <div
                className={clsx(
                  "h-0.5 w-6 md:w-10 flex-shrink-0",
                  isPast
                    ? "bg-success"
                    : isCurrent
                      ? "bg-[#DCFF37]"
                      : "bg-default-200",
                )}
              />
            )}
            <Tooltip content={STATUS_LABELS[status]}>
              <div
                className={clsx(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                  isCurrent && "ring-2 ring-offset-2 ring-offset-background",
                  isPast && "bg-success border-success text-white",
                  isCurrent && `border-${color} bg-${color}/20`,
                  !isPast &&
                    !isCurrent &&
                    "border-default-200 text-default-400",
                )}
              >
                {isPast ? (
                  <Icon icon="solar:check-circle-bold" width={16} />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
            </Tooltip>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// --- Team Score Hero ---
function TeamScoreHero({ result }: { result: MatchResult }) {
  const team1 = result.team_results?.[0];
  const team2 = result.team_results?.[1];

  if (!team1) return null;

  return (
    <Card
      className="bg-gradient-to-br from-[#34445C]/30 via-content1 to-[#34445C]/30 border border-default-200/30 overflow-hidden"
      style={{
        clipPath:
          "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
      }}
    >
      <CardBody className="py-8">
        <div className="flex items-center justify-center gap-6 md:gap-12">
          {/* Team 1 */}
          <div className="flex-1 text-right">
            <div className="flex flex-col items-end gap-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF4654]/20 to-[#FF4654]/5 flex items-center justify-center border border-[#FF4654]/30">
                <Icon
                  icon="solar:shield-bold-duotone"
                  width={24}
                  className="text-[#FF4654]"
                />
              </div>
              <h3
                className={clsx(
                  "text-lg md:text-xl font-bold text-foreground",
                  electrolize.className,
                )}
              >
                {team1.team_name || "Team 1"}
              </h3>
              {team1.position === 1 && (
                <Chip
                  size="sm"
                  color="success"
                  variant="flat"
                  startContent={<Icon icon="solar:crown-bold" width={12} />}
                >
                  Winner
                </Chip>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-3">
              <span
                className={clsx(
                  "text-5xl md:text-6xl font-black tabular-nums",
                  electrolize.className,
                  team1.position === 1 ? "text-[#DCFF37]" : "text-default-400",
                )}
              >
                {team1.score}
              </span>
              <span className="text-2xl text-default-300 font-light">:</span>
              <span
                className={clsx(
                  "text-5xl md:text-6xl font-black tabular-nums",
                  electrolize.className,
                  team2 && team2.position === 1
                    ? "text-[#DCFF37]"
                    : "text-default-400",
                )}
              >
                {team2?.score ?? 0}
              </span>
            </div>
            {result.is_draw && (
              <Chip
                size="sm"
                color="warning"
                variant="bordered"
                className="mt-2"
              >
                DRAW
              </Chip>
            )}
            {result.rounds_played > 0 && (
              <span className="text-xs text-default-400 mt-2">
                {result.rounds_played} rounds
              </span>
            )}
          </div>

          {/* Team 2 */}
          <div className="flex-1 text-left">
            {team2 ? (
              <div className="flex flex-col items-start gap-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A8FF]/20 to-[#00A8FF]/5 flex items-center justify-center border border-[#00A8FF]/30">
                  <Icon
                    icon="solar:shield-bold-duotone"
                    width={24}
                    className="text-[#00A8FF]"
                  />
                </div>
                <h3
                  className={clsx(
                    "text-lg md:text-xl font-bold text-foreground",
                    electrolize.className,
                  )}
                >
                  {team2.team_name || "Team 2"}
                </h3>
                {team2.position === 1 && (
                  <Chip
                    size="sm"
                    color="success"
                    variant="flat"
                    startContent={<Icon icon="solar:crown-bold" width={12} />}
                  >
                    Winner
                  </Chip>
                )}
              </div>
            ) : (
              <p className="text-default-400 italic">No opponent</p>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// --- Player Stats Table ---
function PlayerStatsTable({
  players,
  teamResults,
}: {
  players: PlayerResult[];
  teamResults: TeamResult[];
}) {
  if (!players?.length) {
    return (
      <div className="py-8 text-center text-default-400">
        <Icon
          icon="solar:users-group-rounded-bold-duotone"
          width={32}
          className="mx-auto mb-2 opacity-50"
        />
        <p>No detailed player stats available</p>
      </div>
    );
  }

  const getTeamName = (teamId: string) =>
    teamResults?.find((t) => t.team_id === teamId)?.team_name || "—";

  return (
    <Table
      aria-label="Player Statistics"
      removeWrapper
      classNames={{
        th: "bg-[#34445C]/10 dark:bg-[#34445C]/30 text-default-600 text-xs uppercase tracking-wider",
        td: "py-3",
      }}
    >
      <TableHeader>
        <TableColumn>Player</TableColumn>
        <TableColumn>Team</TableColumn>
        <TableColumn align="center">K</TableColumn>
        <TableColumn align="center">D</TableColumn>
        <TableColumn align="center">A</TableColumn>
        <TableColumn align="center">Score</TableColumn>
        <TableColumn align="center">Rating</TableColumn>
        <TableColumn align="center">MVP</TableColumn>
      </TableHeader>
      <TableBody>
        {players.map((player, idx) => (
          <TableRow
            key={player.player_id || idx}
            className="hover:bg-default-100/50 transition-colors"
          >
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#34445C]/30 to-[#34445C]/10 flex items-center justify-center text-xs font-bold text-default-500">
                  {idx + 1}
                </div>
                <span
                  className={clsx("text-sm font-medium", electrolize.className)}
                >
                  {player.player_id?.slice(0, 8) || `P${idx + 1}`}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <span className="text-xs text-default-500">
                {getTeamName(player.team_id)}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm font-semibold text-success">
                {player.kills}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm font-semibold text-danger">
                {player.deaths}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm font-semibold text-primary">
                {player.assists}
              </span>
            </TableCell>
            <TableCell>
              <span
                className={clsx("text-sm font-bold", electrolize.className)}
              >
                {player.score}
              </span>
            </TableCell>
            <TableCell>
              <Chip
                size="sm"
                variant="flat"
                color={
                  player.rating >= 1.2
                    ? "success"
                    : player.rating >= 0.8
                      ? "default"
                      : "danger"
                }
                classNames={{ content: "font-mono text-xs" }}
              >
                {player.rating?.toFixed(2) || "—"}
              </Chip>
            </TableCell>
            <TableCell>
              {player.is_mvp && (
                <Tooltip content="Most Valuable Player">
                  <Icon
                    icon="solar:star-bold"
                    width={18}
                    className="text-[#FFC700]"
                  />
                </Tooltip>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// --- Result Info Card ---
function ResultInfoCard({ result }: { result: MatchResult }) {
  const infoItems = [
    {
      label: "Source",
      value: SOURCE_LABELS[result.source],
      icon: SOURCE_ICONS[result.source],
    },
    {
      label: "Game",
      value: result.game_id?.toUpperCase(),
      icon: "solar:gamepad-bold-duotone",
    },
    { label: "Map", value: result.map_name, icon: "solar:map-bold-duotone" },
    { label: "Mode", value: result.mode, icon: "solar:tuning-2-bold-duotone" },
    {
      label: "Played",
      value: result.played_at
        ? new Date(result.played_at).toLocaleString()
        : "—",
      icon: "solar:calendar-bold-duotone",
    },
    {
      label: "Duration",
      value: result.duration
        ? `${Math.floor(result.duration / 60)}m ${result.duration % 60}s`
        : "—",
      icon: "solar:clock-circle-bold-duotone",
    },
  ];

  if (result.verification_method) {
    infoItems.push({
      label: "Verified By",
      value: result.verification_method.replace("_", " "),
      icon: "solar:verified-check-bold-duotone",
    });
  }

  if (result.tournament_id) {
    infoItems.push({
      label: "Tournament",
      value: result.tournament_id.slice(0, 8) + "...",
      icon: "solar:cup-bold-duotone",
    });
  }

  return (
    <Card
      className="bg-content1/60 backdrop-blur-sm border border-default-200/30"
      style={{
        clipPath:
          "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
      }}
    >
      <CardHeader className="pb-1">
        <h3
          className={clsx(
            "text-sm font-semibold text-default-600 uppercase tracking-wider",
            electrolize.className,
          )}
        >
          <Icon
            icon="solar:info-circle-bold-duotone"
            width={16}
            className="inline mr-1"
          />
          Match Details
        </h3>
      </CardHeader>
      <CardBody className="pt-1">
        <div className="grid grid-cols-2 gap-3">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-start gap-2">
              <Icon
                icon={item.icon}
                width={16}
                className="text-default-400 mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="text-[10px] text-default-400 uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-sm text-foreground font-medium">
                  {item.value || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

// --- Dispute History Card ---
function DisputeHistoryCard({ result }: { result: MatchResult }) {
  if (!result.dispute_reason && !result.conciliation_notes) return null;

  return (
    <Card
      className="bg-content1/60 backdrop-blur-sm border border-warning/20"
      style={{
        clipPath:
          "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
      }}
    >
      <CardHeader className="pb-1">
        <h3
          className={clsx(
            "text-sm font-semibold text-warning uppercase tracking-wider",
            electrolize.className,
          )}
        >
          <Icon
            icon="solar:danger-triangle-bold-duotone"
            width={16}
            className="inline mr-1"
          />
          Dispute History
        </h3>
      </CardHeader>
      <CardBody className="pt-1 space-y-3">
        {result.dispute_reason && (
          <div className="p-3 rounded-lg bg-warning/5 border border-warning/10">
            <div className="flex items-center gap-2 mb-1">
              <Icon
                icon="solar:flag-bold-duotone"
                width={14}
                className="text-warning"
              />
              <span className="text-xs font-semibold text-warning">
                Dispute Reason
              </span>
              {result.disputed_at && (
                <span className="text-[10px] text-default-400 ml-auto">
                  {new Date(result.disputed_at).toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-sm text-default-600">{result.dispute_reason}</p>
          </div>
        )}
        {result.conciliation_notes && (
          <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/10">
            <div className="flex items-center gap-2 mb-1">
              <Icon
                icon="solar:shield-check-bold-duotone"
                width={14}
                className="text-secondary"
              />
              <span className="text-xs font-semibold text-secondary">
                Resolution
              </span>
              {result.conciliated_at && (
                <span className="text-[10px] text-default-400 ml-auto">
                  {new Date(result.conciliated_at).toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-sm text-default-600">
              {result.conciliation_notes}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// --- Prize Pool Card ---
function PrizePoolCard({
  prizePool,
  resultId: _resultId,
}: {
  prizePool: PrizePool | null;
  resultId: string;
}) {
  const router = useRouter();

  if (!prizePool) return null;

  const DISTRIBUTION_LABELS: Record<string, string> = {
    winner_takes_all: "Winner Takes All",
    top_three_split_60_30_10: "Top 3 Split (60/30/10)",
    performance_mvp_70_20_10: "Performance MVP (70/20/10)",
  };

  const STATUS_BADGE: Record<
    string,
    {
      color: "success" | "warning" | "danger" | "primary" | "default";
      label: string;
    }
  > = {
    accumulating: { color: "primary", label: "Accumulating" },
    locked: { color: "warning", label: "Locked" },
    in_escrow: { color: "warning", label: "In Escrow" },
    distributed: { color: "success", label: "Distributed" },
    refunded: { color: "default", label: "Refunded" },
    disputed: { color: "danger", label: "Disputed" },
  };

  const badge = STATUS_BADGE[prizePool.status] || {
    color: "default" as const,
    label: prizePool.status,
  };

  return (
    <Card
      className="bg-content1/60 backdrop-blur-sm border border-[#DCFF37]/20"
      style={{
        clipPath:
          "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
      }}
    >
      <CardHeader className="pb-1 flex items-center justify-between">
        <h3
          className={clsx(
            "text-sm font-semibold text-[#DCFF37] uppercase tracking-wider",
            electrolize.className,
          )}
        >
          <Icon
            icon="solar:wallet-money-bold-duotone"
            width={16}
            className="inline mr-1"
          />
          Prize Pool
        </h3>
        <Chip size="sm" variant="flat" color={badge.color}>
          {badge.label}
        </Chip>
      </CardHeader>
      <CardBody className="pt-1 space-y-3">
        {/* Total Amount */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#DCFF37]/5 border border-[#DCFF37]/10">
          <span className="text-xs text-default-400 uppercase tracking-wider">
            Total Pool
          </span>
          <span
            className={clsx(
              "text-2xl font-black text-[#DCFF37]",
              electrolize.className,
            )}
          >
            ${prizePool.total_amount?.dollars?.toFixed(2) || "0.00"}
          </span>
        </div>

        {/* Distribution Rule */}
        <div className="flex items-start gap-2">
          <Icon
            icon="solar:chart-2-bold-duotone"
            width={16}
            className="text-default-400 mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="text-[10px] text-default-400 uppercase tracking-wider">
              Distribution Rule
            </p>
            <p className="text-sm text-foreground font-medium">
              {DISTRIBUTION_LABELS[prizePool.distribution_rule] ||
                prizePool.distribution_rule}
            </p>
          </div>
        </div>

        {/* Players */}
        <div className="flex items-start gap-2">
          <Icon
            icon="solar:users-group-rounded-bold-duotone"
            width={16}
            className="text-default-400 mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="text-[10px] text-default-400 uppercase tracking-wider">
              Players
            </p>
            <p className="text-sm text-foreground font-medium">
              {prizePool.current_player_count} / {prizePool.max_players}
            </p>
          </div>
        </div>

        {/* Entry Fee */}
        {prizePool.entry_fee_cents > 0 && (
          <div className="flex items-start gap-2">
            <Icon
              icon="solar:ticket-bold-duotone"
              width={16}
              className="text-default-400 mt-0.5 flex-shrink-0"
            />
            <div>
              <p className="text-[10px] text-default-400 uppercase tracking-wider">
                Entry Fee
              </p>
              <p className="text-sm text-foreground font-medium">
                ${(prizePool.entry_fee_cents / 100).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Payouts Breakdown */}
        {prizePool.payouts && prizePool.payouts.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-default-400 uppercase tracking-wider flex items-center gap-1">
              <Icon icon="solar:cup-bold-duotone" width={12} />
              Payout Breakdown
            </p>
            {prizePool.payouts.map((payout, idx) => (
              <div
                key={idx}
                className={clsx(
                  "flex items-center justify-between p-2 rounded-lg border",
                  payout.position === 1
                    ? "bg-success/5 border-success/20"
                    : "bg-default-50/50 border-default-200/30",
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold",
                      electrolize.className,
                      payout.position === 1
                        ? "bg-[#FFC700]/20 text-[#FFC700]"
                        : payout.position === 2
                          ? "bg-default-200 text-default-600"
                          : "bg-[#CD7F32]/20 text-[#CD7F32]",
                    )}
                  >
                    #{payout.position}
                  </span>
                  <span className="text-xs text-default-500 capitalize">
                    {payout.reason}
                  </span>
                </div>
                <span
                  className={clsx("text-sm font-bold", electrolize.className)}
                >
                  ${payout.amount?.dollars?.toFixed(2) || "0.00"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Escrow Release Timer */}
        {prizePool.status === "in_escrow" && prizePool.escrow_release_at && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/5 border border-warning/10 text-xs text-warning">
            <Icon icon="solar:clock-circle-bold-duotone" width={14} />
            <span>
              Escrow release:{" "}
              {new Date(prizePool.escrow_release_at).toLocaleString()}
            </span>
          </div>
        )}

        {/* View in Wallet link */}
        {prizePool.status === "distributed" && (
          <EsportsButton
            size="sm"
            variant="ghost"
            onClick={() => router.push("/wallet")}
            className="w-full"
            startContent={<Icon icon="solar:wallet-bold-duotone" width={16} />}
          >
            View in Wallet
          </EsportsButton>
        )}
      </CardBody>
    </Card>
  );
}

// --- Main Page ---
export default function MatchResultDetailPage() {
  const params = useParams();
  const _router = useRouter();
  const resultId = params?.id as string;
  const { isAuthenticated } = useOptionalAuth();
  const { sdk, isReady } = useSDK();

  const [result, setResult] = useState<MatchResult | null>(null);
  const [prizePool, setPrizePool] = useState<PrizePool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [actionLoading, setActionLoading] = useState(false);

  // Dispute modal
  const disputeModal = useDisclosure();
  const [disputeReason, setDisputeReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchResult = useCallback(async () => {
    if (!isReady || !resultId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await sdk.scores.getMatchResult(resultId);
      if (data) {
        setResult(data);

        // Fetch prize pool if distribution exists
        if (data.prize_distribution_id) {
          try {
            const poolResponse = await sdk.prizePools.getPrizePool({
              pool_id: data.prize_distribution_id,
            });
            if (poolResponse?.pool) {
              setPrizePool(poolResponse.pool);
            }
          } catch (poolErr) {
            logger.error(
              "[MatchResultDetail] Failed to fetch prize pool",
              poolErr,
            );
            // Non-critical - don't block the page
          }
        }
      } else {
        setError("Match result not found");
      }
    } catch (err) {
      logger.error("[MatchResultDetail] Failed to fetch", err);
      setError("Failed to load match result");
    } finally {
      setLoading(false);
    }
  }, [sdk, isReady, resultId]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  // --- Action Handlers ---
  const clearFeedback = () => {
    setActionError(null);
    setActionSuccess(null);
  };

  const handleDispute = async () => {
    if (!resultId || !disputeReason.trim()) return;
    setActionLoading(true);
    clearFeedback();
    try {
      const updated = await sdk.scores.disputeMatchResult(resultId, {
        reason: disputeReason,
      });
      if (updated) {
        setResult(updated);
        disputeModal.onClose();
        setDisputeReason("");
        setActionSuccess("Dispute submitted successfully");
      }
    } catch (err) {
      logger.error("[MatchResultDetail] Dispute failed", err);
      setActionError(
        err instanceof Error ? err.message : "Failed to submit dispute",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!resultId) return;
    setActionLoading(true);
    clearFeedback();
    try {
      const updated = await sdk.scores.verifyMatchResult(resultId, {
        verification_method: "manual",
      });
      if (updated) {
        setResult(updated);
        setActionSuccess("Result verified successfully");
      }
    } catch (err) {
      logger.error("[MatchResultDetail] Verify failed", err);
      setActionError(
        err instanceof Error ? err.message : "Failed to verify result",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!resultId) return;
    setActionLoading(true);
    clearFeedback();
    try {
      const updated = await sdk.scores.finalizeMatchResult(resultId);
      if (updated) {
        setResult(updated);
        setActionSuccess("Result finalized — prizes will be distributed");
      }
    } catch (err) {
      logger.error("[MatchResultDetail] Finalize failed", err);
      setActionError(
        err instanceof Error ? err.message : "Failed to finalize result",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!resultId) return;
    setActionLoading(true);
    clearFeedback();
    try {
      const updated = await sdk.scores.cancelMatchResult(resultId, {
        reason: "Cancelled by admin",
      });
      if (updated) {
        setResult(updated);
        setActionSuccess("Result cancelled");
      }
    } catch (err) {
      logger.error("[MatchResultDetail] Cancel failed", err);
      setActionError(
        err instanceof Error ? err.message : "Failed to cancel result",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Determine available actions based on current status
  const availableActions = useMemo(() => {
    if (!result)
      return {
        canVerify: false,
        canDispute: false,
        canFinalize: false,
        canCancel: false,
      };
    const s = result.status;
    return {
      canVerify: s === "submitted" || s === "under_review",
      canDispute: s === "verified" || s === "submitted" || s === "under_review",
      canFinalize: s === "verified" || s === "conciliated",
      canCancel: s !== "finalized" && s !== "cancelled",
    };
  }, [result]);

  // Loading
  if (loading) {
    return (
      <PageLoadingState
        title="Loading Match Result"
        subtitle="Fetching scores and verification data..."
      />
    );
  }

  // Error
  if (error || !result) {
    return (
      <ErrorState
        title="Error Loading Result"
        message={error || "Match result not found"}
        onRetry={fetchResult}
      />
    );
  }

  return (
    <PageContainer maxWidth="7xl" animate animationVariant="slideUp">
      {/* Breadcrumbs */}
      <BreadcrumbBar />

      {/* Header with Status */}
      <Section className="mt-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Chip
              size="lg"
              variant="flat"
              color={STATUS_COLORS[result.status]}
              startContent={
                <Icon icon="solar:verified-check-bold-duotone" width={16} />
              }
              classNames={{ content: "font-semibold" }}
            >
              {STATUS_LABELS[result.status]}
            </Chip>
            <span className="text-sm text-default-400">
              ID:{" "}
              <code className="text-xs bg-default-100 px-1.5 py-0.5 rounded">
                {resultId.slice(0, 12)}
              </code>
            </span>
            {result.match_id && (
              <EsportsButton
                size="sm"
                variant="ghost"
                onClick={() =>
                  _router.push(`/matches/${result.game_id}/${result.match_id}`)
                }
                startContent={
                  <Icon icon="solar:gamepad-bold-duotone" width={14} />
                }
              >
                View Match
              </EsportsButton>
            )}
          </div>

          {/* Action Buttons */}
          {isAuthenticated && (
            <div className="flex items-center gap-2 flex-wrap">
              {availableActions.canVerify && (
                <EsportsButton
                  size="sm"
                  onClick={handleVerify}
                  loading={actionLoading}
                  startContent={
                    <Icon icon="solar:verified-check-bold-duotone" width={16} />
                  }
                >
                  Verify
                </EsportsButton>
              )}
              {availableActions.canDispute && (
                <EsportsButton
                  size="sm"
                  variant="ghost"
                  onClick={disputeModal.onOpen}
                  startContent={
                    <Icon
                      icon="solar:danger-triangle-bold-duotone"
                      width={16}
                    />
                  }
                >
                  Dispute
                </EsportsButton>
              )}
              {availableActions.canFinalize && (
                <EsportsButton
                  size="sm"
                  onClick={handleFinalize}
                  loading={actionLoading}
                  startContent={
                    <Icon icon="solar:check-circle-bold-duotone" width={16} />
                  }
                >
                  Finalize
                </EsportsButton>
              )}
              {availableActions.canCancel && (
                <EsportsButton
                  size="sm"
                  variant="danger"
                  onClick={handleCancel}
                  loading={actionLoading}
                  startContent={
                    <Icon icon="solar:close-circle-bold-duotone" width={16} />
                  }
                >
                  Cancel
                </EsportsButton>
              )}
            </div>
          )}
        </div>

        {/* Status Timeline */}
        <div className="mt-4">
          <StatusTimeline currentStatus={result.status} />
        </div>

        {/* Action Feedback */}
        {actionSuccess && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm">
            <Icon icon="solar:check-circle-bold-duotone" width={18} />
            {actionSuccess}
          </div>
        )}
        {actionError && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
            <Icon icon="solar:danger-circle-bold-duotone" width={18} />
            {actionError}
          </div>
        )}
      </Section>

      {/* Team Score Hero */}
      <Section className="mb-6">
        <TeamScoreHero result={result} />
      </Section>

      {/* Tabs */}
      <Section>
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          variant="underlined"
          color="danger"
          classNames={{
            tabList:
              "gap-4 w-full relative rounded-none p-0 border-b border-divider flex-wrap",
            cursor: "w-full bg-[#FF4654] dark:bg-[#DCFF37]",
            tab: "max-w-fit px-0 h-12",
            tabContent:
              "group-data-[selected=true]:text-[#FF4654] dark:group-data-[selected=true]:text-[#DCFF37]",
          }}
        >
          <Tab
            key="overview"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:chart-2-bold-duotone" width={16} />
                <span className={electrolize.className}>Overview</span>
              </div>
            }
          />
          <Tab
            key="players"
            title={
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:users-group-rounded-bold-duotone"
                  width={16}
                />
                <span className={electrolize.className}>Players</span>
              </div>
            }
          />
          <Tab
            key="history"
            title={
              <div className="flex items-center gap-2">
                <Icon icon="solar:history-bold-duotone" width={16} />
                <span className={electrolize.className}>History</span>
              </div>
            }
          />
        </Tabs>
      </Section>

      {/* Tab Content */}
      <Section className="mt-6">
        {selectedTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card
                className="bg-content1/60 border border-default-200/30"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                }}
              >
                <CardHeader>
                  <h3
                    className={clsx(
                      "text-sm font-semibold text-default-600 uppercase tracking-wider",
                      electrolize.className,
                    )}
                  >
                    <Icon
                      icon="solar:ranking-bold-duotone"
                      width={16}
                      className="inline mr-1"
                    />
                    Team Results
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {result.team_results?.map((team, idx) => (
                      <div
                        key={team.team_id || idx}
                        className={clsx(
                          "flex items-center justify-between p-4 rounded-xl border transition-all",
                          team.position === 1
                            ? "bg-gradient-to-r from-success/5 to-transparent border-success/20"
                            : "bg-default-50/50 border-default-200/30",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={clsx(
                              "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                              electrolize.className,
                              team.position === 1
                                ? "bg-success/20 text-success"
                                : "bg-default-100 text-default-500",
                            )}
                          >
                            #{team.position}
                          </div>
                          <div>
                            <p
                              className={clsx(
                                "font-semibold",
                                electrolize.className,
                              )}
                            >
                              {team.team_name || `Team ${idx + 1}`}
                            </p>
                            <p className="text-xs text-default-400">
                              {team.players?.length || 0} players
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={clsx(
                              "text-3xl font-black",
                              electrolize.className,
                              team.position === 1
                                ? "text-[#DCFF37]"
                                : "text-default-400",
                            )}
                          >
                            {team.score}
                          </p>
                          <p className="text-[10px] text-default-400 uppercase tracking-wider">
                            Score
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
            <div className="space-y-4">
              <ResultInfoCard result={result} />
              <PrizePoolCard prizePool={prizePool} resultId={resultId} />
              <DisputeHistoryCard result={result} />
            </div>
          </div>
        )}

        {selectedTab === "players" && (
          <Card
            className="bg-content1/60 border border-default-200/30"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
            }}
          >
            <CardBody>
              <PlayerStatsTable
                players={result.player_results || []}
                teamResults={result.team_results || []}
              />
            </CardBody>
          </Card>
        )}

        {selectedTab === "history" && (
          <div className="space-y-4">
            {/* Timeline of events */}
            <Card
              className="bg-content1/60 border border-default-200/30"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
              }}
            >
              <CardHeader>
                <h3
                  className={clsx(
                    "text-sm font-semibold text-default-600 uppercase tracking-wider",
                    electrolize.className,
                  )}
                >
                  <Icon
                    icon="solar:history-bold-duotone"
                    width={16}
                    className="inline mr-1"
                  />
                  Result Timeline
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {/* Created */}
                  <TimelineItem
                    icon="solar:add-circle-bold-duotone"
                    color="text-primary"
                    title="Result Submitted"
                    description={`Source: ${SOURCE_LABELS[result.source]}`}
                    timestamp={result.created_at}
                  />

                  {/* Verified */}
                  {result.verified_at && (
                    <TimelineItem
                      icon="solar:verified-check-bold-duotone"
                      color="text-success"
                      title={`Verified (${result.verification_method?.replace("_", " ")})`}
                      description={
                        result.verified_by
                          ? `By: ${result.verified_by.slice(0, 8)}...`
                          : undefined
                      }
                      timestamp={result.verified_at}
                    />
                  )}

                  {/* Disputed */}
                  {result.disputed_at && (
                    <TimelineItem
                      icon="solar:danger-triangle-bold-duotone"
                      color="text-warning"
                      title="Result Disputed"
                      description={result.dispute_reason}
                      timestamp={result.disputed_at}
                    />
                  )}

                  {/* Conciliated */}
                  {result.conciliated_at && (
                    <TimelineItem
                      icon="solar:shield-check-bold-duotone"
                      color="text-secondary"
                      title="Dispute Resolved"
                      description={result.conciliation_notes}
                      timestamp={result.conciliated_at}
                    />
                  )}

                  {/* Finalized */}
                  {result.finalized_at && (
                    <TimelineItem
                      icon="solar:check-circle-bold-duotone"
                      color="text-success"
                      title="Result Finalized"
                      description={
                        result.prize_distribution_id
                          ? `Prize Distribution: ${result.prize_distribution_id.slice(0, 8)}...`
                          : "Prize distribution triggered"
                      }
                      timestamp={result.finalized_at}
                    />
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Dispute details */}
            <DisputeHistoryCard result={result} />

            {/* Original results if adjusted */}
            {result.original_team_results &&
              result.original_team_results.length > 0 && (
                <Card
                  className="bg-content1/60 border border-warning/20"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                  }}
                >
                  <CardHeader>
                    <h3
                      className={clsx(
                        "text-sm font-semibold text-warning uppercase tracking-wider",
                        electrolize.className,
                      )}
                    >
                      <Icon
                        icon="solar:undo-left-bold-duotone"
                        width={16}
                        className="inline mr-1"
                      />
                      Original Scores (Before Adjustment)
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-2">
                      {result.original_team_results.map((team, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-default-50/50"
                        >
                          <span className="text-sm">
                            {team.team_name || `Team ${idx + 1}`}
                          </span>
                          <span
                            className={clsx(
                              "text-lg font-bold",
                              electrolize.className,
                            )}
                          >
                            {team.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}
          </div>
        )}
      </Section>

      {/* Dispute Modal */}
      <Modal
        isOpen={disputeModal.isOpen}
        onClose={disputeModal.onClose}
        size="lg"
      >
        <ModalContent>
          <ModalHeader className={electrolize.className}>
            <Icon
              icon="solar:danger-triangle-bold-duotone"
              width={20}
              className="text-warning mr-2"
            />
            Dispute Match Result
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-500 mb-3">
              Please provide a detailed reason for disputing this match result.
              Our team will review the dispute and may request additional
              evidence.
            </p>
            <Textarea
              label="Dispute Reason"
              placeholder="Describe the issue with this match result..."
              value={disputeReason}
              onValueChange={setDisputeReason}
              minRows={3}
              maxRows={6}
              variant="bordered"
            />
          </ModalBody>
          <ModalFooter>
            <EsportsButton variant="ghost" onClick={disputeModal.onClose}>
              Cancel
            </EsportsButton>
            <EsportsButton
              onClick={handleDispute}
              loading={actionLoading}
              disabled={!disputeReason.trim()}
            >
              Submit Dispute
            </EsportsButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageContainer>
  );
}

// --- Timeline Item Component ---
function TimelineItem({
  icon,
  color,
  title,
  description,
  timestamp,
}: {
  icon: string;
  color: string;
  title: string;
  description?: string;
  timestamp?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div
          className={clsx(
            "w-8 h-8 rounded-full flex items-center justify-center bg-default-100",
            color,
          )}
        >
          <Icon icon={icon} width={16} />
        </div>
        <div className="w-px h-full bg-default-200 min-h-[16px]" />
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between">
          <p className={clsx("text-sm font-semibold", electrolize.className)}>
            {title}
          </p>
          {timestamp && (
            <span className="text-[10px] text-default-400">
              {new Date(timestamp).toLocaleString()}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-default-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}
