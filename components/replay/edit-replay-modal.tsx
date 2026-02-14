"use client";

/**
 * Edit Replay Modal Component
 * Allows replay owners to update metadata (title, description, visibility, tags)
 */

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { VisibilityTypeValue } from "@/types/replay-api/settings";
import { useReplayApi } from "@/hooks/use-replay-api";
import { logger } from "@/lib/logger";

export interface EditReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  replayId: string;
  gameId: string;
  initialData?: {
    title?: string;
    description?: string;
    visibility?: string | number;
    tags?: string[];
  };
  onSaved?: (updated: {
    title?: string;
    description?: string;
    visibility?: number;
    tags?: string[];
  }) => void;
}

const VISIBILITY_OPTIONS = [
  {
    key: VisibilityTypeValue.Public,
    label: "Public",
    description: "Anyone can view this replay",
    icon: "solar:earth-bold",
    iconColor: "text-green-500",
  },
  {
    key: VisibilityTypeValue.Restricted,
    label: "Restricted",
    description: "Only team members can view",
    icon: "solar:users-group-rounded-bold",
    iconColor: "text-yellow-500",
  },
  {
    key: VisibilityTypeValue.Private,
    label: "Private",
    description: "Only you can view this replay",
    icon: "solar:lock-bold",
    iconColor: "text-red-500",
  },
];

export function EditReplayModal({
  isOpen,
  onClose,
  replayId,
  gameId,
  initialData,
  onSaved,
}: EditReplayModalProps) {
  const { sdk } = useReplayApi();
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [visibility, setVisibility] = useState<VisibilityTypeValue>(() => {
    // Parse initial visibility
    if (typeof initialData?.visibility === "number") {
      return initialData.visibility as VisibilityTypeValue;
    }
    if (initialData?.visibility === "public") return VisibilityTypeValue.Public;
    if (initialData?.visibility === "private") return VisibilityTypeValue.Private;
    if (initialData?.visibility === "restricted") return VisibilityTypeValue.Restricted;
    return VisibilityTypeValue.Public;
  });
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || "");
      setDescription(initialData?.description || "");
      setTags(initialData?.tags || []);
      
      // Parse visibility
      if (typeof initialData?.visibility === "number") {
        setVisibility(initialData.visibility as VisibilityTypeValue);
      } else if (initialData?.visibility === "public") {
        setVisibility(VisibilityTypeValue.Public);
      } else if (initialData?.visibility === "private") {
        setVisibility(VisibilityTypeValue.Private);
      } else if (initialData?.visibility === "restricted") {
        setVisibility(VisibilityTypeValue.Restricted);
      } else {
        setVisibility(VisibilityTypeValue.Public);
      }
      
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const updates = {
        title: title || undefined,
        description: description || undefined,
        visibility: visibility,
        tags: tags.length > 0 ? tags : undefined,
      };

      const result = await sdk.replayFiles.updateReplayFile(gameId, replayId, updates);

      if (result) {
        logger.info("[EditReplayModal] Replay updated successfully", { replayId, updates });
        onSaved?.(updates);
        onClose();
      } else {
        setError("Failed to update replay. Please try again.");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to save changes";
      logger.error("[EditReplayModal] Failed to update replay", { replayId, error: e });
      
      // Handle specific error cases
      if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
        setError("You don't have permission to edit this replay.");
      } else if (errorMessage.includes("404")) {
        setError("Replay not found. It may have been deleted.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      classNames={{
        base: "rounded-none",
        header: "border-b border-[#34445C]/20 dark:border-[#DCFF37]/20",
        footer: "border-t border-[#34445C]/20 dark:border-[#DCFF37]/20",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Icon
              icon="solar:pen-bold"
              className="text-[#FF4654] dark:text-[#DCFF37]"
              width={24}
            />
            <span className="text-lg font-bold">Edit Replay</span>
          </div>
          <p className="text-sm text-default-500 font-normal">
            Update your replay&apos;s metadata and visibility settings
          </p>
        </ModalHeader>

        <ModalBody className="py-6">
          <div className="space-y-6">
            {/* Title Input */}
            <Input
              label="Title"
              placeholder="Give your replay a memorable title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              classNames={{
                inputWrapper: "rounded-none",
              }}
              startContent={
                <Icon icon="solar:text-bold" className="text-default-400" width={18} />
              }
            />

            {/* Description */}
            <Textarea
              label="Description"
              placeholder="Describe what happened in this replay..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              classNames={{
                inputWrapper: "rounded-none",
              }}
              minRows={3}
              maxRows={6}
            />

            {/* Visibility Selector */}
            <Select
              label="Visibility"
              selectedKeys={[String(visibility)]}
              onChange={(e) => setVisibility(Number(e.target.value) as VisibilityTypeValue)}
              classNames={{
                trigger: "rounded-none",
              }}
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <SelectItem
                  key={String(option.key)}
                  startContent={
                    <Icon icon={option.icon} className={option.iconColor} width={18} />
                  }
                  description={option.description}
                >
                  {option.label}
                </SelectItem>
              ))}
            </Select>

            {/* Tags Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-default-700">
                Tags
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  classNames={{
                    inputWrapper: "rounded-none",
                  }}
                  endContent={
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onClick={handleAddTag}
                      isDisabled={!tagInput.trim()}
                    >
                      <Icon icon="solar:add-circle-bold" width={18} />
                    </Button>
                  }
                />
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-[#34445C]/10 dark:bg-[#DCFF37]/10 text-sm rounded-none"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-danger"
                      >
                        <Icon icon="solar:close-circle-bold" width={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-danger/10 border-l-2 border-danger rounded-none">
                <p className="text-sm text-danger flex items-center gap-2">
                  <Icon icon="solar:danger-triangle-bold" width={18} />
                  {error}
                </p>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="light"
            onClick={onClose}
            isDisabled={isSaving}
            className="rounded-none"
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleSave}
            isLoading={isSaving}
            className="rounded-none bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] text-white dark:text-[#1a1a1a] font-semibold"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
