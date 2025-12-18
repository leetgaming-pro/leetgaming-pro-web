/**
 * Session Video Review Component
 * Video review interface for coaching sessions per PRD D.4.3
 */

"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Avatar,
  Chip,
  Slider,
  ScrollShadow,
  Textarea,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export interface VideoMarker {
  id: string;
  timestamp: number; // seconds
  type: "highlight" | "mistake" | "tip" | "question" | "note";
  title: string;
  description?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: Date;
  replies?: MarkerReply[];
}

export interface MarkerReply {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: Date;
}

export interface DrawingAnnotation {
  id: string;
  timestamp: number;
  duration: number; // How long to show
  type: "arrow" | "circle" | "rectangle" | "freehand" | "text";
  data: {
    startX: number;
    startY: number;
    endX?: number;
    endY?: number;
    path?: string;
    text?: string;
    color: string;
  };
  authorId: string;
}

export interface SessionVideo {
  id: string;
  sessionId: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  duration: number; // seconds
  uploadedAt: Date;
  uploadedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface SessionReviewProps {
  video: SessionVideo;
  markers: VideoMarker[];
  annotations: DrawingAnnotation[];
  currentUserId: string;
  isCoach: boolean;
  onAddMarker: (marker: Omit<VideoMarker, "id" | "createdAt">) => Promise<void>;
  onUpdateMarker: (
    markerId: string,
    updates: Partial<VideoMarker>
  ) => Promise<void>;
  onDeleteMarker: (markerId: string) => Promise<void>;
  onAddReply: (markerId: string, content: string) => Promise<void>;
  onAddAnnotation?: (
    annotation: Omit<DrawingAnnotation, "id">
  ) => Promise<void>;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const MARKER_TYPES = [
  {
    key: "highlight",
    label: "Highlight",
    icon: "solar:star-bold",
    color: "#FFD700",
  },
  {
    key: "mistake",
    label: "Mistake",
    icon: "solar:close-circle-bold",
    color: "#FF4444",
  },
  {
    key: "tip",
    label: "Tip",
    icon: "solar:lightbulb-bolt-bold",
    color: "#4CAF50",
  },
  {
    key: "question",
    label: "Question",
    icon: "solar:question-circle-bold",
    color: "#2196F3",
  },
  { key: "note", label: "Note", icon: "solar:notes-bold", color: "#9C27B0" },
] as const;

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

// ============================================================================
// Utils
// ============================================================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getMarkerColor(type: VideoMarker["type"]): string {
  return MARKER_TYPES.find((t) => t.key === type)?.color || "#666";
}

// ============================================================================
// Components
// ============================================================================

/**
 * Main Session Video Review Component
 */
export function SessionVideoReview({
  video,
  markers,
  annotations: _annotations,
  currentUserId,
  isCoach,
  onAddMarker,
  onUpdateMarker: _onUpdateMarker,
  onDeleteMarker,
  onAddReply,
  className = "",
}: SessionReviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMarkerForm, setShowMarkerForm] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<VideoMarker | null>(
    null
  );
  const [filterType, setFilterType] = useState<string>("all");
  const [sidebarTab, setSidebarTab] = useState<"markers" | "chat">("markers");

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter markers
  const filteredMarkers = useMemo(() => {
    if (filterType === "all") return markers;
    return markers.filter((m) => m.type === filterType);
  }, [markers, filterType]);

  // Sort markers by timestamp
  const sortedMarkers = useMemo(() => {
    return [...filteredMarkers].sort((a, b) => a.timestamp - b.timestamp);
  }, [filteredMarkers]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number | number[]) => {
    const time = Array.isArray(value) ? value[0] : value;
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (value: number | number[]) => {
    const vol = Array.isArray(value) ? value[0] : value;
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const jumpToMarker = (marker: VideoMarker) => {
    handleSeek(marker.timestamp);
    setSelectedMarker(marker);
  };

  const skipSeconds = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      handleSeek(newTime);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  // Get markers near current time
  const nearbyMarkers = useMemo(() => {
    return markers.filter((m) => Math.abs(m.timestamp - currentTime) < 3);
  }, [markers, currentTime]);

  return (
    <div ref={containerRef} className={`flex gap-4 ${className}`}>
      {/* Main Video Area */}
      <div className="flex-1">
        <Card>
          {/* Video Player */}
          <div className="relative bg-black aspect-video">
            <video
              ref={videoRef}
              src={video.url}
              className="w-full h-full"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Video Overlay - Nearby Markers */}
            <AnimatePresence>
              {nearbyMarkers.map((marker) => (
                <motion.div
                  key={marker.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-4 left-4 right-4"
                >
                  <div
                    className="p-3 rounded-lg backdrop-blur-md"
                    style={{
                      backgroundColor: `${getMarkerColor(marker.type)}20`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        icon={
                          MARKER_TYPES.find((t) => t.key === marker.type)
                            ?.icon || ""
                        }
                        style={{ color: getMarkerColor(marker.type) }}
                        className="w-5 h-5"
                      />
                      <span className="font-medium text-white">
                        {marker.title}
                      </span>
                    </div>
                    {marker.description && (
                      <p className="text-sm text-white/80 mt-1">
                        {marker.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Click to Play Overlay */}
            {!isPlaying && (
              <button
                className="absolute inset-0 flex items-center justify-center bg-black/30"
                onClick={handlePlayPause}
              >
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Icon
                    icon="solar:play-bold"
                    className="w-10 h-10 text-white"
                  />
                </div>
              </button>
            )}
          </div>

          {/* Progress Bar with Markers */}
          <div className="px-4 py-2">
            <div className="relative">
              <Slider
                size="sm"
                minValue={0}
                maxValue={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="max-w-full"
                formatOptions={{ style: "decimal" }}
                aria-label="Video progress"
              />
              {/* Marker Indicators */}
              <div className="absolute top-0 left-0 right-0 h-full pointer-events-none">
                {markers.map((marker) => (
                  <Tooltip key={marker.id} content={marker.title}>
                    <button
                      className="absolute w-2 h-2 rounded-full -translate-y-1/2 top-1/2 pointer-events-auto cursor-pointer hover:scale-150 transition-transform"
                      style={{
                        left: `${(marker.timestamp / duration) * 100}%`,
                        backgroundColor: getMarkerColor(marker.type),
                      }}
                      onClick={() => jumpToMarker(marker)}
                    />
                  </Tooltip>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-xs text-default-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <CardBody className="p-4 border-t border-divider">
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  onClick={() => skipSeconds(-10)}
                >
                  <Icon
                    icon="solar:rewind-10-seconds-back-bold"
                    className="w-5 h-5"
                  />
                </Button>
                <Button
                  isIconOnly
                  color="primary"
                  size="lg"
                  onClick={handlePlayPause}
                >
                  <Icon
                    icon={isPlaying ? "solar:pause-bold" : "solar:play-bold"}
                    className="w-6 h-6"
                  />
                </Button>
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  onClick={() => skipSeconds(10)}
                >
                  <Icon
                    icon="solar:rewind-10-seconds-forward-bold"
                    className="w-5 h-5"
                  />
                </Button>

                {/* Volume */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onClick={() => {
                      const newMuted = !isMuted;
                      setIsMuted(newMuted);
                      if (videoRef.current) {
                        videoRef.current.muted = newMuted;
                      }
                    }}
                  >
                    <Icon
                      icon={
                        isMuted
                          ? "solar:volume-cross-bold"
                          : "solar:volume-loud-bold"
                      }
                      className="w-5 h-5"
                    />
                  </Button>
                  <Slider
                    size="sm"
                    minValue={0}
                    maxValue={1}
                    step={0.1}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-24"
                    aria-label="Volume"
                  />
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2">
                {/* Playback Speed */}
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="flat" size="sm">
                      {playbackSpeed}x
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    selectedKeys={[playbackSpeed.toString()]}
                    selectionMode="single"
                    onSelectionChange={(keys) => {
                      const speed = parseFloat(Array.from(keys)[0] as string);
                      handleSpeedChange(speed);
                    }}
                  >
                    {PLAYBACK_SPEEDS.map((speed) => (
                      <DropdownItem key={speed.toString()}>
                        {speed}x
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>

                {/* Add Marker */}
                {isCoach && (
                  <Button
                    variant="flat"
                    size="sm"
                    color="primary"
                    startContent={
                      <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
                    }
                    onClick={() => setShowMarkerForm(true)}
                  >
                    Add Marker
                  </Button>
                )}

                {/* Fullscreen */}
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  onClick={toggleFullscreen}
                >
                  <Icon
                    icon={
                      isFullscreen
                        ? "solar:minimize-square-bold"
                        : "solar:maximize-square-bold"
                    }
                    className="w-5 h-5"
                  />
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Video Info */}
        <Card className="mt-4">
          <CardBody className="p-4">
            <h2 className="text-lg font-bold">{video.title}</h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-default-500">
              <Avatar src={video.uploadedBy.avatar} size="sm" />
              <span>{video.uploadedBy.name}</span>
              <span>•</span>
              <span>{new Date(video.uploadedAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{markers.length} markers</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="pb-0">
            <Tabs
              selectedKey={sidebarTab}
              onSelectionChange={(key) =>
                setSidebarTab(key as typeof sidebarTab)
              }
              fullWidth
            >
              <Tab
                key="markers"
                title={
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:bookmark-bold" className="w-4 h-4" />
                    <span>Markers</span>
                    <Chip size="sm" variant="flat">
                      {markers.length}
                    </Chip>
                  </div>
                }
              />
              <Tab
                key="chat"
                title={
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:chat-round-bold" className="w-4 h-4" />
                    <span>Chat</span>
                  </div>
                }
              />
            </Tabs>
          </CardHeader>

          {sidebarTab === "markers" && (
            <>
              {/* Filter */}
              <div className="p-3 border-b border-divider">
                <div className="flex gap-1 flex-wrap">
                  <Chip
                    variant={filterType === "all" ? "solid" : "bordered"}
                    className="cursor-pointer"
                    onClick={() => setFilterType("all")}
                  >
                    All
                  </Chip>
                  {MARKER_TYPES.map((type) => (
                    <Chip
                      key={type.key}
                      variant={filterType === type.key ? "solid" : "bordered"}
                      className="cursor-pointer"
                      style={{
                        borderColor:
                          filterType === type.key ? type.color : undefined,
                        backgroundColor:
                          filterType === type.key ? type.color : undefined,
                      }}
                      onClick={() => setFilterType(type.key)}
                    >
                      <Icon icon={type.icon} className="w-3 h-3 mr-1" />
                      {type.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Marker List */}
              <ScrollShadow className="flex-1 p-3">
                <div className="space-y-2">
                  {sortedMarkers.map((marker) => (
                    <MarkerCard
                      key={marker.id}
                      marker={marker}
                      isSelected={selectedMarker?.id === marker.id}
                      isOwn={marker.authorId === currentUserId}
                      onClick={() => jumpToMarker(marker)}
                      onDelete={() => onDeleteMarker(marker.id)}
                      onReply={(content) => onAddReply(marker.id, content)}
                    />
                  ))}

                  {sortedMarkers.length === 0 && (
                    <div className="text-center py-8">
                      <Icon
                        icon="solar:bookmark-bold"
                        className="w-12 h-12 mx-auto text-default-300 mb-2"
                      />
                      <p className="text-default-500">No markers yet</p>
                      {isCoach && (
                        <p className="text-sm text-default-400 mt-1">
                          Add markers to highlight key moments
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </ScrollShadow>
            </>
          )}

          {sidebarTab === "chat" && (
            <CardBody className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Icon
                  icon="solar:chat-round-bold"
                  className="w-12 h-12 mx-auto text-default-300 mb-2"
                />
                <p className="text-default-500">Live chat during sessions</p>
                <p className="text-sm text-default-400 mt-1">
                  Chat is available during live sessions
                </p>
              </div>
            </CardBody>
          )}
        </Card>
      </div>

      {/* Add Marker Modal */}
      <AddMarkerModal
        isOpen={showMarkerForm}
        onClose={() => setShowMarkerForm(false)}
        currentTime={currentTime}
        currentUserId={currentUserId}
        onAdd={onAddMarker}
      />
    </div>
  );
}

/**
 * Marker Card Component
 */
function MarkerCard({
  marker,
  isSelected,
  isOwn,
  onClick,
  onDelete,
  onReply,
}: {
  marker: VideoMarker;
  isSelected: boolean;
  isOwn: boolean;
  onClick: () => void;
  onDelete: () => void;
  onReply: (content: string) => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(replyContent.trim());
      setReplyContent("");
      setShowReply(false);
    }
  };

  const typeConfig = MARKER_TYPES.find((t) => t.key === marker.type);

  return (
    <Card
      isPressable
      isHoverable
      className={`transition-all ${isSelected ? "ring-2 ring-primary" : ""}`}
      onClick={onClick}
    >
      <CardBody className="p-3">
        <div className="flex items-start gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${typeConfig?.color}20` }}
          >
            <Icon
              icon={typeConfig?.icon || ""}
              className="w-4 h-4"
              style={{ color: typeConfig?.color }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{marker.title}</span>
              <Chip size="sm" variant="flat">
                {formatTime(marker.timestamp)}
              </Chip>
            </div>
            {marker.description && (
              <p className="text-xs text-default-500 mt-1 line-clamp-2">
                {marker.description}
              </p>
            )}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-default-400">
                {marker.authorName}
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  className="h-6 w-6 min-w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReply(!showReply);
                  }}
                >
                  <Icon icon="solar:chat-round-bold" className="w-3 h-3" />
                </Button>
                {isOwn && (
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    isIconOnly
                    className="h-6 w-6 min-w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                  >
                    <Icon
                      icon="solar:trash-bin-minimalistic-bold"
                      className="w-3 h-3"
                    />
                  </Button>
                )}
              </div>
            </div>

            {/* Replies */}
            {marker.replies && marker.replies.length > 0 && (
              <div className="mt-2 space-y-1 border-t border-divider pt-2">
                {marker.replies.map((reply) => (
                  <div key={reply.id} className="text-xs">
                    <span className="font-medium">{reply.authorName}:</span>{" "}
                    <span className="text-default-500">{reply.content}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Input */}
            {showReply && (
              <div
                className="mt-2 flex gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Input
                  size="sm"
                  placeholder="Add reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleReply()}
                />
                <Button
                  size="sm"
                  color="primary"
                  isIconOnly
                  onClick={handleReply}
                >
                  <Icon icon="solar:plain-2-bold" className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

/**
 * Add Marker Modal
 */
function AddMarkerModal({
  isOpen,
  onClose,
  currentTime,
  currentUserId,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentTime: number;
  currentUserId: string;
  onAdd: SessionReviewProps["onAddMarker"];
}) {
  const [type, setType] = useState<VideoMarker["type"]>("note");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        timestamp: currentTime,
        type,
        title: title.trim(),
        description: description.trim() || undefined,
        authorId: currentUserId,
        authorName: "You", // Would come from user context
      });
      onClose();
      // Reset form
      setType("note");
      setTitle("");
      setDescription("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Add Marker at {formatTime(currentTime)}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Type Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Marker Type
              </label>
              <div className="flex gap-2 flex-wrap">
                {MARKER_TYPES.map((t) => (
                  <Chip
                    key={t.key}
                    variant={type === t.key ? "solid" : "bordered"}
                    className="cursor-pointer"
                    style={{
                      borderColor: type === t.key ? t.color : undefined,
                      backgroundColor: type === t.key ? t.color : undefined,
                      color: type === t.key ? "white" : undefined,
                    }}
                    onClick={() => setType(t.key as VideoMarker["type"])}
                  >
                    <Icon icon={t.icon} className="w-4 h-4 mr-1" />
                    {t.label}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Title */}
            <Input
              label="Title"
              placeholder="What's happening at this moment?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              isRequired
            />

            {/* Description */}
            <Textarea
              label="Description (optional)"
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={!title.trim()}
          >
            Add Marker
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

/**
 * Video Marker Timeline (compact view)
 */
export function MarkerTimeline({
  markers,
  duration,
  currentTime,
  onSeek,
  className = "",
}: {
  markers: VideoMarker[];
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  className?: string;
}) {
  return (
    <div className={`relative h-2 bg-default-200 rounded-full ${className}`}>
      {/* Progress */}
      <div
        className="absolute h-full bg-primary rounded-full"
        style={{ width: `${(currentTime / duration) * 100}%` }}
      />

      {/* Markers */}
      {markers.map((marker) => (
        <Tooltip key={marker.id} content={marker.title}>
          <button
            className="absolute w-3 h-3 rounded-full -translate-y-1/4 top-1/2 hover:scale-125 transition-transform z-10"
            style={{
              left: `${(marker.timestamp / duration) * 100}%`,
              backgroundColor: getMarkerColor(marker.type),
            }}
            onClick={() => onSeek(marker.timestamp)}
          />
        </Tooltip>
      ))}
    </div>
  );
}

// Default export
const SessionVideoReviewComponents = {
  SessionVideoReview,
  MarkerTimeline,
};

export default SessionVideoReviewComponents;
