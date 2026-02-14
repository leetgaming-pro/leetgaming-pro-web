/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - NextUI Table has strict collection types that don't accept conditional children
// This is a known NextUI limitation. The component works correctly at runtime.
"use client";

import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Tooltip,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import clsx from "clsx";
import { electrolize } from "@/config/fonts";
import { TeamScoreboard, PlayerScoreboardEntry, PlayerStatsEntry } from "@/types/replay-api/sdk";
import { ScoreDisplay, KDADisplay, RatingDisplay, SideIndicator } from "@/components/ui/stat-displays";

interface MatchScoreboardProps {
  team1Scoreboard?: TeamScoreboard;
  team2Scoreboard?: TeamScoreboard;
  variant?: "default" | "compact" | "detailed";
  showAdvancedStats?: boolean;
}

// Color mapping for sides
const SIDE_COLORS = {
  CT: "#00A8FF",
  T: "#FFB800",
};

// Get player stats by index (parallel arrays)
const getPlayerStats = (team: TeamScoreboard, index: number): PlayerStatsEntry | undefined => {
  return team.player_stats?.[index];
};

// Get player info
const _getPlayerInfo = (team: TeamScoreboard, index: number): PlayerScoreboardEntry | undefined => {
  return team.players?.[index];
};

// Stat cell with color coding
function StatCell({
  value,
  good,
  bad,
  neutral,
  tooltip,
  format = "number",
}: {
  value: number | undefined | null;
  good?: number;
  bad?: number;
  neutral?: number;
  tooltip?: string;
  format?: "number" | "percent" | "decimal" | "plusminus";
}) {
  const numValue = value ?? 0;
  
  const getColor = () => {
    if (good !== undefined && numValue >= good) return "text-success";
    if (bad !== undefined && numValue <= bad) return "text-danger";
    if (neutral !== undefined && numValue === neutral) return "text-default-500";
    return "text-default-700";
  };

  const formatValue = () => {
    if (format === "percent") return numValue > 0 ? `${numValue.toFixed(0)}%` : "-";
    if (format === "decimal") return numValue > 0 ? numValue.toFixed(2) : "-";
    if (format === "plusminus") return numValue > 0 ? `+${numValue}` : numValue.toString();
    // Default is "number" format
    return numValue > 0 ? numValue : "-";
  };

  const content = (
    <span className={clsx("font-semibold tabular-nums", getColor())}>
      {formatValue()}
    </span>
  );

  return tooltip ? <Tooltip content={tooltip}>{content}</Tooltip> : content;
}

// Individual team scoreboard card
function TeamScoreboardCard({
  team,
  side,
  isWinner,
  showAdvancedStats,
}: {
  team: TeamScoreboard;
  side: "CT" | "T";
  isWinner: boolean;
  showAdvancedStats: boolean;
}) {
  const sideColor = SIDE_COLORS[side];
  const teamName = team.team?.name || side;
  const players = team.players || [];

  return (
    <Card
      className={clsx(
        "overflow-hidden border-2 transition-all",
        isWinner
          ? "border-[#DCFF37]/50 shadow-lg shadow-[#DCFF37]/10"
          : "border-default-200/50"
      )}
    >
      {/* Team Header */}
      <CardHeader
        className={clsx(
          "py-3 px-4",
          "bg-gradient-to-r",
          side === "CT" ? "from-[#00A8FF]/10 to-transparent" : "from-[#FFB800]/10 to-transparent"
        )}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <SideIndicator side={side} size="md" />
            <div>
              <h3 className={clsx("text-lg font-bold uppercase tracking-tight", electrolize.className)}>
                {teamName}
              </h3>
              <p className="text-xs text-default-500">
                {players.length} players
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isWinner && (
              <Chip
                size="sm"
                color="warning"
                variant="shadow"
                startContent={<Icon icon="solar:crown-bold" width={12} />}
              >
                Winner
              </Chip>
            )}
            <div
              className={clsx("text-4xl font-black", electrolize.className)}
              style={{ color: sideColor }}
            >
              {team.team_score ?? 0}
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Players Table */}
      <CardBody className="p-0">
        <Table
          aria-label={`${teamName} scoreboard`}
          removeWrapper
          classNames={{
            th: "bg-default-50/50 text-default-500 text-[10px] uppercase tracking-wider font-semibold py-2",
            td: "py-2.5 border-b border-default-100/50 last:border-0",
          }}
        >
          <TableHeader>
            <TableColumn className="w-[180px]">PLAYER</TableColumn>
            <TableColumn align="center" className="w-12">K</TableColumn>
            <TableColumn align="center" className="w-12">D</TableColumn>
            <TableColumn align="center" className="w-12">A</TableColumn>
            <TableColumn align="center" className="w-14">+/-</TableColumn>
            <TableColumn align="center" className="w-14">ADR</TableColumn>
            {/* @ts-expect-error NextUI Table types don't accept conditional children, but runtime handles it */}
            {showAdvancedStats && (
              <>
                <TableColumn align="center" className="w-14">HS%</TableColumn>
                <TableColumn align="center" className="w-14">FK</TableColumn>
                <TableColumn align="center" className="w-14">KAST</TableColumn>
              </>
            )}
            <TableColumn align="center" className="w-16">RATING</TableColumn>
            <TableColumn align="center" className="w-12">MVP</TableColumn>
          </TableHeader>
          <TableBody>
            {players.map((player, idx) => {
              const stats = getPlayerStats(team, idx);
              const kills = stats?.kills ?? player.kills ?? 0;
              const deaths = stats?.deaths ?? player.deaths ?? 0;
              const assists = stats?.assists ?? player.assists ?? 0;
              const kdDiff = kills - deaths;
              const adr = stats?.adr ?? player.adr ?? 0;
              const headshotPct = stats?.headshot_pct ?? 0;
              const openingKills = stats?.opening_kills ?? 0;
              const openingDeaths = stats?.opening_deaths ?? 0;
              const kast = stats?.kast ?? 0;
              const rating = stats?.rating_2 ?? 0;
              const mvps = stats?.mvp_count ?? player.mvp_count ?? 0;
              const tradeKills = stats?.trade_kills ?? 0;
              const clutchWins = stats?.clutch_wins ?? 0;
              const flashAssists = stats?.flash_assists ?? 0;

              return (
                <TableRow key={player.id || idx} className="hover:bg-default-50/50">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        size="sm"
                        name={player.name?.[0] || player.display_name?.[0] || "?"}
                        classNames={{
                          base: clsx(
                            "flex-shrink-0",
                            side === "CT" ? "bg-[#00A8FF]/20" : "bg-[#FFB800]/20"
                          ),
                        }}
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate max-w-[130px]">
                          {player.name || player.display_name || `Player ${idx + 1}`}
                        </div>
                        {/* Mini badges */}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {tradeKills > 0 && (
                            <Tooltip content={`${tradeKills} Trade Kills`}>
                              <span className="flex items-center gap-0.5 text-[10px] text-cyan-500">
                                <Icon icon="solar:refresh-circle-bold" width={10} />
                                {tradeKills}
                              </span>
                            </Tooltip>
                          )}
                          {clutchWins > 0 && (
                            <Tooltip content={`${clutchWins} Clutches Won`}>
                              <span className="flex items-center gap-0.5 text-[10px] text-purple-500">
                                <Icon icon="solar:fire-bold" width={10} />
                                {clutchWins}
                              </span>
                            </Tooltip>
                          )}
                          {flashAssists > 0 && (
                            <Tooltip content={`${flashAssists} Flash Assists`}>
                              <span className="flex items-center gap-0.5 text-[10px] text-yellow-500">
                                <Icon icon="solar:flashlight-bold" width={10} />
                                {flashAssists}
                              </span>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatCell value={kills} good={15} bad={5} />
                  </TableCell>
                  <TableCell>
                    <StatCell value={deaths} good={5} bad={15} />
                  </TableCell>
                  <TableCell>
                    <StatCell value={assists} good={5} />
                  </TableCell>
                  <TableCell>
                    <StatCell value={kdDiff} good={3} bad={-3} neutral={0} format="plusminus" />
                  </TableCell>
                  <TableCell>
                    <StatCell value={adr} good={80} bad={50} format="decimal" tooltip="Average Damage per Round" />
                  </TableCell>
                  {/* @ts-expect-error NextUI Table types don't accept conditional children, but runtime handles it */}
                  {showAdvancedStats && (
                    <>
                      <TableCell>
                        <StatCell value={headshotPct} good={50} bad={20} format="percent" tooltip="Headshot Percentage" />
                      </TableCell>
                      <TableCell>
                        <Tooltip content={`First Kills: ${openingKills} | First Deaths: ${openingDeaths}`}>
                          <span className={clsx(
                            "font-semibold text-xs",
                            openingKills > openingDeaths ? "text-success" : openingKills < openingDeaths ? "text-danger" : "text-default-500"
                          )}>
                            {openingKills > 0 || openingDeaths > 0 ? `${openingKills}/${openingDeaths}` : "-"}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <StatCell value={kast} good={75} bad={50} format="percent" tooltip="Kill/Assist/Survive/Trade %" />
                      </TableCell>
                    </>
                  )}
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={rating >= 1.2 ? "success" : rating >= 0.9 ? "warning" : "danger"}
                      className="font-bold text-xs"
                    >
                      {rating > 0 ? rating.toFixed(2) : "-"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {mvps > 0 ? (
                      <div className="flex items-center gap-1 justify-center">
                        <Icon icon="solar:star-bold" className="text-[#FFB800]" width={14} />
                        <span className="font-bold text-[#FFB800] text-sm">{mvps}</span>
                      </div>
                    ) : (
                      <span className="text-default-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}

// Main scoreboard component
export function MatchScoreboard({
  team1Scoreboard,
  team2Scoreboard,
  variant = "default",
  showAdvancedStats = true,
}: MatchScoreboardProps) {
  const team1Score = team1Scoreboard?.team_score ?? 0;
  const team2Score = team2Scoreboard?.team_score ?? 0;
  const team1Wins = team1Score > team2Score;
  const team2Wins = team2Score > team1Score;

  const team1Side = (team1Scoreboard?.side || "CT") as "CT" | "T";
  const team2Side = (team2Scoreboard?.side || "T") as "CT" | "T";

  if (!team1Scoreboard && !team2Scoreboard) {
    return (
      <Card className="bg-default-50/50 border border-default-200/50">
        <CardBody className="py-12 text-center">
          <Icon icon="solar:users-group-rounded-bold-duotone" className="mx-auto text-default-300 mb-4" width={48} />
          <p className="text-default-500">No scoreboard data available</p>
        </CardBody>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <div className="space-y-4">
        {/* Compact score display */}
        <ScoreDisplay
          team1Score={team1Score}
          team2Score={team2Score}
          team1Name={team1Scoreboard?.team?.name || team1Side}
          team2Name={team2Scoreboard?.team?.name || team2Side}
          team1Side={team1Side}
          team2Side={team2Side}
          size="md"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score header */}
      <Card className="bg-gradient-to-r from-[#00A8FF]/5 via-transparent to-[#FFB800]/5 border border-default-200/50">
        <CardBody className="py-6">
          <ScoreDisplay
            team1Score={team1Score}
            team2Score={team2Score}
            team1Name={team1Scoreboard?.team?.name || team1Side}
            team2Name={team2Scoreboard?.team?.name || team2Side}
            team1Side={team1Side}
            team2Side={team2Side}
            size="lg"
          />
        </CardBody>
      </Card>

      {/* Team scoreboards */}
      <div className="space-y-4">
        {team1Scoreboard && (
          <TeamScoreboardCard
            team={team1Scoreboard}
            side={team1Side}
            isWinner={team1Wins}
            showAdvancedStats={showAdvancedStats}
          />
        )}
        {team2Scoreboard && (
          <TeamScoreboardCard
            team={team2Scoreboard}
            side={team2Side}
            isWinner={team2Wins}
            showAdvancedStats={showAdvancedStats}
          />
        )}
      </div>
    </div>
  );
}

// MVP player highlight card
export function MVPHighlight({
  player,
  stats,
  side,
}: {
  player: PlayerScoreboardEntry;
  stats?: PlayerStatsEntry;
  side: "CT" | "T";
}) {
  const _sideColor = SIDE_COLORS[side];
  const kills = stats?.kills ?? 0;
  const deaths = stats?.deaths ?? 0;
  const assists = stats?.assists ?? 0;
  const rating = stats?.rating_2 ?? 0;
  const mvps = stats?.mvp_count ?? 0;

  return (
    <Card className="bg-gradient-to-br from-[#FFB800]/10 to-transparent border-2 border-[#FFB800]/30">
      <CardBody className="p-4">
        <div className="flex items-center gap-4">
          {/* MVP Badge */}
          <div className="relative">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FFB800] to-[#FF6B00] flex items-center justify-center">
              <Icon icon="solar:crown-bold" className="text-white" width={32} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#DCFF37] flex items-center justify-center text-xs font-bold text-[#34445C]">
              {mvps}
            </div>
          </div>

          {/* Player Info */}
          <div className="flex-1">
            <div className="text-xs text-[#FFB800] font-semibold uppercase tracking-wider mb-1">
              Match MVP
            </div>
            <div className={clsx("text-xl font-bold", electrolize.className)}>
              {player.name || player.display_name}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <KDADisplay kills={kills} deaths={deaths} assists={assists} size="sm" showLabels={false} />
              <RatingDisplay rating={rating} size="sm" />
            </div>
          </div>

          {/* Side indicator */}
          <SideIndicator side={side} size="lg" />
        </div>
      </CardBody>
    </Card>
  );
}
