import React from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Checkbox, Input, Link, LinkIcon} from "@nextui-org/react";
import UploadContent from './upload-content';
import { CopyDocumentIcon, DeleteDocumentIcon, EditDocumentIcon, Logo, PlusIcon, ServerIcon } from '@/components/icons';
import { ChevronDownIcon } from "@/components/files/replays-table/ChevronDownIcon"

export default function App() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  return (
    <div className='w-full'>
      <Button onPress={onOpen} color="secondary"  className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 shadow-lg shadow-lime-500/50" endContent={<PlusIcon />}>
              Upload
            </Button>
      <Modal 
        backdrop="blur"
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="items-center text-center justify-center">Choose your preferred method:</ModalHeader>
              <ModalBody>
                <UploadContent />
              </ModalBody>
              <ModalFooter>
                <Button variant="faded" color="danger" onPress={onClose} startContent={<DeleteDocumentIcon size={16} height={16} width={16} />}>
                  Discard
                </Button>
                <Button endContent={<ChevronDownIcon />} onPress={onOpen} color="secondary"  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/50">
              Submit
            </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      </div>
  );
}
