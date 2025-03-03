import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Checkbox, Input, Link, LinkIcon, Kbd } from "@nextui-org/react";
import { CopyDocumentIcon, DeleteDocumentIcon, EditDocumentIcon, Logo, PlusIcon, SearchIcon, ServerIcon } from '@/components/icons';
import { ChevronDownIcon } from '@/components/files/replays-table/ChevronDownIcon';
import SearchResults from "./player-search-results";

export default function SearchInput() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <div className='w-full'>
            <Input
                aria-label="Search"
                classNames={{
                    inputWrapper: "bg-default-100",
                    input: "text-sm radius-none text-default-500",
                }}
                onClick={onOpen}
                // onFocus={onOpen}
                onInput={onOpen}
                // onMouseEnter={onOpen}
                // onMouseDown={onOpen}
                endContent={
                    <div>
                        <Kbd className="hidden lg:inline-block">
                            ⌘
                        </Kbd>
                        <small> + </small>
                        <Kbd className="hidden lg:inline-block">
                            K
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
                onOpenChange={onOpenChange}
                placement="top-center"
                size="5xl"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="items-center text-center justify-center">
                                <Input
                                    aria-label="Search"
                                    classNames={{
                                        inputWrapper: "bg-default-100",
                                        input: "text-xl",
                                    }}
                                    endContent={
                                        <Kbd keys={["command", "enter"]} title='Search'></Kbd>
                                    }
                                    labelPlacement="outside"
                                    placeholder="Search..."
                                    startContent={
                                        <SearchIcon className="text-default-300 md" />
                                    }
                                    type="search"
                                />
                            </ModalHeader>
                            <ModalBody>
                                <SearchResults onPress={onClose} />
                            </ModalBody>
                            <ModalFooter>
                                {/* <Button variant="faded" color="danger" onPress={onClose} startContent={<DeleteDocumentIcon size={16} height={16} width={16} />}>
                                    Discard
                                </Button> */}

                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
