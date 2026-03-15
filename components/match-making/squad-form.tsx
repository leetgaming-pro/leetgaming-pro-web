"use client";

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🏆 LEETGAMING - SQUAD SELECTION FORM                                        ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Award-winning squad selection with responsive mobile-first design           ║
 * ║  Supports: Solo, Party Pickup, Team Selection                                ║
 * ║                                                                              ║
 * ║  Brand Colors:                                                               ║
 * ║  • Light: Battle Orange (#FF4654) to Gold (#FFC700) → Navy (#34445C)         ║
 * ║  • Dark: Lime (#DCFF37) accents on dark background                           ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Input,
  Checkbox,
  Avatar,
  Chip,
  Card,
  CardBody,
  Skeleton,
} from "@nextui-org/react";
import { cn } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { title } from "../primitives";
import { useTheme } from "next-themes";
import { useWizard } from "./wizard-context";
import { useAuth } from "@/hooks";
import { useProfiles } from "@/contexts/profile-context";
import { useReplayApi } from "@/hooks/use-replay-api";
import { EsportsButton } from "@/components/ui/esports-button";
import Link from "next/link";
import { GameTitle } from "@/types/replay-api/player.types";

interface TeamMember {
  id: string;
  nickname: string;
  avatar: string;
  type: string;
  role: string;
  online?: boolean;
}

interface Team {
  id: string;
  displayName: string;
  tag: string;
  url: string;
  avatar: string;
  members: TeamMember[];
  description: string;
  memberCount: number;
  rating?: number;
}

type TabKey = "solo" | "party" | "team";

export type SquadFormProps = React.HTMLAttributes<HTMLFormElement>;

const SquadForm = React.forwardRef<HTMLFormElement, SquadFormProps>(
  ({ className: _className, ...props }, ref) => {
    const _props = props;
    const _ref = ref;
    const { state, updateState } = useWizard();
    const { isAuthenticated, user: authUser } = useAuth();
    const {
      getProfileForGame,
      activeProfile,
      isLoading: profilesLoading,
      hasProfiles: _hasProfiles,
    } = useProfiles();
    const { sdk } = useReplayApi();
    const { theme } = useTheme();
    // Use mounted state to prevent hydration mismatch with theme
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const isDark = mounted ? theme === "dark" : false;

    // State
    const [activeTab, setActiveTab] = useState<TabKey>("solo");
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
      state.squadId || null,
    );
    const [selectedFriends, setSelectedFriends] = useState<string[]>(
      state.selectedFriends || [],
    );

    // Get the game profile for the selected game (MUST use game profile, not Google profile)
    const gameProfile = useMemo(() => {
      if (state.selectedGame) {
        return getProfileForGame(state.selectedGame as GameTitle);
      }
      return activeProfile;
    }, [state.selectedGame, getProfileForGame, activeProfile]);

    // User info - MUST use game profile, fallback to auth only for display
    const user = useMemo(
      () => ({
        id: gameProfile?.id || authUser?.id || "guest",
        name: gameProfile?.nickname || authUser?.name || "Guest Player",
        avatar:
          gameProfile?.avatar_uri || authUser?.image || "/default-avatar.png",
        username:
          gameProfile?.nickname || authUser?.email?.split("@")[0] || "player",
        role: gameProfile?.roles?.[0] || "Player",
        online: isAuthenticated,
        gameId: gameProfile?.game_id || state.selectedGame,
      }),
      [gameProfile, authUser, isAuthenticated, state.selectedGame],
    );

    // Mock friends data (replace with real API call)
    const friends = useMemo(
      () => [
        {
          id: "friend-1",
          nickname: "ShadowStrike",
          avatar: "/avatars/shadow.png",
          role: "Entry Fragger",
          online: true,
        },
        {
          id: "friend-2",
          nickname: "PhoenixRise",
          avatar: "/avatars/phoenix.png",
          role: "Support",
          online: true,
        },
        {
          id: "friend-3",
          nickname: "NightHawk",
          avatar: "/avatars/night.png",
          role: "AWPer",
          online: false,
        },
        {
          id: "friend-4",
          nickname: "VoidWalker",
          avatar: "/avatars/void.png",
          role: "IGL",
          online: true,
        },
      ],
      [],
    );

    // Fetch teams
    const fetchTeams = useCallback(async () => {
      try {
        setLoading(true);
        const squads = await sdk.squads.searchSquads({
          visibility: "public",
          name: searchQuery || undefined,
        });

        if (squads && squads.length > 0) {
          const formattedTeams: Team[] = squads.map((squad, index) => ({
            id: squad.id || "",
            displayName: squad.name || "Unnamed Team",
            tag: squad.symbol || "TEAM",
            url: `/teams/${squad.id}`,
            avatar: squad.logo_uri || "/team-default.png",
            members: squad.membership
              ? squad.membership.map((member) => ({
                  id: member.user_id || "",
                  nickname: member.user_id?.substring(0, 8) || "Member",
                  avatar: "/default-avatar.png",
                  type: member.type || "Member",
                  role: member.roles?.[0] || "Player",
                  online: false,
                }))
              : [],
            description: squad.description || "",
            memberCount: squad.membership?.length || 0,
            // Use deterministic rating based on team index to prevent hydration mismatch
            rating: 1500 + ((index * 73) % 500),
          }));
          setTeams(formattedTeams);
        } else {
          setTeams([]);
        }
      } catch (error) {
        console.error("Failed to fetch teams:", error);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    }, [sdk, searchQuery]);

    useEffect(() => {
      const timeoutId = setTimeout(fetchTeams, 300);
      return () => clearTimeout(timeoutId);
    }, [fetchTeams]);

    // Handle tab change
    const handleTabChange = (tab: TabKey) => {
      setActiveTab(tab);
      if (tab === "solo") {
        updateState({
          teamType: "solo",
          squadId: undefined,
          selectedFriends: [],
        });
        setSelectedTeamId(null);
        setSelectedFriends([]);
      } else if (tab === "party") {
        updateState({ teamType: "duo", squadId: undefined });
        setSelectedTeamId(null);
      } else {
        updateState({ teamType: "squad", selectedFriends: [] });
        setSelectedFriends([]);
      }
    };

    // Handle team selection
    const handleTeamSelect = (teamId: string) => {
      setSelectedTeamId(teamId);
      updateState({ squadId: teamId, teamType: "squad" });
    };

    // Handle friend toggle
    const toggleFriend = (friendId: string) => {
      const newSelection = selectedFriends.includes(friendId)
        ? selectedFriends.filter((id) => id !== friendId)
        : [...selectedFriends, friendId];
      setSelectedFriends(newSelection);
      updateState({
        selectedFriends: newSelection,
        teamType: newSelection.length === 0 ? "solo" : "duo",
      });
    };

    // Tab button component
    const TabButton = ({
      tabKey,
      icon,
      label,
      description,
    }: {
      tabKey: TabKey;
      icon: string;
      label: string;
      description: string;
    }) => (
      <motion.button
        type="button"
        onClick={() => handleTabChange(tabKey)}
        className={cn(
          "relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-none",
          "border-2 transition-all duration-300",
          "min-w-[90px] sm:min-w-[120px]",
          activeTab === tabKey
            ? "border-[#FF4654] dark:border-[#DCFF37] bg-[#FF4654]/10 dark:bg-[#DCFF37]/10"
            : "border-[#34445C]/20 dark:border-[#DCFF37]/20 hover:border-[#FF4654]/50 dark:hover:border-[#DCFF37]/50 bg-transparent",
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon
          icon={icon}
          className={cn(
            "w-6 h-6 sm:w-8 sm:h-8 mb-1",
            activeTab === tabKey
              ? "text-[#FF4654] dark:text-[#DCFF37]"
              : "text-[#34445C]/60 dark:text-white/60",
          )}
        />
        <span
          className={cn(
            "text-xs sm:text-sm font-bold uppercase tracking-wide",
            activeTab === tabKey
              ? "text-[#FF4654] dark:text-[#DCFF37]"
              : "text-[#34445C] dark:text-white",
          )}
        >
          {label}
        </span>
        <span className="text-[10px] sm:text-xs text-[#34445C]/60 dark:text-white/40 hidden sm:block">
          {description}
        </span>
        {activeTab === tabKey && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </motion.button>
    );

    return (
      <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
        {/* Header - Compact for mobile */}
        <div className="text-center mb-4 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 sm:gap-3 mb-2"
          >
            <Icon
              icon="solar:users-group-rounded-bold"
              className="w-7 h-7 sm:w-10 sm:h-10 text-[#FF4654] dark:text-[#DCFF37]"
            />
            <h1
              className={cn(
                title({
                  color: isDark ? "battleLime" : "battleNavy",
                  size: "sm",
                }),
                "text-xl sm:text-3xl",
              )}
            >
              Setup Your Squad
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xs sm:text-base text-[#34445C]/70 dark:text-white/60"
          >
            Go solo, team up with friends, or represent your team
          </motion.p>
        </div>

        {/* Tab Selection - Compact for mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-2 sm:gap-4 mb-4 sm:mb-8"
        >
          <TabButton
            tabKey="solo"
            icon="solar:user-bold"
            label="Solo"
            description="Play alone"
          />
          <TabButton
            tabKey="party"
            icon="solar:users-group-two-rounded-bold"
            label="Party"
            description="With friends"
          />
          <TabButton
            tabKey="team"
            icon="solar:shield-star-bold"
            label="Team"
            description="Official squad"
          />
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {/* Solo Tab */}
          {activeTab === "solo" && (
            <motion.div
              key="solo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Loading profiles */}
              {profilesLoading && (
                <div className="p-4 rounded-none border-2 border-[#34445C]/20 dark:border-[#DCFF37]/20 bg-[#34445C]/5 dark:bg-[#DCFF37]/5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-5 h-5 rounded-none" />
                    <div className="flex-1">
                      <Skeleton className="w-32 h-4 rounded-none mb-1" />
                      <Skeleton className="w-48 h-3 rounded-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Warning if no game profile - only show after loading */}
              {!profilesLoading && !gameProfile && (
                <div className="p-4 rounded-none border-2 border-danger bg-danger/10">
                  <div className="flex items-start gap-3">
                    <Icon
                      icon="solar:danger-triangle-bold"
                      className="w-6 h-6 text-danger flex-shrink-0 mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-base mb-2 text-danger">
                        ⚠️ Game Profile Required
                      </p>
                      <p className="text-sm text-[#34445C]/80 dark:text-white/70 mb-3">
                        You need a{" "}
                        <strong>
                          {state.selectedGame?.toUpperCase() || "game"}
                        </strong>{" "}
                        profile to play competitive matches. Your Google account
                        cannot be used for matchmaking.
                      </p>
                      <EsportsButton
                        variant="primary"
                        size="sm"
                        as={Link}
                        href={`/players/register?game=${state.selectedGame || ""}`}
                      >
                        <Icon icon="solar:user-plus-bold" className="mr-2" />
                        Create {state.selectedGame?.toUpperCase() ||
                          "Game"}{" "}
                        Profile
                      </EsportsButton>
                    </div>
                  </div>
                </div>
              )}

              {/* Show profile source indicator */}
              {!profilesLoading && gameProfile && (
                <div className="p-3 rounded-none border border-success/30 bg-success/10">
                  <div className="flex items-center gap-2 text-sm text-success">
                    <Icon
                      icon="solar:verified-check-bold"
                      className="w-4 h-4"
                    />
                    <span>
                      Using your{" "}
                      <strong>{gameProfile.game_id?.toUpperCase()}</strong>{" "}
                      profile: <strong>{gameProfile.nickname}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Current Player Card */}
              <Card
                className={cn(
                  "border-2 rounded-none",
                  gameProfile
                    ? "border-[#FF4654] dark:border-[#DCFF37]"
                    : "border-warning/50",
                  "bg-gradient-to-r from-[#FF4654]/5 to-[#FFC700]/5",
                  "dark:from-[#DCFF37]/5 dark:to-[#34445C]/5",
                )}
              >
                <CardBody className="p-4 sm:p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar
                        src={user.avatar}
                        name={user.name?.charAt(0)}
                        size="lg"
                        radius="none"
                        className="ring-2 ring-[#FF4654] dark:ring-[#DCFF37]"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-[#1a1a1a]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-lg text-[#34445C] dark:text-white">
                          {user.name}
                        </span>
                        {user.gameId && (
                          <Chip
                            size="sm"
                            variant="flat"
                            classNames={{
                              base: "bg-[#FF4654]/20 dark:bg-[#DCFF37]/20 border-0",
                              content:
                                "text-[#FF4654] dark:text-[#DCFF37] font-semibold text-xs uppercase",
                            }}
                          >
                            {user.gameId}
                          </Chip>
                        )}
                        <Chip
                          size="sm"
                          variant="flat"
                          classNames={{
                            base: "bg-green-500/20 border-0",
                            content:
                              "text-green-600 dark:text-green-400 font-semibold text-xs",
                          }}
                        >
                          Online
                        </Chip>
                      </div>
                      <p className="text-sm text-[#34445C]/60 dark:text-white/60">
                        {user.role}
                      </p>
                    </div>
                    {gameProfile && (
                      <Icon
                        icon="solar:verified-check-bold"
                        className="w-6 h-6 text-[#FF4654] dark:text-[#DCFF37]"
                      />
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Solo Info */}
              <div className="p-4 rounded-none border border-[#34445C]/10 dark:border-[#DCFF37]/10 bg-[#34445C]/5 dark:bg-[#DCFF37]/5">
                <div className="flex items-start gap-3">
                  <Icon
                    icon="solar:info-circle-bold"
                    className="w-5 h-5 text-[#FF4654] dark:text-[#DCFF37] flex-shrink-0 mt-0.5"
                  />
                  <div className="text-sm text-[#34445C]/80 dark:text-white/70">
                    <p className="font-semibold mb-1">Solo Queue Mode</p>
                    <p>
                      You&apos;ll be matched with other solo players to form a
                      balanced team. Great for practice or when your squad
                      isn&apos;t available.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Party Tab */}
          {activeTab === "party" && (
            <motion.div
              key="party"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Search Friends */}
              <Input
                placeholder="Search friends..."
                startContent={
                  <Icon
                    icon="solar:magnifer-linear"
                    className="text-[#34445C]/50 dark:text-white/50"
                  />
                }
                classNames={{
                  inputWrapper: cn(
                    "rounded-none border-2",
                    "border-[#34445C]/20 dark:border-[#DCFF37]/20",
                    "hover:border-[#FF4654]/50 dark:hover:border-[#DCFF37]/50",
                    "focus-within:border-[#FF4654] dark:focus-within:border-[#DCFF37]",
                    "bg-white dark:bg-[#1a1a1a]",
                  ),
                  input: "text-[#34445C] dark:text-white",
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Friends List */}
              <div className="space-y-2">
                {/* Current Player (always selected) - uses game profile */}
                <Card
                  className={cn(
                    "border-2 rounded-none",
                    "border-[#FF4654] dark:border-[#DCFF37]",
                    "bg-[#FF4654]/5 dark:bg-[#DCFF37]/5",
                  )}
                >
                  <CardBody className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar
                          src={user.avatar}
                          name={user.name?.charAt(0)}
                          size="sm"
                          radius="none"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#1a1a1a]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#34445C] dark:text-white">
                            {user.name}
                          </span>
                          <span className="text-xs text-[#34445C]/60 dark:text-white/50">
                            (You)
                          </span>
                          {user.gameId && (
                            <Chip
                              size="sm"
                              variant="flat"
                              classNames={{
                                base: "bg-[#34445C]/10 dark:bg-white/10 border-0 h-4",
                                content:
                                  "text-[#34445C]/70 dark:text-white/70 font-medium text-[10px] uppercase px-1",
                              }}
                            >
                              {user.gameId}
                            </Chip>
                          )}
                        </div>
                        <p className="text-xs text-[#34445C]/50 dark:text-white/40">
                          {user.role}
                        </p>
                      </div>
                      <Chip
                        size="sm"
                        variant="flat"
                        classNames={{
                          base: "bg-[#FF4654]/20 dark:bg-[#DCFF37]/20 border-0",
                          content:
                            "text-[#FF4654] dark:text-[#DCFF37] font-semibold text-xs",
                        }}
                      >
                        Party Leader
                      </Chip>
                    </div>
                  </CardBody>
                </Card>

                {/* Friends */}
                {isAuthenticated ? (
                  friends.map((friend) => (
                    <motion.div
                      key={friend.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <Card
                        isPressable
                        isDisabled={!friend.online}
                        onPress={() => friend.online && toggleFriend(friend.id)}
                        className={cn(
                          "border-2 rounded-none transition-all",
                          selectedFriends.includes(friend.id)
                            ? "border-[#FF4654] dark:border-[#DCFF37] bg-[#FF4654]/5 dark:bg-[#DCFF37]/5"
                            : "border-[#34445C]/10 dark:border-[#DCFF37]/10 hover:border-[#FF4654]/30 dark:hover:border-[#DCFF37]/30",
                          !friend.online && "opacity-50",
                        )}
                      >
                        <CardBody className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar src={friend.avatar} size="sm" />
                              <div
                                className={cn(
                                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#1a1a1a]",
                                  friend.online
                                    ? "bg-green-500"
                                    : "bg-gray-400",
                                )}
                              />
                            </div>
                            <div className="flex-1">
                              <span className="font-semibold text-sm text-[#34445C] dark:text-white">
                                {friend.nickname}
                              </span>
                              <p className="text-xs text-[#34445C]/50 dark:text-white/40">
                                {friend.role}
                              </p>
                            </div>
                            <Checkbox
                              isSelected={selectedFriends.includes(friend.id)}
                              isDisabled={!friend.online}
                              classNames={{
                                wrapper: cn(
                                  "before:border-[#FF4654] dark:before:border-[#DCFF37]",
                                  "after:bg-[#FF4654] dark:after:bg-[#DCFF37]",
                                ),
                              }}
                            />
                          </div>
                        </CardBody>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Icon
                      icon="solar:user-plus-bold"
                      className="w-12 h-12 mx-auto mb-3 text-[#34445C]/30 dark:text-white/30"
                    />
                    <p className="text-[#34445C]/60 dark:text-white/50 mb-4">
                      Sign in to invite friends to your party
                    </p>
                    <EsportsButton
                      variant="primary"
                      size="sm"
                      as="a"
                      href="/signin?callbackUrl=%2Fmatch-making"
                    >
                      Sign In
                    </EsportsButton>
                  </div>
                )}
              </div>

              {/* Party Size Indicator */}
              {isAuthenticated && (
                <div className="flex items-center justify-between p-3 rounded-none border border-[#34445C]/10 dark:border-[#DCFF37]/10 bg-[#34445C]/5 dark:bg-[#DCFF37]/5">
                  <span className="text-sm text-[#34445C]/70 dark:text-white/60">
                    Party Size
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#FF4654] dark:text-[#DCFF37]">
                      {selectedFriends.length + 1}
                    </span>
                    <span className="text-[#34445C]/50 dark:text-white/40">
                      / 5
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Team Tab */}
          {activeTab === "team" && (
            <motion.div
              key="team"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Search Teams */}
              <Input
                placeholder="Search teams..."
                startContent={
                  <Icon
                    icon="solar:magnifer-linear"
                    className="text-[#34445C]/50 dark:text-white/50"
                  />
                }
                classNames={{
                  inputWrapper: cn(
                    "rounded-none border-2",
                    "border-[#34445C]/20 dark:border-[#DCFF37]/20",
                    "hover:border-[#FF4654]/50 dark:hover:border-[#DCFF37]/50",
                    "focus-within:border-[#FF4654] dark:focus-within:border-[#DCFF37]",
                    "bg-white dark:bg-[#1a1a1a]",
                  ),
                  input: "text-[#34445C] dark:text-white",
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Teams List */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#FF4654]/20 dark:scrollbar-thumb-[#DCFF37]/20">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 rounded-none" />
                    ))}
                  </div>
                ) : teams.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon
                      icon="solar:shield-star-bold"
                      className="w-12 h-12 mx-auto mb-3 text-[#34445C]/30 dark:text-white/30"
                    />
                    <p className="text-[#34445C]/60 dark:text-white/50 mb-4">
                      {isAuthenticated
                        ? "You haven't joined any teams yet"
                        : "Sign in to see your teams"}
                    </p>
                    <EsportsButton
                      variant="primary"
                      size="sm"
                      as="a"
                      href={isAuthenticated ? "/teams/create" : "/signin?callbackUrl=%2Fmatch-making"}
                    >
                      {isAuthenticated ? "Create Team" : "Sign In"}
                    </EsportsButton>
                  </div>
                ) : (
                  teams.map((team) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <Card
                        isPressable
                        onPress={() => handleTeamSelect(team.id)}
                        className={cn(
                          "border-2 rounded-none transition-all",
                          selectedTeamId === team.id
                            ? "border-[#FF4654] dark:border-[#DCFF37] bg-gradient-to-r from-[#FF4654]/10 to-[#FFC700]/5 dark:from-[#DCFF37]/10 dark:to-[#34445C]/5"
                            : "border-[#34445C]/10 dark:border-[#DCFF37]/10 hover:border-[#FF4654]/30 dark:hover:border-[#DCFF37]/30",
                        )}
                      >
                        <CardBody className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar
                              src={team.avatar}
                              size="lg"
                              className={cn(
                                "ring-2",
                                selectedTeamId === team.id
                                  ? "ring-[#FF4654] dark:ring-[#DCFF37]"
                                  : "ring-[#34445C]/20 dark:ring-[#DCFF37]/20",
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-[#34445C] dark:text-white truncate">
                                  {team.displayName}
                                </span>
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  classNames={{
                                    base: "bg-[#34445C]/10 dark:bg-[#DCFF37]/10 border-0",
                                    content:
                                      "text-[#34445C]/70 dark:text-[#DCFF37]/70 font-mono text-xs",
                                  }}
                                >
                                  [{team.tag}]
                                </Chip>
                              </div>
                              {team.description && (
                                <p className="text-xs text-[#34445C]/50 dark:text-white/40 truncate mt-1">
                                  {team.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1">
                                  <Icon
                                    icon="solar:users-group-rounded-linear"
                                    className="w-4 h-4 text-[#34445C]/40 dark:text-white/40"
                                  />
                                  <span className="text-xs text-[#34445C]/60 dark:text-white/50">
                                    {team.memberCount} members
                                  </span>
                                </div>
                                {team.rating && (
                                  <div className="flex items-center gap-1">
                                    <Icon
                                      icon="solar:star-bold"
                                      className="w-4 h-4 text-[#FFC700]"
                                    />
                                    <span className="text-xs font-semibold text-[#34445C]/70 dark:text-white/60">
                                      {team.rating}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {selectedTeamId === team.id && (
                              <Icon
                                icon="solar:check-circle-bold"
                                className="w-6 h-6 text-[#FF4654] dark:text-[#DCFF37] flex-shrink-0"
                              />
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Create Team Link */}
              {isAuthenticated && (
                <div className="text-center pt-2">
                  <Link
                    href="/teams/create"
                    className="inline-flex items-center gap-2 text-sm text-[#FF4654] dark:text-[#DCFF37] hover:underline"
                  >
                    <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
                    Create a New Team
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selection Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 sm:mt-8 p-4 rounded-none border-2 border-dashed border-[#34445C]/20 dark:border-[#DCFF37]/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon
                icon={
                  activeTab === "solo"
                    ? "solar:user-bold"
                    : activeTab === "party"
                      ? "solar:users-group-two-rounded-bold"
                      : "solar:shield-star-bold"
                }
                className="w-6 h-6 text-[#FF4654] dark:text-[#DCFF37]"
              />
              <div>
                <p className="font-semibold text-[#34445C] dark:text-white">
                  {activeTab === "solo"
                    ? "Solo Queue"
                    : activeTab === "party"
                      ? `Party of ${selectedFriends.length + 1}`
                      : selectedTeamId
                        ? teams.find((t) => t.id === selectedTeamId)
                            ?.displayName || "Team Selected"
                        : "No Team Selected"}
                </p>
                <p className="text-xs text-[#34445C]/50 dark:text-white/40">
                  {activeTab === "solo"
                    ? "Matchmaking will find teammates for you"
                    : activeTab === "party"
                      ? "Play with your selected friends"
                      : "Represent your team in competitive play"}
                </p>
              </div>
            </div>
            <Chip
              size="sm"
              variant="flat"
              classNames={{
                base: "bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 border-0",
                content:
                  "text-[#FF4654] dark:text-[#DCFF37] font-semibold text-xs uppercase",
              }}
            >
              {activeTab === "solo" ? "1v1 Ready" : "Team Ready"}
            </Chip>
          </div>
        </motion.div>
      </div>
    );
  },
);

SquadForm.displayName = "SquadForm";

export default SquadForm;
