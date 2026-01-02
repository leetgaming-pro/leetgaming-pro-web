"use client";

import React, { useMemo } from "react";
import { Select, SelectItem, Avatar, Chip, Selection } from "@nextui-org/react";
import { getActiveGames, getGameById } from "@/config/games";
import { GameId } from "@/types/games";
import Image from "next/image";

interface GameSelectProps {
  selectedGame?: GameId | null;
  onSelectionChange: (gameId: GameId | null) => void;
  label?: string;
  placeholder?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
  variant?: "flat" | "bordered" | "faded" | "underlined";
  size?: "sm" | "md" | "lg";
  className?: string;
  isDisabled?: boolean;
  filterByCategory?: string;
}

/**
 * GameSelect - A reusable game selector component with game logos
 *
 * Features:
 * - Displays game logos in the dropdown
 * - Shows selected game with its icon
 * - Optional "All Games" option
 * - Filters by category if needed
 * - Consistent styling with NextUI
 */
export function GameSelect({
  selectedGame,
  onSelectionChange,
  label = "Game",
  placeholder = "Select a game",
  showAllOption = true,
  allOptionLabel = "All Games",
  variant = "bordered",
  size = "md",
  className = "",
  isDisabled = false,
  filterByCategory,
}: GameSelectProps) {
  const games = getActiveGames();
  const filteredGames = filterByCategory
    ? games.filter((g) => g.category === filterByCategory)
    : games;

  // Sort games by priority (lower number = higher priority)
  const sortedGames = [...filteredGames].sort(
    (a, b) => a.priority - b.priority
  );

  // Build items list including optional "All" option
  const items = useMemo(() => {
    const gameItems = sortedGames.map((game) => ({
      key: game.id,
      label: game.name,
      logo: game.logo,
      shortName: game.shortName,
      color: game.color,
      category: game.category,
    }));

    if (showAllOption) {
      return [
        {
          key: "all",
          label: allOptionLabel,
          logo: null,
          shortName: "🎮",
          color: { primary: "#6366f1", secondary: "#1a1a1a" },
          category: "",
        },
        ...gameItems,
      ];
    }

    return gameItems;
  }, [sortedGames, showAllOption, allOptionLabel]);

  const handleSelectionChange = (keys: Selection) => {
    const selected = Array.from(keys)[0] as string;
    if (selected === "all" || !selected) {
      onSelectionChange(null);
    } else {
      onSelectionChange(selected as GameId);
    }
  };

  const selectedKeys: Selection = selectedGame
    ? new Set([selectedGame])
    : showAllOption
    ? new Set(["all"])
    : new Set();

  const renderValue = () => {
    if (!selectedGame && showAllOption) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-default-200 flex items-center justify-center">
            <span className="text-xs">🎮</span>
          </div>
          <span>{allOptionLabel}</span>
        </div>
      );
    }

    if (selectedGame) {
      const game = getGameById(selectedGame);
      if (game) {
        return (
          <div className="flex items-center gap-2">
            <Avatar
              src={game.logo}
              alt={game.name}
              className="w-6 h-6"
              radius="sm"
              fallback={game.shortName[0]}
            />
            <span>{game.name}</span>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <Select
      label={label}
      placeholder={placeholder}
      variant={variant}
      size={size}
      className={className}
      isDisabled={isDisabled}
      selectedKeys={selectedKeys}
      onSelectionChange={handleSelectionChange}
      renderValue={renderValue}
      classNames={{
        trigger: "min-h-unit-12",
        value: "text-small",
      }}
      items={items}
    >
      {(item) => (
        <SelectItem
          key={item.key}
          startContent={
            item.logo ? (
              <Avatar
                src={item.logo}
                alt={item.label}
                className="w-8 h-8"
                radius="sm"
                fallback={item.shortName[0]}
                style={{
                  backgroundColor: item.color.secondary,
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-lg">{item.shortName}</span>
              </div>
            )
          }
          textValue={item.label}
        >
          {item.label}
        </SelectItem>
      )}
    </Select>
  );
}

/**
 * GameChip - A small chip component showing game info
 */
interface GameChipProps {
  gameId: GameId;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

export function GameChip({
  gameId,
  size = "md",
  showName = true,
  className = "",
}: GameChipProps) {
  const game = getGameById(gameId);

  if (!game) {
    return null;
  }

  const avatarSize =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";

  return (
    <Chip
      size={size}
      variant="flat"
      className={className}
      style={{
        backgroundColor: `${game.color.primary}20`,
        borderColor: game.color.primary,
      }}
      avatar={
        <Avatar
          src={game.logo}
          alt={game.name}
          className={avatarSize}
          radius="sm"
          fallback={game.shortName[0]}
        />
      }
    >
      {showName ? game.shortName : ""}
    </Chip>
  );
}

/**
 * GameBanner - A banner component for team/player pages
 */
interface GameBannerProps {
  gameId: GameId;
  className?: string;
  height?: string;
  showOverlay?: boolean;
  children?: React.ReactNode;
}

export function GameBanner({
  gameId,
  className = "",
  height = "h-48",
  showOverlay = true,
  children,
}: GameBannerProps) {
  const game = getGameById(gameId);

  if (!game) {
    return null;
  }

  return (
    <div
      className={`relative w-full ${height} overflow-hidden rounded-xl ${className}`}
    >
      {/* Banner Image */}
      <Image
        src={game.banner}
        alt={`${game.name} banner`}
        fill
        className="object-cover"
        priority
      />

      {/* Gradient Overlay */}
      {showOverlay && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent 30%, ${game.color.secondary}ee 90%)`,
          }}
        />
      )}

      {/* Game Logo Watermark */}
      <div className="absolute top-4 right-4 opacity-30">
        <Image
          src={game.logo}
          alt={game.name}
          width={64}
          height={64}
          className="object-contain"
        />
      </div>

      {/* Content */}
      {children && (
        <div className="absolute bottom-0 left-0 right-0 p-6">{children}</div>
      )}
    </div>
  );
}

/**
 * GameIcon - Simple game icon component for inline usage
 */
interface GameIconProps {
  gameId: GameId;
  size?: number;
  className?: string;
}

export function GameIcon({ gameId, size = 32, className = "" }: GameIconProps) {
  const game = getGameById(gameId);

  if (!game) {
    return null;
  }

  return (
    <Image
      src={game.logo}
      alt={game.name}
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
}

export default GameSelect;
