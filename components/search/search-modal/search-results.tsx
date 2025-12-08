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
      <div className="flex flex-col items-center justify-center h-[400px] text-[#34445C]/60 dark:text-[#F5F0E1]/60">
        <div className="w-16 h-16 flex items-center justify-center bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 mb-4"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)' }}>
          <Icon icon="mdi:magnify" width={32} className="text-[#FF4654] dark:text-[#DCFF37]" />
        </div>
        <p className="text-lg text-[#34445C] dark:text-[#F5F0E1]">Start typing to search...</p>
        <p className="text-sm mt-2">Search for replays, players, teams, and more</p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Spinner size="lg" label="Searching..." color="warning" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-danger">
        <div className="w-16 h-16 flex items-center justify-center bg-danger/10 mb-4"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)' }}>
          <Icon icon="mdi:alert-circle" width={32} />
        </div>
        <p className="text-lg">Search failed</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    );
  }

  // No results
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-[#34445C]/60 dark:text-[#F5F0E1]/60">
        <div className="w-16 h-16 flex items-center justify-center bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 mb-4"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)' }}>
          <Icon icon="mdi:magnify-close" width={32} className="text-[#FF4654] dark:text-[#DCFF37]" />
        </div>
        <p className="text-lg text-[#34445C] dark:text-[#F5F0E1]">No results found</p>
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
        classNames={{
          base: "p-0",
        }}
      >
        {Object.keys(groupedResults).map((type) => {
          const config = typeConfig[type as keyof typeof typeConfig];
          const items = groupedResults[type];

          return (
            <ListboxSection
              key={type}
              title={config.label}
              classNames={{
                heading: "text-small font-bold text-[#FF4654] dark:text-[#DCFF37] pl-2 uppercase tracking-wider",
                group: "mb-2",
              }}
            >
              {items.map((result) => (
                <ListboxItem
                  key={result.id}
                  href={result.href}
                  className="py-3 rounded-none hover:bg-[#FF4654]/10 dark:hover:bg-[#DCFF37]/10 data-[hover=true]:bg-[#FF4654]/10 dark:data-[hover=true]:bg-[#DCFF37]/10"
                  startContent={
                    <div className="flex items-center justify-center w-10 h-10 bg-[#FF4654]/10 dark:bg-[#DCFF37]/10"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}>
                      <Icon
                        icon={config.icon}
                        width={24}
                        className="text-[#FF4654] dark:text-[#DCFF37]"
                      />
                    </div>
                  }
                  description={<span className="text-[#34445C]/60 dark:text-[#F5F0E1]/60">{result.description}</span>}
                  onClick={onPress}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[#34445C] dark:text-[#F5F0E1]">{result.title}</span>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={config.color}
                      className="capitalize rounded-none"
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
