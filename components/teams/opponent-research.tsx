"use client";

/**
 * Opponent Research Component
 * Per PRD D.5.3 and Section 3.3.1 - Team Premium Feature
 *
 * Features:
 * - Opponent team search and analysis
 * - Match history tracking
 * - Player stats breakdown
 * - Tendency analysis (maps, agents, strategies)
 * - Scouting reports generation
 * - Notes and bookmarks for opponents
 */

import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  Button,
  Avatar,
  Chip,
  Progress,
  Input,
  Tabs,
  Tab,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export interface OpponentTeam {
  id: string;
  name: string;
  tag: string;
  logo?: string;
  region: string;
  tier: "amateur" | "semi-pro" | "professional";
  rating: number;
  wins: number;
  losses: number;
  players: OpponentPlayer[];
  recentMatches: OpponentMatch[];
  tendencies: TeamTendencies;
  lastUpdated: string;
}

export interface OpponentPlayer {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  rating: number;
  mainAgent?: string;
  playstyle?: string;
  stats: PlayerStats;
}

export interface PlayerStats {
  kd: number;
  adr: number;
  kast: number;
  clutchRate: number;
  firstKillRate: number;
  headshots: number;
}

export interface OpponentMatch {
  id: string;
  date: string;
  opponent: string;
  opponentLogo?: string;
  map: string;
  score: string;
  result: "win" | "loss" | "draw";
  tournamentName?: string;
}

export interface TeamTendencies {
  preferredMaps: MapTendency[];
  commonComps: AgentComp[];
  attackStyle: "aggressive" | "methodical" | "mixed";
  defenseStyle: "aggressive" | "passive" | "mixed";
  economyPatterns: string[];
  weaknesses: string[];
  strengths: string[];
}

export interface MapTendency {
  map: string;
  pickRate: number;
  winRate: number;
  avgRounds: number;
}

export interface AgentComp {
  agents: string[];
  useRate: number;
  winRate: number;
}

export interface ScoutingNote {
  id: string;
  teamId: string;
  authorId: string;
  authorName: string;
  content: string;
  category: "general" | "strategy" | "weakness" | "player" | "map";
  createdAt: string;
  updatedAt: string;
}

export interface ScoutingReport {
  id: string;
  teamId: string;
  teamName: string;
  generatedAt: string;
  sections: ReportSection[];
}

export interface ReportSection {
  title: string;
  content: string;
  type: "overview" | "players" | "maps" | "strategies" | "recommendations";
}

// ============================================================================
// Component Props
// ============================================================================

interface OpponentResearchProps {
  myTeamId: string;
  savedOpponents?: OpponentTeam[];
  recentSearches?: string[];
  onSearchTeam: (query: string) => Promise<OpponentTeam[]>;
  onSaveOpponent: (teamId: string) => void;
  onRemoveOpponent: (teamId: string) => void;
  onAddNote: (
    teamId: string,
    note: Omit<ScoutingNote, "id" | "createdAt" | "updatedAt">
  ) => void;
  onGenerateReport: (teamId: string) => Promise<ScoutingReport>;
  className?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function OpponentResearch({
  myTeamId: _myTeamId,
  savedOpponents = [],
  recentSearches = [],
  onSearchTeam,
  onSaveOpponent,
  onRemoveOpponent,
  onAddNote,
  onGenerateReport,
  className = "",
}: OpponentResearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<OpponentTeam[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<OpponentTeam | null>(null);
  const [activeTab, setActiveTab] = useState("saved");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await onSearchTeam(searchQuery);
      setSearchResults(results);
      setActiveTab("search");
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateReport = async (teamId: string) => {
    setIsGeneratingReport(true);
    try {
      await onGenerateReport(teamId);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const savedTeamIds = useMemo(
    () => new Set(savedOpponents.map((t) => t.id)),
    [savedOpponents]
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Opponent Research</h2>
          <p className="text-default-500">
            Scout and analyze opponents to prepare for matches
          </p>
        </div>
        <Chip
          color="warning"
          variant="flat"
          startContent={<Icon icon="mdi:crown" />}
        >
          Team Premium
        </Chip>
      </div>

      {/* Search Bar */}
      <Card>
        <CardBody>
          <div className="flex gap-3">
            <Input
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Search for teams by name or tag..."
              startContent={
                <Icon icon="mdi:magnify" className="text-default-400" />
              }
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              classNames={{
                input: "text-base",
              }}
            />
            <Button
              color="primary"
              isLoading={isSearching}
              onPress={handleSearch}
              startContent={!isSearching && <Icon icon="mdi:magnify" />}
            >
              Search
            </Button>
          </div>

          {recentSearches.length > 0 && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-default-500">Recent:</span>
              {recentSearches.slice(0, 5).map((term, i) => (
                <Chip
                  key={i}
                  size="sm"
                  variant="flat"
                  className="cursor-pointer"
                  onClick={() => {
                    setSearchQuery(term);
                  }}
                >
                  {term}
                </Chip>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team List */}
        <Card className="lg:col-span-1">
          <CardBody className="p-0">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              fullWidth
              classNames={{
                tabList: "rounded-none",
              }}
            >
              <Tab
                key="saved"
                title={
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:bookmark" />
                    <span>Saved ({savedOpponents.length})</span>
                  </div>
                }
              />
              <Tab
                key="search"
                title={
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:magnify" />
                    <span>Results ({searchResults.length})</span>
                  </div>
                }
              />
            </Tabs>

            <div className="p-4 max-h-[600px] overflow-y-auto">
              {activeTab === "saved" && (
                <TeamList
                  teams={savedOpponents}
                  selectedTeamId={selectedTeam?.id}
                  onSelectTeam={setSelectedTeam}
                  savedTeamIds={savedTeamIds}
                  onToggleSave={onSaveOpponent}
                  emptyMessage="No saved opponents yet. Search and save teams to track them."
                />
              )}
              {activeTab === "search" && (
                <TeamList
                  teams={searchResults}
                  selectedTeamId={selectedTeam?.id}
                  onSelectTeam={setSelectedTeam}
                  savedTeamIds={savedTeamIds}
                  onToggleSave={onSaveOpponent}
                  emptyMessage="No results found. Try a different search term."
                />
              )}
            </div>
          </CardBody>
        </Card>

        {/* Team Details */}
        <div className="lg:col-span-2">
          {selectedTeam ? (
            <TeamDetailView
              team={selectedTeam}
              isSaved={savedTeamIds.has(selectedTeam.id)}
              onSave={() => onSaveOpponent(selectedTeam.id)}
              onRemove={() => onRemoveOpponent(selectedTeam.id)}
              onAddNote={(note) => onAddNote(selectedTeam.id, note)}
              onGenerateReport={() => handleGenerateReport(selectedTeam.id)}
              isGeneratingReport={isGeneratingReport}
            />
          ) : (
            <Card className="h-full min-h-[400px]">
              <CardBody className="flex items-center justify-center">
                <div className="text-center">
                  <Icon
                    icon="mdi:account-search"
                    className="text-6xl text-default-300 mb-4"
                  />
                  <p className="text-default-500">
                    Select a team to view their details and analysis
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Team List Component
// ============================================================================

interface TeamListProps {
  teams: OpponentTeam[];
  selectedTeamId?: string;
  onSelectTeam: (team: OpponentTeam) => void;
  savedTeamIds: Set<string>;
  onToggleSave: (teamId: string) => void;
  emptyMessage: string;
}

function TeamList({
  teams,
  selectedTeamId,
  onSelectTeam,
  savedTeamIds,
  onToggleSave,
  emptyMessage,
}: TeamListProps) {
  if (teams.length === 0) {
    return (
      <div className="text-center py-8 text-default-500">
        <Icon icon="mdi:account-group" className="text-4xl mb-2" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {teams.map((team) => (
        <motion.div
          key={team.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card
            isPressable
            isHoverable
            className={`${
              selectedTeamId === team.id ? "border-2 border-primary" : ""
            }`}
            onPress={() => onSelectTeam(team)}
          >
            <CardBody className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={team.logo}
                    name={team.tag}
                    size="sm"
                    radius="sm"
                  />
                  <div>
                    <p className="font-semibold">{team.name}</p>
                    <div className="flex items-center gap-2 text-xs text-default-500">
                      <span>[{team.tag}]</span>
                      <span>•</span>
                      <span>{team.region}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Chip
                    size="sm"
                    variant="flat"
                    color={
                      team.wins > team.losses
                        ? "success"
                        : team.wins < team.losses
                        ? "danger"
                        : "default"
                    }
                  >
                    {team.wins}W-{team.losses}L
                  </Chip>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => {
                      onToggleSave(team.id);
                    }}
                  >
                    <Icon
                      icon={
                        savedTeamIds.has(team.id)
                          ? "mdi:bookmark"
                          : "mdi:bookmark-outline"
                      }
                      className={`text-lg ${
                        savedTeamIds.has(team.id) ? "text-warning" : ""
                      }`}
                    />
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// Team Detail View Component
// ============================================================================

interface TeamDetailViewProps {
  team: OpponentTeam;
  isSaved: boolean;
  onSave: () => void;
  onRemove: () => void;
  onAddNote: (
    note: Omit<ScoutingNote, "id" | "createdAt" | "updatedAt">
  ) => void;
  onGenerateReport: () => void;
  isGeneratingReport: boolean;
}

function TeamDetailView({
  team,
  isSaved,
  onSave,
  onRemove,
  onAddNote,
  onGenerateReport,
  isGeneratingReport,
}: TeamDetailViewProps) {
  const [detailTab, setDetailTab] = useState("overview");
  const noteModal = useDisclosure();

  return (
    <Card>
      <CardBody className="p-0">
        {/* Team Header */}
        <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                src={team.logo}
                name={team.tag}
                size="lg"
                radius="sm"
                className="w-16 h-16"
              />
              <div>
                <h3 className="text-2xl font-bold">{team.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <Chip size="sm" variant="flat">
                    [{team.tag}]
                  </Chip>
                  <Chip size="sm" variant="flat" color="primary">
                    {team.region}
                  </Chip>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={
                      team.tier === "professional"
                        ? "warning"
                        : team.tier === "semi-pro"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {team.tier}
                  </Chip>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="flat"
                onPress={noteModal.onOpen}
                startContent={<Icon icon="mdi:note-plus" />}
              >
                Add Note
              </Button>
              <Button
                color="secondary"
                variant="flat"
                isLoading={isGeneratingReport}
                onPress={onGenerateReport}
                startContent={
                  !isGeneratingReport && <Icon icon="mdi:file-document" />
                }
              >
                Generate Report
              </Button>
              <Button
                color={isSaved ? "warning" : "default"}
                variant={isSaved ? "flat" : "bordered"}
                onPress={isSaved ? onRemove : onSave}
                startContent={
                  <Icon
                    icon={isSaved ? "mdi:bookmark-remove" : "mdi:bookmark-plus"}
                  />
                }
              >
                {isSaved ? "Remove" : "Save"}
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <StatCard
              label="Rating"
              value={team.rating.toFixed(0)}
              icon="mdi:chart-line"
            />
            <StatCard
              label="Win Rate"
              value={`${((team.wins / (team.wins + team.losses)) * 100).toFixed(
                1
              )}%`}
              icon="mdi:trophy"
              color={team.wins > team.losses ? "success" : "danger"}
            />
            <StatCard
              label="Record"
              value={`${team.wins}W-${team.losses}L`}
              icon="mdi:scoreboard"
            />
            <StatCard
              label="Players"
              value={team.players.length.toString()}
              icon="mdi:account-group"
            />
          </div>
        </div>

        {/* Detail Tabs */}
        <Tabs
          selectedKey={detailTab}
          onSelectionChange={(key) => setDetailTab(key as string)}
          fullWidth
        >
          <Tab key="overview" title="Overview" />
          <Tab key="players" title="Players" />
          <Tab key="maps" title="Maps" />
          <Tab key="matches" title="Recent Matches" />
          <Tab key="tendencies" title="Tendencies" />
        </Tabs>

        <div className="p-6">
          {detailTab === "overview" && <OverviewTab team={team} />}
          {detailTab === "players" && <PlayersTab players={team.players} />}
          {detailTab === "maps" && (
            <MapsTab mapTendencies={team.tendencies.preferredMaps} />
          )}
          {detailTab === "matches" && (
            <MatchesTab matches={team.recentMatches} />
          )}
          {detailTab === "tendencies" && (
            <TendenciesTab tendencies={team.tendencies} />
          )}
        </div>
      </CardBody>

      {/* Add Note Modal */}
      <AddNoteModal
        isOpen={noteModal.isOpen}
        onClose={noteModal.onClose}
        teamName={team.name}
        onSubmit={onAddNote}
      />
    </Card>
  );
}

// ============================================================================
// Stat Card Component
// ============================================================================

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  color?: "default" | "success" | "danger" | "warning";
}

function StatCard({ label, value, icon, color = "default" }: StatCardProps) {
  const colorClass =
    color === "success"
      ? "text-success"
      : color === "danger"
      ? "text-danger"
      : color === "warning"
      ? "text-warning"
      : "";

  return (
    <Card className="bg-content2/50">
      <CardBody className="p-3 text-center">
        <Icon icon={icon} className={`text-2xl mb-1 ${colorClass}`} />
        <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
        <p className="text-xs text-default-500">{label}</p>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// Tab Content Components
// ============================================================================

function OverviewTab({ team }: { team: OpponentTeam }) {
  return (
    <div className="space-y-6">
      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Icon icon="mdi:arm-flex" className="text-success" />
            Strengths
          </h4>
          <div className="space-y-2">
            {team.tendencies.strengths.length > 0 ? (
              team.tendencies.strengths.map((strength, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Icon
                    icon="mdi:check-circle"
                    className="text-success mt-0.5"
                  />
                  <span className="text-sm">{strength}</span>
                </div>
              ))
            ) : (
              <p className="text-default-500 text-sm">No data available</p>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Icon icon="mdi:alert" className="text-danger" />
            Weaknesses
          </h4>
          <div className="space-y-2">
            {team.tendencies.weaknesses.length > 0 ? (
              team.tendencies.weaknesses.map((weakness, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Icon
                    icon="mdi:close-circle"
                    className="text-danger mt-0.5"
                  />
                  <span className="text-sm">{weakness}</span>
                </div>
              ))
            ) : (
              <p className="text-default-500 text-sm">No data available</p>
            )}
          </div>
        </div>
      </div>

      <Divider />

      {/* Playstyle */}
      <div>
        <h4 className="font-semibold mb-3">Playstyle Analysis</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-content2 rounded-lg">
            <span className="text-default-500">Attack Style</span>
            <Chip
              size="sm"
              color={
                team.tendencies.attackStyle === "aggressive"
                  ? "danger"
                  : team.tendencies.attackStyle === "methodical"
                  ? "primary"
                  : "default"
              }
            >
              {team.tendencies.attackStyle}
            </Chip>
          </div>
          <div className="flex items-center justify-between p-3 bg-content2 rounded-lg">
            <span className="text-default-500">Defense Style</span>
            <Chip
              size="sm"
              color={
                team.tendencies.defenseStyle === "aggressive"
                  ? "danger"
                  : team.tendencies.defenseStyle === "passive"
                  ? "secondary"
                  : "default"
              }
            >
              {team.tendencies.defenseStyle}
            </Chip>
          </div>
        </div>
      </div>

      {/* Top Maps */}
      <div>
        <h4 className="font-semibold mb-3">Top Maps</h4>
        <div className="flex gap-2 flex-wrap">
          {team.tendencies.preferredMaps.slice(0, 3).map((map) => (
            <Chip key={map.map} variant="flat" color="primary">
              {map.map} ({(map.winRate * 100).toFixed(0)}% WR)
            </Chip>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-default-400">
        Last updated: {new Date(team.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}

function PlayersTab({ players }: { players: OpponentPlayer[] }) {
  return (
    <Table aria-label="Player stats">
      <TableHeader>
        <TableColumn>PLAYER</TableColumn>
        <TableColumn>ROLE</TableColumn>
        <TableColumn>RATING</TableColumn>
        <TableColumn>K/D</TableColumn>
        <TableColumn>ADR</TableColumn>
        <TableColumn>KAST</TableColumn>
        <TableColumn>FK%</TableColumn>
      </TableHeader>
      <TableBody>
        {players.map((player) => (
          <TableRow key={player.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar src={player.avatar} name={player.name} size="sm" />
                <div>
                  <p className="font-medium">{player.name}</p>
                  {player.mainAgent && (
                    <p className="text-xs text-default-500">
                      {player.mainAgent}
                    </p>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Chip size="sm" variant="flat">
                {player.role}
              </Chip>
            </TableCell>
            <TableCell>
              <span className="font-semibold">{player.rating.toFixed(2)}</span>
            </TableCell>
            <TableCell
              className={player.stats.kd >= 1 ? "text-success" : "text-danger"}
            >
              {player.stats.kd.toFixed(2)}
            </TableCell>
            <TableCell>{player.stats.adr.toFixed(1)}</TableCell>
            <TableCell>{(player.stats.kast * 100).toFixed(0)}%</TableCell>
            <TableCell>
              {(player.stats.firstKillRate * 100).toFixed(0)}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function MapsTab({ mapTendencies }: { mapTendencies: MapTendency[] }) {
  const sortedMaps = [...mapTendencies].sort((a, b) => b.pickRate - a.pickRate);

  return (
    <div className="space-y-4">
      {sortedMaps.map((map) => (
        <Card key={map.map}>
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold">{map.map}</h5>
              <div className="flex gap-2">
                <Chip size="sm" variant="flat">
                  Pick: {(map.pickRate * 100).toFixed(0)}%
                </Chip>
                <Chip
                  size="sm"
                  variant="flat"
                  color={map.winRate >= 0.5 ? "success" : "danger"}
                >
                  Win: {(map.winRate * 100).toFixed(0)}%
                </Chip>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Pick Rate</span>
                  <span>{(map.pickRate * 100).toFixed(0)}%</span>
                </div>
                <Progress
                  value={map.pickRate * 100}
                  color="primary"
                  size="sm"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Win Rate</span>
                  <span>{(map.winRate * 100).toFixed(0)}%</span>
                </div>
                <Progress
                  value={map.winRate * 100}
                  color={map.winRate >= 0.5 ? "success" : "danger"}
                  size="sm"
                />
              </div>
            </div>

            <div className="mt-3 text-sm text-default-500">
              Avg. rounds: {map.avgRounds.toFixed(1)}
            </div>
          </CardBody>
        </Card>
      ))}

      {sortedMaps.length === 0 && (
        <div className="text-center py-8 text-default-500">
          No map data available
        </div>
      )}
    </div>
  );
}

function MatchesTab({ matches }: { matches: OpponentMatch[] }) {
  return (
    <div className="space-y-2">
      {matches.map((match) => (
        <Card key={match.id}>
          <CardBody className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-1 h-12 rounded-full ${
                    match.result === "win"
                      ? "bg-success"
                      : match.result === "loss"
                      ? "bg-danger"
                      : "bg-default"
                  }`}
                />
                <div>
                  <p className="font-medium">vs {match.opponent}</p>
                  <p className="text-sm text-default-500">
                    {match.map} • {new Date(match.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {match.tournamentName && (
                  <Chip size="sm" variant="flat">
                    {match.tournamentName}
                  </Chip>
                )}
                <span
                  className={`text-lg font-bold ${
                    match.result === "win"
                      ? "text-success"
                      : match.result === "loss"
                      ? "text-danger"
                      : ""
                  }`}
                >
                  {match.score}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}

      {matches.length === 0 && (
        <div className="text-center py-8 text-default-500">
          No recent matches available
        </div>
      )}
    </div>
  );
}

function TendenciesTab({ tendencies }: { tendencies: TeamTendencies }) {
  return (
    <div className="space-y-6">
      {/* Common Compositions */}
      <div>
        <h4 className="font-semibold mb-3">Most Used Compositions</h4>
        <div className="space-y-3">
          {tendencies.commonComps.map((comp, i) => (
            <Card key={i}>
              <CardBody className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 flex-wrap">
                    {comp.agents.map((agent) => (
                      <Chip key={agent} size="sm" variant="flat">
                        {agent}
                      </Chip>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Tooltip content="Use Rate">
                      <Chip size="sm" variant="flat" color="primary">
                        {(comp.useRate * 100).toFixed(0)}%
                      </Chip>
                    </Tooltip>
                    <Tooltip content="Win Rate">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={comp.winRate >= 0.5 ? "success" : "danger"}
                      >
                        {(comp.winRate * 100).toFixed(0)}% WR
                      </Chip>
                    </Tooltip>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      <Divider />

      {/* Economy Patterns */}
      <div>
        <h4 className="font-semibold mb-3">Economy Patterns</h4>
        <div className="space-y-2">
          {tendencies.economyPatterns.length > 0 ? (
            tendencies.economyPatterns.map((pattern, i) => (
              <div key={i} className="flex items-start gap-2">
                <Icon icon="mdi:currency-usd" className="text-warning mt-0.5" />
                <span className="text-sm">{pattern}</span>
              </div>
            ))
          ) : (
            <p className="text-default-500 text-sm">
              No economy data available
            </p>
          )}
        </div>
      </div>

      <Divider />

      {/* Key Insights */}
      <div>
        <h4 className="font-semibold mb-3">Key Insights</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-content2 rounded-lg">
            <p className="text-sm text-default-500 mb-1">Attack Tendency</p>
            <p className="font-medium capitalize">{tendencies.attackStyle}</p>
            <p className="text-xs text-default-400 mt-1">
              {tendencies.attackStyle === "aggressive"
                ? "Tends to rush and take early map control"
                : tendencies.attackStyle === "methodical"
                ? "Prefers slow, utility-based executes"
                : "Varies approach based on situation"}
            </p>
          </div>
          <div className="p-4 bg-content2 rounded-lg">
            <p className="text-sm text-default-500 mb-1">Defense Tendency</p>
            <p className="font-medium capitalize">{tendencies.defenseStyle}</p>
            <p className="text-xs text-default-400 mt-1">
              {tendencies.defenseStyle === "aggressive"
                ? "Looks for early picks and info plays"
                : tendencies.defenseStyle === "passive"
                ? "Plays retake-focused defense"
                : "Adapts defense based on read"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Add Note Modal Component
// ============================================================================

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName: string;
  onSubmit: (
    note: Omit<ScoutingNote, "id" | "createdAt" | "updatedAt">
  ) => void;
}

function AddNoteModal({
  isOpen,
  onClose,
  teamName,
  onSubmit,
}: AddNoteModalProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<ScoutingNote["category"]>("general");

  const handleSubmit = () => {
    if (!content.trim()) return;

    onSubmit({
      teamId: "",
      authorId: "",
      authorName: "",
      content,
      category,
    });

    setContent("");
    setCategory("general");
    onClose();
  };

  const categoryOptions = [
    { key: "general", label: "General", icon: "mdi:note" },
    { key: "strategy", label: "Strategy", icon: "mdi:strategy" },
    { key: "weakness", label: "Weakness", icon: "mdi:target" },
    { key: "player", label: "Player Note", icon: "mdi:account" },
    { key: "map", label: "Map Specific", icon: "mdi:map" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>
          <div>
            <h3>Add Scouting Note</h3>
            <p className="text-sm text-default-500 font-normal">{teamName}</p>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  startContent={
                    <Icon
                      icon={
                        categoryOptions.find((c) => c.key === category)?.icon ||
                        "mdi:note"
                      }
                    />
                  }
                  endContent={<Icon icon="mdi:chevron-down" />}
                >
                  {categoryOptions.find((c) => c.key === category)?.label ||
                    "General"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Note category"
                selectionMode="single"
                selectedKeys={new Set([category])}
                onSelectionChange={(keys) =>
                  setCategory(Array.from(keys)[0] as ScoutingNote["category"])
                }
              >
                {categoryOptions.map((opt) => (
                  <DropdownItem
                    key={opt.key}
                    startContent={<Icon icon={opt.icon} />}
                  >
                    {opt.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Textarea
              value={content}
              onValueChange={setContent}
              label="Note"
              placeholder="Enter your scouting observation..."
              minRows={4}
              maxRows={8}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={!content.trim()}
          >
            Add Note
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ============================================================================
// Compact Components for Embedding
// ============================================================================

export function OpponentQuickView({
  team,
  onViewDetails,
}: {
  team: OpponentTeam;
  onViewDetails: () => void;
}) {
  return (
    <Card isPressable isHoverable onPress={onViewDetails}>
      <CardBody className="p-4">
        <div className="flex items-center gap-4">
          <Avatar src={team.logo} name={team.tag} size="lg" radius="sm" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold">{team.name}</h4>
              <Chip
                size="sm"
                color={team.wins > team.losses ? "success" : "danger"}
              >
                {team.wins}W-{team.losses}L
              </Chip>
            </div>
            <p className="text-sm text-default-500">
              {team.region} • {team.tier}
            </p>
            <div className="flex gap-1 mt-2">
              {team.tendencies.preferredMaps.slice(0, 2).map((m) => (
                <Chip key={m.map} size="sm" variant="flat">
                  {m.map}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export function OpponentComparisonCard({
  myTeam,
  opponent,
}: {
  myTeam: { wins: number; losses: number; rating: number };
  opponent: OpponentTeam;
}) {
  const myWinRate = myTeam.wins / (myTeam.wins + myTeam.losses);
  const oppWinRate = opponent.wins / (opponent.wins + opponent.losses);
  const ratingDiff = myTeam.rating - opponent.rating;

  return (
    <Card>
      <CardBody className="p-4">
        <h4 className="font-semibold mb-4">Head-to-Head Analysis</h4>

        <div className="space-y-4">
          {/* Rating Comparison */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Rating</span>
              <span
                className={
                  ratingDiff > 0
                    ? "text-success"
                    : ratingDiff < 0
                    ? "text-danger"
                    : ""
                }
              >
                {ratingDiff > 0 ? "+" : ""}
                {ratingDiff.toFixed(0)} vs opponent
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm w-16">{myTeam.rating.toFixed(0)}</span>
              <Progress
                value={
                  (myTeam.rating / (myTeam.rating + opponent.rating)) * 100
                }
                color="primary"
                className="flex-1"
              />
              <span className="text-sm w-16 text-right">
                {opponent.rating.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Win Rate Comparison */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Win Rate</span>
              <span
                className={
                  myWinRate > oppWinRate
                    ? "text-success"
                    : myWinRate < oppWinRate
                    ? "text-danger"
                    : ""
                }
              >
                {((myWinRate - oppWinRate) * 100).toFixed(1)}% difference
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm w-16">
                {(myWinRate * 100).toFixed(1)}%
              </span>
              <Progress
                value={(myWinRate / (myWinRate + oppWinRate)) * 100}
                color="success"
                className="flex-1"
              />
              <span className="text-sm w-16 text-right">
                {(oppWinRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <Divider className="my-4" />
        <div>
          <p className="text-sm font-medium mb-2">Strategic Notes</p>
          <div className="space-y-1 text-sm text-default-500">
            {opponent.tendencies.weaknesses.slice(0, 2).map((w, i) => (
              <p key={i}>• Target: {w}</p>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// ============================================================================
// Default Export
// ============================================================================

const OpponentResearchComponents = {
  OpponentResearch,
  OpponentQuickView,
  OpponentComparisonCard,
};

export default OpponentResearchComponents;
