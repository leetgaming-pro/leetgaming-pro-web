"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Avatar,
  Chip,
  Button,
  Select,
  SelectItem,
  Divider,
  Spinner,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { title, subtitle } from "@/components/primitives";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { PlayerProfile } from "@/types/replay-api/entities.types";
import { logger } from "@/lib/logger";
import { PlayerCreationModal } from "@/components/players/player-creation-modal";
import { useDisclosure } from "@nextui-org/react";
import { PageContainer } from "@/components/layout/page-container";

const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);

/** Extended player profile with stats from API */
interface PlayerProfileWithStats extends PlayerProfile {
  rating?: number;
  rank?: string;
  country?: string;
  team_name?: string;
  stats?: {
    wins?: number;
    losses?: number;
    win_rate?: number;
    kd_ratio?: number;
  };
  achievements?: string[];
  verified?: boolean;
  looking_for_team?: boolean;
}

/** Search filters for players */
interface PlayerSearchFilters {
  game_id?: string;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  rank: string;
  rating: number;
  country: string;
  game: string;
  role: string;
  team?: string;
  wins: number;
  losses: number;
  winRate: number;
  kd: number;
  achievements: number;
  isVerified: boolean;
  isLookingForTeam: boolean;
}

export default function PlayersPage() {
  const { data: session } = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [showOnlyLFT, setShowOnlyLFT] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    async function fetchPlayers() {
      try {
        setLoading(true);
        setError(null);

        const filters: PlayerSearchFilters = {};
        if (selectedGame !== "all") {
          filters.game_id = selectedGame;
        }

        const playersData = await sdk.playerProfiles.searchPlayerProfiles(filters);

        // Convert API data to Player interface
        const mappedPlayers: Player[] = (playersData || []).map((p: PlayerProfileWithStats) => ({
          id: p.id,
          name: p.nickname || "Unknown",
          avatar: p.avatar_uri || `https://i.pravatar.cc/150?u=${p.id}`,
          rank: p.rank || "Unranked",
          rating: p.rating || 0,
          country: p.country || "XX",
          game: p.game_id?.toUpperCase() || "CS2",
          role: p.roles?.[0] || "Player",
          team: p.team_name,
          wins: p.stats?.wins || 0,
          losses: p.stats?.losses || 0,
          winRate: p.stats?.win_rate || 0,
          kd: p.stats?.kd_ratio || 0,
          achievements: p.achievements?.length || 0,
          isVerified: p.verified || false,
          isLookingForTeam: p.looking_for_team || false,
        }));

        // Use real data from API
        setPlayers(mappedPlayers);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load players";
        logger.error("Failed to fetch players", err);
        setError(errorMessage);
        // Don't use mock data - show empty state when API fails
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayers();
  }, [selectedGame]);

  // Memoize filtered players to avoid re-computing on every render
  // Global search (navbar) handles text search - page only filters by dropdowns
  const filteredPlayers = React.useMemo(() => {
    return players.filter((player) => {
      const matchesGame = selectedGame === "all" || player.game.toLowerCase() === selectedGame.toLowerCase();
      const matchesRole = selectedRole === "all" || player.role.toLowerCase() === selectedRole.toLowerCase();
      const matchesLFT = !showOnlyLFT || player.isLookingForTeam;

      return matchesGame && matchesRole && matchesLFT;
    });
  }, [players, selectedGame, selectedRole, showOnlyLFT]);

  // Paginate filtered results
  const totalPages = Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE);
  const paginatedPlayers = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPlayers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPlayers, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGame, selectedRole, showOnlyLFT]);

  return (
    <PageContainer maxWidth="7xl" padding="md">
      <div className="flex w-full flex-col items-center gap-8 py-8">
        {/* Header */}
        <div className="flex w-full flex-col items-center text-center gap-2">
          <h2 className="text-secondary font-medium">Competitive Community</h2>
          <h1 className={title({ size: "lg" })}>Player Profiles</h1>
          <p className={subtitle({ class: "mt-2 max-w-2xl" })}>
            Discover talented players, find teammates, and connect with the competitive gaming community.
          </p>
        </div>

        {/* Filters */}
        <Card className="w-full max-w-7xl">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <Select
              label="Game"
              selectedKeys={[selectedGame]}
              onSelectionChange={(keys) => setSelectedGame(Array.from(keys)[0] as string)}
              className="w-full md:w-48"
              variant="bordered"
            >
              <SelectItem key="all" value="all">All Games</SelectItem>
              <SelectItem key="cs2" value="cs2">CS2</SelectItem>
              <SelectItem key="valorant" value="valorant">Valorant</SelectItem>
              <SelectItem key="csgo" value="csgo">CS:GO</SelectItem>
            </Select>
            <Select
              label="Role"
              selectedKeys={[selectedRole]}
              onSelectionChange={(keys) => setSelectedRole(Array.from(keys)[0] as string)}
              className="w-full md:w-48"
              variant="bordered"
            >
              <SelectItem key="all" value="all">All Roles</SelectItem>
              <SelectItem key="awper" value="awper">AWPer</SelectItem>
              <SelectItem key="rifler" value="rifler">Rifler</SelectItem>
              <SelectItem key="support" value="support">Support</SelectItem>
              <SelectItem key="entry fragger" value="entry fragger">Entry Fragger</SelectItem>
              <SelectItem key="duelist" value="duelist">Duelist</SelectItem>
              <SelectItem key="controller" value="controller">Controller</SelectItem>
            </Select>
            <Button
              color={showOnlyLFT ? "primary" : "default"}
              variant={showOnlyLFT ? "shadow" : "bordered"}
              onPress={() => setShowOnlyLFT(!showOnlyLFT)}
              startContent={<Icon icon="mdi:account-search" width={20} />}
              className="w-full md:w-auto"
            >
              Looking for Team
            </Button>
            <p className="text-tiny text-default-400 hidden md:block">
              Use ⌘+` to search players
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="w-full max-w-7xl flex justify-center py-12">
          <Spinner size="lg" label="Loading players..." color="primary" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="w-full max-w-md">
          <CardBody className="text-center">
            <Icon icon="mdi:alert-circle" className="text-danger mx-auto mb-4" width={48} />
            <p className="text-danger font-semibold mb-2">Error loading players</p>
            <p className="text-default-500 mb-4">{error}</p>
            <p className="text-xs text-default-400 mb-4">Showing cached data</p>
          </CardBody>
        </Card>
      )}

      {/* Players Grid */}
      {!loading && (
        <div className="w-full max-w-7xl">
          <div className="flex justify-between items-center mb-4">
            <p className="text-default-500">
              Showing {filteredPlayers.length} player{filteredPlayers.length !== 1 ? "s" : ""}
            </p>
          </div>

          {filteredPlayers.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <Icon icon="mdi:account-off" className="text-6xl text-default-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No players found</h3>
              <p className="text-default-500">
                Try adjusting your filters or search query
              </p>
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPlayers.map((player) => (
              <Card key={player.id} className="hover:shadow-lg hover:border-primary/50 transition-all">
                <CardHeader className="flex flex-col gap-3 p-6">
                  <div className="flex w-full justify-between items-start">
                    <Avatar
                      src={player.avatar}
                      className="w-20 h-20"
                      isBordered
                      color="primary"
                    />
                    <div className="flex flex-col items-end gap-2">
                      {player.isVerified && (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="primary"
                          startContent={<Icon icon="mdi:check-decagram" width={16} />}
                        >
                          Verified
                        </Chip>
                      )}
                      {player.isLookingForTeam && (
                        <Chip
                          size="sm"
                          variant="flat"
                          color="success"
                          startContent={<Icon icon="mdi:account-search" width={16} />}
                        >
                          LFT
                        </Chip>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{player.name}</h3>
                      <span className="text-xs text-default-500">{player.country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Chip size="sm" variant="flat" color="warning">
                        {player.rank}
                      </Chip>
                      <Chip size="sm" variant="flat">
                        {player.rating}
                      </Chip>
                    </div>
                  </div>
                </CardHeader>

                <Divider />

                <CardBody className="p-6 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-default-500">Game</span>
                      <span className="font-semibold">{player.game}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-default-500">Role</span>
                      <span className="font-semibold">{player.role}</span>
                    </div>
                    {player.team && (
                      <div className="flex flex-col col-span-2">
                        <span className="text-xs text-default-500">Team</span>
                        <span className="font-semibold">{player.team}</span>
                      </div>
                    )}
                  </div>

                  <Divider />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-xs text-default-500">Win Rate</span>
                      <span className="font-bold text-success">{player.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-default-500">K/D Ratio</span>
                      <span className="font-bold">{player.kd.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-default-500">Matches</span>
                      <span className="font-semibold">{player.wins + player.losses}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-default-500">Achievements</span>
                      <span className="font-semibold">{player.achievements}</span>
                    </div>
                  </div>
                </CardBody>

                <Divider />

                <CardFooter className="p-4 gap-2">
                  <Button
                    color="primary"
                    variant="flat"
                    className="flex-1"
                    startContent={<Icon icon="mdi:account" width={18} />}
                  >
                    View Profile
                  </Button>
                  <Button
                    color="default"
                    variant="bordered"
                    isIconOnly
                  >
                    <Icon icon="mdi:message" width={20} />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                isIconOnly
                variant="flat"
                isDisabled={currentPage === 1}
                onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <Icon icon="mdi:chevron-left" width={20} />
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show first page, current page, and last page with ellipsis
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={currentPage === pageNum ? "solid" : "flat"}
                      color={currentPage === pageNum ? "primary" : "default"}
                      onPress={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                isIconOnly
                variant="flat"
                isDisabled={currentPage === totalPages}
                onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <Icon icon="mdi:chevron-right" width={20} />
              </Button>
            </div>
          )}
        </>
        )}
        </div>
      )}

      {/* CTA Card */}
      <Card className="w-full bg-gradient-to-r from-primary-50 to-secondary-50">
        <CardBody className="text-center py-8">
          <Icon icon="mdi:account-plus" className="text-4xl mx-auto mb-2 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Create Your Player Profile</h3>
          <p className="text-default-600 mb-4">
            Join our community and showcase your skills to teams and players worldwide
          </p>
          <Button color="primary" variant="shadow" size="lg" onPress={onOpen}>
            Create Profile
          </Button>
        </CardBody>
      </Card>

        {/* Player Creation Modal */}
        <PlayerCreationModal isOpen={isOpen} onClose={onClose} />
      </div>
    </PageContainer>
  );
}
