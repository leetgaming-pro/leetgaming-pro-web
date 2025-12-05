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
    <section className="flex w-full flex-col items-center py-8 px-4">
      <div className="flex max-w-xl flex-col text-center">
        <Chip color="primary" variant="flat" className="mx-auto mb-2">
          <Icon icon="solar:users-group-two-rounded-bold" className="mr-1" width={16} />
          Community
        </Chip>
        <h1 className="text-4xl font-bold tracking-tight">
          Competitive Teams
        </h1>
        <Spacer y={4} />
        <p className="text-lg text-default-600">
          Discover professional esports teams and find your next squad. Join the competitive gaming community.
        </p>
        <Spacer y={6} />

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row w-full justify-center gap-3 mb-6">
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={<SearchIcon size={16} />}
            className="max-w-xs"
            variant="bordered"
            size="lg"
          />
          <Select
            placeholder="Select game"
            selectedKeys={[gameFilter]}
            onChange={(e) => setGameFilter(e.target.value)}
            className="max-w-xs"
            variant="bordered"
            size="lg"
            startContent={<Icon icon="solar:gamepad-bold-duotone" width={20} />}
          >
            <SelectItem key="all" value="all">All Games</SelectItem>
            <SelectItem key="cs2" value="cs2">Counter-Strike 2</SelectItem>
            <SelectItem key="vlrnt" value="vlrnt">Valorant</SelectItem>
            <SelectItem key="csgo" value="csgo">CS:GO</SelectItem>
          </Select>
        </div>

        <div className="flex w-full justify-center gap-3">
          <ApplyNowButton />
          <LaunchYourSquadButton />
        </div>
      </div>

      <Spacer y={8} />

      {/* Loading State */}
      {loading && (
        <div className="w-full flex flex-col items-center justify-center py-16">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-default-500">Loading teams...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="max-w-md mx-auto">
          <CardBody className="text-center py-8">
            <Icon icon="solar:danger-triangle-bold-duotone" className="text-danger mx-auto mb-4" width={56} />
            <h3 className="text-lg font-semibold text-danger mb-2">Unable to load teams</h3>
            <p className="text-default-500 mb-6">{error}</p>
            <Button
              color="primary"
              variant="flat"
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
        <Card className="max-w-lg mx-auto">
          <CardBody className="text-center py-12">
            <Icon icon="solar:users-group-two-rounded-bold-duotone" className="text-default-300 mx-auto mb-6" width={72} />
            <h3 className="text-xl font-semibold mb-2">No teams found</h3>
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
