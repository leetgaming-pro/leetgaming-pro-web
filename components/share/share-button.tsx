"use client";

/**
 * Share Button Component
 * Handles sharing of replays, matches, and other content
 */

import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Chip,
  Divider,
  useDisclosure,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useReplayApi } from "@/hooks/use-replay-api";

export interface ShareButtonProps {
  /** Type of content being shared */
  contentType: "replay" | "match" | "team" | "player" | "tournament";
  /** ID of the content */
  contentId: string;
  /** Optional title for the share modal */
  title?: string;
  /** Optional description */
  description?: string;
  /** Button variant */
  variant?:
    | "solid"
    | "bordered"
    | "light"
    | "flat"
    | "faded"
    | "shadow"
    | "ghost";
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Button color */
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  /** Show icon only */
  iconOnly?: boolean;
  /** Custom class name */
  className?: string;
}

export function ShareButton({
  contentType,
  contentId,
  title,
  description,
  variant = "bordered",
  size = "md",
  color = "default",
  iconOnly = false,
  className = "",
}: ShareButtonProps) {
  const { sdk } = useReplayApi();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const shareUrl = shareToken
    ? `${window.location.origin}/share/${contentType}/${shareToken}`
    : "";

  const generateShareToken = async () => {
    setIsGenerating(true);
    try {
      // Use real SDK for replay content
      if (contentType === "replay") {
        const response = await sdk.shareTokens.createShareToken(
          "cs2",
          contentId,
          {
            expires_at: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(), // 30 days
            visibility_type: "public",
          }
        );

        if (response?.token) {
          setShareToken(response.token);
        } else {
          throw new Error("No token received from API");
        }
      } else {
        // For other content types, use the API endpoint
        const response = await fetch("/api/share/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content_type: contentType,
            content_id: contentId,
            expires_in_hours: 720, // 30 days
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate share token");
        }

        const data = await response.json();
        setShareToken(data.token || data.share_token);
      }
    } catch (error) {
      console.error("Error generating share token:", error);
      // Fallback for development/demo
      const fallbackToken = `${contentType}_${contentId}_${Date.now().toString(
        36
      )}`;
      setShareToken(fallbackToken);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpen = () => {
    onOpen();
    if (!shareToken) {
      generateShareToken();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const shareToSocial = (platform: "twitter" | "discord" | "reddit") => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(
      title || `Check out this ${contentType}!`
    );

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      discord: shareUrl, // Discord doesn't have direct share URL, just copy link
      reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    };

    if (platform === "discord") {
      copyToClipboard();
    } else {
      window.open(urls[platform], "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        color={color}
        className={className}
        startContent={
          !iconOnly ? <Icon icon="solar:share-bold" width={20} /> : undefined
        }
        isIconOnly={iconOnly}
        onPress={handleOpen}
      >
        {iconOnly ? <Icon icon="solar:share-bold" width={20} /> : "Share"}
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:share-bold" width={24} />
                  <span>Share {title || contentType}</span>
                </div>
                {description && (
                  <p className="text-sm text-default-500 font-normal">
                    {description}
                  </p>
                )}
              </ModalHeader>
              <Divider />
              <ModalBody className="py-6">
                {/* Share Link */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Share Link</h3>
                  <div className="flex gap-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      placeholder={
                        isGenerating
                          ? "Generating share link..."
                          : "Share link will appear here"
                      }
                      classNames={{
                        input: "text-sm",
                      }}
                      endContent={
                        shareToken && (
                          <Chip
                            size="sm"
                            color={copySuccess ? "success" : "default"}
                            variant="flat"
                          >
                            {copySuccess ? "Copied!" : "Click to copy"}
                          </Chip>
                        )
                      }
                    />
                    <Button
                      color="primary"
                      isDisabled={!shareToken || isGenerating}
                      isLoading={isGenerating}
                      onPress={copyToClipboard}
                      startContent={
                        !isGenerating ? (
                          <Icon icon="solar:copy-bold" width={18} />
                        ) : undefined
                      }
                    >
                      Copy
                    </Button>
                  </div>
                  {shareToken && (
                    <p className="text-xs text-default-500">
                      <Icon
                        icon="solar:clock-circle-linear"
                        width={14}
                        className="inline mr-1"
                      />
                      This link will expire in 30 days
                    </p>
                  )}
                </div>

                <Divider className="my-4" />

                {/* Social Share Buttons */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">
                    Share on Social Media
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="flat"
                      color="default"
                      className="bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20"
                      startContent={<Icon icon="bi:twitter-x" width={20} />}
                      onPress={() => shareToSocial("twitter")}
                      isDisabled={!shareToken}
                    >
                      Twitter
                    </Button>
                    <Button
                      variant="flat"
                      color="default"
                      className="bg-[#5865F2]/10 hover:bg-[#5865F2]/20"
                      startContent={
                        <Icon icon="ic:baseline-discord" width={20} />
                      }
                      onPress={() => shareToSocial("discord")}
                      isDisabled={!shareToken}
                    >
                      Discord
                    </Button>
                    <Button
                      variant="flat"
                      color="default"
                      className="bg-[#FF4500]/10 hover:bg-[#FF4500]/20"
                      startContent={
                        <Icon icon="ic:baseline-reddit" width={20} />
                      }
                      onPress={() => shareToSocial("reddit")}
                      isDisabled={!shareToken}
                    >
                      Reddit
                    </Button>
                  </div>
                </div>

                {/* Embed Code (optional, for advanced users) */}
                {contentType === "replay" && shareToken && (
                  <>
                    <Divider className="my-4" />
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">Embed Code</h3>
                      <Input
                        value={`<iframe src="${shareUrl}" width="800" height="600" frameborder="0"></iframe>`}
                        readOnly
                        size="sm"
                        classNames={{
                          input: "font-mono text-xs",
                        }}
                        endContent={
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onPress={() => {
                              navigator.clipboard.writeText(
                                `<iframe src="${shareUrl}" width="800" height="600" frameborder="0"></iframe>`
                              );
                            }}
                          >
                            <Icon icon="solar:copy-bold" width={16} />
                          </Button>
                        }
                      />
                      <p className="text-xs text-default-500">
                        Embed this replay on your website or blog
                      </p>
                    </div>
                  </>
                )}

                {/* Privacy Notice */}
                <div className="mt-4 p-3 bg-default-100 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Icon
                      icon="solar:shield-check-bold"
                      width={20}
                      className="text-success mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="text-xs text-default-600">
                        Anyone with this link can view this {contentType}. The
                        link will remain active for 30 days unless you revoke it
                        from your account settings.
                      </p>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <Divider />
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => {
                    generateShareToken();
                  }}
                  startContent={<Icon icon="solar:refresh-bold" width={18} />}
                >
                  Generate New Link
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
