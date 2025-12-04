import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Checkbox, Input, Link, LinkIcon, Kbd } from "@nextui-org/react";
import { CopyDocumentIcon, DeleteDocumentIcon, EditDocumentIcon, Logo, PlusIcon, SearchIcon, ServerIcon } from '@/components/icons';
import { ChevronDownIcon } from '@/components/files/replays-table/ChevronDownIcon';
import SearchResults from "./search-results";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";

export default function SearchInput() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
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
        }
        onOpenChange();
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
                    inputWrapper: "bg-default-100 h-9",
                    input: "text-sm text-default-500",
                }}
                size="sm"
                onClick={onOpen}
                // onFocus={onOpen}
                // onInput={onOpen}
                // onMouseEnter={onOpen}
                // onMouseDown={onOpen}
                endContent={
                    <div>
                    <Kbd className="hidden lg:inline-block">
                        ⌘
                    </Kbd>
                    <small> + </small>
                    <Kbd className="hidden lg:inline-block">
                        `
                    </Kbd>
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
                onOpenChange={handleOpenChange}
                placement="top-center"
                size="5xl"
            >
                <ModalContent>
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
                                        inputWrapper: "bg-default-100",
                                        input: "text-xl",
                                    }}
                                    endContent={
                                        loading ? (
                                            <div className="animate-spin">⏳</div>
                                        ) : (
                                            <Kbd keys={["command", "enter"]} title='Search'></Kbd>
                                        )
                                    }
                                    labelPlacement="outside"
                                    placeholder="Type at least 2 characters..."
                                    startContent={
                                        <SearchIcon className="text-default-300 md" />
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
