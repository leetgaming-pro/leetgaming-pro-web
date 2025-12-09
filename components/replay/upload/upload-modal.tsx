import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import { Icon } from '@iconify/react';
import UploadContent from './upload-content';
import { DeleteDocumentIcon, PlusIcon } from '@/components/icons';
import { ChevronDownIcon } from "@/components/files/replays-table/ChevronDownIcon"

export default function App() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div className='w-full'>
      {/* Upload Button - Brand Colors */}
      <Button 
        onPress={onOpen} 
        className="esports-btn esports-btn-primary px-6"
        endContent={<PlusIcon />}
      >
        Upload
      </Button>

      {/* Upload Modal - Gaming Aesthetic */}
      <Modal 
        backdrop="opaque"
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        placement="top-center"
        size="2xl"
        classNames={{
          base: "leet-modal",
          wrapper: "leet-modal-backdrop",
          backdrop: "leet-modal-backdrop",
        }}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              scale: 1,
              transition: { duration: 0.3, ease: [0.36, 0.66, 0.4, 1] },
            },
            exit: {
              y: -20,
              opacity: 0,
              scale: 0.95,
              transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
            },
          },
        }}
      >
        <ModalContent className="leet-modal-content">
          {(onClose) => (
            <>
              <ModalHeader className="leet-modal-header">
                <div className="leet-modal-title w-full justify-center">
                  <div className="leet-modal-icon">
                    <Icon icon="solar:cloud-upload-bold" width={20} />
                  </div>
                  <span className="text-xl font-bold">Upload Replay</span>
                </div>
              </ModalHeader>
              <ModalBody className="leet-modal-body py-6">
                <p className="text-center text-default-500 mb-4">Choose your preferred upload method:</p>
                <UploadContent />
              </ModalBody>
              <ModalFooter className="leet-modal-footer gap-3">
                <Button 
                  className="leet-modal-btn leet-modal-btn-secondary"
                  onPress={onClose} 
                  startContent={<DeleteDocumentIcon size={16} height={16} width={16} />}
                >
                  Discard
                </Button>
                <Button 
                  className="leet-modal-btn leet-modal-btn-primary"
                  endContent={<Icon icon="solar:arrow-right-bold" width={18} />}
                  onPress={onOpen}
                >
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
