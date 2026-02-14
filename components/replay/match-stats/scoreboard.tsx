"use client";

/**
 * Match Scoreboard Component
 * Displays player statistics in a professional esports-style scoreboard
 */

import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Avatar,
  Chip,
  Tooltip,
  Divider,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { ScoreboardPlayer } from "@/types/replay-api/match-analytics.sdk";

interface TeamScoreboardProps {
  teamName: string;
  teamScore: number;
  teamSide: "CT" | "T";
  players: ScoreboardPlayer[];
  isWinner?: boolean;
}

interface MatchScoreboardProps {
  team1Name?: string;
  team2Name?: string;
  team1Score: number;
  team2Score: number;
  team1Players: ScoreboardPlayer[];
  team2Players: ScoreboardPlayer[];
  mapName?: string;
}

const TeamScoreboard: React.FC<TeamScoreboardProps> = ({
  teamName,
  teamScore,
  teamSide,
  players,
  isWinner,
}) => {
  const sortedPlayers = [...players].sort((a, b) => {
    // Sort by kills, then by ADR, then by rating
    if (b.kills !== a.kills) return b.kills - a.kills;
    if ((b.adr || 0) !== (a.adr || 0)) return (b.adr || 0) - (a.adr || 0);
    return (b.rating || 0) - (a.rating || 0);
  });

  const sideConfig = {
    CT: {
      color: "primary" as const,
      bgClass: "bg-blue-500/10 dark:bg-blue-400/10",
      borderClass: "border-blue-500/30 dark:border-blue-400/30",
      icon: "mdi:shield",
      label: "Counter-Terrorist",
    },
    T: {
      color: "warning" as const,
      bgClass: "bg-amber-500/10 dark:bg-amber-400/10",
      borderClass: "border-amber-500/30 dark:border-amber-400/30",
      icon: "mdi:target",
      label: "Terrorist",
    },
  };

  const config = sideConfig[teamSide];

  return (
    <Card className={`rounded-none border ${config.borderClass} ${config.bgClass}`}>
      <CardHeader className="flex justify-between items-center px-4 py-3">
        <div className="flex items-center gap-3">
          <Icon icon={config.icon} width={24} className={teamSide === "CT" ? "text-blue-500" : "text-amber-500"} />
          <div>
            <h3 className="font-bold text-lg">{teamName || config.label}</h3>
            <p className="text-xs text-default-500">{config.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isWinner && (
            <Chip size="sm" color="success" variant="flat" startContent={<Icon icon="solar:cup-bold" width={14} />}>
              Winner
            </Chip>
          )}
          <span className={`text-3xl font-black ${teamSide === "CT" ? "text-blue-500" : "text-amber-500"}`}>
            {teamScore}
          </span>
        </div>
      </CardHeader>
      <Divider className={config.borderClass.replace("border-", "bg-")} />
      <CardBody className="p-0">
        <Table
          removeWrapper
          aria-label={`${teamName} scoreboard`}
          classNames={{
            th: "bg-transparent text-default-500 text-xs uppercase font-semibold",
            td: "py-2",
          }}
        >
          <TableHeader>
            <TableColumn>Player</TableColumn>
            <TableColumn align="center">K</TableColumn>
            <TableColumn align="center">D</TableColumn>
            <TableColumn align="center">A</TableColumn>
            <TableColumn align="center">ADR</TableColumn>
            <TableColumn align="center">HS%</TableColumn>
            <TableColumn align="center">Rating</TableColumn>
          </TableHeader>
          <TableBody>
            {sortedPlayers.map((player, index) => {
              const kd = player.deaths > 0 ? (player.kills / player.deaths).toFixed(2) : player.kills.toFixed(2);
              const kdColor = parseFloat(kd) >= 1 ? "text-success" : "text-danger";
              const isTopFragger = index === 0;
              const isMVP = player.mvps && player.mvps > 0;

              return (
                <TableRow key={player.player_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar
                        size="sm"
                        name={player.player_name}
                        classNames={{
                          base: teamSide === "CT" ? "bg-blue-500/20" : "bg-amber-500/20",
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-1">
                          {player.player_name}
                          {isTopFragger && (
                            <Tooltip content="Top Fragger">
                              <Icon icon="solar:crown-bold" className="text-amber-400" width={14} />
                            </Tooltip>
                          )}
                          {isMVP && (
                            <Tooltip content={`${player.mvps} MVP${(player.mvps || 0) > 1 ? "s" : ""}`}>
                              <Icon icon="solar:star-bold" className="text-amber-500" width={14} />
                            </Tooltip>
                          )}
                        </span>
                        <span className={`text-xs ${kdColor}`}>{kd} K/D</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold">{player.kills}</TableCell>
                  <TableCell className="text-center text-default-500">{player.deaths}</TableCell>
                  <TableCell className="text-center text-default-400">{player.assists}</TableCell>
                  <TableCell className="text-center">
                    <span className={player.adr && player.adr >= 80 ? "text-success font-medium" : ""}>
                      {player.adr?.toFixed(1) || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={player.hs_percent && player.hs_percent >= 50 ? "text-warning font-medium" : ""}>
                      {player.hs_percent ? `${player.hs_percent.toFixed(0)}%` : "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        player.rating && player.rating >= 1.2
                          ? "success"
                          : player.rating && player.rating >= 0.8
                          ? "default"
                          : "danger"
                      }
                    >
                      {player.rating?.toFixed(2) || "-"}
                    </Chip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};

export const MatchScoreboard: React.FC<MatchScoreboardProps> = ({
  team1Name,
  team2Name,
  team1Score,
  team2Score,
  team1Players,
  team2Players,
  mapName,
}) => {
  const team1IsWinner = team1Score > team2Score;
  const team2IsWinner = team2Score > team1Score;

  return (
    <div className="space-y-6">
      {/* Score Header */}
      <Card className="rounded-none border border-default-200 dark:border-default-100/10">
        <CardBody className="py-6">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-sm text-default-500 mb-1">{team1Name || "Team 1"}</p>
              <span className={`text-5xl font-black ${team1IsWinner ? "text-success" : "text-default-400"}`}>
                {team1Score}
              </span>
            </div>
            <div className="flex flex-col items-center">
              {mapName && (
                <Chip size="sm" variant="flat" className="mb-2">
                  {mapName}
                </Chip>
              )}
              <span className="text-2xl text-default-300">vs</span>
            </div>
            <div className="text-center">
              <p className="text-sm text-default-500 mb-1">{team2Name || "Team 2"}</p>
              <span className={`text-5xl font-black ${team2IsWinner ? "text-success" : "text-default-400"}`}>
                {team2Score}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Team Scoreboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamScoreboard
          teamName={team1Name || "Counter-Terrorists"}
          teamScore={team1Score}
          teamSide="CT"
          players={team1Players}
          isWinner={team1IsWinner}
        />
        <TeamScoreboard
          teamName={team2Name || "Terrorists"}
          teamScore={team2Score}
          teamSide="T"
          players={team2Players}
          isWinner={team2IsWinner}
        />
      </div>
    </div>
  );
};

export default MatchScoreboard;
