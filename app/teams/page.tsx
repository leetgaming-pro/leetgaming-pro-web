"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Team, Squad as TeamCardSquad } from "@/components/teams/team-card/App";

import {
  Button,
  Spacer,
  Input,
  Select,
  SelectItem,
  Spinner,
  Card,
  CardBody,
  Chip,
} from "@nextui-org/react";

import TeamCard from "@/components/teams/team-card/App";
import { SearchIcon } from "@/components/icons";
import { Icon } from "@iconify/react";
import LaunchYourSquadButton from "@/components/teams/team-form/launch-your-squad-button";
import ApplyNowButton from "@/components/players/player-form/apply-now-button";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { Squad, SquadMembership } from "@/types/replay-api/entities.types";
import { logger } from "@/lib/logger";

const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);

/** Search filters for squads */
interface SquadSearchFilters {
  game_id?: string;
  name?: string;
}

export default function TeamsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [gameFilter, setGameFilter] = useState("all");

  useEffect(() => {
    async function fetchSquads() {
      try {
        setLoading(true);
        setError(null);

        const filters: SquadSearchFilters = {};
        if (gameFilter !== "all") {
          filters.game_id = gameFilter;
        }
        if (searchQuery) {
          filters.name = searchQuery;
        }

        const squadsData = await sdk.squads.searchSquads(filters);
        setSquads(squadsData || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load squads";
        logger.error("Failed to fetch squads", err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchSquads();
  }, [gameFilter, searchQuery]);

  // Convert SDK squads to Team format for existing components
  const teamsFromSquads: Team[] = squads.map((squad: Squad) => ({
    name: squad.name,
    avatar: squad.logo_uri || "https://avatars.githubusercontent.com/u/168373383",
    tag: squad.symbol || squad.name?.slice(0, 4).toUpperCase(),
    slug: squad.slug_uri || "",
    squad: {
      title: getGameTitle(squad.game_id),
      description: squad.description || "",
      members: Object.values(squad.members || {}).map((m: SquadMembership) => ({
        nickname: m.roles?.[0] || "Player",
        avatar: "https://i.pravatar.cc/150",
      })),
    },
    bio: squad.description || "",
    social: {
      twitter: `@${squad.symbol || squad.name}`,
      linkedin: squad.slug_uri || "",
      github: `@${squad.symbol || squad.name}`,
    },
  }));

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header - Cloud page pattern */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-none"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
            <Icon icon="solar:users-group-two-rounded-bold" width={28} className="text-[#F5F0E1] dark:text-[#1a1a1a]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">Competitive Teams</h1>
            <p className="text-sm text-[#34445C]/60 dark:text-[#F5F0E1]/60">Discover professional esports teams and find your squad</p>
          </div>
        </div>
        <div className="flex gap-2">
          <LaunchYourSquadButton />
        </div>
      </div>

      {/* Search and Filters Card */}
      <Card className="mb-6 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-gradient-to-r from-[#34445C]/5 to-transparent dark:from-[#DCFF37]/5">
        <CardBody className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<SearchIcon size={16} className="text-[#FF4654] dark:text-[#DCFF37]" />}
                className="w-full sm:w-64"
                variant="bordered"
                classNames={{
                  inputWrapper: "rounded-none border-[#FF4654]/30 dark:border-[#DCFF37]/30 data-[hover=true]:border-[#FF4654]/60 dark:data-[hover=true]:border-[#DCFF37]/60 h-10",
                }}
              />
              <Select
                placeholder="Select game"
                selectedKeys={[gameFilter]}
                onChange={(e) => setGameFilter(e.target.value)}
                className="w-full sm:w-48"
                variant="bordered"
                startContent={<Icon icon="solar:gamepad-bold-duotone" width={18} className="text-[#FF4654] dark:text-[#DCFF37]" />}
                classNames={{
                  trigger: "rounded-none border-[#FF4654]/30 dark:border-[#DCFF37]/30 data-[hover=true]:border-[#FF4654]/60 dark:data-[hover=true]:border-[#DCFF37]/60 h-10",
                  popoverContent: "rounded-none",
                }}
              >
                <SelectItem key="all" value="all">All Games</SelectItem>
                <SelectItem key="cs2" value="cs2">Counter-Strike 2</SelectItem>
                <SelectItem key="vlrnt" value="vlrnt">Valorant</SelectItem>
                <SelectItem key="csgo" value="csgo">CS:GO</SelectItem>
              </Select>
            </div>
            <div className="flex gap-2">
              <ApplyNowButton />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="w-full flex flex-col items-center justify-center py-16">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-default-500">Loading teams...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="max-w-md mx-auto rounded-none border border-danger/30">
          <CardBody className="text-center py-8">
            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-danger/20"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
              <Icon icon="solar:danger-triangle-bold-duotone" className="text-danger" width={28} />
            </div>
            <h3 className="text-lg font-semibold text-danger mb-2">Unable to load teams</h3>
            <p className="text-default-500 mb-6">{error}</p>
            <Button
              className="bg-[#34445C] dark:bg-[#DCFF37] text-[#F5F0E1] dark:text-[#34445C] rounded-none"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
              onPress={() => router.refresh()}
              startContent={<Icon icon="solar:refresh-bold" width={18} />}
            >
              Try Again
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && teamsFromSquads.length === 0 && (
        <Card className="max-w-lg mx-auto rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
          <CardBody className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-[#34445C]/10 dark:bg-[#DCFF37]/10"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)' }}>
              <Icon icon="solar:users-group-two-rounded-bold-duotone" className="text-[#34445C] dark:text-[#DCFF37]" width={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#34445C] dark:text-[#F5F0E1]">No teams found</h3>
            <p className="text-default-500 mb-6">
              Be the first to create a team and start competing!
            </p>
            <div className="flex gap-3 justify-center">
              <LaunchYourSquadButton />
            </div>
          </CardBody>
        </Card>
      )}

      {/* Teams Grid */}
      {!loading && !error && teamsFromSquads.length > 0 && (
        <>
          <div className="w-full flex justify-between items-center mb-6 max-w-7xl">
            <p className="text-default-500">
              <span className="font-semibold text-foreground">{teamsFromSquads.length}</span> teams found
            </p>
          </div>
          <div className="grid w-full max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teamsFromSquads.map((team: Team, index) => (
              <TeamCard key={`${team.tag}-${index}`} {...team} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function getGameTitle(gameId: string | undefined): string {
  const games: Record<string, string> = {
    cs2: "Counter-Strike 2",
    vlrnt: "Valorant",
    csgo: "CS:GO",
    lol: "League of Legends",
    dota2: "Dota 2",
  };
  return games[gameId || ""] || gameId?.toUpperCase() || "Unknown";
}
