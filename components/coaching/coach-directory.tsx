/**
 * Coach Directory Component
 * Searchable, filterable coach listing for the marketplace
 * Per PRD D.4.3 and E.7 - Coaching Marketplace
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Input,
  Select,
  SelectItem,
  Slider,
  Checkbox,
  CheckboxGroup,
  Button,
  Chip,
  Card,
  CardBody,
  Divider,
  Accordion,
  AccordionItem,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { CoachCard, CoachGrid } from "./coach-card";
import type { Coach, CoachFilters, SessionType } from "@/types/coaching";
import { SESSION_TYPE_LABELS, formatCoachPrice } from "@/types/coaching";
import type { GameId } from "@/types/games";
import { GAME_CONFIGS, getActiveGames } from "@/config/games";

interface CoachDirectoryProps {
  coaches: Coach[];
  onBook?: (coach: Coach) => void;
  onMessage?: (coach: Coach) => void;
  isLoading?: boolean;
}

const SORT_OPTIONS = [
  { key: "rating", label: "Highest Rated" },
  { key: "price-low", label: "Price: Low to High" },
  { key: "price-high", label: "Price: High to Low" },
  { key: "sessions", label: "Most Sessions" },
  { key: "response-time", label: "Fastest Response" },
  { key: "newest", label: "Newest" },
] as const;

const LANGUAGE_OPTIONS = [
  { key: "en", label: "English" },
  { key: "es", label: "Spanish" },
  { key: "pt", label: "Portuguese" },
  { key: "zh", label: "Chinese" },
  { key: "ru", label: "Russian" },
  { key: "ko", label: "Korean" },
  { key: "ja", label: "Japanese" },
  { key: "de", label: "German" },
  { key: "fr", label: "French" },
];

export function CoachDirectory({
  coaches,
  onBook,
  onMessage,
  isLoading = false,
}: CoachDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<CoachFilters>({
    sortBy: "rating",
    verified: false,
    proOnly: false,
    acceptingStudents: true,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);

  const activeGames = getActiveGames();

  // Filter and sort coaches
  const filteredCoaches = useMemo(() => {
    let result = [...coaches];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (coach) =>
          coach.displayName.toLowerCase().includes(query) ||
          coach.tagline.toLowerCase().includes(query) ||
          coach.expertise.some((e) =>
            GAME_CONFIGS[e.gameId]?.name.toLowerCase().includes(query)
          )
      );
    }

    // Game filter
    if (filters.games && filters.games.length > 0) {
      result = result.filter((coach) =>
        coach.expertise.some((e) => filters.games?.includes(e.gameId))
      );
    }

    // Session type filter
    if (filters.sessionTypes && filters.sessionTypes.length > 0) {
      result = result.filter((coach) =>
        coach.pricing.some((p) => filters.sessionTypes?.includes(p.sessionType))
      );
    }

    // Price range filter
    result = result.filter((coach) => {
      const minPrice = Math.min(...coach.pricing.map((p) => p.priceUsd));
      return minPrice >= priceRange[0] && minPrice <= priceRange[1];
    });

    // Rating filter
    if (filters.rating && filters.rating > 0) {
      result = result.filter(
        (coach) => coach.stats.avgRating >= (filters.rating ?? 0)
      );
    }

    // Language filter
    if (filters.languages && filters.languages.length > 0) {
      result = result.filter((coach) =>
        coach.languages.some((lang) =>
          filters.languages?.some((fl) =>
            lang.toLowerCase().includes(fl.toLowerCase())
          )
        )
      );
    }

    // Verified filter
    if (filters.verified) {
      result = result.filter((coach) => coach.verified);
    }

    // Pro only filter
    if (filters.proOnly) {
      result = result.filter((coach) => coach.proVerified);
    }

    // Accepting students filter
    if (filters.acceptingStudents) {
      result = result.filter((coach) => coach.acceptingStudents);
    }

    // Sort
    switch (filters.sortBy) {
      case "rating":
        result.sort((a, b) => b.stats.avgRating - a.stats.avgRating);
        break;
      case "price-low":
        result.sort((a, b) => {
          const aMin = Math.min(...a.pricing.map((p) => p.priceUsd));
          const bMin = Math.min(...b.pricing.map((p) => p.priceUsd));
          return aMin - bMin;
        });
        break;
      case "price-high":
        result.sort((a, b) => {
          const aMax = Math.max(...a.pricing.map((p) => p.priceUsd));
          const bMax = Math.max(...b.pricing.map((p) => p.priceUsd));
          return bMax - aMax;
        });
        break;
      case "sessions":
        result.sort((a, b) => b.stats.totalSessions - a.stats.totalSessions);
        break;
      case "response-time":
        result.sort((a, b) => a.stats.responseTime - b.stats.responseTime);
        break;
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return result;
  }, [coaches, searchQuery, filters, priceRange]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.games && filters.games.length > 0) count++;
    if (filters.sessionTypes && filters.sessionTypes.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < 500) count++;
    if (filters.rating) count++;
    if (filters.languages && filters.languages.length > 0) count++;
    if (filters.verified) count++;
    if (filters.proOnly) count++;
    return count;
  }, [filters, priceRange]);

  const clearFilters = () => {
    setFilters({
      sortBy: "rating",
      verified: false,
      proOnly: false,
      acceptingStudents: true,
    });
    setPriceRange([0, 500]);
    setSearchQuery("");
  };

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Search coaches by name, game, or specialty..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          startContent={
            <Icon icon="solar:magnifer-bold" className="text-default-400" />
          }
          classNames={{
            inputWrapper:
              "rounded-none border-l-4 border-[#FF4654] dark:border-[#DCFF37]",
          }}
          className="flex-1"
        />
        <div className="flex gap-2">
          <Select
            placeholder="Sort by"
            selectedKeys={filters.sortBy ? [filters.sortBy] : []}
            onChange={(e) =>
              setFilters({
                ...filters,
                sortBy: e.target.value as CoachFilters["sortBy"],
              })
            }
            className="w-40"
            classNames={{ trigger: "rounded-none" }}
          >
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.key} value={opt.key}>
                {opt.label}
              </SelectItem>
            ))}
          </Select>
          <Button
            variant="flat"
            startContent={<Icon icon="solar:filter-bold" />}
            endContent={
              activeFilterCount > 0 && (
                <Chip
                  size="sm"
                  color="primary"
                  variant="solid"
                  className="h-5 min-w-5"
                >
                  {activeFilterCount}
                </Chip>
              )
            }
            onPress={() => setShowFilters(!showFilters)}
            className="rounded-none"
          >
            Filters
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <Card className="rounded-none">
              <CardBody className="gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Games Filter */}
                  <div>
                    <p className="text-sm font-semibold mb-2">Games</p>
                    <CheckboxGroup
                      value={filters.games as string[]}
                      onChange={(values) =>
                        setFilters({ ...filters, games: values as GameId[] })
                      }
                      className="gap-1"
                    >
                      {activeGames.slice(0, 6).map((game) => (
                        <Checkbox key={game.id} value={game.id} size="sm">
                          {game.name}
                        </Checkbox>
                      ))}
                    </CheckboxGroup>
                  </div>

                  {/* Session Types */}
                  <div>
                    <p className="text-sm font-semibold mb-2">Session Type</p>
                    <CheckboxGroup
                      value={filters.sessionTypes as string[]}
                      onChange={(values) =>
                        setFilters({
                          ...filters,
                          sessionTypes: values as SessionType[],
                        })
                      }
                      className="gap-1"
                    >
                      {(Object.keys(SESSION_TYPE_LABELS) as SessionType[]).map(
                        (type) => (
                          <Checkbox key={type} value={type} size="sm">
                            {SESSION_TYPE_LABELS[type].label}
                          </Checkbox>
                        )
                      )}
                    </CheckboxGroup>
                  </div>

                  {/* Price Range */}
                  <div>
                    <p className="text-sm font-semibold mb-2">
                      Price Range: {formatCoachPrice(priceRange[0])} -{" "}
                      {formatCoachPrice(priceRange[1])}
                    </p>
                    <Slider
                      step={10}
                      minValue={0}
                      maxValue={500}
                      value={priceRange}
                      onChange={(value) =>
                        setPriceRange(value as [number, number])
                      }
                      className="max-w-md"
                      classNames={{
                        track: "rounded-none",
                        filler:
                          "rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]",
                      }}
                    />
                    <div className="flex justify-between text-xs text-default-500 mt-1">
                      <span>$0</span>
                      <span>$500+</span>
                    </div>
                  </div>

                  {/* Other Filters */}
                  <div>
                    <p className="text-sm font-semibold mb-2">Other Options</p>
                    <div className="flex flex-col gap-2">
                      <Checkbox
                        isSelected={filters.verified}
                        onValueChange={(checked) =>
                          setFilters({ ...filters, verified: checked })
                        }
                        size="sm"
                      >
                        Verified Coaches Only
                      </Checkbox>
                      <Checkbox
                        isSelected={filters.proOnly}
                        onValueChange={(checked) =>
                          setFilters({ ...filters, proOnly: checked })
                        }
                        size="sm"
                      >
                        Pro Players Only
                      </Checkbox>
                      <Checkbox
                        isSelected={filters.acceptingStudents}
                        onValueChange={(checked) =>
                          setFilters({ ...filters, acceptingStudents: checked })
                        }
                        size="sm"
                      >
                        Currently Accepting
                      </Checkbox>
                    </div>
                  </div>
                </div>

                {/* Languages - Collapsed by default */}
                <Accordion>
                  <AccordionItem
                    key="languages"
                    title={
                      <span className="text-sm font-semibold">
                        Languages{" "}
                        {filters.languages &&
                          filters.languages.length > 0 &&
                          `(${filters.languages.length})`}
                      </span>
                    }
                  >
                    <CheckboxGroup
                      value={filters.languages as string[]}
                      onChange={(values) =>
                        setFilters({
                          ...filters,
                          languages: values as string[],
                        })
                      }
                      orientation="horizontal"
                      className="gap-2"
                    >
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <Checkbox key={lang.key} value={lang.key} size="sm">
                          {lang.label}
                        </Checkbox>
                      ))}
                    </CheckboxGroup>
                  </AccordionItem>
                </Accordion>

                <Divider />

                {/* Filter Actions */}
                <div className="flex justify-between items-center">
                  <p className="text-sm text-default-500">
                    {filteredCoaches.length} coach
                    {filteredCoaches.length !== 1 ? "es" : ""} found
                  </p>
                  <div className="flex gap-2">
                    {activeFilterCount > 0 && (
                      <Button
                        variant="light"
                        color="danger"
                        size="sm"
                        onPress={clearFilters}
                      >
                        Clear All Filters
                      </Button>
                    )}
                    <Button
                      variant="flat"
                      size="sm"
                      onPress={() => setShowFilters(false)}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Chips */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.games?.map((gameId) => (
            <Chip
              key={gameId}
              onClose={() =>
                setFilters({
                  ...filters,
                  games: filters.games?.filter((g) => g !== gameId),
                })
              }
              variant="flat"
              size="sm"
            >
              {GAME_CONFIGS[gameId]?.name}
            </Chip>
          ))}
          {filters.sessionTypes?.map((type) => (
            <Chip
              key={type}
              onClose={() =>
                setFilters({
                  ...filters,
                  sessionTypes: filters.sessionTypes?.filter((t) => t !== type),
                })
              }
              variant="flat"
              size="sm"
            >
              {SESSION_TYPE_LABELS[type].label}
            </Chip>
          ))}
          {(priceRange[0] > 0 || priceRange[1] < 500) && (
            <Chip
              onClose={() => setPriceRange([0, 500])}
              variant="flat"
              size="sm"
            >
              {formatCoachPrice(priceRange[0])} -{" "}
              {formatCoachPrice(priceRange[1])}
            </Chip>
          )}
          {filters.verified && (
            <Chip
              onClose={() => setFilters({ ...filters, verified: false })}
              variant="flat"
              size="sm"
            >
              Verified
            </Chip>
          )}
          {filters.proOnly && (
            <Chip
              onClose={() => setFilters({ ...filters, proOnly: false })}
              variant="flat"
              size="sm"
            >
              Pro Players
            </Chip>
          )}
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="w-full h-64">
              <CardBody className="animate-pulse bg-default-100" />
            </Card>
          ))}
        </div>
      ) : (
        <CoachGrid
          coaches={filteredCoaches}
          onBook={onBook}
          onMessage={onMessage}
          emptyMessage={
            searchQuery || activeFilterCount > 0
              ? "No coaches match your search criteria"
              : "No coaches available yet"
          }
        />
      )}
    </div>
  );
}

// Featured coaches section for homepage
export function FeaturedCoaches({
  coaches,
  onBook,
  onMessage,
}: {
  coaches: Coach[];
  onBook?: (coach: Coach) => void;
  onMessage?: (coach: Coach) => void;
}) {
  const topCoaches = coaches
    .filter((c) => c.verified && c.stats.avgRating >= 4.5)
    .sort((a, b) => b.stats.totalSessions - a.stats.totalSessions)
    .slice(0, 3);

  if (topCoaches.length === 0) return null;

  return (
    <section className="w-full py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#34445C] dark:text-[#F5F0E1]">
            Featured Coaches
          </h2>
          <p className="text-default-500">
            Learn from the best in competitive gaming
          </p>
        </div>
        <Button
          as="a"
          href="/coaching"
          variant="flat"
          endContent={<Icon icon="solar:arrow-right-bold" />}
          className="rounded-none"
        >
          View All Coaches
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {topCoaches.map((coach, idx) => (
          <CoachCard
            key={coach.id}
            coach={coach}
            variant={idx === 0 ? "featured" : "default"}
            onBook={onBook}
            onMessage={onMessage}
          />
        ))}
      </div>
    </section>
  );
}

export default CoachDirectory;
