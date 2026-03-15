/**
 * Opponent Scouting Card
 * Detailed opponent analysis with tendencies, weapon preferences, and map strengths
 * Per PRD D.6 - Player Analytics & Performance Tracking
 */

"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Avatar,
  Progress,
  Tabs,
  Tab,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

// ── Types ──────────────────────────────────────────────

export interface OpponentData {
  playerId: string;
  playerName: string;
  avatar?: string;
  teamName?: string;
  teamTag?: string;
  rating: number;
  matchesPlayed: number;

  // Head-to-head record
  h2h: {
    matchesAgainst: number;
    wins: number;
    losses: number;
    draws: number;
    avgRatingAgainst: number;
  };

  // Side tendencies
  tendencies: {
    ctWinRate: number;
    tWinRate: number;
    aggressionScore: number; // 0-100, higher = more aggressive
    entryRate: number;
    clutchRate: number;
    awpUsageRate: number;
    ecoWinRate: number;
    forceWinRate: number;
  };

  // Top weapons
  topWeapons: {
    name: string;
    kills: number;
    hsPercent: number;
    usageRate: number;
  }[];

  // Map preferences
  mapPreferences: {
    mapName: string;
    winRate: number;
    matchesPlayed: number;
    avgRating: number;
    isBan?: boolean;
    isPick?: boolean;
  }[];

  // Recent form
  recentForm: ("win" | "loss" | "draw")[];

  // Key patterns
  patterns: string[];
}

interface OpponentScoutingCardProps {
  opponent: OpponentData;
  isCompact?: boolean;
}

// ── Constants ──────────────────────────────────────────

const WEAPON_ICONS: Record<string, string> = {
  AK47: "solar:shield-bold",
  "AK-47": "solar:shield-bold",
  M4A4: "solar:shield-bold",
  "M4A1-S": "solar:shield-bold",
  AWP: "solar:target-bold",
  Deagle: "solar:fire-bold",
  "Desert Eagle": "solar:fire-bold",
  USP: "solar:fire-minimalistic-bold",
  "USP-S": "solar:fire-minimalistic-bold",
  Glock: "solar:fire-minimalistic-bold",
  default: "solar:bomb-bold",
};

function getWeaponIcon(name: string): string {
  return WEAPON_ICONS[name] || WEAPON_ICONS.default;
}

// ── Component ──────────────────────────────────────────

export function OpponentScoutingCard({
  opponent,
  isCompact = false,
}: OpponentScoutingCardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const h2hWinRate =
    opponent.h2h.matchesAgainst > 0
      ? (opponent.h2h.wins / opponent.h2h.matchesAgainst) * 100
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-content1/50 backdrop-blur-sm border border-white/10">
        {/* Header */}
        <CardHeader className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <Avatar
              src={opponent.avatar}
              name={opponent.playerName}
              size="lg"
              radius="sm"
              className="border-2 border-danger/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{opponent.playerName}</h3>
                {opponent.teamTag && (
                  <Chip size="sm" variant="flat" color="default">
                    {opponent.teamTag}
                  </Chip>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-default-500">
                <span>Rating: {opponent.rating.toFixed(2)}</span>
                <span>·</span>
                <span>{opponent.matchesPlayed} matches</span>
              </div>
            </div>
          </div>

          {/* H2H quick summary */}
          <div className="text-right">
            <div className="flex items-center gap-1">
              <span
                className={`text-xl font-bold ${h2hWinRate >= 50 ? "text-success" : "text-danger"}`}
              >
                {opponent.h2h.wins}W
              </span>
              <span className="text-default-500">-</span>
              <span className="text-xl font-bold text-default-400">
                {opponent.h2h.losses}L
              </span>
            </div>
            <p className="text-xs text-default-500">
              H2H ({opponent.h2h.matchesAgainst} matches)
            </p>
          </div>
        </CardHeader>

        <CardBody className="pt-0">
          {/* Recent form strip */}
          <div className="flex items-center gap-1 mb-4">
            <span className="text-xs text-default-500 mr-2">Recent:</span>
            {opponent.recentForm.slice(0, 10).map((result, idx) => (
              <div
                key={idx}
                className={`w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold ${
                  result === "win"
                    ? "bg-success/20 text-success"
                    : result === "loss"
                      ? "bg-danger/20 text-danger"
                      : "bg-warning/20 text-warning"
                }`}
              >
                {result === "win" ? "W" : result === "loss" ? "L" : "D"}
              </div>
            ))}
          </div>

          {isCompact ? (
            <CompactView opponent={opponent} />
          ) : (
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              size="sm"
              classNames={{
                tabList: "gap-2",
                cursor: "rounded-none bg-[#DCFF37]",
                tab: "rounded-none text-xs",
                tabContent: "group-data-[selected=true]:text-black",
              }}
            >
              <Tab key="overview" title="Overview">
                <OverviewTab opponent={opponent} />
              </Tab>
              <Tab key="weapons" title="Weapons">
                <WeaponsTab opponent={opponent} />
              </Tab>
              <Tab key="maps" title="Maps">
                <MapsTab opponent={opponent} />
              </Tab>
              <Tab key="patterns" title="Intel">
                <PatternsTab opponent={opponent} />
              </Tab>
            </Tabs>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}

// ── Sub-components ─────────────────────────────────────

function CompactView({ opponent }: { opponent: OpponentData }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <TendencyBar
        label="CT Win Rate"
        value={opponent.tendencies.ctWinRate}
        color="#5D79AE"
      />
      <TendencyBar
        label="T Win Rate"
        value={opponent.tendencies.tWinRate}
        color="#DE9B35"
      />
      <TendencyBar
        label="Aggression"
        value={opponent.tendencies.aggressionScore}
        color="#F31260"
      />
      <TendencyBar
        label="Clutch Rate"
        value={opponent.tendencies.clutchRate}
        color="#DCFF37"
      />
    </div>
  );
}

function OverviewTab({ opponent }: { opponent: OpponentData }) {
  const t = opponent.tendencies;

  const playstyleLabel =
    t.aggressionScore >= 70
      ? "Aggressive"
      : t.aggressionScore >= 40
        ? "Balanced"
        : "Passive";

  const playstyleColor =
    t.aggressionScore >= 70
      ? "danger"
      : t.aggressionScore >= 40
        ? "warning"
        : "primary";

  return (
    <div className="space-y-4 mt-3">
      {/* Playstyle badge */}
      <div className="flex items-center gap-2">
        <Chip
          color={playstyleColor as "danger" | "warning" | "primary"}
          variant="flat"
          startContent={
            <Icon icon="solar:user-check-bold" className="w-3.5 h-3.5" />
          }
        >
          {playstyleLabel} Playstyle
        </Chip>
        {t.awpUsageRate > 30 && (
          <Chip
            color="secondary"
            variant="flat"
            startContent={
              <Icon icon="solar:target-bold" className="w-3.5 h-3.5" />
            }
          >
            AWP Player ({t.awpUsageRate.toFixed(0)}%)
          </Chip>
        )}
      </div>

      {/* Tendencies grid */}
      <div className="grid grid-cols-2 gap-3">
        <TendencyBar
          label="CT Win Rate"
          value={t.ctWinRate}
          color="#5D79AE"
          icon="solar:shield-bold"
        />
        <TendencyBar
          label="T Win Rate"
          value={t.tWinRate}
          color="#DE9B35"
          icon="solar:bomb-bold"
        />
        <TendencyBar
          label="Entry Rate"
          value={t.entryRate}
          color="#17C964"
          icon="solar:running-round-bold"
        />
        <TendencyBar
          label="Clutch Rate"
          value={t.clutchRate}
          color="#DCFF37"
          icon="solar:star-bold"
        />
        <TendencyBar
          label="Eco Win Rate"
          value={t.ecoWinRate}
          color="#F5A524"
          icon="solar:dollar-bold"
        />
        <TendencyBar
          label="Force Win Rate"
          value={t.forceWinRate}
          color="#006FEE"
          icon="solar:bolt-bold"
        />
      </div>

      {/* Aggression meter */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-default-500">Aggression Level</span>
          <span className="font-medium">
            {t.aggressionScore.toFixed(0)}/100
          </span>
        </div>
        <div className="relative h-2 rounded-full bg-default-100 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
            style={{
              width: `${t.aggressionScore}%`,
              background: `linear-gradient(90deg, #006FEE, #F5A524, #F31260)`,
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-default-400 mt-0.5">
          <span>Passive</span>
          <span>Balanced</span>
          <span>Aggressive</span>
        </div>
      </div>
    </div>
  );
}

function WeaponsTab({ opponent }: { opponent: OpponentData }) {
  const maxKills = Math.max(...opponent.topWeapons.map((w) => w.kills), 1);

  return (
    <div className="space-y-3 mt-3">
      {opponent.topWeapons.slice(0, 6).map((weapon, idx) => (
        <div
          key={weapon.name}
          className="flex items-center gap-3 p-2 rounded-lg bg-default-50/50"
        >
          <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center">
            <span className="text-xs font-bold text-default-400">
              #{idx + 1}
            </span>
          </div>
          <Icon
            icon={getWeaponIcon(weapon.name)}
            className="w-5 h-5 text-default-400"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{weapon.name}</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-default-500">{weapon.kills} kills</span>
                <Chip size="sm" variant="flat" className="h-4 text-[10px]">
                  {weapon.hsPercent.toFixed(0)}% HS
                </Chip>
              </div>
            </div>
            <Progress
              value={(weapon.kills / maxKills) * 100}
              size="sm"
              classNames={{
                indicator: "bg-gradient-to-r from-[#DCFF37] to-[#17C964]",
              }}
            />
          </div>
        </div>
      ))}
      {opponent.topWeapons.length === 0 && (
        <p className="text-sm text-default-500 text-center py-4">
          No weapon data available
        </p>
      )}
    </div>
  );
}

function MapsTab({ opponent }: { opponent: OpponentData }) {
  return (
    <div className="space-y-3 mt-3">
      {opponent.mapPreferences.map((map) => (
        <div
          key={map.mapName}
          className="flex items-center gap-3 p-3 rounded-lg bg-default-50/50"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{map.mapName}</span>
              {map.isPick && (
                <Chip
                  size="sm"
                  color="success"
                  variant="flat"
                  className="h-4 text-[10px]"
                >
                  PICK
                </Chip>
              )}
              {map.isBan && (
                <Chip
                  size="sm"
                  color="danger"
                  variant="flat"
                  className="h-4 text-[10px]"
                >
                  BAN
                </Chip>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-default-500">
              <span>{map.matchesPlayed} matches</span>
              <span>Rating: {map.avgRating.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`text-lg font-bold ${map.winRate >= 50 ? "text-success" : "text-danger"}`}
            >
              {map.winRate.toFixed(0)}%
            </span>
            <p className="text-[10px] text-default-500">Win Rate</p>
          </div>
        </div>
      ))}
      {opponent.mapPreferences.length === 0 && (
        <p className="text-sm text-default-500 text-center py-4">
          No map data available
        </p>
      )}
    </div>
  );
}

function PatternsTab({ opponent }: { opponent: OpponentData }) {
  return (
    <div className="space-y-3 mt-3">
      <p className="text-xs text-default-500 mb-2">
        Key patterns detected from {opponent.matchesPlayed} matches:
      </p>
      {opponent.patterns.map((pattern, idx) => (
        <div
          key={idx}
          className="flex items-start gap-3 p-3 rounded-lg bg-default-50/50"
        >
          <div className="w-6 h-6 rounded-full bg-[#DCFF37]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon
              icon="solar:lightbulb-bold"
              className="w-3.5 h-3.5 text-[#DCFF37]"
            />
          </div>
          <p className="text-sm">{pattern}</p>
        </div>
      ))}
      {opponent.patterns.length === 0 && (
        <p className="text-sm text-default-500 text-center py-4">
          Not enough data to detect patterns yet
        </p>
      )}
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────

function TendencyBar({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon?: string;
}) {
  return (
    <Tooltip content={`${label}: ${value.toFixed(1)}%`}>
      <div>
        <div className="flex items-center justify-between text-xs mb-1">
          <div className="flex items-center gap-1 text-default-500">
            {icon && <Icon icon={icon} className="w-3 h-3" />}
            <span>{label}</span>
          </div>
          <span className="font-medium" style={{ color }}>
            {value.toFixed(0)}%
          </span>
        </div>
        <Progress
          value={value}
          size="sm"
          classNames={{
            indicator: "",
          }}
          style={
            {
              "--nextui-progress-indicator": color,
            } as React.CSSProperties
          }
        />
      </div>
    </Tooltip>
  );
}

export default OpponentScoutingCard;
