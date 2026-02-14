"use client";

/**
 * Enhanced Upload Form Component
 * Supports multiple games with progress tracking and immediate stats preview
 */

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Button,
  Chip,
  Progress,
  Card,
  CardBody,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { UploadClient, UploadProgress } from "@/types/replay-api/upload-client";
import { ReplayApiSettingsMock, GameIDKey, VisibilityTypeValue } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";
import { useOptionalAuth } from "@/hooks";
import { ensureSession } from "@/types/replay-api/auth";
import { EsportsButton } from "@/components/ui/esports-button";

type UploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "completed"
  | "failed";

interface FileInfo {
  file: File;
  name: string;
  size: string;
  type: string;
}

interface GameOption {
  key: GameIDKey;
  label: string;
  icon: string;
  formats: string[];
  maxSize: number; // in bytes
}

const SUPPORTED_GAMES: GameOption[] = [
  {
    key: GameIDKey.CounterStrike2,
    label: "Counter-Strike 2",
    icon: "simple-icons:counterstrike",
    formats: [".dem", ".dem.gz", ".dem.bz2", ".zip"],
    maxSize: 500 * 1024 * 1024, // 500MB
  },
  {
    key: GameIDKey.Valorant,
    label: "Valorant",
    icon: "simple-icons:valorant",
    formats: [".json", ".replay"],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  {
    key: GameIDKey.Dota2,
    label: "Dota 2",
    icon: "simple-icons:dota2",
    formats: [".dem", ".dem.bz2"],
    maxSize: 300 * 1024 * 1024, // 300MB
  },
  {
    key: GameIDKey.LeagueOfLegends,
    label: "League of Legends",
    icon: "simple-icons:leagueoflegends",
    formats: [".rofl"],
    maxSize: 50 * 1024 * 1024, // 50MB
  },
];

export function EnhancedUploadForm() {
  const router = useRouter();
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    user: _user,
  } = useOptionalAuth();
  const {
    isOpen: isSuccessOpen,
    onOpen: onSuccessOpen,
    onClose: onSuccessClose,
  } = useDisclosure();

  const [selectedGame, setSelectedGame] = useState<GameIDKey>(
    GameIDKey.CounterStrike2
  );
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [replayId, setReplayId] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<VisibilityTypeValue>(VisibilityTypeValue.Public);
  const [title, setTitle] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize guest session on mount for uploads
  useEffect(() => {
    const initializeSession = async () => {
      try {
        await ensureSession();
      } catch (error) {
        logger.warn(
          "[EnhancedUploadForm] Failed to initialize session:",
          error
        );
      }
    };

    initializeSession();
  }, []);

  const currentGame = useMemo(
    () =>
      SUPPORTED_GAMES.find((g) => g.key === selectedGame) || SUPPORTED_GAMES[0],
    [selectedGame]
  );

  const uploadClient = useMemo(() => {
    const baseUrl =
      process.env.NEXT_PUBLIC_REPLAY_API_URL ||
      process.env.REPLAY_API_URL ||
      "http://localhost:8080";
    return new UploadClient({ ...ReplayApiSettingsMock, baseUrl }, logger);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = useCallback(
    (file: File): boolean => {
      const fileName = file.name.toLowerCase();
      const isValidExtension = currentGame.formats.some((ext) =>
        fileName.endsWith(ext)
      );

      if (!isValidExtension) {
        setError(
          `Invalid file type for ${
            currentGame.label
          }. Supported formats: ${currentGame.formats.join(", ")}`
        );
        return false;
      }

      if (file.size > currentGame.maxSize) {
        setError(
          `File too large. Maximum size for ${
            currentGame.label
          } is ${formatFileSize(currentGame.maxSize)}`
        );
        return false;
      }

      return true;
    },
    [currentGame]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      setError(null);

      if (!validateFile(file)) {
        return;
      }

      setFileInfo({
        file,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.name.split(".").pop()?.toUpperCase() || "UNKNOWN",
      });
      setStatus("idle");
      setProgress(0);
      setReplayId(null);
      setMatchId(null);
    },
    [validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleUpload = async () => {
    if (!fileInfo?.file) {
      setError("Please select a file");
      return;
    }

    if (isAuthLoading) {
      setError("Please wait, checking authentication...");
      return;
    }

    // Ensure user has a session (authenticated or guest)
    const hasSession = await ensureSession();
    if (!hasSession) {
      setError("Failed to establish session. Please try again.");
      return;
    }

    // Allow guest uploads but store for later claim
    setError(null);
    setStatus("uploading");
    setProgress(0);

    try {
      const result = await uploadClient.uploadReplay(fileInfo.file, {
        gameId: selectedGame,
        networkId: "valve", // TODO: Make this configurable
        title: title || undefined,
        visibility: visibility,
        onProgress: (uploadProgress: UploadProgress) => {
          setProgress(uploadProgress.percentage);
          setStatus(uploadProgress.phase as UploadStatus);

          if (uploadProgress.replayFileId) {
            setReplayId(uploadProgress.replayFileId);
          }

          if (uploadProgress.error) {
            setError(uploadProgress.error);
          }
        },
      });

      if (result.success) {
        setStatus("completed");
        setProgress(100);
        if (result.replayFile) {
          setReplayId(result.replayFile.id || null);
          // Try to get match ID from the response
          const matchIdFromFile = result.replayFile.matchId;
          if (matchIdFromFile) {
            setMatchId(matchIdFromFile);
          }
        }
        logger.info("Upload successful", { replayFile: result.replayFile });
        onSuccessOpen();
      } else {
        setStatus("failed");
        setError(result.error || "Upload failed");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      logger.error("Error uploading file", error);
      setStatus("failed");
      setError(errorMessage);
    }
  };

  const handleReset = () => {
    setFileInfo(null);
    setStatus("idle");
    setProgress(0);
    setError(null);
    setReplayId(null);
    setMatchId(null);
    setVisibility(VisibilityTypeValue.Public);
    setTitle("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleViewStats = () => {
    onSuccessClose();
    if (matchId) {
      router.push(`/matches/${selectedGame}/${matchId}`);
    } else if (replayId) {
      router.push(`/replays/${replayId}`);
    }
  };

  const isUploading = status === "uploading" || status === "processing";
  const acceptFormats = currentGame.formats.join(",");

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Game Selector */}
      <div className="mb-6">
        <Select
          label="Select Game"
          placeholder="Choose the game for this replay"
          selectedKeys={[selectedGame]}
          onChange={(e) => {
            setSelectedGame(e.target.value as GameIDKey);
            handleReset();
          }}
          classNames={{
            trigger:
              "rounded-none border-[#34445C]/30 dark:border-[#DCFF37]/30",
          }}
          startContent={<Icon icon={currentGame.icon} width={20} />}
          isDisabled={isUploading}
        >
          {SUPPORTED_GAMES.map((game) => (
            <SelectItem
              key={game.key}
              startContent={<Icon icon={game.icon} width={18} />}
            >
              {game.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptFormats}
        onChange={handleInputChange}
        className="hidden"
        disabled={isUploading}
      />

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`
          relative cursor-pointer transition-all duration-300
          border-2 border-dashed rounded-none p-8
          flex flex-col items-center justify-center gap-4
          min-h-[200px]
          ${
            isDragOver
              ? "border-[#FF4654] dark:border-[#DCFF37] bg-[#FF4654]/10 dark:bg-[#DCFF37]/10"
              : "border-[#34445C]/30 dark:border-[#DCFF37]/30 hover:border-[#FF4654]/50 dark:hover:border-[#DCFF37]/50"
          }
          ${isUploading ? "cursor-not-allowed opacity-60" : ""}
        `}
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)",
        }}
      >
        {/* Animated corner accent */}
        <div
          className="absolute bottom-0 right-0 w-6 h-6 bg-gradient-to-tl from-[#FF4654] dark:from-[#DCFF37] to-transparent"
          style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
        />

        {!fileInfo ? (
          <>
            <div
              className={`
              w-20 h-20 flex items-center justify-center rounded-none
              bg-gradient-to-br from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/20 dark:to-[#34445C]/20
              ${isDragOver ? "scale-110" : ""}
              transition-transform duration-200
            `}
            >
              <Icon
                icon="solar:cloud-upload-bold-duotone"
                className="text-[#FF4654] dark:text-[#DCFF37]"
                width={48}
              />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-[#34445C] dark:text-white">
                {isDragOver
                  ? "Drop your replay here!"
                  : "Drag & Drop your replay"}
              </p>
              <p className="text-sm text-default-500 mt-1">
                or{" "}
                <span className="text-[#FF4654] dark:text-[#DCFF37] underline">
                  browse files
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {currentGame.formats.map((format) => (
                <Chip
                  key={format}
                  size="sm"
                  variant="flat"
                  className="bg-[#34445C]/10 dark:bg-[#DCFF37]/10"
                >
                  {format}
                </Chip>
              ))}
            </div>
            <p className="text-xs text-default-400 mt-2">
              Maximum file size: {formatFileSize(currentGame.maxSize)}
            </p>
          </>
        ) : (
          <div className="w-full">
            {/* File Info Card */}
            <Card className="rounded-none border border-[#FF4654]/20 dark:border-[#DCFF37]/20 bg-default-50 dark:bg-[#111111]">
              <CardBody className="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-none"
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                    }}
                  >
                    <Icon
                      icon="solar:file-bold"
                      className="text-white dark:text-[#1a1a1a]"
                      width={24}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#34445C] dark:text-white truncate">
                      {fileInfo.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Chip
                        size="sm"
                        variant="flat"
                        className="bg-[#FF4654]/10 dark:bg-[#DCFF37]/10 text-[#FF4654] dark:text-[#DCFF37]"
                      >
                        {fileInfo.type}
                      </Chip>
                      <span className="text-sm text-default-500">
                        {fileInfo.size}
                      </span>
                    </div>
                  </div>
                  {status === "idle" && (
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                    >
                      <Icon
                        icon="solar:close-circle-bold"
                        width={20}
                        className="text-default-400"
                      />
                    </Button>
                  )}
                  {status === "completed" && (
                    <Icon
                      icon="solar:check-circle-bold"
                      width={32}
                      className="text-success"
                    />
                  )}
                </div>

                {/* Progress Bar */}
                {status !== "idle" && status !== "completed" && (
                  <div className="mt-4">
                    <Progress
                      value={progress}
                      size="sm"
                      classNames={{
                        track: "bg-default-200 dark:bg-[#1a1a1a] rounded-none",
                        indicator:
                          status === "failed"
                            ? "bg-danger rounded-none"
                            : "bg-gradient-to-r from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] rounded-none",
                      }}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-default-500 capitalize flex items-center gap-2">
                        {status === "uploading" && (
                          <Icon
                            icon="solar:cloud-upload-bold"
                            width={16}
                            className="animate-pulse"
                          />
                        )}
                        {status === "processing" && (
                          <Icon
                            icon="solar:cpu-bolt-bold"
                            width={16}
                            className="animate-spin"
                          />
                        )}
                        {status}...
                      </span>
                      <span className="text-sm font-semibold text-[#FF4654] dark:text-[#DCFF37]">
                        {progress}%
                      </span>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      {/* Replay Options - Only show when file is selected */}
      {fileInfo && status === "idle" && (
        <div className="mt-4 space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-[#34445C] dark:text-[#DCFF37] mb-2">
              Replay Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Epic clutch on Mirage"
              className="w-full px-3 py-2 bg-default-100 dark:bg-[#1a1a1a] border border-[#34445C]/20 dark:border-[#DCFF37]/20 rounded-none focus:border-[#FF4654] dark:focus:border-[#DCFF37] focus:outline-none text-[#34445C] dark:text-white placeholder:text-default-400"
              disabled={isUploading}
            />
          </div>

          {/* Visibility Selector */}
          <div>
            <label className="block text-sm font-medium text-[#34445C] dark:text-[#DCFF37] mb-2">
              Visibility
            </label>
            <Select
              selectedKeys={[String(visibility)]}
              onChange={(e) => setVisibility(Number(e.target.value) as VisibilityTypeValue)}
              classNames={{
                trigger:
                  "rounded-none border-[#34445C]/30 dark:border-[#DCFF37]/30",
              }}
              isDisabled={isUploading}
            >
              <SelectItem
                key={String(VisibilityTypeValue.Public)}
                startContent={<Icon icon="solar:earth-bold" width={18} className="text-green-500" />}
              >
                Public - Anyone can view
              </SelectItem>
              <SelectItem
                key={String(VisibilityTypeValue.Restricted)}
                startContent={<Icon icon="solar:users-group-rounded-bold" width={18} className="text-yellow-500" />}
              >
                Restricted - Team members only
              </SelectItem>
              <SelectItem
                key={String(VisibilityTypeValue.Private)}
                startContent={<Icon icon="solar:lock-bold" width={18} className="text-red-500" />}
              >
                Private - Only you
              </SelectItem>
            </Select>
            <p className="mt-1 text-xs text-default-400">
              {visibility === VisibilityTypeValue.Public && "Your replay will be visible to everyone and may appear in public listings."}
              {visibility === VisibilityTypeValue.Restricted && "Only members of your team/group can view this replay."}
              {visibility === VisibilityTypeValue.Private && "Only you can view this replay. You can share it later using a link."}
            </p>
          </div>
        </div>
      )}

      {/* Guest Upload Notice - Brand compliant */}
      {!isAuthenticated && !isAuthLoading && (
        <div
          className="mt-4 p-4 bg-gradient-to-r from-[#FF4654]/10 to-[#FFC700]/10 dark:from-[#DCFF37]/10 dark:to-[#34445C]/10 border-l-2 border-[#FF4654] dark:border-[#DCFF37] rounded-none"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-[#FF4654] to-[#FFC700] dark:from-[#DCFF37] dark:to-[#34445C] flex-shrink-0"
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
              }}
            >
              <Icon
                icon="solar:user-circle-bold"
                width={16}
                className="text-white dark:text-[#1a1a1a]"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#34445C] dark:text-[#DCFF37]">
                Welcome, Guest Player!
              </p>
              <p className="text-xs text-default-500 mt-1">
                Your replay will be uploaded and analyzed instantly.
                <span
                  className="text-[#FF4654] dark:text-[#DCFF37] font-medium cursor-pointer hover:underline"
                  onClick={() => router.push("/signin?callbackUrl=/upload")}
                >
                  Sign in
                </span>{" "}
                to save replays to your profile and unlock all features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-danger/10 border-l-2 border-danger rounded-none">
          <p className="text-sm text-danger flex items-center gap-2">
            <Icon icon="solar:danger-triangle-bold" width={18} />
            {error}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        {status === "completed" ? (
          <>
            <EsportsButton
              variant="ghost"
              size="md"
              className="flex-1"
              onClick={handleReset}
            >
              <Icon icon="solar:upload-bold" width={18} />
              Upload Another
            </EsportsButton>
            <EsportsButton
              variant="primary"
              size="md"
              className="flex-1"
              onClick={handleViewStats}
            >
              <Icon icon="solar:chart-2-bold" width={18} />
              View Stats
            </EsportsButton>
          </>
        ) : (
          <EsportsButton
            variant="action"
            size="lg"
            className="w-full"
            onClick={handleUpload}
            disabled={!fileInfo || isUploading || isAuthLoading}
          >
            {isUploading ? (
              <>
                <Icon
                  icon="solar:refresh-bold"
                  className="animate-spin"
                  width={20}
                />
                {status === "uploading" ? "Uploading..." : "Processing..."}
              </>
            ) : isAuthLoading ? (
              <>
                <Icon
                  icon="solar:refresh-bold"
                  className="animate-spin"
                  width={20}
                />
                Checking auth...
              </>
            ) : (
              <>
                <Icon icon="solar:cloud-upload-bold" width={20} />
                Upload Replay
              </>
            )}
          </EsportsButton>
        )}
      </div>

      {/* Tips Section */}
      <div className="mt-6 p-4 bg-[#34445C]/5 dark:bg-[#DCFF37]/5 rounded-none border-l-2 border-[#FF4654] dark:border-[#DCFF37]">
        <p className="text-sm font-semibold text-[#34445C] dark:text-[#DCFF37] mb-2">
          💡 Pro Tips
        </p>
        <ul className="text-xs text-default-500 space-y-1">
          {selectedGame === GameIDKey.CounterStrike2 && (
            <>
              <li>
                • CS2 demo files are usually found in{" "}
                <code className="bg-default-200 dark:bg-[#1a1a1a] px-1 rounded">
                  Steam/steamapps/common/Counter-Strike Global
                  Offensive/game/csgo/
                </code>
              </li>
              <li>• Compressed files (.gz, .bz2) upload faster</li>
            </>
          )}
          {selectedGame === GameIDKey.Valorant && (
            <li>• Valorant replays require the game to export match data</li>
          )}
          {selectedGame === GameIDKey.Dota2 && (
            <li>
              • Dota 2 replays are found in{" "}
              <code className="bg-default-200 dark:bg-[#1a1a1a] px-1 rounded">
                Steam/steamapps/common/dota 2 beta/game/dota/replays/
              </code>
            </li>
          )}
          {selectedGame === GameIDKey.LeagueOfLegends && (
            <li>
              • LoL replay files (.rofl) are in your Documents/League of
              Legends/Replays folder
            </li>
          )}
          <li>• Analysis starts automatically after upload</li>
        </ul>
      </div>

      {/* Success Modal - Brand Compliant */}
      <Modal
        isOpen={isSuccessOpen}
        onClose={onSuccessClose}
        size="md"
        classNames={{
          base: "rounded-none bg-white dark:bg-[#0a0a0a] border border-[#FF4654]/20 dark:border-[#DCFF37]/20",
          header: "border-b border-[#34445C]/10 dark:border-[#DCFF37]/10",
          footer: "border-t border-[#34445C]/10 dark:border-[#DCFF37]/10",
        }}
      >
        <ModalContent>
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
                  icon="solar:check-circle-bold"
                  width={24}
                  className="text-white dark:text-[#1a1a1a]"
                />
              </div>
              <span className="text-[#34445C] dark:text-[#DCFF37] font-bold">
                Upload Complete!
              </span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="text-center py-6">
              <div
                className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-[#FF4654]/20 to-[#FFC700]/20 dark:from-[#DCFF37]/20 dark:to-[#34445C]/20"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
                }}
              >
                <Icon
                  icon="solar:gamepad-bold-duotone"
                  width={48}
                  className="text-[#FF4654] dark:text-[#DCFF37]"
                />
              </div>
              <p className="text-lg font-bold text-[#34445C] dark:text-white mb-2">
                Your {currentGame.label} replay is ready!
              </p>
              <p className="text-default-500 text-sm">
                The match has been processed. View detailed statistics,
                heatmaps, and player performance now.
              </p>
              {!isAuthenticated && (
                <p className="text-xs text-[#FF4654] dark:text-[#DCFF37] mt-3 font-medium">
                  💡 Sign in to save this replay to your profile!
                </p>
              )}
            </div>
          </ModalBody>
          <ModalFooter className="justify-center gap-3">
            <EsportsButton variant="ghost" onClick={onSuccessClose}>
              Upload Another
            </EsportsButton>
            <EsportsButton variant="action" onClick={handleViewStats} glow>
              <Icon icon="solar:chart-2-bold" width={18} />
              View Match Stats
            </EsportsButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default EnhancedUploadForm;
