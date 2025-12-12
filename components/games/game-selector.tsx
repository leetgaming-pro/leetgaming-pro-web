"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardBody, Chip, Button, Badge, Tooltip, Input } from "@nextui-org/react";
import { Icon } from "@iconify/react";

import { GAME_CONFIGS, getActiveGames, GAME_CATEGORIES, getGamesByCategory } from "@/config/games";
import type { GameId, GameCategory, GameConfig } from "@/types/games";

export interface GameSelectorProps {
  /** Currently selected game ID */
  selectedGame?: GameId;
  /** Callback when a game is selected */
  onSelect: (gameId: GameId) => void;
  /** Filter games by category */
  categoryFilter?: GameCategory;
  /** Filter games that support a specific feature */
  featureFilter?: keyof GameConfig["features"];
  /** Show only games with replay support */
  replayOnly?: boolean;
  /** Layout mode */
  layout?: "grid" | "list" | "compact";
  /** Show category filter tabs */
  showCategoryFilter?: boolean;
  /** Show search input */
  showSearch?: boolean;
  /** Allow multiple selection */
  multiSelect?: boolean;
  /** Selected games for multi-select mode */
  selectedGames?: GameId[];
  /** Callback for multi-select mode */
  onMultiSelect?: (gameIds: GameId[]) => void;
  /** Custom class name */
  className?: string;
}

/**
 * Premium game selector component for choosing games across the platform.
 * Features:
 * - Gaming-themed visual design
 * - Category filtering
 * - Search functionality
 * - Grid/List/Compact layouts
 * - Multi-select support
 * - Animated transitions
 */
export function GameSelector({
  selectedGame,
  onSelect,
  categoryFilter,
  featureFilter,
  replayOnly = false,
  layout = "grid",
  showCategoryFilter = true,
  showSearch = false,
  multiSelect = false,
  selectedGames = [],
  onMultiSelect,
  className = "",
}: GameSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<GameCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredGame, setHoveredGame] = useState<GameId | null>(null);

  // Get filtered games
  const getFilteredGames = useCallback(() => {
    let games = getActiveGames();

    // Apply category filter
    if (categoryFilter) {
      games = getGamesByCategory(categoryFilter);
    } else if (activeCategory !== "all") {
      games = getGamesByCategory(activeCategory);
    }

    // Apply feature filter
    if (featureFilter) {
      games = games.filter((g) => g.features[featureFilter]);
    }

    // Apply replay filter
    if (replayOnly) {
      games = games.filter((g) => g.integration.replaySupport);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      games = games.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.shortName.toLowerCase().includes(query) ||
          g.category.toLowerCase().includes(query)
      );
    }

    return games;
  }, [activeCategory, categoryFilter, featureFilter, replayOnly, searchQuery]);

  const games = getFilteredGames();

  const handleSelect = (gameId: GameId) => {
    if (multiSelect && onMultiSelect) {
      const newSelection = selectedGames.includes(gameId)
        ? selectedGames.filter((id) => id !== gameId)
        : [...selectedGames, gameId];
      onMultiSelect(newSelection);
    } else {
      onSelect(gameId);
    }
  };

  const isSelected = (gameId: GameId) => {
    if (multiSelect) {
      return selectedGames.includes(gameId);
    }
    return selectedGame === gameId;
  };

  return (
    <div className={`game-selector ${className}`}>
      {/* Header with filters */}
      <div className="mb-6 space-y-4">
        {/* Category filter tabs */}
        {showCategoryFilter && !categoryFilter && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={activeCategory === "all" ? "solid" : "bordered"}
              color={activeCategory === "all" ? "primary" : "default"}
              className="font-gaming"
              onClick={() => setActiveCategory("all")}
            >
              <Icon icon="solar:gamepad-bold" className="mr-1" />
              All Games
            </Button>
            {Object.entries(GAME_CATEGORIES).map(([key, category]) => {
              const catKey = key as GameCategory;
              const gameCount = getGamesByCategory(catKey).length;
              if (gameCount === 0) return null;

              return (
                <Button
                  key={key}
                  size="sm"
                  variant={activeCategory === catKey ? "solid" : "bordered"}
                  color={activeCategory === catKey ? "primary" : "default"}
                  className="font-gaming"
                  onClick={() => setActiveCategory(catKey)}
                >
                  <Icon icon={category.icon} className="mr-1" />
                  {category.name}
                  <Badge 
                    content={gameCount} 
                    size="sm" 
                    color="primary" 
                    className="ml-1"
                  >
                    <span />
                  </Badge>
                </Button>
              );
            })}
          </div>
        )}

        {/* Search input */}
        {showSearch && (
          <Input
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Icon icon="solar:magnifer-linear" className="text-default-400" />}
            classNames={{
              input: "font-gaming",
              inputWrapper: "bg-content2/50 backdrop-blur-md",
            }}
          />
        )}
      </div>

      {/* Games grid/list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={
            layout === "grid"
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              : layout === "list"
              ? "flex flex-col gap-3"
              : "flex flex-wrap gap-2"
          }
        >
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              selected={isSelected(game.id)}
              hovered={hoveredGame === game.id}
              layout={layout}
              onSelect={() => handleSelect(game.id)}
              onHover={(hovered) => setHoveredGame(hovered ? game.id : null)}
            />
          ))}

          {games.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12"
            >
              <Icon
                icon="solar:gamepad-no-charge-bold"
                className="text-6xl text-default-300 mx-auto mb-4"
              />
              <p className="text-default-500 font-gaming">No games found</p>
              <p className="text-sm text-default-400">
                Try adjusting your filters or search query
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface GameCardProps {
  game: GameConfig;
  selected: boolean;
  hovered: boolean;
  layout: "grid" | "list" | "compact";
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}

function GameCard({ game, selected, hovered, layout, onSelect, onHover }: GameCardProps) {
  if (layout === "compact") {
    return (
      <Tooltip content={game.name}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Chip
            variant={selected ? "solid" : "bordered"}
            color={selected ? "primary" : "default"}
            className="cursor-pointer font-gaming"
            onClick={onSelect}
            startContent={<Icon icon={game.icon} />}
          >
            {game.shortName}
          </Chip>
        </motion.div>
      </Tooltip>
    );
  }

  if (layout === "list") {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
      >
        <Card
          isPressable
          onPress={onSelect}
          className={`transition-all duration-200 ${
            selected
              ? "ring-2 ring-primary bg-primary/10"
              : hovered
              ? "ring-1 ring-default-300"
              : ""
          }`}
        >
          <CardBody className="flex flex-row items-center gap-4 p-3">
            {/* Game icon */}
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: game.color.primary + "20" }}
            >
              <Icon
                icon={game.icon}
                className="text-2xl"
                style={{ color: game.color.primary }}
              />
            </div>

            {/* Game info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-gaming font-bold truncate">{game.name}</h3>
              <p className="text-sm text-default-500 truncate">{game.description}</p>
            </div>

            {/* Category chip */}
            <Chip size="sm" variant="flat" color="primary">
              {GAME_CATEGORIES[game.category]?.name || game.category}
            </Chip>

            {/* Selection indicator */}
            {selected && (
              <Icon
                icon="solar:check-circle-bold"
                className="text-2xl text-primary shrink-0"
              />
            )}
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  // Grid layout (default)
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <Card
        isPressable
        onPress={onSelect}
        className={`overflow-hidden transition-all duration-300 ${
          selected
            ? "ring-2 ring-primary shadow-lg shadow-primary/30"
            : hovered
            ? "ring-1 ring-default-300 shadow-md"
            : ""
        }`}
      >
        {/* Banner image with gradient overlay */}
        <div
          className="relative h-24 overflow-hidden"
          style={{ backgroundColor: game.color.secondary }}
        >
          {/* Animated gradient background */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background: `linear-gradient(135deg, ${game.color.primary}40, ${game.color.accent}40)`,
            }}
          />
          
          {/* Game icon centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon
              icon={game.icon}
              className="text-5xl drop-shadow-lg"
              style={{ color: game.color.primary }}
            />
          </div>

          {/* Selection checkmark */}
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2"
            >
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Icon icon="solar:check-linear" className="text-white text-sm" />
              </div>
            </motion.div>
          )}

          {/* Feature badges */}
          <div className="absolute bottom-2 left-2 flex gap-1">
            {game.features.tournaments && (
              <Tooltip content="Tournaments">
                <div className="w-5 h-5 bg-black/50 rounded flex items-center justify-center">
                  <Icon icon="solar:cup-star-bold" className="text-amber-400 text-xs" />
                </div>
              </Tooltip>
            )}
            {game.features.replayAnalysis && (
              <Tooltip content="Replay Analysis">
                <div className="w-5 h-5 bg-black/50 rounded flex items-center justify-center">
                  <Icon icon="solar:videocamera-record-bold" className="text-blue-400 text-xs" />
                </div>
              </Tooltip>
            )}
            {game.features.coaching && (
              <Tooltip content="Coaching">
                <div className="w-5 h-5 bg-black/50 rounded flex items-center justify-center">
                  <Icon icon="solar:users-group-rounded-bold" className="text-green-400 text-xs" />
                </div>
              </Tooltip>
            )}
          </div>
        </div>

        <CardBody className="p-3">
          <h3 className="font-gaming font-bold text-sm truncate" title={game.name}>
            {game.name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <Chip
              size="sm"
              variant="flat"
              className="text-xs"
              style={{
                backgroundColor: game.color.primary + "20",
                color: game.color.primary,
              }}
            >
              {game.shortName}
            </Chip>
            <span className="text-xs text-default-400">
              {game.matchmaking.modes.filter((m) => m.ranked).length} ranked modes
            </span>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

/**
 * Simplified game selector for quick selection (e.g., in forms)
 */
export function QuickGameSelector({
  selectedGame,
  onSelect,
  className = "",
}: Pick<GameSelectorProps, "selectedGame" | "onSelect" | "className">) {
  return (
    <GameSelector
      selectedGame={selectedGame}
      onSelect={onSelect}
      layout="compact"
      showCategoryFilter={false}
      showSearch={false}
      className={className}
    />
  );
}

/**
 * Game selector with preview details
 */
export function GameSelectorWithDetails({
  selectedGame,
  onSelect,
  className = "",
}: Pick<GameSelectorProps, "selectedGame" | "onSelect" | "className">) {
  const game = selectedGame ? GAME_CONFIGS[selectedGame] : null;

  return (
    <div className={`flex flex-col lg:flex-row gap-6 ${className}`}>
      {/* Selector */}
      <div className="flex-1">
        <GameSelector
          selectedGame={selectedGame}
          onSelect={onSelect}
          layout="grid"
          showCategoryFilter
          showSearch
        />
      </div>

      {/* Details panel */}
      <div className="lg:w-80 shrink-0">
        <AnimatePresence mode="wait">
          {game ? (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="sticky top-4">
                <CardBody className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: game.color.primary + "20" }}
                    >
                      <Icon
                        icon={game.icon}
                        className="text-3xl"
                        style={{ color: game.color.primary }}
                      />
                    </div>
                    <div>
                      <h3 className="font-gaming font-bold text-lg">{game.name}</h3>
                      <p className="text-sm text-default-500">
                        {GAME_CATEGORIES[game.category]?.name}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-default-600">{game.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-content2">
                      <p className="text-xs text-default-500">Team Size</p>
                      <p className="font-gaming font-bold">{game.matchmaking.teamSize}v{game.matchmaking.teamSize}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-content2">
                      <p className="text-xs text-default-500">Maps</p>
                      <p className="font-gaming font-bold">
                        {game.matchmaking.maps.filter((m) => m.active).length}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-content2">
                      <p className="text-xs text-default-500">Modes</p>
                      <p className="font-gaming font-bold">{game.matchmaking.modes.length}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-content2">
                      <p className="text-xs text-default-500">Ranks</p>
                      <p className="font-gaming font-bold">{game.ranking.tiers.length}</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <p className="text-xs text-default-500 mb-2">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(game.features).map(
                        ([feature, enabled]) =>
                          enabled && (
                            <Chip
                              key={feature}
                              size="sm"
                              variant="flat"
                              color="primary"
                            >
                              {feature.replace(/([A-Z])/g, " $1").trim()}
                            </Chip>
                          )
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    color="primary"
                    className="w-full font-gaming"
                    startContent={<Icon icon="solar:gamepad-bold" />}
                  >
                    Play {game.shortName}
                  </Button>
                </CardBody>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-default-400"
            >
              <Icon icon="solar:hand-stars-bold" className="text-4xl mb-2" />
              <p className="text-sm">Select a game to see details</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default GameSelector;
