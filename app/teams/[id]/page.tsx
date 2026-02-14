"use client";

/**
 * Team Detail Page
 * Team profile, members, statistics, and match history
 */

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardFooter,
  Avatar,
  Button,
  Chip,
  Tabs,
  Tab,
  Skeleton,
  Divider,
  Progress,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { PageContainer } from "@/components/layouts/centered-content";
import { ShareButton } from "@/components/share/share-button";
import { useReplayApi } from "@/hooks/use-replay-api";
import { useOptionalAuth } from "@/hooks";
import { logger } from "@/lib/logger";

import { Squad as SquadBase } from "@/types/replay-api/entities.types";

/** Extended squad response from API */
interface SquadAPIResponse extends SquadBase {
  squad_id?: string;
  tag?: string;
  region?: string;
  visibility?: string;
  rating?: number;
  stats?: {
    matches_played?: number;
    wins?: number;
    losses?: number;
    win_streak?: number;
    ranking?: number;
  };
}

/** Member from API response */
interface SquadMemberAPIResponse {
  player_id?: string;
  nickname?: string;
  name?: string;
  avatar_uri?: string;
  role?: string;
  joined_at?: string;
  stats?: {
    matches?: number;
    wins?: number;
    kd_ratio?: number;
  };
}

interface TeamMember {
  id: string;
  nickname: string;
  avatar: string;
  role: string;
  join_date: string;
  stats: {
    matches: number;
    wins: number;
    kd: number;
  };
}

interface TeamProfile {
  id: string;
  name: string;
  tag: string;
  logo: string;
  description: string;
  founded: string;
  region: string;
  status: "recruiting" | "full" | "inactive";
  members: TeamMember[];
  stats: {
    matches_played: number;
    wins: number;
    losses: number;
    win_streak: number;
    ranking: number;
    rating: number;
  };
  recent_matches: Array<{
    id: string;
    date: string;
    opponent: string;
    result: "win" | "loss" | "tie";
    score: string;
    map: string;
    map_name?: string;
  }>;
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;
  const { sdk } = useReplayApi();
  const { isAuthenticated, user } = useOptionalAuth();
  const [team, setTeam] = useState<TeamProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete confirmation modal
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  useEffect(() => {
    async function fetchTeamProfile() {
      try {
        setLoading(true);
        setError(null);

        // Fetch squad from API
        const response = await sdk.squads.getSquad(teamId);
        const squadData = response as SquadAPIResponse | null;

        if (squadData) {
          // Convert created_at to string
          const createdAt = squadData.created_at
            ? typeof squadData.created_at === "string"
              ? squadData.created_at
              : new Date(squadData.created_at as unknown as Date).toISOString()
            : new Date().toISOString();

          // Convert members Record to array
          const membersArray: SquadMemberAPIResponse[] = squadData.members
            ? Object.entries(squadData.members).map(([userId, membership]) => ({
                player_id: userId,
                nickname: membership.roles?.[0] || "Member",
                role: membership.roles?.[0] || "Member",
              }))
            : [];

          // Map API response to TeamProfile interface
          const apiTeam: TeamProfile = {
            id: squadData.squad_id || teamId,
            name: squadData.name || "Unknown Team",
            tag:
              squadData.tag || `[${squadData.name?.slice(0, 3).toUpperCase()}]`,
            logo:
              squadData.logo_uri ||
              `https://i.pravatar.cc/200?u=team-${teamId}`,
            description: squadData.description || "A competitive esports team.",
            founded: createdAt,
            region: squadData.region || "Global",
            status: squadData.visibility === "public" ? "recruiting" : "full",
            members: membersArray.map(
              (m: SquadMemberAPIResponse, idx: number) => ({
                id: m.player_id || `member-${idx}`,
                nickname: m.nickname || m.name || `Player ${idx + 1}`,
                avatar:
                  m.avatar_uri ||
                  `https://i.pravatar.cc/100?u=${m.player_id || idx}`,
                role: m.role || "Member",
                join_date: m.joined_at || createdAt,
                stats: {
                  matches: m.stats?.matches || 0,
                  wins: m.stats?.wins || 0,
                  kd: m.stats?.kd_ratio || 1.0,
                },
              })
            ),
            stats: {
              matches_played: squadData.stats?.matches_played || 0,
              wins: squadData.stats?.wins || 0,
              losses: squadData.stats?.losses || 0,
              win_streak: squadData.stats?.win_streak || 0,
              ranking: squadData.stats?.ranking || 0,
              rating: squadData.rating || 1500,
            },
            recent_matches: [], // Match history needs separate API - empty for now
          };
          setTeam(apiTeam);

          // Check resource ownership
          if (isAuthenticated && user && squadData.resource_owner) {
            const ownerUserId = squadData.resource_owner.userId;
            // Also check if user is a member with owner/admin role
            const userMembership = user?.id
              ? squadData.members?.[user.id]
              : undefined;
            const isTeamOwner =
              ownerUserId === user.id ||
              userMembership?.roles?.includes("owner") ||
              false;
            setIsOwner(isTeamOwner);
          } else {
            setIsOwner(false);
          }
        } else {
          // Team not found - show error state
          setError("Team not found");
          setTeam(null);
          setIsOwner(false);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load team profile";
        logger.error("Failed to load team profile", err);
        setError(errorMessage);
        // No fallback to mock data - show error state instead
        setTeam(null);
        setIsOwner(false);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamProfile();
  }, [teamId, sdk, isAuthenticated, user]);

  // Handle team deletion
  const handleDeleteTeam = async () => {
    try {
      setIsDeleting(true);
      await sdk.squads.deleteSquad(teamId);
      logger.info("Team deleted", { teamId });
      onDeleteClose();
      router.push("/teams");
    } catch (err) {
      logger.error("Failed to delete team", err);
      setError(err instanceof Error ? err.message : "Failed to delete team");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer maxWidth="7xl">
        <div className="space-y-6">
          <Skeleton className="w-full h-64 rounded-xl" />
          <Skeleton className="w-full h-96 rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  if (error || !team) {
    return (
      <PageContainer maxWidth="7xl">
        <Card className="rounded-none border border-danger/30">
          <CardBody className="text-center py-12">
            <div
              className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-danger/10"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
              }}
            >
              <Icon
                icon="solar:ghost-linear"
                width={32}
                className="text-danger"
              />
            </div>
            <p className="text-lg text-danger">{error || "Team not found"}</p>
            <Button
              className="mt-4 bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-[#F5F0E1] dark:text-[#34445C] rounded-none"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
              }}
              onClick={() => (window.location.href = "/teams")}
            >
              Back to Teams
            </Button>
          </CardBody>
        </Card>
      </PageContainer>
    );
  }

  const winRate = ((team.stats.wins / team.stats.matches_played) * 100).toFixed(
    1
  );

  return (
    <PageContainer maxWidth="7xl">
      {/* Header Card */}
      <Card className="mb-6 bg-gradient-to-br from-[#FF4654]/10 to-[#FFC700]/10 dark:from-[#DCFF37]/10 dark:to-[#34445C]/10 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="relative">
              <Avatar
                src={team.logo}
                className="w-32 h-32 ring-4 ring-[#FF4654]/30 dark:ring-[#DCFF37]/30"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
                }}
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
                  {team.tag} {team.name}
                </h1>
                <Chip
                  className={`rounded-none ${
                    team.status === "recruiting"
                      ? "bg-success text-white"
                      : team.status === "full"
                      ? "bg-warning text-black"
                      : "bg-default"
                  }`}
                  variant="flat"
                >
                  {team.status === "recruiting"
                    ? "Recruiting"
                    : team.status === "full"
                    ? "Full Roster"
                    : "Inactive"}
                </Chip>
              </div>
              <p className="text-default-600 mb-4">{team.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-default-500">
                <div className="flex items-center gap-1">
                  <Icon icon="solar:calendar-bold" width={16} />
                  <span>
                    Founded {new Date(team.founded).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon icon="solar:map-point-bold" width={16} />
                  <span>{team.region}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon icon="solar:users-group-rounded-bold" width={16} />
                  <span>{team.members.length} Members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon icon="solar:ranking-bold" width={16} />
                  <span>Rank #{team.stats.ranking}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {team.status === "recruiting" && (
                <Button
                  className="bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-[#F5F0E1] dark:text-[#34445C] rounded-none"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                  }}
                  startContent={<Icon icon="solar:user-plus-bold" width={20} />}
                >
                  Apply to Join
                </Button>
              )}

              {/* Owner controls - Edit and Delete */}
              {isOwner && (
                <>
                  <Tooltip content="Edit team settings" placement="bottom">
                    <Button
                      className="bg-[#34445C] dark:bg-[#DCFF37] text-[#F5F0E1] dark:text-[#34445C] rounded-none"
                      style={{
                        clipPath:
                          "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                      }}
                      startContent={<Icon icon="solar:pen-bold" width={20} />}
                      onPress={() => router.push(`/teams/${teamId}/edit`)}
                    >
                      Edit Team
                    </Button>
                  </Tooltip>
                  <Tooltip content="Manage team members" placement="bottom">
                    <Button
                      variant="bordered"
                      className="rounded-none border-[#FF4654]/30 dark:border-[#DCFF37]/30 text-[#34445C] dark:text-[#F5F0E1]"
                      startContent={
                        <Icon
                          icon="solar:users-group-rounded-bold"
                          width={20}
                        />
                      }
                      onPress={() => router.push(`/teams/${teamId}/members`)}
                    >
                      Manage
                    </Button>
                  </Tooltip>
                  <Tooltip
                    content="Delete this team"
                    placement="bottom"
                    color="danger"
                  >
                    <Button
                      variant="bordered"
                      className="rounded-none border-danger/50 text-danger hover:bg-danger/10"
                      isIconOnly
                      onPress={onDeleteOpen}
                    >
                      <Icon
                        icon="solar:trash-bin-minimalistic-bold"
                        width={20}
                      />
                    </Button>
                  </Tooltip>
                </>
              )}

              {/* Public actions - only show if not owner */}
              {!isOwner && (
                <Tooltip
                  content={
                    isAuthenticated ? "Contact team" : "Sign in to contact"
                  }
                  placement="bottom"
                >
                  <Button
                    variant="bordered"
                    className="rounded-none border-[#FF4654]/30 dark:border-[#DCFF37]/30 text-[#34445C] dark:text-[#F5F0E1] hover:border-[#FF4654] dark:hover:border-[#DCFF37]"
                    startContent={
                      <Icon icon="solar:chat-round-bold" width={20} />
                    }
                    onPress={() => {
                      if (!isAuthenticated) {
                        router.push(`/signin?callbackUrl=/teams/${teamId}`);
                      }
                      // TODO: Open contact modal
                    }}
                  >
                    Contact
                  </Button>
                </Tooltip>
              )}
              <ShareButton
                contentType="team"
                contentId={teamId}
                title={`${team.tag} ${team.name}`}
                description={team.description}
                variant="bordered"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardBody className="text-center py-6">
            <div className="text-3xl font-bold text-primary">
              {team.stats.matches_played}
            </div>
            <div className="text-sm text-default-500">Matches</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-6">
            <div className="text-3xl font-bold text-success">{winRate}%</div>
            <div className="text-sm text-default-500">Win Rate</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-6">
            <div className="text-3xl font-bold text-warning">
              {team.stats.win_streak}
            </div>
            <div className="text-sm text-default-500">Win Streak</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-6">
            <div className="text-3xl font-bold text-secondary">
              {team.stats.ranking}
            </div>
            <div className="text-sm text-default-500">Global Rank</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-6">
            <div className="text-3xl font-bold text-primary">
              {team.stats.rating}
            </div>
            <div className="text-sm text-default-500">ELO Rating</div>
          </CardBody>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs aria-label="Team tabs" size="lg">
        <Tab key="roster" title="Roster">
          <Card>
            <CardBody>
              <div className="space-y-4">
                {team.members.map((member) => (
                  <Card
                    key={member.id}
                    isPressable
                    className="hover:bg-default-100"
                    onPress={() =>
                      (window.location.href = `/players/${member.id}`)
                    }
                  >
                    <CardBody>
                      <div className="flex items-center gap-4">
                        <Avatar src={member.avatar} size="lg" />
                        <div className="flex-1">
                          <div className="font-semibold text-lg">
                            {member.nickname}
                          </div>
                          <div className="text-sm text-default-500">
                            {member.role}
                          </div>
                          <div className="text-xs text-default-400 mt-1">
                            Joined{" "}
                            {new Date(member.join_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-lg font-semibold">
                                {member.stats.matches}
                              </div>
                              <div className="text-xs text-default-500">
                                Matches
                              </div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-success">
                                {member.stats.wins}
                              </div>
                              <div className="text-xs text-default-500">
                                Wins
                              </div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-primary">
                                {member.stats.kd}
                              </div>
                              <div className="text-xs text-default-500">
                                K/D
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
              {team.status === "recruiting" && (
                <>
                  <Divider className="my-6" />
                  <div className="text-center py-6">
                    <Icon
                      icon="solar:user-plus-bold"
                      width={48}
                      className="mx-auto mb-3 text-primary"
                    />
                    <h3 className="text-lg font-semibold mb-2">
                      We&apos;re recruiting!
                    </h3>
                    <p className="text-default-500 mb-4">
                      Looking for skilled players to join our roster
                    </p>
                    <Button color="primary" size="lg">
                      Apply Now
                    </Button>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </Tab>

        <Tab key="matches" title="Match History">
          <Card>
            <CardBody>
              <div className="space-y-3">
                {team.recent_matches.map((match) => (
                  <Card
                    key={match.id}
                    isPressable
                    className="hover:bg-default-100"
                  >
                    <CardBody>
                      <div className="flex items-center gap-4">
                        <Chip
                          color={
                            match.result === "win"
                              ? "success"
                              : match.result === "loss"
                              ? "danger"
                              : "default"
                          }
                          variant="flat"
                          size="lg"
                        >
                          {match.result.toUpperCase()}
                        </Chip>
                        <div className="flex-1">
                          <div className="font-semibold">
                            vs {match.opponent}
                          </div>
                          <div className="text-sm text-default-500">
                            {new Date(match.date).toLocaleDateString()} •{" "}
                            {match.map_name || match.map}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {match.score}
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CardBody>
            <CardFooter>
              <Button variant="flat" className="w-full">
                Load More Matches
              </Button>
            </CardFooter>
          </Card>
        </Tab>

        <Tab key="stats" title="Statistics">
          <Card>
            <CardBody>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Performance Overview
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Overall Win Rate</span>
                        <span className="font-semibold">{winRate}%</span>
                      </div>
                      <Progress value={parseFloat(winRate)} color="success" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Current Form (Last 10 matches)</span>
                        <span className="font-semibold">70%</span>
                      </div>
                      <Progress value={70} color="warning" />
                    </div>
                  </div>
                </div>
                <Divider />
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Map Performance
                  </h3>
                  <div className="text-center py-8">
                    <Icon
                      icon="solar:chart-2-bold"
                      width={64}
                      className="mx-auto mb-4 text-default-400"
                    />
                    <p className="text-default-600">
                      Detailed map statistics coming soon
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        classNames={{
          base: "rounded-none border border-danger/30",
          header: "border-b border-danger/20",
          footer: "border-t border-danger/20",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-danger">
              <Icon icon="solar:danger-triangle-bold" width={24} />
              <span>Delete Team</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-default-600">
              Are you sure you want to delete{" "}
              <strong>
                {team.tag} {team.name}
              </strong>
              ? This action cannot be undone.
            </p>
            <p className="text-sm text-default-500 mt-2">
              All team data including members, match history, and statistics
              will be permanently removed.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              className="rounded-none"
              onPress={onDeleteClose}
              isDisabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              className="rounded-none"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
              }}
              onPress={handleDeleteTeam}
              isLoading={isDeleting}
              startContent={
                !isDeleting && (
                  <Icon icon="solar:trash-bin-minimalistic-bold" width={18} />
                )
              }
            >
              {isDeleting ? "Deleting..." : "Delete Team"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageContainer>
  );
}
