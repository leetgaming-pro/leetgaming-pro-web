import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Checkbox, Input, Link, LinkIcon, Kbd } from "@nextui-org/react";
import { CopyDocumentIcon, DeleteDocumentIcon, EditDocumentIcon, Logo, PlusIcon, SearchIcon, ServerIcon } from '@/components/icons';
import { ChevronDownIcon } from '@/components/files/replays-table/ChevronDownIcon';
import SearchResults from "./search-results";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { useGlobalSearchContext } from "@/components/search/global-search-provider";

export default function SearchInput() {
    // Use global search context for keyboard shortcut integration (Cmd+K / Ctrl+K)
    const { isOpen, openSearch, closeSearch } = useGlobalSearchContext();
    const [query, setQuery] = useState("");
    const { results, loading, error, search, clear } = useGlobalSearch();
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Debounced search
    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        if (query.trim().length >= 2) {
            debounceTimer.current = setTimeout(() => {
                search(query);
            }, 300); // 300ms debounce
        } else {
            clear();
        }

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [query, search, clear]);

    // Clear search when modal closes
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setQuery("");
            clear();
            closeSearch();
        }
    };

    const handleKey = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            handleOpenChange(false);
        }
    }, []);

    return (
        <div className="w-full">
            <Input
                aria-label="Search"
                classNames={{
                    inputWrapper: "bg-[#F5F0E1]/80 dark:bg-[#1a1a1a]/80 h-9 rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 hover:border-[#FF4654]/40 dark:hover:border-[#DCFF37]/40",
                    input: "text-sm text-[#34445C] dark:text-[#F5F0E1]",
                }}
                size="sm"
                onClick={openSearch}
                endContent={
                    <div className="flex items-center gap-1">
                    <Kbd className="hidden lg:inline-block bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 text-[#FF4654] dark:text-[#DCFF37] rounded-none">
                        ⌘
                    </Kbd>
                    <small className="text-[#34445C]/50 dark:text-[#F5F0E1]/50"> + </small>
                    <Kbd className="hidden lg:inline-block bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 text-[#FF4654] dark:text-[#DCFF37] rounded-none">
                        `
                    </Kbd>
                    </div>
                }
                labelPlacement="outside"
                placeholder="Search..."
                startContent={
                    <SearchIcon className="text-base text-[#FF4654] dark:text-[#DCFF37] pointer-events-none flex-shrink-0" />
                }
                type="search"
            />
            <Modal
                backdrop="opaque"
                isOpen={isOpen}
                onOpenChange={handleOpenChange}
                placement="top-center"
                size="5xl"
                classNames={{
                    base: "leet-modal",
                    wrapper: "leet-modal-backdrop",
                    backdrop: "leet-modal-backdrop",
                    body: "leet-modal-body bg-[#F5F0E1] dark:bg-[#1a1a1a]",
                    header: "leet-modal-header",
                    footer: "leet-modal-footer",
                }}
                motionProps={{
                    variants: {
                        enter: {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            transition: {
                                duration: 0.3,
                                ease: [0.36, 0.66, 0.4, 1],
                            },
                        },
                        exit: {
                            y: -20,
                            opacity: 0,
                            scale: 0.95,
                            transition: {
                                duration: 0.2,
                                ease: [0.4, 0, 1, 1],
                            },
                        },
                    },
                }}
            >
                <ModalContent className="leet-modal-content">
                    {(onClose) => (
                        <>
                            <ModalHeader className="items-center text-center justify-center">
                                <Input
                                    aria-label="Search"
                                    autoFocus
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKey}
                                    classNames={{
                                        inputWrapper: "bg-[#F5F0E1]/80 dark:bg-[#1a1a1a]/80 rounded-none border border-[#FF4654]/30 dark:border-[#DCFF37]/30",
                                        input: "text-xl text-[#34445C] dark:text-[#F5F0E1]",
                                    }}
                                    endContent={
                                        loading ? (
                                            <div className="animate-spin text-[#FF4654] dark:text-[#DCFF37]">⏳</div>
                                        ) : (
                                            <Kbd keys={["command", "enter"]} title='Search' className="bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 text-[#FF4654] dark:text-[#DCFF37] rounded-none"></Kbd>
                                        )
                                    }
                                    labelPlacement="outside"
                                    placeholder="Type at least 2 characters..."
                                    startContent={
                                        <SearchIcon className="text-[#FF4654] dark:text-[#DCFF37]" />
                                    }
                                    type="search"
                                />
                            </ModalHeader>
                            <ModalBody>
                                <SearchResults
                                    results={results}
                                    loading={loading}
                                    error={error}
                                    query={query}
                                    onPress={onClose}
                                />
                            </ModalBody>
                            <ModalFooter>
                                {error && (
                                    <div className="text-danger text-sm">{error}</div>
                                )}
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
