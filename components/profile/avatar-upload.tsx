"use client";

import { useState, useRef, useCallback } from "react";
import { Avatar, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Slider, Spinner } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useAuth } from "@/hooks/use-auth";

interface AvatarUploadProps {
  currentAvatar?: string;
  playerName: string;
  playerId: string;
  onAvatarChange?: (newAvatarUrl: string) => void;
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-40 h-40",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default function AvatarUpload({
  currentAvatar,
  playerName,
  playerId,
  onAvatarChange,
  size = "lg",
  editable = true,
}: AvatarUploadProps) {
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("Image size must be less than 5MB");
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
      setIsModalOpen(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile || !previewImage) return;

    setIsUploading(true);
    setError(null);

    try {
      // Extract base64 data from data URL
      const base64Data = previewImage.split(",")[1];
      const extension = selectedFile.type.split("/")[1];

      const response = await fetch(`/api/players/${playerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64_avatar: base64Data,
          avatar_extension: extension,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }

      const updatedProfile = await response.json();
      
      if (onAvatarChange && updatedProfile.avatar) {
        onAvatarChange(updatedProfile.avatar);
      }

      setIsModalOpen(false);
      setPreviewImage(null);
      setSelectedFile(null);
    } catch (err) {
      console.error("Avatar upload error:", err);
      setError("Failed to upload avatar. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setPreviewImage(null);
    setSelectedFile(null);
    setError(null);
    setZoom(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (editable) {
      fileInputRef.current?.click();
    }
  };

  return (
    <>
      <div className="relative group">
        <Avatar
          src={currentAvatar}
          name={playerName?.[0]?.toUpperCase()}
          className={`${sizeClasses[size]} ring-4 ring-default-100 transition-all ${
            editable ? "cursor-pointer group-hover:ring-primary/50" : ""
          }`}
          onClick={triggerFileInput}
        />
        
        {editable && (
          <Button
            isIconOnly
            size="sm"
            color="primary"
            className="absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={triggerFileInput}
          >
            <Icon icon="solar:camera-bold" className="w-4 h-4" />
          </Button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Preview & Crop Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCancel}
        size="md"
        classNames={{
          backdrop: "bg-black/80",
          base: "bg-content1 border border-white/10",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">Upload Avatar</h3>
            <p className="text-sm text-default-500 font-normal">
              Preview your new avatar before uploading
            </p>
          </ModalHeader>
          
          <ModalBody>
            {error && (
              <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 mb-4">
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-center">
              <div 
                className="relative w-48 h-48 rounded-full overflow-hidden bg-default-100"
                style={{ transform: `scale(${zoom})` }}
              >
                {previewImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-default-500 mb-2">Zoom</p>
              <Slider
                size="sm"
                step={0.1}
                minValue={0.5}
                maxValue={2}
                value={zoom}
                onChange={(value) => setZoom(value as number)}
                className="max-w-md"
                classNames={{
                  track: "bg-default-200",
                  filler: "bg-primary",
                }}
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="flat"
              onPress={handleCancel}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleUpload}
              disabled={isUploading}
              startContent={
                isUploading ? (
                  <Spinner size="sm" color="current" />
                ) : (
                  <Icon icon="solar:upload-bold" className="w-4 h-4" />
                )
              }
            >
              {isUploading ? "Uploading..." : "Upload Avatar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

