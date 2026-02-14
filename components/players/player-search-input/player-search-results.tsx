import React from "react";
import {
  Listbox,
  ListboxItem,
  ListboxSection,
  ScrollShadow,
  Spinner,
  Avatar,
} from "@nextui-org/react";
import { PlayerProfile } from "@/types/replay-api/entities.types";

export type ResourceSearchResult = {
  id: string;
  nickname: string;
  avatar: string;
  role: string;
};

interface SearchResultsProps {
  players?: PlayerProfile[];
  isLoading?: boolean;
  hasSearched?: boolean;
  onPlayerSelect?: (player: PlayerProfile) => void;
  onClose?: () => void;
  onPress?: (key: string) => void;
}

const SearchResults = ({
  players = [],
  isLoading = false,
  hasSearched = false,
  onPlayerSelect,
  onClose: _onClose,
  onPress: _onPress,
}: SearchResultsProps) => {
  const handleSelect = (player: PlayerProfile) => {
    if (onPlayerSelect) {
      onPlayerSelect(player);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (hasSearched && players.length === 0) {
    return (
      <div className="text-center text-default-500 py-8">No players found</div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="text-center text-default-400 py-8">
        Start typing to search for players
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 gap-2">
      <div>
        <ScrollShadow className="w-full h-[400px]">
          <Listbox
            aria-label="Player search results"
            selectionMode="single"
            onAction={(key) => {
              const player = players.find((p) => p.id === key);
              if (player) handleSelect(player);
            }}
          >
            <ListboxSection title="Players">
              {players.map((player) => (
                <ListboxItem
                  key={player.id}
                  textValue={player.nickname || player.id}
                  startContent={
                    <Avatar
                      src={player.avatar_uri}
                      name={player.nickname}
                      size="sm"
                    />
                  }
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{player.nickname}</span>
                    {player.slug_uri && (
                      <span className="text-small text-default-400">
                        @{player.slug_uri}
                      </span>
                    )}
                  </div>
                </ListboxItem>
              ))}
            </ListboxSection>
          </Listbox>
        </ScrollShadow>
      </div>
    </div>
  );
};

export default SearchResults;
