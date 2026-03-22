"use client";

/**
 * Player Profile Detail Page
 * Comprehensive player statistics, match history, and achievements
 */

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Avatar,
  Button,
  Chip,
  Tabs,
  Tab,
  Progress,
  Skeleton,
  Divider,
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
import { EsportsButton } from "@/components/ui/esports-button";
import { ShareButton } from "@/components/share/share-button";
import { useReplayApi } from "@/hooks/use-replay-api";
import { useOptionalAuth } from "@/hooks";
import { logger } from "@/lib/logger";

import { PlayerProfile as PlayerProfileBase } from "@/types/replay-api/entities.types";
import {
  PlayerSkill,
  PlayerTrait,
  TeamHistoryEntry,
  SkillProfile,
  SkillCategory,
} from "@/types/replay-api/player-profile.types";
import { SkillRadarChart, SkillRadarMini } from "@/components/profile/skills/skill-radar-chart";
import { SkillBarList } from "@/components/profile/skills/skill-bar";
import { TraitShowcase } from "@/components/profile/traits/trait-badge";
import { TeamHistoryTimeline } from "@/components/profile/history/team-history-timeline";
import {
  getDemoSkills,
  getDemoTraits,
  getDemoTeamHistory,
  getDemoProfile,
} from "@/lib/demo/player-profile-demo";
import { useViewTracking, useViewStatistics, useViewInsights } from "@/hooks/use-view-analytics";
import { ViewCounter } from "@/components/analytics/view-counter";
import { WhoViewedPanel } from "@/components/analytics/who-viewed-panel";
import { ViewStatisticsCard } from "@/components/analytics/view-statistics-card";
import { getDemoViewStatistics, getDemoViewerInsights } from "@/lib/demo/view-analytics-demo";

/** Extended player profile from API response - uses Omit to avoid type conflicts with base Date properties */
interface PlayerAPIResponse
  extends Omit<PlayerProfileBase, "created_at" | "updated_at"> {
  player_id?: string;
  name?: string;
  steam_id?: string;
  discord_id?: string;
  country?: string;
  created_at?: string;
  updated_at?: string;
  rating?: number;
  stats?: {
    matches_played?: number;
    wins?: number;
    losses?: number;
    kills?: number;
    deaths?: number;
    assists?: number;
    headshot_percentage?: number;
    accuracy?: number;
    adr?: number;
  };
}

interface PlayerProfile {
  id: string;
  nickname: string;
  avatar: string;
  description: string;
  roles: string[];
  steam_id?: string;
  discord_id?: string;
  country?: string;
  join_date: string;
  stats: {
    matches_played: number;
    wins: number;
    losses: number;
    kills: number;
    deaths: number;
    assists: number;
    headshot_percentage: number;
    accuracy: number;
    adr: number; // Average Damage per Round
    rating: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earned_at: string;
  }>;
  recent_matches: Array<{
    id: string;
    date: string;
    map: string;
    map_name?: string;
    result: "win" | "loss" | "tie";
    score: string;
    kills: number;
    deaths: number;
    assists: number;
  }>;
}

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;
  const { sdk } = useReplayApi();
  const { isAuthenticated, user } = useOptionalAuth();
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Professional profile data
  const [skills, setSkills] = useState<PlayerSkill[]>([]);
  const [traits, setTraits] = useState<PlayerTrait[]>([]);
  const [teamHistory, setTeamHistory] = useState<TeamHistoryEntry[]>([]);
  const [skillProfile, setSkillProfile] = useState<SkillProfile | null>(null);

  // Delete confirmation modal
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  // View analytics
  useViewTracking("player", playerId);
  const { stats: viewStats, loading: viewStatsLoading } = useViewStatistics("player", playerId);
  const { insights: viewInsights, total: viewInsightsTotal, loading: viewInsightsLoading } = useViewInsights("player", playerId);

  // Demo fallback for view analytics
  const effectiveViewStats = viewStats || getDemoViewStatistics(playerId);
  const effectiveViewInsights = viewInsights.length > 0 ? viewInsights : getDemoViewerInsights();

  useEffect(() => {
    async function fetchPlayerProfile() {
      try {
        setLoading(true);
        setError(null);

        let resolvedPlayer: PlayerProfile | null = null;
        let pid = playerId;

        // Fetch player from API
        try {
          const response = await sdk.playerProfiles.getPlayerProfile(playerId);
          const playerData = response as PlayerAPIResponse | null;

          if (playerData) {
            // Map API response to PlayerProfile interface
            const createdAt = playerData.created_at
              ? typeof playerData.created_at === "string"
                ? playerData.created_at
                : new Date(playerData.created_at).toISOString()
              : new Date().toISOString();

            resolvedPlayer = {
              id: playerData.player_id || playerId,
              nickname:
                playerData.nickname || playerData.name || "Unknown Player",
              avatar:
                playerData.avatar_uri ||
                `https://i.pravatar.cc/150?u=${playerId}`,
              description:
                playerData.description || "A competitive esports player.",
              roles: playerData.roles || ["Player"],
              steam_id: playerData.steam_id,
              discord_id: playerData.discord_id,
              country: playerData.country || "Global",
              join_date: createdAt,
              stats: {
                matches_played: playerData.stats?.matches_played || 0,
                wins: playerData.stats?.wins || 0,
                losses: playerData.stats?.losses || 0,
                kills: playerData.stats?.kills || 0,
                deaths: playerData.stats?.deaths || 0,
                assists: playerData.stats?.assists || 0,
                headshot_percentage: playerData.stats?.headshot_percentage || 0,
                accuracy: playerData.stats?.accuracy || 0,
                adr: playerData.stats?.adr || 0,
                rating: playerData.rating || 1.0,
              },
              achievements: [],
              recent_matches: [],
            };
            pid = playerData.player_id || playerId;

            // Check resource ownership
            if (isAuthenticated && user && playerData.resource_owner) {
              setIsOwner(playerData.resource_owner.userId === user.id);
            } else {
              setIsOwner(false);
            }
          }
        } catch (apiErr) {
          logger.error("API call failed, trying demo fallback", apiErr);
        }

        // Fallback to demo profile when API is unavailable
        if (!resolvedPlayer) {
          const demoProfile = getDemoProfile(playerId);
          if (demoProfile) {
            resolvedPlayer = demoProfile;
            pid = playerId;
            setIsOwner(false);
          }
        }

        if (!resolvedPlayer) {
          setError("Player not found");
          setPlayer(null);
          setIsOwner(false);
          return;
        }

        setPlayer(resolvedPlayer);

        // Fetch professional profile data in parallel (non-blocking)
        const [skillsData, traitsData, historyData] = await Promise.allSettled([
          sdk.playerProfiles.getPlayerSkills?.(pid) ?? Promise.resolve([]),
          sdk.playerProfiles.getPlayerTraits?.(pid) ?? Promise.resolve([]),
          sdk.playerProfiles.getPlayerTeamHistory?.(pid) ?? Promise.resolve([]),
        ]);

        const resolvedSkills = skillsData.status === "fulfilled" ? skillsData.value : [];
        const resolvedTraits = traitsData.status === "fulfilled" ? traitsData.value : [];
        const resolvedHistory = historyData.status === "fulfilled" ? historyData.value : [];

        // Use demo data as fallback when API returns empty
        const finalSkills = (resolvedSkills as PlayerSkill[]).length > 0
          ? (resolvedSkills as PlayerSkill[])
          : (getDemoSkills(pid) ?? []);
        const finalTraits = (resolvedTraits as PlayerTrait[]).length > 0
          ? (resolvedTraits as PlayerTrait[])
          : (getDemoTraits(pid) ?? []);
        const finalHistory = (resolvedHistory as TeamHistoryEntry[]).length > 0
          ? (resolvedHistory as TeamHistoryEntry[])
          : (getDemoTeamHistory(pid) ?? []);

        setSkills(finalSkills);
        setTraits(finalTraits);
        setTeamHistory(finalHistory);

        // Build aggregated skill profile for radar chart
        if (finalSkills.length > 0) {
          const categories: Record<SkillCategory, number[]> = {
            mechanical: [],
            tactical: [],
            leadership: [],
            utility: [],
            consistency: [],
          };
          let totalEndorsements = 0;
          for (const s of finalSkills) {
            categories[s.category]?.push(s.level);
            totalEndorsements += s.endorsement_count;
          }
          const avgCategories = Object.fromEntries(
            Object.entries(categories).map(([k, vals]) => [
              k,
              vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0,
            ])
          ) as Record<SkillCategory, number>;

          setSkillProfile({
            player_id: pid,
            categories: avgCategories,
            top_skills: [...finalSkills]
              .sort((a, b) => b.level - a.level)
              .slice(0, 5),
            total_endorsements: totalEndorsements,
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load player profile";
        logger.error("Failed to load player profile", err);

        // Last-resort demo fallback
        const demoProfile = getDemoProfile(playerId);
        if (demoProfile) {
          setPlayer(demoProfile);
          setIsOwner(false);

          const demoSkills = getDemoSkills(playerId) ?? [];
          const demoTraits = getDemoTraits(playerId) ?? [];
          const demoHistory = getDemoTeamHistory(playerId) ?? [];
          setSkills(demoSkills);
          setTraits(demoTraits);
          setTeamHistory(demoHistory);

          if (demoSkills.length > 0) {
            const categories: Record<SkillCategory, number[]> = {
              mechanical: [],
              tactical: [],
              leadership: [],
              utility: [],
              consistency: [],
            };
            let totalEndorsements = 0;
            for (const s of demoSkills) {
              categories[s.category]?.push(s.level);
              totalEndorsements += s.endorsement_count;
            }
            const avgCategories = Object.fromEntries(
              Object.entries(categories).map(([k, vals]) => [
                k,
                vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0,
              ])
            ) as Record<SkillCategory, number>;
            setSkillProfile({
              player_id: playerId,
              categories: avgCategories,
              top_skills: [...demoSkills].sort((a, b) => b.level - a.level).slice(0, 5),
              total_endorsements: totalEndorsements,
            });
          }
        } else {
          setError(errorMessage);
          setPlayer(null);
          setIsOwner(false);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPlayerProfile();
  }, [playerId, sdk, isAuthenticated, user]);

  // Handle profile deletion
  const handleDeleteProfile = async () => {
    try {
      setIsDeleting(true);
      await sdk.playerProfiles.deletePlayerProfile(playerId);
      logger.info("Player profile deleted", { playerId });
      onDeleteClose();
      router.push("/players");
    } catch (err) {
      logger.error("Failed to delete player profile", err);
      setError(err instanceof Error ? err.message : "Failed to delete profile");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer maxWidth="7xl">
        <div className="space-y-6">
          <Skeleton className="w-full h-64 rounded-none" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="w-full h-32 rounded-none" />
            <Skeleton className="w-full h-32 rounded-none" />
            <Skeleton className="w-full h-32 rounded-none" />
            <Skeleton className="w-full h-32 rounded-none" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !player) {
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
            <p className="text-lg text-danger">{error || "Player not found"}</p>
            <Button
              className="mt-4 bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-[#F5F0E1] dark:text-[#34445C] rounded-none"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
              }}
              onClick={() => router.push("/players")}
            >
              Back to Players
            </Button>
          </CardBody>
        </Card>
      </PageContainer>
    );
  }

  const winRate = player.stats.matches_played > 0
    ? ((player.stats.wins / player.stats.matches_played) * 100).toFixed(1)
    : "0.0";
  const kd = player.stats.deaths > 0
    ? (player.stats.kills / player.stats.deaths).toFixed(2)
    : player.stats.kills > 0 ? player.stats.kills.toFixed(2) : "0.00";

  /** Handle skill endorsement */
  const handleEndorseSkill = async (skillId: string) => {
    if (!isAuthenticated) {
      router.push(`/signin?callbackUrl=/players/${playerId}`);
      return;
    }
    try {
      // Optimistic update
      setSkills((prev) =>
        prev.map((s) =>
          s.id === skillId
            ? {
                ...s,
                endorsement_count: s.endorsed_by_viewer
                  ? s.endorsement_count - 1
                  : s.endorsement_count + 1,
                endorsed_by_viewer: !s.endorsed_by_viewer,
              }
            : s
        )
      );
      // TODO: Call sdk.playerProfiles.endorseSkill(playerId, skillId, authToken)
    } catch {
      logger.error("Failed to endorse skill", { skillId });
    }
  };

  /** Handle trait endorsement */
  const handleEndorseTrait = async (traitId: string) => {
    if (!isAuthenticated) {
      router.push(`/signin?callbackUrl=/players/${playerId}`);
      return;
    }
    try {
      setTraits((prev) =>
        prev.map((t) =>
          t.id === traitId
            ? {
                ...t,
                endorsement_count: t.endorsed_by_viewer
                  ? t.endorsement_count - 1
                  : t.endorsement_count + 1,
                endorsed_by_viewer: !t.endorsed_by_viewer,
              }
            : t
        )
      );
      // TODO: Call sdk.playerProfiles.endorseTrait(playerId, traitId, authToken)
    } catch {
      logger.error("Failed to endorse trait", { traitId });
    }
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* ================================================================ */}
      {/* Hero Banner + Profile Header                                     */}
      {/* ================================================================ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Cover Banner */}
        <div
          className="relative w-full h-32 md:h-44 bg-gradient-to-r from-[#FF4654] via-[#FFC700]/80 to-[#FF4654] dark:from-[#1a1a2e] dark:via-[#34445C] dark:to-[#1a1a2e] overflow-hidden"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
          }}
        >
          {/* Decorative grid overlay */}
          <div className="absolute inset-0 opacity-10 dark:opacity-20" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
          {/* Floating achievement icons */}
          <div className="absolute right-8 top-6 hidden md:flex items-center gap-3 opacity-30 dark:opacity-40">
            <Icon icon="solar:cup-star-bold" width={48} className="text-[#F5F0E1] dark:text-[#DCFF37]" />
            <Icon icon="solar:target-bold" width={36} className="text-[#F5F0E1] dark:text-[#DCFF37]" />
            <Icon icon="solar:medal-star-bold" width={42} className="text-[#F5F0E1] dark:text-[#DCFF37]" />
          </div>
          {/* Rating badge on banner */}
          <div className="absolute right-4 bottom-6 md:right-8">
            <div
              className="px-4 py-2 bg-[#F5F0E1]/90 dark:bg-[#1a1a2e]/90 backdrop-blur-sm flex items-center gap-2"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
              }}
            >
              <Icon icon="solar:star-bold" width={18} className="text-[#FFC700]" />
              <span className="text-2xl font-black text-[#FF4654] dark:text-[#DCFF37]">{player.stats.rating}</span>
              <span className="text-xs text-default-500 uppercase tracking-wider">Rating</span>
            </div>
          </div>
        </div>

        {/* Profile Info Card (overlapping banner) */}
        <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 -mt-14 md:-mt-16 mx-2 md:mx-0 mb-6 relative z-10 overflow-visible">
          <CardBody className="p-5 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="relative flex-shrink-0 -mt-16 md:-mt-20">
                <div
                  className="w-28 h-28 md:w-36 md:h-36 ring-4 ring-[#F5F0E1] dark:ring-[#1a1a2e] bg-[#F5F0E1] dark:bg-[#1a1a2e] overflow-hidden"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
                  }}
                >
                  <Avatar
                    src={player.avatar}
                    className="w-full h-full"
                    imgProps={{ className: "object-cover object-top" }}
                  />
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                  }}
                >
                  <Icon
                    icon="solar:verified-check-bold"
                    width={16}
                    className="text-[#F5F0E1] dark:text-[#34445C]"
                  />
                </div>
              </div>

              {/* Name, description, meta */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#34445C] dark:text-[#F5F0E1]">
                    {player.nickname}
                  </h1>
                  {player.country && (
                    <Chip
                      size="sm"
                      variant="flat"
                      className="rounded-none"
                      startContent={<span className="text-lg">{player.country.length === 2 ? String.fromCodePoint(...[...player.country.toUpperCase()].map(c => 0x1F1E6 - 65 + c.charCodeAt(0))) : "🌍"}</span>}
                    >
                      {player.country}
                    </Chip>
                  )}
                </div>
                {/* Role chips + current team */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {player.roles.map((role) => (
                    <Chip
                      key={role}
                      size="sm"
                      className="bg-[#34445C] text-[#F5F0E1] dark:bg-[#DCFF37] dark:text-[#34445C] rounded-none font-semibold"
                    >
                      {role}
                    </Chip>
                  ))}
                  {teamHistory.length > 0 && !teamHistory[0].left_at && (
                    <Chip
                      size="sm"
                      variant="bordered"
                      className="rounded-none border-[#FF4654]/40 dark:border-[#DCFF37]/40 text-[#34445C] dark:text-[#F5F0E1]"
                      startContent={<Icon icon="solar:users-group-rounded-bold" width={12} />}
                    >
                      {teamHistory[0].squad_tag ? `[${teamHistory[0].squad_tag}] ` : ""}{teamHistory.sort((a,b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime())[0]?.squad_name}
                    </Chip>
                  )}
                </div>
                <p className="text-default-600 text-sm md:text-base leading-relaxed mb-3 max-w-2xl">{player.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-default-500">
                  {player.steam_id && (
                    <div className="flex items-center gap-1">
                      <Icon icon="solar:gameboy-bold" width={16} />
                      <span>Steam: {player.steam_id.slice(-8)}</span>
                    </div>
                  )}
                  {player.discord_id && (
                    <div className="flex items-center gap-1">
                      <Icon icon="solar:chat-round-bold" width={16} />
                      <span>{player.discord_id}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Icon icon="solar:calendar-bold" width={16} />
                    <span>
                      Joined {new Date(player.join_date).toLocaleDateString()}
                    </span>
                  </div>
                  {skillProfile && (
                    <div className="flex items-center gap-1">
                      <Icon icon="solar:like-bold" width={16} className="text-[#FF4654] dark:text-[#DCFF37]" />
                      <span className="font-semibold text-[#FF4654] dark:text-[#DCFF37]">{skillProfile.total_endorsements}</span>
                      <span>endorsements</span>
                    </div>
                  )}
                  <ViewCounter
                    totalViews={effectiveViewStats.total_views}
                    uniqueViewers={effectiveViewStats.unique_viewers}
                    trendDirection={effectiveViewStats.trend_direction}
                    trendPercentage={effectiveViewStats.trend_percentage}
                    size="sm"
                  />
                </div>

                {/* Inline skill radar + top traits preview */}
                {skillProfile && (
                  <div className="mt-4 flex items-center gap-5 flex-wrap">
                    <SkillRadarMini profile={skillProfile} size={90} />
                    <div className="flex flex-wrap gap-2">
                      {traits.slice(0, 4).map((trait) => (
                        <Chip
                          key={trait.id}
                          size="sm"
                          variant="flat"
                          className={`rounded-none ${
                            trait.tier === "diamond"
                              ? "bg-cyan-400/10 text-cyan-400 border-cyan-400/30"
                              : trait.tier === "gold"
                              ? "bg-[#FFC700]/10 text-[#FFC700] border-[#FFC700]/30"
                              : trait.tier === "silver"
                              ? "bg-slate-300/10 text-slate-400 border-slate-400/30"
                              : "bg-default-100 text-default-600"
                          } border`}
                          startContent={<Icon icon={trait.icon} width={12} />}
                        >
                          {trait.display_name}
                        </Chip>
                      ))}
                      {traits.length > 4 && (
                        <Chip size="sm" variant="flat" className="rounded-none bg-default-100 text-default-500">
                          +{traits.length - 4} more
                        </Chip>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap md:flex-col">
                {isOwner && (
                  <>
                    <Tooltip content="Edit your profile" placement="bottom">
                      <Button
                        className="bg-[#34445C] dark:bg-[#DCFF37] text-[#F5F0E1] dark:text-[#34445C] rounded-none"
                        style={{
                          clipPath:
                            "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                        }}
                        startContent={<Icon icon="solar:pen-bold" width={20} />}
                        onPress={() => router.push(`/players/${playerId}/edit`)}
                      >
                        Edit Profile
                      </Button>
                    </Tooltip>
                    <Tooltip content="Delete this profile" placement="bottom" color="danger">
                      <Button
                        variant="bordered"
                        className="rounded-none border-danger/50 text-danger hover:bg-danger/10"
                        isIconOnly
                        onPress={onDeleteOpen}
                      >
                        <Icon icon="solar:trash-bin-minimalistic-bold" width={20} />
                      </Button>
                    </Tooltip>
                  </>
                )}
                {!isOwner && (
                  <>
                    <Button
                      className="bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-[#F5F0E1] dark:text-[#34445C] rounded-none"
                      style={{
                        clipPath:
                          "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                      }}
                      startContent={<Icon icon="solar:user-plus-bold" width={20} />}
                      onPress={() => {
                        if (!isAuthenticated) {
                          router.push(`/signin?callbackUrl=/players/${playerId}`);
                        }
                      }}
                    >
                      Add Friend
                    </Button>
                    <Tooltip content={isAuthenticated ? "Send a message" : "Sign in to message"} placement="bottom">
                      <Button
                        variant="bordered"
                        className="rounded-none border-[#FF4654]/30 dark:border-[#DCFF37]/30 text-[#34445C] dark:text-[#F5F0E1] hover:border-[#FF4654] dark:hover:border-[#DCFF37]"
                        startContent={<Icon icon="solar:chat-round-bold" width={20} />}
                        onPress={() => {
                          if (!isAuthenticated) {
                            router.push(`/signin?callbackUrl=/players/${playerId}`);
                          }
                        }}
                      >
                        Message
                      </Button>
                    </Tooltip>
                  </>
                )}
                <ShareButton
                  contentType="player"
                  contentId={playerId}
                  title={player.nickname}
                  description={player.description}
                  variant="bordered"
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Key Stats Bar */}
      <motion.div
        className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {[
          { icon: "solar:gamepad-bold", value: player.stats.matches_played.toLocaleString(), label: "Matches", color: "text-[#FF4654] dark:text-[#DCFF37]" },
          { icon: "solar:chart-bold", value: `${winRate}%`, label: "Win Rate", color: parseFloat(winRate) >= 60 ? "text-success" : parseFloat(winRate) >= 50 ? "text-warning" : "text-danger" },
          { icon: "solar:target-bold", value: kd, label: "K/D Ratio", color: parseFloat(kd) >= 1.2 ? "text-success" : parseFloat(kd) >= 1.0 ? "text-[#FFC700]" : "text-danger" },
          { icon: "solar:star-bold", value: player.stats.rating.toString(), label: "Rating", color: "text-[#FF4654] dark:text-[#DCFF37]" },
          { icon: "solar:bomb-bold", value: `${player.stats.headshot_percentage}%`, label: "HS %", color: player.stats.headshot_percentage >= 50 ? "text-success" : "text-warning" },
          { icon: "solar:fire-bold", value: player.stats.adr.toString(), label: "ADR", color: player.stats.adr >= 80 ? "text-success" : "text-warning" },
        ].map((stat, i) => (
          <Card key={stat.label} className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
            <CardBody className="text-center py-4 px-2">
              <div
                className="w-8 h-8 mx-auto mb-1.5 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}
              >
                <Icon icon={stat.icon} width={16} className="text-[#F5F0E1] dark:text-[#34445C]" />
              </div>
              <div className={`text-2xl font-black ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-[11px] text-default-500 font-medium uppercase tracking-wider">{stat.label}</div>
            </CardBody>
          </Card>
        ))}
      </motion.div>

      {/* Detailed Stats & Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
      <Tabs
        aria-label="Player tabs"
        size="lg"
        className="mb-6"
        classNames={{
          tabList:
            "bg-[#34445C]/10 dark:bg-[#DCFF37]/10 p-1 rounded-none gap-1 border border-[#FF4654]/20 dark:border-[#DCFF37]/20",
          tab: "text-sm font-semibold rounded-none text-[#34445C] dark:text-[#F5F0E1] data-[selected=true]:text-[#F5F0E1] dark:data-[selected=true]:text-[#1a1a1a] data-[hover=true]:text-[#FF4654] dark:data-[hover=true]:text-[#DCFF37]",
          cursor:
            "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-none",
        }}
      >
        <Tab key="overview" title="Overview">
          <div className="space-y-6">
            {/* Row 1: Skill Profile + Combat Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Skill Radar — hero section */}
              {skillProfile && (
                <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 lg:col-span-1">
                  <CardHeader className="border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                        style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}
                      >
                        <Icon icon="solar:chart-bold" width={16} className="text-[#F5F0E1] dark:text-[#34445C]" />
                      </div>
                      <h3 className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1]">Skill Profile</h3>
                    </div>
                  </CardHeader>
                  <CardBody className="flex flex-col items-center justify-center py-6">
                    <SkillRadarChart profile={skillProfile} size={220} showLabels interactive />
                    {skillProfile.top_skills.length > 0 && (
                      <div className="mt-4 w-full px-2">
                        <p className="text-[10px] uppercase tracking-widest text-default-400 mb-2 font-semibold">Top Skills</p>
                        <div className="space-y-1.5">
                          {skillProfile.top_skills.slice(0, 3).map((s) => (
                            <div key={s.id} className="flex items-center justify-between text-xs">
                              <span className="text-default-600">{s.skill_name}</span>
                              <span className="font-bold text-[#FF4654] dark:text-[#DCFF37]">{s.level}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}

              {/* Combat Stats */}
              <Card className={`rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 ${skillProfile ? 'lg:col-span-1' : 'lg:col-span-2'}`}>
                <CardHeader className="border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                      style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}
                    >
                      <Icon icon="solar:target-bold" width={16} className="text-[#F5F0E1] dark:text-[#34445C]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1]">Combat Statistics</h3>
                  </div>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-default-600">Headshot %</span>
                      <span className="font-semibold text-sm">
                        {player.stats.headshot_percentage}%
                      </span>
                    </div>
                    <Progress
                      value={player.stats.headshot_percentage}
                      color="danger"
                      className="rounded-none"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-default-600">Accuracy</span>
                      <span className="font-semibold text-sm">
                        {player.stats.accuracy}%
                      </span>
                    </div>
                    <Progress value={player.stats.accuracy} color="warning" className="rounded-none" />
                  </div>
                  <Divider />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-success">
                        {player.stats.kills.toLocaleString()}
                      </div>
                      <div className="text-xs text-default-500">Kills</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-danger">
                        {player.stats.deaths.toLocaleString()}
                      </div>
                      <div className="text-xs text-default-500">Deaths</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {player.stats.assists.toLocaleString()}
                      </div>
                      <div className="text-xs text-default-500">Assists</div>
                    </div>
                  </div>
                  <Divider />
                  <div className="flex justify-between text-sm">
                    <span className="text-default-600">ADR (Avg Damage/Round)</span>
                    <span className="font-bold text-[#FF4654] dark:text-[#DCFF37]">
                      {player.stats.adr}
                    </span>
                  </div>
                </CardBody>
              </Card>

              {/* Achievements + Career Highlights */}
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 lg:col-span-1">
                <CardHeader className="border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                      style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}
                    >
                      <Icon icon="solar:cup-star-bold" width={16} className="text-[#F5F0E1] dark:text-[#34445C]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1]">Achievements</h3>
                    {player.achievements.length > 0 && (
                      <Chip size="sm" variant="flat" className="rounded-none bg-[#FFC700]/10 text-[#FFC700] h-5">
                        {player.achievements.length}
                      </Chip>
                    )}
                  </div>
                </CardHeader>
                <CardBody className="space-y-2.5 max-h-[400px] overflow-y-auto">
                  {player.achievements.length === 0 && (
                    <div className="text-center py-8">
                      <Icon icon="solar:cup-star-bold" width={32} className="text-default-300 mx-auto mb-2" />
                      <p className="text-sm text-default-400">Achievements earned from tournaments and milestones will appear here</p>
                    </div>
                  )}
                  {player.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-3 p-3 bg-[#34445C]/5 dark:bg-[#DCFF37]/5 rounded-none border border-[#FF4654]/10 dark:border-[#DCFF37]/10"
                      style={{
                        clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
                      }}
                    >
                      <div
                        className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/20 dark:to-[#34445C]/20 flex items-center justify-center"
                        style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}
                      >
                        <Icon
                          icon={achievement.icon}
                          width={20}
                          className="text-[#FFC700]"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-[#34445C] dark:text-[#F5F0E1] truncate">{achievement.name}</div>
                        <div className="text-[11px] text-default-500 truncate">
                          {achievement.description}
                        </div>
                      </div>
                      <div className="text-[10px] text-default-400 flex-shrink-0">
                        {new Date(achievement.earned_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </div>

            {/* Row 2: Traits Showcase + Team History Snapshot */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Traits Preview */}
              {traits.length > 0 && (
                <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                  <CardHeader className="border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                        style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}
                      >
                        <Icon icon="solar:medal-ribbons-star-bold" width={16} className="text-[#F5F0E1] dark:text-[#34445C]" />
                      </div>
                      <h3 className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1]">Professional Traits</h3>
                      <Chip size="sm" variant="flat" className="rounded-none bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 text-[#FF4654] dark:text-[#DCFF37] h-5">
                        {traits.length}
                      </Chip>
                    </div>
                  </CardHeader>
                  <CardBody className="p-5">
                    <TraitShowcase
                      traits={traits}
                      onEndorse={handleEndorseTrait}
                      canEndorse={isAuthenticated && !isOwner}
                    />
                  </CardBody>
                </Card>
              )}

              {/* Career Snapshot */}
              {teamHistory.length > 0 && (
                <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                  <CardHeader className="border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                        style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}
                      >
                        <Icon icon="solar:history-bold" width={16} className="text-[#F5F0E1] dark:text-[#34445C]" />
                      </div>
                      <h3 className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1]">Career Journey</h3>
                      <span className="text-xs text-default-400">{teamHistory.length} {teamHistory.length === 1 ? "team" : "teams"}</span>
                    </div>
                  </CardHeader>
                  <CardBody className="p-5">
                    <TeamHistoryTimeline
                      history={teamHistory}
                      onTeamClick={(squadId) => router.push(`/teams/${squadId}`)}
                    />
                  </CardBody>
                </Card>
              )}
            </div>

            {/* Row 3: Recent Match Performance */}
            {player.recent_matches.length > 0 && (
              <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
                <CardHeader className="border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                      style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}
                    >
                      <Icon icon="solar:gamepad-bold" width={16} className="text-[#F5F0E1] dark:text-[#34445C]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1]">Recent Performance</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    {player.recent_matches.slice(0, 4).map((match) => (
                      <div
                        key={match.id}
                        className={`p-3 border ${match.result === 'win' ? 'border-success/20 bg-success/[0.03]' : match.result === 'loss' ? 'border-danger/20 bg-danger/[0.03]' : 'border-default-200'}`}
                        style={{
                          clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-[#34445C] dark:text-[#F5F0E1]">{match.map_name || match.map}</span>
                          <Chip
                            size="sm"
                            className={`rounded-none h-5 text-[10px] font-bold ${match.result === 'win' ? 'bg-success/20 text-success' : match.result === 'loss' ? 'bg-danger/20 text-danger' : 'bg-default-100 text-default-600'}`}
                          >
                            {match.result.toUpperCase()}
                          </Chip>
                        </div>
                        <div className="text-xs text-default-500 mb-1">{match.score}</div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-success font-semibold">{match.kills}</span>
                          <span className="text-default-300">/</span>
                          <span className="text-danger font-semibold">{match.deaths}</span>
                          <span className="text-default-300">/</span>
                          <span className="text-primary font-semibold">{match.assists}</span>
                          <span className="text-default-400 ml-auto">{new Date(match.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Row 4: Profile Analytics & Who Viewed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ViewStatisticsCard
                  stats={effectiveViewStats}
                  loading={viewStatsLoading}
                />
              </div>
              <div className="lg:col-span-1">
                <WhoViewedPanel
                  viewers={effectiveViewInsights}
                  totalViewers={viewInsightsTotal || effectiveViewInsights.length}
                  loading={viewInsightsLoading}
                  isOwner={isOwner}
                />
              </div>
            </div>
          </div>
        </Tab>

        <Tab key="matches" title="Match History">
          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
            <CardBody>
              <div className="space-y-3">
                {player.recent_matches.length === 0 && (
                  <div className="text-center py-12">
                    <div
                      className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-[#34445C]/10 dark:bg-[#DCFF37]/10"
                      style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)" }}
                    >
                      <Icon icon="solar:gamepad-bold" width={32} className="text-[#34445C] dark:text-[#DCFF37]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1] mb-2">No matches yet</h3>
                    <p className="text-default-500">Match history will appear here after playing</p>
                  </div>
                )}
                {player.recent_matches.map((match) => (
                  <Card
                    key={match.id}
                    isPressable
                    className="hover:bg-[#34445C]/5 dark:hover:bg-[#DCFF37]/5 rounded-none border border-[#FF4654]/10 dark:border-[#DCFF37]/10"
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
                          <div className="font-semibold">{match.map_name || match.map}</div>
                          <div className="text-sm text-default-500">
                            {new Date(match.date).toLocaleDateString()} • Score:{" "}
                            {match.score}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            <span className="text-success font-semibold">
                              {match.kills}
                            </span>{" "}
                            /{" "}
                            <span className="text-danger font-semibold">
                              {match.deaths}
                            </span>{" "}
                            /{" "}
                            <span className="text-primary font-semibold">
                              {match.assists}
                            </span>
                          </div>
                          <div className="text-xs text-default-500">
                            K / D / A
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CardBody>
            <CardFooter>
              <EsportsButton
                variant="ghost"
                fullWidth
              >
                Load More Matches
              </EsportsButton>
            </CardFooter>
          </Card>
        </Tab>

        <Tab key="stats" title="Detailed Stats">
          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
            <CardBody className="text-center py-12">
              <div
                className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-[#FF4654]/10 to-[#FFC700]/10 dark:from-[#DCFF37]/10 dark:to-[#34445C]/10"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)" }}
              >
                <Icon
                  icon="solar:chart-2-bold"
                  width={32}
                  className="text-[#FF4654] dark:text-[#DCFF37]"
                />
              </div>
              <p className="text-lg text-[#34445C] dark:text-[#F5F0E1] font-semibold">
                Advanced statistics coming soon
              </p>
              <p className="text-sm text-default-400 mt-2">
                Heatmaps, weapon stats, performance trends, and more
              </p>
            </CardBody>
          </Card>
        </Tab>

        {/* ============================================= */}
        {/* Professional Profile Tabs                     */}
        {/* ============================================= */}

        <Tab
          key="skills"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:target-bold" width={16} />
              Skills
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Radar Chart */}
            <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <CardBody className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                    style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}
                  >
                    <Icon icon="solar:chart-bold" width={16} className="text-[#F5F0E1] dark:text-[#34445C]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#34445C] dark:text-[#F5F0E1]">Skill Profile</h3>
                </div>
                {skillProfile ? (
                  <SkillRadarChart profile={skillProfile} size={280} showLabels interactive />
                ) : (
                  <div className="text-center py-16">
                    <div
                      className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-[#34445C]/10 dark:bg-[#DCFF37]/10"
                      style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)" }}
                    >
                      <Icon icon="solar:target-bold" width={32} className="text-[#34445C] dark:text-[#DCFF37]" />
                    </div>
                    <p className="text-default-500">Skills will be calculated after match data is available</p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Skill Bars */}
            <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
              <CardBody className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                    style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}
                  >
                    <Icon icon="solar:graph-up-bold" width={16} className="text-[#F5F0E1] dark:text-[#34445C]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#34445C] dark:text-[#F5F0E1]">Individual Skills</h3>
                </div>
                {skills.length > 0 ? (
                  <SkillBarList
                    skills={skills}
                    onEndorse={handleEndorseSkill}
                    canEndorse={isAuthenticated && !isOwner}
                    sortBy="level"
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-default-500">No individual skill data available yet</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab
          key="traits"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:medal-ribbons-star-bold" width={16} />
              Traits
              {traits.length > 0 && (
                <Chip size="sm" variant="flat" className="rounded-none bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 text-[#FF4654] dark:text-[#DCFF37] h-5 min-w-5">
                  {traits.length}
                </Chip>
              )}
            </div>
          }
        >
          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
            <CardBody className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div
                  className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                  style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}
                >
                  <Icon icon="solar:medal-ribbons-star-bold" width={16} className="text-[#F5F0E1] dark:text-[#34445C]" />
                </div>
                <h3 className="text-xl font-bold text-[#34445C] dark:text-[#F5F0E1]">Professional Traits</h3>
                <span className="text-sm text-default-400 ml-2">
                  Earned through competitive play
                </span>
              </div>
              <TraitShowcase
                traits={traits}
                onEndorse={handleEndorseTrait}
                canEndorse={isAuthenticated && !isOwner}
              />
            </CardBody>
          </Card>
        </Tab>

        <Tab
          key="career"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:history-bold" width={16} />
              Career
            </div>
          }
        >
          <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20">
            <CardBody className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div
                  className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                  style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)" }}
                >
                  <Icon icon="solar:history-bold" width={16} className="text-[#F5F0E1] dark:text-[#34445C]" />
                </div>
                <h3 className="text-xl font-bold text-[#34445C] dark:text-[#F5F0E1]">Team History</h3>
              </div>
              <TeamHistoryTimeline
                history={teamHistory}
                onTeamClick={(squadId) => router.push(`/teams/${squadId}`)}
              />
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
      </motion.div>

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
              <span>Delete Player Profile</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-default-600">
              Are you sure you want to delete <strong>{player.nickname}</strong>
              ? This action cannot be undone.
            </p>
            <p className="text-sm text-default-500 mt-2">
              All associated data including match history and achievements will
              be permanently removed.
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
              onPress={handleDeleteProfile}
              isLoading={isDeleting}
              startContent={
                !isDeleting && (
                  <Icon icon="solar:trash-bin-minimalistic-bold" width={18} />
                )
              }
            >
              {isDeleting ? "Deleting..." : "Delete Profile"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageContainer>
  );
}
