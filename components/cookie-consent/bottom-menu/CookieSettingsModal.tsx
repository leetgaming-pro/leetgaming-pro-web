"use client";

import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spacer, Switch } from "@nextui-org/react";
import { EsportsButton } from "@/components/ui/esports-button";

interface CookieSettingsModalProps {
  onClose: () => void;
  onRejectAll: () => void;
  onAcceptAll: () => void;
  onAcceptSelected: () => void;
}

const CookieSettingsModal: React.FC<CookieSettingsModalProps> = ({ onClose, onRejectAll, onAcceptAll, onAcceptSelected }) => {
  const handleRejectAll = () => {
    onRejectAll();
  };

  const handleAcceptAll = () => {
    onAcceptAll();
  };

  const handleAcceptSelected = () => {
    onAcceptSelected();
  };

  return (
    <Modal isOpen={true} onClose={onClose} placement="top-center">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Cookie Settings</ModalHeader>
        <ModalBody>
          <p className="text-small font-normal text-default-700">
            This site uses tracking technologies to improve your experience. You may choose to accept or
            reject these technologies. Check our{" "}
            <a href="/legal/privacy" className="font-medium underline">
              Privacy Policy
            </a>{" "}
            for more information.
          </p>
          <Spacer y={4} />
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
              <span>Marketing</span>
              <Switch defaultSelected className="dark:bg-content1" />
            </div>
            <div className="flex items-center justify-between">
              <span>Essential</span>
              <Switch defaultSelected className="dark:bg-content1" />
            </div>
            <div className="flex items-center justify-between">
              <span>Performance</span>
              <Switch defaultSelected className="dark:bg-content1" />
            </div>
            <div className="flex items-center justify-between">
              <span>Analytics</span>
              <Switch defaultSelected className="dark:bg-content1" />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex-col gap-2">
          <EsportsButton fullWidth variant="primary" onClick={handleAcceptSelected}>
            Accept Selected
          </EsportsButton>
          <EsportsButton fullWidth variant="ghost" onClick={handleRejectAll}>
            Reject All
          </EsportsButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CookieSettingsModal;
