/**
 * Search Results Component
 * Displays search results from global search with proper entity grouping,
 * game badges, and intelligent visual hierarchy
 */

import React from "react";
import {
  Chip,
  Listbox,
  ListboxItem,
  ListboxSection,
  ScrollShadow,
  Spinner,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { GlobalSearchResult } from "@/hooks/useGlobalSearch";
import { ParsedSearchQuery } from "@/lib/search/query-parser";

interface SearchResultsProps {
  results: GlobalSearchResult[];
  loading: boolean;
  error: string | null;
  query: string;
  parsedQuery?: ParsedSearchQuery | null;
  onPress?: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  error,
  query,
  parsedQuery,
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

  // Show detected filters banner
  const renderFilterBanner = () => {
    if (!parsedQuery) return null;

    const filters: React.ReactNode[] = [];

    if (parsedQuery.gameDisplay) {
      filters.push(
        <Chip
          key="game"
          size="sm"
          variant="flat"
          className="rounded-none"
          style={{ backgroundColor: `${parsedQuery.gameDisplay.color}20`, color: parsedQuery.gameDisplay.color }}
          startContent={
            <Icon icon={parsedQuery.gameDisplay.icon} width={14} />
          }
        >
          {parsedQuery.gameDisplay.shortName}
        </Chip>
      );
    }

    if (parsedQuery.entityType) {
      const config = typeConfig[parsedQuery.entityType];
      filters.push(
        <Chip
          key="entity"
          size="sm"
          variant="flat"
          color={config.color}
          className="rounded-none"
          startContent={<Icon icon={config.icon} width={14} />}
        >
          {config.label}
        </Chip>
      );
    }

    if (filters.length === 0) return null;

    return (
      <div className="flex items-center gap-2 px-2 py-2 mb-2 bg-[#FF4654]/5 dark:bg-[#DCFF37]/5 border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10">
        <span className="text-xs text-[#34445C]/60 dark:text-[#F5F0E1]/60">Filtering by:</span>
        {filters}
        {parsedQuery.searchTerm && (
          <span className="text-xs text-[#34445C]/40 dark:text-[#F5F0E1]/40 ml-auto">
            searching &ldquo;{parsedQuery.searchTerm}&rdquo;
          </span>
        )}
      </div>
    );
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
        <p className="text-sm mt-2">Search for replays, players, teams, and matches</p>
        <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-md">
          <span className="text-xs text-[#34445C]/40 dark:text-[#F5F0E1]/40">Try:</span>
          <Chip size="sm" variant="flat" className="rounded-none text-xs cursor-pointer hover:opacity-80">
            valorant teams
          </Chip>
          <Chip size="sm" variant="flat" className="rounded-none text-xs cursor-pointer hover:opacity-80">
            cs2 players
          </Chip>
          <Chip size="sm" variant="flat" className="rounded-none text-xs cursor-pointer hover:opacity-80">
            NeoStrike
          </Chip>
        </div>
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
        {renderFilterBanner()}
        <div className="w-16 h-16 flex items-center justify-center bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 mb-4"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)' }}>
          <Icon icon="mdi:magnify-close" width={32} className="text-[#FF4654] dark:text-[#DCFF37]" />
        </div>
        <p className="text-lg text-[#34445C] dark:text-[#F5F0E1]">No results found</p>
        <p className="text-sm mt-2">
          {parsedQuery?.hasGameFilter
            ? `No ${parsedQuery.gameDisplay?.name || 'game'} results found. Try a different game or broader search.`
            : 'Try searching with different keywords'}
        </p>
        {parsedQuery?.suggestions && parsedQuery.suggestions.length > 0 && (
          <div className="mt-4 text-xs text-[#34445C]/40 dark:text-[#F5F0E1]/40">
            <p className="mb-1">💡 Tips:</p>
            <ul className="list-disc list-inside">
              {parsedQuery.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px]">
      {renderFilterBanner()}
      <ScrollShadow className="flex-1">
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
                title={`${config.label} (${items.length})`}
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
                      <div className="relative">
                        <div className="flex items-center justify-center w-10 h-10 bg-[#FF4654]/10 dark:bg-[#DCFF37]/10"
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}>
                          <Icon
                            icon={config.icon}
                            width={24}
                            className="text-[#FF4654] dark:text-[#DCFF37]"
                          />
                        </div>
                        {result.gameDisplay && (
                          <Tooltip content={result.gameDisplay.name} placement="bottom" delay={200}>
                            <div
                              className="absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center rounded-sm"
                              style={{ backgroundColor: result.gameDisplay.color }}
                            >
                              <Icon icon={result.gameDisplay.icon} width={12} className="text-white" />
                            </div>
                          </Tooltip>
                        )}
                      </div>
                    }
                    description={
                      <span className="text-[#34445C]/60 dark:text-[#F5F0E1]/60 text-xs">
                        {result.description}
                      </span>
                    }
                    onClick={onPress}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[#34445C] dark:text-[#F5F0E1] font-medium">
                        {result.title}
                      </span>
                      <div className="flex items-center gap-1">
                        {result.gameDisplay && (
                          <Chip
                            size="sm"
                            variant="flat"
                            className="rounded-none text-xs h-5"
                            style={{
                              backgroundColor: `${result.gameDisplay.color}15`,
                              color: result.gameDisplay.color,
                            }}
                          >
                            {result.gameDisplay.shortName}
                          </Chip>
                        )}
                        <Chip
                          size="sm"
                          variant="flat"
                          color={config.color}
                          className="capitalize rounded-none text-xs h-5"
                        >
                          {type}
                        </Chip>
                      </div>
                    </div>
                  </ListboxItem>
                ))}
              </ListboxSection>
            );
          })}
        </Listbox>
      </ScrollShadow>
      {results.length > 0 && (
        <div className="flex items-center justify-between px-2 py-2 border-t border-[#FF4654]/10 dark:border-[#DCFF37]/10 text-xs text-[#34445C]/40 dark:text-[#F5F0E1]/40">
          <span>{results.length} results found</span>
          <span>↵ to select • esc to close</span>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
