"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Input,
  Kbd,
  Spinner,
} from "@nextui-org/react";
import { SearchIcon } from "@/components/icons";
import SearchResults from "./player-search-results";
import { PlayerApiClient } from "@/types/replay-api/player-api.client";
import { PlayerProfile } from "@/types/replay-api/entities.types";
import { logger } from "@/lib/logger";
import { useAuth } from "@/hooks/use-auth";

// Type alias for backwards compatibility
type Player = PlayerProfile;

export default function SearchInput() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Player[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const playerApiClient = useMemo(() => new PlayerApiClient({ logger }), []);

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      setError(null);
      setHasSearched(true);

      try {
        // Pass RID token if available, or undefined for public search
        const authToken = user?.rid;
        const result = await playerApiClient.searchPlayers(query, authToken);

        // Handle both wrapped and unwrapped response formats
        const players = Array.isArray(result) ? result : result ? [result] : [];
        setResults(players);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to search players";
        logger.error("Player search failed", err);
        setError(errorMessage);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [playerApiClient, user?.rid]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  const handlePlayerSelect = (player: Player) => {
    logger.info("Player selected", { player });
    onClose();
  };

  const handleModalOpen = () => {
    setSearchQuery("");
    setResults([]);
    setError(null);
    setHasSearched(false);
    onOpen();
  };

  return (
    <div className="w-full">
      <Input
        aria-label="Search"
        classNames={{
          inputWrapper: "bg-default-100",
          input: "text-sm radius-none text-default-500",
        }}
        onClick={handleModalOpen}
        onInput={handleModalOpen}
        endContent={
          <div>
            <Kbd className="hidden lg:inline-block">⌘</Kbd>
            <small> + </small>
            <Kbd className="hidden lg:inline-block">K</Kbd>
          </div>
        }
        labelPlacement="outside"
        placeholder="Search..."
        startContent={
          <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
        }
        type="search"
      />
      <Modal
        backdrop="opaque"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
        size="5xl"
      >
        <ModalContent>
          {(onModalClose) => (
            <>
              <ModalHeader className="items-center text-center justify-center">
                <Input
                  aria-label="Search"
                  classNames={{
                    inputWrapper: "bg-default-100",
                    input: "text-xl",
                  }}
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  endContent={
                    isSearching ? (
                      <Spinner size="sm" color="primary" />
                    ) : (
                      <Kbd keys={["command", "enter"]} title="Search"></Kbd>
                    )
                  }
                  labelPlacement="outside"
                  placeholder="Search players..."
                  startContent={<SearchIcon className="text-default-300 md" />}
                  type="search"
                />
              </ModalHeader>
              <ModalBody>
                {error && (
                  <div className="bg-danger-100 text-danger-700 p-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                <SearchResults
                  players={results}
                  isLoading={isSearching}
                  hasSearched={hasSearched}
                  onPlayerSelect={handlePlayerSelect}
                  onClose={onModalClose}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onModalClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
