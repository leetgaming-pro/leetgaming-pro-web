"use client";

/**
 * Escrow History Panel Component
 * Displays match escrow history with outcomes, winnings, and blockchain verification
 * Features filtering, stats overview, and award-winning LeetGaming branding
 */

import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Tooltip,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Input,
  Select,
  SelectItem,
  Skeleton,
  Link,
  Button,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { cn } from "@nextui-org/react";
import type {
  EscrowHistoryEntry,
  UserEscrowStats,
} from "@/types/replay-api/escrow-wallet.types";
import { getChainIcon } from "@/types/replay-api/escrow-wallet.types";
import { CHAIN_CONFIGS } from "@/types/replay-api/blockchain.types";
import { AnimatedCounter } from "@/components/ui/animated-counter";

interface EscrowHistoryPanelProps {
  history: EscrowHistoryEntry[];
  stats: UserEscrowStats;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onViewMatch?: (matchId: string) => void;
  className?: string;
}

// Game icons mapping
const getGameIcon = (gameId: string): string => {
  const icons: Record<string, string> = {
    cs2: "simple-icons:counterstrike",
    valorant: "simple-icons:valorant",
    league: "simple-icons:leagueoflegends",
    dota2: "simple-icons:dota2",
    pubg: "simple-icons:pubg",
    fortnite: "simple-icons:fortnite",
  };
  return icons[gameId] || "solar:gamepad-bold";
};

// Status configuration
const getStatusConfig = (status: EscrowHistoryEntry["status"]) => {
  const configs = {
    won: { label: "Won", color: "success" as const, icon: "solar:cup-bold" },
    lost: {
      label: "Lost",
      color: "danger" as const,
      icon: "solar:close-circle-bold",
    },
    refunded: {
      label: "Refunded",
      color: "warning" as const,
      icon: "solar:undo-left-bold",
    },
    pending: {
      label: "Pending",
      color: "default" as const,
      icon: "solar:clock-circle-bold",
    },
  };
  return configs[status] || configs.pending;
};

// Stats Card Component
function StatsOverview({
  stats,
  compact = false,
}: {
  stats: UserEscrowStats;
  compact?: boolean;
}) {
  const isPositive = stats.net_profit.dollars >= 0;

  return (
    <div className={cn("grid gap-3", compact ? "grid-cols-2" : "grid-cols-4")}>
      {/* Win Rate */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-3 rounded-lg bg-[#34445C]/5 dark:bg-[#DCFF37]/5 border border-[#34445C]/10 dark:border-[#DCFF37]/10"
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Icon
            icon="solar:chart-2-bold-duotone"
            className="text-[#FF4654] dark:text-[#DCFF37]"
            width={18}
          />
          <span className="text-xs text-default-500 uppercase tracking-wider">
            Win Rate
          </span>
        </div>
        <p className="text-xl font-bold text-[#34445C] dark:text-white">
          {(stats.win_rate * 100).toFixed(1)}%
        </p>
        <p className="text-xs text-default-500">
          {stats.total_matches_won}/{stats.total_matches_entered} matches
        </p>
      </motion.div>

      {/* Net Profit */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "p-3 rounded-lg border",
          isPositive
            ? "bg-success/10 border-success/20"
            : "bg-danger/10 border-danger/20",
        )}
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Icon
            icon={
              isPositive
                ? "solar:graph-up-bold-duotone"
                : "solar:graph-down-bold-duotone"
            }
            className={isPositive ? "text-success" : "text-danger"}
            width={18}
          />
          <span className="text-xs text-default-500 uppercase tracking-wider">
            Net Profit
          </span>
        </div>
        <p
          className={cn(
            "text-xl font-bold",
            isPositive ? "text-success" : "text-danger",
          )}
        >
          {isPositive ? "+" : ""}
          <AnimatedCounter
            value={stats.net_profit.dollars}
            prefix="$"
            decimals={2}
          />
        </p>
        <p className="text-xs text-default-500">All time</p>
      </motion.div>

      {/* Biggest Win */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-3 rounded-lg bg-gradient-to-br from-[#FFC700]/10 to-[#FF4654]/10 border border-[#FFC700]/20"
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Icon
            icon="solar:cup-star-bold-duotone"
            className="text-[#FFC700]"
            width={18}
          />
          <span className="text-xs text-default-500 uppercase tracking-wider">
            Biggest Win
          </span>
        </div>
        <p className="text-xl font-bold text-[#FFC700]">
          <AnimatedCounter
            value={stats.biggest_win.dollars}
            prefix="$"
            decimals={2}
          />
        </p>
        <p className="text-xs text-default-500">Personal record</p>
      </motion.div>

      {/* Current Streak */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-3 rounded-lg bg-[#34445C]/5 dark:bg-[#DCFF37]/5 border border-[#34445C]/10 dark:border-[#DCFF37]/10"
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Icon
            icon="solar:fire-bold-duotone"
            className="text-[#FF4654]"
            width={18}
          />
          <span className="text-xs text-default-500 uppercase tracking-wider">
            Streak
          </span>
        </div>
        <p className="text-xl font-bold text-[#34445C] dark:text-white">
          {stats.current_streak} 🔥
        </p>
        <p className="text-xs text-default-500">Best: {stats.best_streak}</p>
      </motion.div>
    </div>
  );
}

// History Table Row
function HistoryRow({
  entry,
  onViewMatch,
}: {
  entry: EscrowHistoryEntry;
  onViewMatch?: (matchId: string) => void;
}) {
  const statusConfig = getStatusConfig(entry.status);
  const chainConfig = CHAIN_CONFIGS[entry.chain_id];

  return (
    <TableRow key={entry.match_id}>
      {/* Game & Mode */}
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#34445C]/10 dark:bg-[#DCFF37]/10 flex items-center justify-center">
            <Icon
              icon={getGameIcon(entry.game_id)}
              className="text-[#34445C] dark:text-[#DCFF37]"
              width={18}
            />
          </div>
          <div>
            <p className="font-medium text-sm text-[#34445C] dark:text-white">
              {entry.game_mode}
            </p>
            <p className="text-xs text-default-500">
              {entry.total_participants} players
            </p>
          </div>
        </div>
      </TableCell>

      {/* Entry Fee */}
      <TableCell>
        <span className="text-sm font-medium text-[#34445C] dark:text-white">
          ${entry.entry_fee.dollars.toFixed(2)}
        </span>
      </TableCell>

      {/* Prize Pool */}
      <TableCell>
        <span className="text-sm text-default-600">
          ${entry.total_pot.dollars.toFixed(2)}
        </span>
      </TableCell>

      {/* Result */}
      <TableCell>
        <div className="flex items-center gap-2">
          <Chip
            size="sm"
            color={statusConfig.color}
            variant="flat"
            startContent={<Icon icon={statusConfig.icon} width={14} />}
            className="rounded-none"
          >
            {statusConfig.label}
          </Chip>
          {entry.rank && entry.rank <= 3 && (
            <span className="text-sm">
              {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
            </span>
          )}
        </div>
      </TableCell>

      {/* Profit/Loss */}
      <TableCell>
        {entry.prize_won ? (
          <span className="font-bold text-success">
            +${entry.prize_won.dollars.toFixed(2)}
          </span>
        ) : entry.status === "refunded" ? (
          <span className="text-warning">Refunded</span>
        ) : (
          <span className="text-danger">
            -${entry.entry_fee.dollars.toFixed(2)}
          </span>
        )}
      </TableCell>

      {/* Chain & Date */}
      <TableCell>
        <div className="flex items-center gap-2">
          <Tooltip content={chainConfig?.name || entry.chain_id}>
            <div className="w-6 h-6 rounded bg-[#34445C]/10 dark:bg-[#DCFF37]/10 flex items-center justify-center">
              <Icon icon={getChainIcon(entry.chain_id)} width={14} />
            </div>
          </Tooltip>
          <span className="text-xs text-default-500">
            {new Date(entry.match_date).toLocaleDateString()}
          </span>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex items-center gap-1">
          {entry.settlement_verified && entry.explorer_url && (
            <Tooltip content="View on blockchain">
              <Button
                as={Link}
                href={entry.explorer_url}
                isExternal
                isIconOnly
                size="sm"
                variant="light"
              >
                <Icon icon="solar:link-bold" width={16} />
              </Button>
            </Tooltip>
          )}
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => onViewMatch?.(entry.match_id)}
          >
            <Icon icon="solar:eye-bold" width={16} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function EscrowHistoryPanel({
  history,
  stats,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  onViewMatch,
  className,
}: EscrowHistoryPanelProps) {
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterGame, setFilterGame] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const rowsPerPage = 10;

  // Filter history
  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
      if (filterStatus !== "all" && entry.status !== filterStatus) return false;
      if (filterGame !== "all" && entry.game_id !== filterGame) return false;
      if (
        searchQuery &&
        !entry.game_mode.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [history, filterStatus, filterGame, searchQuery]);

  // Paginate
  const paginatedHistory = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredHistory.slice(start, start + rowsPerPage);
  }, [filteredHistory, page]);

  const totalPages = Math.ceil(filteredHistory.length / rowsPerPage);

  // Unique games for filter
  const uniqueGames = useMemo(() => {
    return Array.from(new Set(history.map((h) => h.game_id)));
  }, [history]);

  if (isLoading) {
    return (
      <Card className={cn("rounded-none", className)}>
        <CardBody className="gap-4">
          <div className="grid grid-cols-4 gap-3">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "bg-gradient-to-br from-[#34445C]/5 to-[#FF4654]/5 dark:from-[#DCFF37]/5 dark:to-[#34445C]/10",
        "border-2 border-[#34445C]/20 dark:border-[#DCFF37]/20 rounded-none overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      <CardHeader className="flex items-center justify-between bg-[#34445C]/5 dark:bg-[#DCFF37]/5 pb-3">
        <div className="flex items-center gap-2">
          <Icon
            icon="solar:history-bold-duotone"
            width={24}
            className="text-[#FF4654] dark:text-[#DCFF37]"
          />
          <span className="font-semibold text-[#34445C] dark:text-white">
            Match History
          </span>
          <Chip size="sm" variant="flat" className="rounded-none">
            {filteredHistory.length} matches
          </Chip>
        </div>
      </CardHeader>

      <CardBody className="gap-4">
        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        <Divider />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search matches..."
            size="sm"
            className="max-w-xs"
            startContent={
              <Icon
                icon="solar:magnifer-bold"
                className="text-default-400"
                width={16}
              />
            }
            value={searchQuery}
            onValueChange={setSearchQuery}
            classNames={{
              inputWrapper:
                "rounded-none border-[#34445C]/30 dark:border-[#DCFF37]/30",
            }}
          />

          <Select
            size="sm"
            className="max-w-[150px]"
            selectedKeys={new Set([filterStatus])}
            onSelectionChange={(keys) =>
              setFilterStatus(Array.from(keys)[0] as string)
            }
            classNames={{
              trigger:
                "rounded-none border-[#34445C]/30 dark:border-[#DCFF37]/30",
            }}
          >
            <SelectItem key="all">All Status</SelectItem>
            <SelectItem key="won">Won</SelectItem>
            <SelectItem key="lost">Lost</SelectItem>
            <SelectItem key="refunded">Refunded</SelectItem>
            <SelectItem key="pending">Pending</SelectItem>
          </Select>

          <Select
            size="sm"
            className="max-w-[150px]"
            selectedKeys={new Set([filterGame])}
            onSelectionChange={(keys) =>
              setFilterGame(Array.from(keys)[0] as string)
            }
            classNames={{
              trigger:
                "rounded-none border-[#34445C]/30 dark:border-[#DCFF37]/30",
            }}
          >
            {["all", ...uniqueGames].map((game) => (
              <SelectItem key={game}>
                {game === "all" ? "All Games" : game.toUpperCase()}
              </SelectItem>
            ))}
          </Select>

          <div className="flex-1" />

          <Button
            size="sm"
            variant="flat"
            className="rounded-none"
            startContent={<Icon icon="solar:download-bold" width={16} />}
          >
            Export
          </Button>
        </div>

        {/* History Table */}
        {filteredHistory.length > 0 ? (
          <>
            <Table
              aria-label="Match escrow history"
              removeWrapper
              classNames={{
                th: "bg-[#34445C]/5 dark:bg-[#DCFF37]/5 text-[#34445C] dark:text-[#DCFF37] rounded-none first:rounded-l-none last:rounded-r-none",
                td: "py-3",
              }}
            >
              <TableHeader>
                <TableColumn>MATCH</TableColumn>
                <TableColumn>ENTRY</TableColumn>
                <TableColumn>POOL</TableColumn>
                <TableColumn>RESULT</TableColumn>
                <TableColumn>PROFIT/LOSS</TableColumn>
                <TableColumn>CHAIN</TableColumn>
                <TableColumn width={80}>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedHistory.map((entry) => (
                  <HistoryRow
                    key={entry.match_id}
                    entry={entry}
                    onViewMatch={onViewMatch}
                  />
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center py-2">
                <Pagination
                  total={totalPages}
                  page={page}
                  onChange={setPage}
                  showControls
                  size="sm"
                  classNames={{
                    cursor: "rounded-none bg-[#FF4654] dark:bg-[#DCFF37]",
                  }}
                />
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center">
                <Button
                  variant="flat"
                  className="rounded-none"
                  onPress={onLoadMore}
                  endContent={
                    <Icon icon="solar:alt-arrow-down-bold" width={16} />
                  }
                >
                  Load More Matches
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#34445C]/10 to-[#FF4654]/10 dark:from-[#DCFF37]/10 dark:to-[#34445C]/10 flex items-center justify-center mb-4"
              style={{
                clipPath:
                  "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
              }}
            >
              <Icon
                icon="solar:history-bold-duotone"
                width={40}
                className="text-default-300"
              />
            </div>
            <p className="text-default-500 font-medium">No match history yet</p>
            <p className="text-sm text-default-400 mt-1">
              Your escrow match results will appear here
            </p>
            <Button
              color="primary"
              variant="flat"
              className="mt-4 rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-white dark:text-[#34445C]"
              startContent={<Icon icon="solar:gamepad-bold" width={18} />}
            >
              Find a Match
            </Button>
          </motion.div>
        )}

        {/* 30-Day Summary */}
        {stats.last_30_days && (
          <>
            <Divider />
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#34445C]/5 dark:bg-[#DCFF37]/5">
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:calendar-bold"
                  className="text-default-500"
                  width={18}
                />
                <span className="text-sm text-default-600">Last 30 Days</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-default-500">Matches: </span>
                  <span className="font-semibold text-[#34445C] dark:text-white">
                    {stats.last_30_days.matches}
                  </span>
                </div>
                <div>
                  <span className="text-default-500">Wins: </span>
                  <span className="font-semibold text-success">
                    {stats.last_30_days.wins}
                  </span>
                </div>
                <div>
                  <span className="text-default-500">Profit: </span>
                  <span
                    className={cn(
                      "font-semibold",
                      stats.last_30_days.profit.dollars >= 0
                        ? "text-success"
                        : "text-danger",
                    )}
                  >
                    {stats.last_30_days.profit.dollars >= 0 ? "+" : ""}$
                    {stats.last_30_days.profit.dollars.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

export default EscrowHistoryPanel;
