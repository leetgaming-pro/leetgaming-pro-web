/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - NextUI DropdownMenu has strict collection types that don't accept conditional children
// This is a known NextUI limitation. The component works correctly at runtime.
"use client";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { Avatar, Badge, Chip } from "@nextui-org/react";
import { useAuth } from "@/hooks";
import { useProfiles } from "@/contexts/profile-context";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { GameTitle } from "@/types/replay-api/player.types";

// Game icons and colors
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

export default function SessionButton() {
  const { user, signOut } = useAuth();
  const {
    activeProfile,
    profiles,
    hasProfiles,
    switchProfileById,
    createProfile,
  } = useProfiles();
  const router = useRouter();

  const userImage = user?.image || undefined;
  const userName = user?.name || "Player";
  const userEmail = user?.email || "";

  // Use game profile info if available
  const displayName = activeProfile?.nickname || userName;
  const displayAvatar = activeProfile?.avatar_uri || userImage;
  const activeGameConfig = activeProfile?.game_id
    ? GAME_CONFIG[activeProfile.game_id as unknown as GameTitle]
    : null;

  // Get initials for avatar fallback
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 h-full">
      {/* User Dropdown - Edgy borders (no rounded) */}
      <Dropdown
        placement="bottom-end"
        backdrop="blur"
        classNames={{
          content:
            "rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20",
        }}
      >
        <DropdownTrigger>
          <button className="relative flex items-center gap-2 outline-none transition-transform hover:scale-105 focus:ring-2 focus:ring-primary/50">
            <Badge
              content=""
              color="success"
              shape="rectangle"
              placement="bottom-right"
              size="sm"
              isInvisible={false}
              classNames={{ badge: "rounded-none" }}
            >
              {/* Edgy avatar container - diagonal cut instead of circle */}
              <div
                className="relative w-9 h-9 overflow-hidden border-2 transition-all hover:border-[#FFC700] dark:hover:border-[#DCFF37]"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                  borderColor: activeGameConfig?.color || "#FF4654",
                }}
              >
                <Avatar
                  as="span"
                  className="transition-transform w-full h-full rounded-none"
                  name={initials}
                  size="sm"
                  src={displayAvatar}
                  radius="none"
                />
              </div>
            </Badge>
            {/* Game indicator */}
            {activeGameConfig && (
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-none flex items-center justify-center"
                style={{ backgroundColor: activeGameConfig.color }}
              >
                <Icon
                  icon={activeGameConfig.icon}
                  width={10}
                  className="text-white"
                />
              </div>
            )}
          </button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="User menu"
          variant="faded"
          classNames={{
            base: "rounded-none",
            list: "gap-1",
          }}
          itemClasses={{
            base: [
              "rounded-none",
              "data-[hover=true]:bg-gradient-to-r data-[hover=true]:from-[#FF4654]/10 data-[hover=true]:to-[#FFC700]/5",
              "dark:data-[hover=true]:from-[#DCFF37]/10 dark:data-[hover=true]:to-transparent",
              "data-[hover=true]:border-l-2 data-[hover=true]:border-[#FF4654] dark:data-[hover=true]:border-[#DCFF37]",
              "transition-all duration-200",
            ].join(" "),
          }}
          onAction={(key) => {
            const keyStr = key as string;
            if (keyStr === "logout") {
              signOut();
            } else if (keyStr === "create-profile") {
              createProfile();
            } else if (keyStr.startsWith("switch-profile-")) {
              const profileId = keyStr.replace("switch-profile-", "");
              switchProfileById(profileId);
            } else if (!keyStr.startsWith("profile-header")) {
              router.push(keyStr);
            }
          }}
        >
          <DropdownSection showDivider>
            <DropdownItem
              key="profile-header"
              className="h-14 gap-2 opacity-100"
              isReadOnly
              textValue={displayName}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar
                    name={initials}
                    size="sm"
                    src={displayAvatar}
                    radius="none"
                    className="rounded-none"
                  />
                  {activeGameConfig && (
                    <div
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-none flex items-center justify-center"
                      style={{ backgroundColor: activeGameConfig.color }}
                    >
                      <Icon
                        icon={activeGameConfig.icon}
                        width={10}
                        className="text-white"
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">{displayName}</p>
                  <p className="text-xs text-default-500">
                    {activeGameConfig ? activeGameConfig.name : userEmail}
                  </p>
                </div>
              </div>
            </DropdownItem>
          </DropdownSection>

          {/* Game Profiles Section */}
          {hasProfiles && profiles.length > 1 && (
            <DropdownSection title="Switch Profile" showDivider>
              {profiles
                .filter((p) => p.id !== activeProfile?.id)
                .map((profile) => {
                  const gameConfig =
                    GAME_CONFIG[profile.game_id as unknown as GameTitle];
                  return (
                    <DropdownItem
                      key={`switch-profile-${profile.id}`}
                      startContent={
                        gameConfig ? (
                          <div
                            className="w-5 h-5 rounded-none flex items-center justify-center"
                            style={{ backgroundColor: `${gameConfig.color}20` }}
                          >
                            <Icon
                              icon={gameConfig.icon}
                              width={14}
                              style={{ color: gameConfig.color }}
                            />
                          </div>
                        ) : (
                          <Icon icon="solar:user-bold" width={20} />
                        )
                      }
                      description={gameConfig?.name || profile.game_id}
                    >
                      {profile.nickname}
                    </DropdownItem>
                  );
                })}
            </DropdownSection>
          )}

          {/* Create Profile if none */}
          {!hasProfiles && (
            <DropdownSection showDivider>
              <DropdownItem
                key="create-profile"
                startContent={
                  <Icon
                    icon="solar:user-plus-bold"
                    className="text-[#FF4654] dark:text-[#DCFF37]"
                    width={20}
                  />
                }
                description="Create a game profile to play"
                className="text-[#FF4654] dark:text-[#DCFF37]"
              >
                Create Game Profile
              </DropdownItem>
            </DropdownSection>
          )}

          <DropdownSection title="Quick Actions" showDivider>
            <DropdownItem
              key="/match-making"
              startContent={
                <Icon
                  icon="solar:gamepad-bold"
                  className="text-success"
                  width={20}
                />
              }
              endContent={
                <Chip size="sm" color="success" variant="flat">
                  Live
                </Chip>
              }
              description="Find a match now"
            >
              Play Now
            </DropdownItem>
            <DropdownItem
              key="/upload"
              startContent={
                <Icon
                  icon="solar:cloud-upload-bold"
                  className="text-primary"
                  width={20}
                />
              }
              description="Upload replay files"
            >
              Upload Replay
            </DropdownItem>
            <DropdownItem
              key="/cloud"
              startContent={
                <Icon
                  icon="solar:cloud-bold"
                  className="text-secondary"
                  width={20}
                />
              }
              description="Access your cloud storage"
            >
              Cloud Dashboard
            </DropdownItem>
          </DropdownSection>

          <DropdownSection title="Profile" showDivider>
            <DropdownItem
              key="/players/me"
              startContent={<Icon icon="solar:user-bold" width={20} />}
              description="View your player profile"
            >
              My Profile
            </DropdownItem>
            <DropdownItem
              key="/replays"
              startContent={
                <Icon icon="solar:videocamera-record-bold" width={20} />
              }
              description="View your saved replays"
            >
              My Replays
            </DropdownItem>
            <DropdownItem
              key="/analytics"
              startContent={<Icon icon="solar:chart-2-bold" width={20} />}
              description="Performance analytics"
            >
              Analytics
            </DropdownItem>
            <DropdownItem
              key="/teams"
              startContent={
                <Icon icon="solar:users-group-two-rounded-bold" width={20} />
              }
              description="Manage your teams"
            >
              My Teams
            </DropdownItem>
          </DropdownSection>

          <DropdownSection title="Account" showDivider>
            <DropdownItem
              key="/checkout"
              startContent={
                <Icon
                  icon="solar:crown-bold"
                  className="text-warning"
                  width={20}
                />
              }
              endContent={
                <Chip size="sm" color="warning" variant="flat">
                  Pro
                </Chip>
              }
              description="Upgrade your subscription"
            >
              Subscription
            </DropdownItem>
            <DropdownItem
              key="/wallet"
              startContent={<Icon icon="solar:wallet-bold" width={20} />}
              description="Manage your wallet"
            >
              Wallet
            </DropdownItem>
            <DropdownItem
              key="/settings?tab=billing"
              startContent={<Icon icon="solar:card-bold" width={20} />}
              description="Payment methods & history"
            >
              Billing
            </DropdownItem>
          </DropdownSection>

          <DropdownSection title="Settings">
            <DropdownItem
              key="/settings"
              startContent={<Icon icon="solar:settings-bold" width={20} />}
              description="App preferences"
            >
              Settings
            </DropdownItem>
            <DropdownItem
              key="/settings?tab=privacy"
              startContent={<Icon icon="solar:shield-check-bold" width={20} />}
              description="Privacy & data controls"
            >
              Privacy & Data
            </DropdownItem>
            <DropdownItem
              key="/settings?tab=security"
              startContent={<Icon icon="solar:lock-bold" width={20} />}
              description="Security & MFA"
            >
              Security
            </DropdownItem>
            <DropdownItem
              key="logout"
              className="text-danger"
              color="danger"
              startContent={<Icon icon="solar:logout-2-bold" width={20} />}
              description="Sign out of your account"
            >
              Log Out
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
