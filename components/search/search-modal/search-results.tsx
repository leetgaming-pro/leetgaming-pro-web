/**
 * Search Results Component
 * Displays search results from global search with proper entity grouping
 */

import React from "react";
import {
  Avatar,
  Chip,
  Listbox,
  ListboxItem,
  ListboxSection,
  ScrollShadow,
  Spinner,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { GlobalSearchResult } from "@/hooks/useGlobalSearch";
import Link from "next/link";

interface SearchResultsProps {
  results: GlobalSearchResult[];
  loading: boolean;
  error: string | null;
  query: string;
  onPress?: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  error,
  query,
  onPress,
}) => {
  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, GlobalSearchResult[]>);

  // Type labels and icons
  const typeConfig = {
    replay: {
      label: "Replays",
      icon: "mdi:video-box",
      color: "danger" as const,
    },
    player: {
      label: "Players",
      icon: "mdi:account",
      color: "primary" as const,
    },
    team: {
      label: "Teams",
      icon: "mdi:account-group",
      color: "secondary" as const,
    },
    match: {
      label: "Matches",
      icon: "mdi:trophy",
      color: "warning" as const,
    },
  };

  // Empty state
  if (!query || query.trim().length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-default-400">
        <Icon icon="mdi:magnify" width={64} className="mb-4 opacity-50" />
        <p className="text-lg">Start typing to search...</p>
        <p className="text-sm mt-2">Search for replays, players, teams, and more</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Spinner size="lg" label="Searching..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-danger">
        <Icon icon="mdi:alert-circle" width={64} className="mb-4" />
        <p className="text-lg">Search failed</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    );
  }

  // No results
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-default-400">
        <Icon icon="mdi:magnify-close" width={64} className="mb-4 opacity-50" />
        <p className="text-lg">No results found</p>
        <p className="text-sm mt-2">Try searching with different keywords</p>
      </div>
    );
  }

  return (
    <ScrollShadow className="w-full h-[400px]">
      <Listbox
        aria-label="Search results"
        selectionMode="none"
        emptyContent="No results found"
      >
        {Object.keys(groupedResults).map((type) => {
          const config = typeConfig[type as keyof typeof typeConfig];
          const items = groupedResults[type];

          return (
            <ListboxSection
              key={type}
              title={config.label}
              classNames={{
                heading: "text-small font-semibold text-default-500 pl-2 uppercase",
              }}
            >
              {items.map((result) => (
                <ListboxItem
                  key={result.id}
                  href={result.href}
                  className="py-3"
                  startContent={
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-default-100">
                      <Icon
                        icon={config.icon}
                        width={24}
                        className={`text-${config.color}`}
                      />
                    </div>
                  }
                  description={result.description}
                  onClick={onPress}
                >
                  <div className="flex items-center gap-2">
                    {result.title}
                    <Chip
                      size="sm"
                      variant="flat"
                      color={config.color}
                      className="capitalize"
                    >
                      {type}
                    </Chip>
                  </div>
                </ListboxItem>
              ))}
            </ListboxSection>
          );
        })}
      </Listbox>
    </ScrollShadow>
  );
};

export default SearchResults;
