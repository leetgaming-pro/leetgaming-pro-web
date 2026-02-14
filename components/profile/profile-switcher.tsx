/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🎮 LEETGAMING - PROFILE SWITCHER                                            ║
 * ║══════════════════════════════════════════════════════════════════════════════║
 * ║                                                                              ║
 * ║  Dropdown component for switching between game profiles.                     ║
 * ║  Shows active profile and allows switching to other game profiles.           ║
 * ║                                                                              ║
 * ║  Features:                                                                   ║
 * ║  • Display current active profile with game icon                             ║
 * ║  • Dropdown with all user profiles                                           ║
 * ║  • Create new profile option                                                 ║
 * ║  • Compact and full variants                                                 ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

"use client";

import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Button,
  Skeleton,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useProfiles } from "@/contexts/profile-context";
import { GameTitle } from "@/types/replay-api/player.types";

// ============================================================================
// Game Icons and Colors
// ============================================================================

const GAME_CONFIG: Record<
  GameTitle,
  { icon: string; name: string; color: string }
> = {
  [GameTitle.CS2]: {
    icon: "simple-icons:counterstrike",
    name: "CS2",
    color: "#E08E45",
  },
  [GameTitle.CSGO]: {
    icon: "simple-icons:counterstrike",
    name: "CS:GO",
    color: "#F7B93E",
  },
  [GameTitle.VALORANT]: {
    icon: "simple-icons:valorant",
    name: "Valorant",
    color: "#FF4654",
  },
  [GameTitle.LOL]: {
    icon: "simple-icons:leagueoflegends",
    name: "LoL",
    color: "#C89B3C",
  },
  [GameTitle.DOTA2]: {
    icon: "simple-icons:dota2",
    name: "Dota 2",
    color: "#B73830",
  },
};

// ============================================================================
// Component Props
// ============================================================================

interface ProfileSwitcherProps {
  /** Variant for display */
  variant?: "compact" | "full";
  /** Show create profile option */
  showCreate?: boolean;
  /** Custom trigger element */
  trigger?: React.ReactNode;
  /** Callback when profile is switched */
  onSwitch?: (profileId: string, gameId: GameTitle) => void;
}

// ============================================================================
// Component
// ============================================================================

export function ProfileSwitcher({
  variant = "full",
  showCreate = true,
  trigger,
  onSwitch,
}: ProfileSwitcherProps) {
  const {
    profiles,
    activeProfile,
    isLoading,
    hasProfiles,
    switchProfileById,
    createProfile,
  } = useProfiles();

  // Handle profile selection
  const handleSelect = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      switchProfileById(profileId);
      onSwitch?.(profileId, profile.game_id as unknown as GameTitle);
    }
  };

  // Loading state
  if (isLoading) {
    return <Skeleton className="rounded-none h-10 w-32" />;
  }

  // No profiles state
  if (!hasProfiles) {
    return (
      <Button
        className="bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-white dark:text-[#34445C] rounded-none text-xs font-semibold"
        size="sm"
        onPress={() => createProfile()}
        startContent={<Icon icon="solar:user-plus-bold" width={16} />}
      >
        Create Profile
      </Button>
    );
  }

  // Get game config for active profile
  const activeGameConfig = activeProfile?.game_id
    ? GAME_CONFIG[activeProfile.game_id as unknown as GameTitle]
    : null;

  // Default trigger
  const defaultTrigger = (
    <Button
      className={`bg-[#34445C]/10 dark:bg-[#1a1a1a] border border-[#FF4654]/20 dark:border-[#DCFF37]/20 rounded-none ${
        variant === "compact" ? "min-w-0 px-2" : ""
      }`}
      variant="flat"
      size="sm"
    >
      <div className="flex items-center gap-2">
        {activeProfile && (
          <>
            {/* Game Icon */}
            {activeGameConfig && (
              <Icon
                icon={activeGameConfig.icon}
                width={variant === "compact" ? 16 : 18}
                style={{ color: activeGameConfig.color }}
              />
            )}

            {/* Profile Info */}
            {variant === "full" && (
              <div className="flex flex-col items-start">
                <span className="text-xs font-semibold text-foreground">
                  {activeProfile.nickname}
                </span>
                <span className="text-[10px] text-default-500">
                  {activeGameConfig?.name || activeProfile.game_id}
                </span>
              </div>
            )}

            {/* Dropdown Indicator */}
            <Icon
              icon="solar:alt-arrow-down-linear"
              width={14}
              className="text-default-400"
            />
          </>
        )}
      </div>
    </Button>
  );

  return (
    <Dropdown
      classNames={{
        content:
          "rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-white dark:bg-[#1a1a1a]",
      }}
    >
      <DropdownTrigger>{trigger || defaultTrigger}</DropdownTrigger>
      <DropdownMenu
        aria-label="Profile Selection"
        selectionMode="single"
        selectedKeys={activeProfile ? new Set([activeProfile.id]) : new Set()}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          if (selected && selected !== "create") {
            handleSelect(selected);
          }
        }}
        items={[
          ...profiles.map((profile) => ({ type: "profile" as const, profile })),
          ...(showCreate ? [{ type: "create" as const }] : []),
        ]}
      >
        {(item) => {
          if (item.type === "create") {
            return (
              <DropdownItem
                key="create"
                className="text-[#FF4654] dark:text-[#DCFF37]"
                startContent={
                  <div className="flex items-center justify-center w-8 h-8 rounded-none bg-[#FF4654]/10 dark:bg-[#DCFF37]/10">
                    <Icon
                      icon="solar:add-circle-bold"
                      width={18}
                      className="text-[#FF4654] dark:text-[#DCFF37]"
                    />
                  </div>
                }
                onPress={() => createProfile()}
              >
                <span className="text-sm font-semibold">
                  Create New Profile
                </span>
              </DropdownItem>
            );
          }

          const profile = item.profile;
          const gameConfig =
            GAME_CONFIG[profile.game_id as unknown as GameTitle];
          const isActive = activeProfile?.id === profile.id;

          return (
            <DropdownItem
              key={profile.id}
              className={`py-2 ${isActive ? "bg-[#FF4654]/10 dark:bg-[#DCFF37]/10" : ""}`}
              startContent={
                gameConfig ? (
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-none"
                    style={{ backgroundColor: `${gameConfig.color}20` }}
                  >
                    <Icon
                      icon={gameConfig.icon}
                      width={18}
                      style={{ color: gameConfig.color }}
                    />
                  </div>
                ) : undefined
              }
              endContent={
                isActive ? (
                  <Chip
                    size="sm"
                    color="success"
                    variant="flat"
                    className="text-[10px]"
                  >
                    Active
                  </Chip>
                ) : undefined
              }
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  {profile.nickname}
                </span>
                <span className="text-xs text-default-500">
                  {gameConfig?.name || profile.game_id}
                  {profile.roles?.[0] && ` • ${profile.roles[0]}`}
                </span>
              </div>
            </DropdownItem>
          );
        }}
      </DropdownMenu>
    </Dropdown>
  );
}

export default ProfileSwitcher;
