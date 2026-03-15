"use client";

import React, { useState, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { EsportsButton } from "@/components/ui/esports-button";

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl?: string; // Kept as fallback; dynamic PDF is preferred
  source?: string;
}

export function EmailCaptureModal({
  isOpen,
  onClose,
  source = "investor-page-one-pager",
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const triggerDownload = useCallback(async () => {
    try {
      const [{ pdf }, { OnePagerDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/investors/one-pager-pdf"),
      ]);
      const blob = await pdf(<OnePagerDocument />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "LeetGaming-PRO-Investment-Overview.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback to static placeholder
      const link = document.createElement("a");
      link.href = "/investors/leetgaming-pro-one-pager.pdf";
      link.download = "LeetGaming-PRO-Investment-Overview.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const lead = {
        email,
        name: name || undefined,
        organization: organization || undefined,
        timestamp: new Date().toISOString(),
        source,
        pagePath:
          typeof window !== "undefined" ? window.location.pathname : undefined,
        referrer:
          typeof document !== "undefined" ? document.referrer || undefined : undefined,
      };

      const response = await fetch("/api/investors/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lead),
      });

      if (!response.ok) {
        throw new Error("Lead capture failed");
      }

      setSubmitted(true);
      await triggerDownload();

      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setEmail("");
        setName("");
        setOrganization("");
        setErrorMessage(null);
      }, 2000);
    } catch {
      try {
        const existingLeads = JSON.parse(
          localStorage.getItem("investor-leads") || "[]"
        );
        existingLeads.push({
          email,
          name: name || undefined,
          organization: organization || undefined,
          timestamp: new Date().toISOString(),
          source,
          fallback: true,
        });
        localStorage.setItem("investor-leads", JSON.stringify(existingLeads));
      } catch {
        // best effort fallback only
      }

      setErrorMessage(
        "We could not submit your details right now. Your download will still continue."
      );
      await triggerDownload();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    await triggerDownload();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      classNames={{
        base: "rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20",
        header: "border-b border-[#FF4654]/10 dark:border-[#DCFF37]/10",
        footer: "border-t border-[#FF4654]/10 dark:border-[#DCFF37]/10",
      }}
    >
      <ModalContent>
        {submitted ? (
          <ModalBody className="py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
                }}
              >
                <Icon
                  icon="solar:check-circle-bold"
                  className="text-white dark:text-[#34445C]"
                  width={32}
                />
              </div>
              <p className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                Thank you! Your download has started.
              </p>
              <p className="text-sm text-default-500">
                We&apos;ll be in touch soon.
              </p>
            </div>
          </ModalBody>
        ) : (
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C]"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                  }}
                >
                  <Icon
                    icon="solar:document-bold"
                    className="text-white dark:text-[#34445C]"
                    width={20}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#34445C] dark:text-[#F5F0E1]">
                    Download Investor Brief
                  </h3>
                  <p className="text-xs text-default-500 font-normal">
                    Get the one-pager covering market, projections, and verified score infrastructure
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="gap-4">
              {errorMessage ? (
                <div className="border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                  {errorMessage}
                </div>
              ) : null}
              <Input
                label="Email"
                placeholder="investor@example.com"
                type="email"
                value={email}
                onValueChange={setEmail}
                isRequired
                variant="bordered"
                classNames={{
                  inputWrapper:
                    "rounded-none border-[#FF4654]/20 dark:border-[#DCFF37]/20",
                }}
                startContent={
                  <Icon
                    icon="solar:letter-bold"
                    className="text-default-400"
                    width={18}
                  />
                }
              />
              <Input
                label="Name"
                placeholder="Your name (optional)"
                value={name}
                onValueChange={setName}
                variant="bordered"
                classNames={{
                  inputWrapper:
                    "rounded-none border-[#FF4654]/20 dark:border-[#DCFF37]/20",
                }}
                startContent={
                  <Icon
                    icon="solar:user-bold"
                    className="text-default-400"
                    width={18}
                  />
                }
              />
              <Input
                label="Organization"
                placeholder="Fund / Company (optional)"
                value={organization}
                onValueChange={setOrganization}
                variant="bordered"
                classNames={{
                  inputWrapper:
                    "rounded-none border-[#FF4654]/20 dark:border-[#DCFF37]/20",
                }}
                startContent={
                  <Icon
                    icon="solar:buildings-bold"
                    className="text-default-400"
                    width={18}
                  />
                }
              />
            </ModalBody>

            <ModalFooter className="flex flex-col gap-2">
              <EsportsButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                startContent={
                  <Icon icon="solar:download-bold" width={18} />
                }
              >
                Submit & Download
              </EsportsButton>
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs text-default-400 hover:text-[#FF4654] dark:hover:text-[#DCFF37] transition-colors py-2 underline underline-offset-2"
              >
                Skip — download without providing info
              </button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
