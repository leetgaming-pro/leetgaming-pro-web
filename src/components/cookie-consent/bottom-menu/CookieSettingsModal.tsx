"use client";

import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spacer, Switch } from "@nextui-org/react";

interface CookieSettingsModalProps {
  onClose: () => void;
  onRejectAll: () => void;
  onAcceptAll: () => void;
  onAcceptSelected: () => void;
}

const CookieSettingsModal: React.FC<CookieSettingsModalProps> = ({ onClose, onRejectAll, onAcceptAll, onAcceptSelected }) => {
  const handleRejectAll = () => {
    console.log("All cookies rejected");
    onRejectAll();
  };

  const handleAcceptAll = () => {
    console.log("All cookies accepted");
    onAcceptAll();
  };

  const handleAcceptSelected = () => {
    console.log("Selected cookies accepted");
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
            <a href="#" className="font-medium underline">
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
        <ModalFooter>
          <Button fullWidth radius="lg" onPress={handleAcceptSelected} style={{ border: "solid 2px transparent", backgroundImage: `linear-gradient(hsl(var(--nextui-background)), hsl(var(--nextui-background))), linear-gradient(83.87deg, rgb(6, 182, 212), rgb(34, 197, 94))`, backgroundOrigin: "border-box", backgroundClip: "padding-box, border-box" }}>
            Accept Selected
          </Button>
          <Button fullWidth variant="bordered" onPress={handleRejectAll}>
            Reject All
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CookieSettingsModal;
