/**
 * Stream Integration Component
 * Twitch/YouTube embed for tournaments and matches
 * Per PRD D.5.1 - Stream Integration (Missing)
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";

// ============================================================================
// Types
// ============================================================================

export type StreamPlatform = "twitch" | "youtube" | "kick";

export interface StreamInfo {
  id: string;
  platform: StreamPlatform;
  channelId: string;
  channelName: string;
  title: string;
  viewerCount: number;
  thumbnailUrl?: string;
  isLive: boolean;
  gameName?: string;
  language?: string;
  startedAt?: Date;
}

export interface StreamEmbedProps {
  stream: StreamInfo;
  width?: string | number;
  height?: string | number;
  autoplay?: boolean;
  muted?: boolean;
  allowFullscreen?: boolean;
  className?: string;
  onError?: () => void;
}

export interface StreamSelectorProps {
  streams: StreamInfo[];
  selectedStreamId?: string;
  onSelectStream: (stream: StreamInfo) => void;
  onAddStream?: (url: string) => void;
  showAddButton?: boolean;
  className?: string;
}

export interface MultiStreamViewerProps {
  streams: StreamInfo[];
  maxStreams?: number;
  defaultLayout?: "single" | "dual" | "quad";
  showChat?: boolean;
  className?: string;
}

// ============================================================================
// Utils
// ============================================================================

function formatViewerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

function formatDuration(startedAt: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(startedAt).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

const PLATFORM_COLORS: Record<StreamPlatform, string> = {
  twitch: "#9146FF",
  youtube: "#FF0000",
  kick: "#53FC18",
};

const PLATFORM_ICONS: Record<StreamPlatform, string> = {
  twitch: "mdi:twitch",
  youtube: "mdi:youtube",
  kick: "simple-icons:kick",
};

// ============================================================================
// Components
// ============================================================================

/**
 * Single Stream Embed
 */
export function StreamEmbed({
  stream,
  width = "100%",
  height = "100%",
  autoplay = true,
  muted = false,
  allowFullscreen = true,
  className = "",
  onError,
}: StreamEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const embedUrl = useMemo(() => {
    const parent =
      typeof window !== "undefined" ? window.location.hostname : "localhost";

    switch (stream.platform) {
      case "twitch":
        return `https://player.twitch.tv/?channel=${stream.channelId}&parent=${parent}&autoplay=${autoplay}&muted=${muted}`;
      case "youtube":
        return `https://www.youtube.com/embed/${stream.channelId}?autoplay=${
          autoplay ? 1 : 0
        }&mute=${muted ? 1 : 0}`;
      case "kick":
        return `https://player.kick.com/${stream.channelId}`;
      default:
        return "";
    }
  }, [stream, autoplay, muted]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-default-100 rounded-lg ${className}`}
        style={{ width, height, minHeight: 200 }}
      >
        <Icon
          icon="solar:video-frame-cut-bold"
          className="w-12 h-12 text-default-300 mb-2"
        />
        <p className="text-default-500">Stream unavailable</p>
        <Button
          size="sm"
          variant="flat"
          className="mt-2"
          onClick={() => {
            setHasError(false);
            setIsLoading(true);
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-default-100 rounded-lg">
          <div className="flex flex-col items-center">
            <Icon
              icon={PLATFORM_ICONS[stream.platform]}
              className="w-12 h-12 animate-pulse"
              style={{ color: PLATFORM_COLORS[stream.platform] }}
            />
            <p className="text-sm text-default-500 mt-2">Loading stream...</p>
          </div>
        </div>
      )}
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        allowFullScreen={allowFullscreen}
        onLoad={handleLoad}
        onError={handleError}
        className="rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}

/**
 * Stream Chat Embed
 */
export function StreamChat({
  stream,
  width = "100%",
  height = "100%",
  className = "",
}: {
  stream: StreamInfo;
  width?: string | number;
  height?: string | number;
  className?: string;
}) {
  const chatUrl = useMemo(() => {
    const parent =
      typeof window !== "undefined" ? window.location.hostname : "localhost";

    switch (stream.platform) {
      case "twitch":
        return `https://www.twitch.tv/embed/${stream.channelId}/chat?parent=${parent}&darkpopout`;
      case "youtube":
        return `https://www.youtube.com/live_chat?v=${stream.channelId}&embed_domain=${parent}`;
      default:
        return "";
    }
  }, [stream]);

  if (!chatUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-default-100 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <p className="text-default-500">Chat not available for this platform</p>
      </div>
    );
  }

  return (
    <iframe
      src={chatUrl}
      width={width}
      height={height}
      className={`rounded-lg ${className}`}
    />
  );
}

/**
 * Stream Card Preview
 */
export function StreamCard({
  stream,
  isSelected,
  onClick,
  showViewers = true,
  compact = false,
}: {
  stream: StreamInfo;
  isSelected?: boolean;
  onClick?: () => void;
  showViewers?: boolean;
  compact?: boolean;
}) {
  return (
    <Card
      isPressable={!!onClick}
      isHoverable={!!onClick}
      className={`${isSelected ? "ring-2 ring-primary" : ""}`}
      onClick={onClick}
    >
      <CardBody className={compact ? "p-2" : "p-3"}>
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0">
            {stream.thumbnailUrl ? (
              <div
                className={`rounded-lg bg-cover bg-center ${
                  compact ? "w-16 h-10" : "w-24 h-14"
                }`}
                style={{ backgroundImage: `url(${stream.thumbnailUrl})` }}
                role="img"
                aria-label={stream.title}
              />
            ) : (
              <div
                className={`rounded-lg bg-default-100 flex items-center justify-center ${
                  compact ? "w-16 h-10" : "w-24 h-14"
                }`}
              >
                <Icon
                  icon={PLATFORM_ICONS[stream.platform]}
                  className="w-6 h-6"
                  style={{ color: PLATFORM_COLORS[stream.platform] }}
                />
              </div>
            )}
            {stream.isLive && (
              <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-danger text-white text-[10px] font-bold rounded">
                LIVE
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Icon
                icon={PLATFORM_ICONS[stream.platform]}
                className="w-4 h-4 flex-shrink-0"
                style={{ color: PLATFORM_COLORS[stream.platform] }}
              />
              <span
                className={`font-semibold truncate ${compact ? "text-sm" : ""}`}
              >
                {stream.channelName}
              </span>
            </div>
            {!compact && (
              <p className="text-sm text-default-500 truncate mt-0.5">
                {stream.title}
              </p>
            )}
            {showViewers && stream.isLive && (
              <div className="flex items-center gap-1 text-xs text-default-400 mt-1">
                <Icon icon="solar:eye-bold" className="w-3 h-3" />
                <span>{formatViewerCount(stream.viewerCount)} viewers</span>
                {stream.startedAt && (
                  <>
                    <span>•</span>
                    <span>{formatDuration(stream.startedAt)}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {isSelected && (
            <Icon
              icon="solar:check-circle-bold"
              className="w-5 h-5 text-primary flex-shrink-0"
            />
          )}
        </div>
      </CardBody>
    </Card>
  );
}

/**
 * Stream Selector
 */
export function StreamSelector({
  streams,
  selectedStreamId,
  onSelectStream,
  onAddStream,
  showAddButton = true,
  className = "",
}: StreamSelectorProps) {
  const [streamUrl, setStreamUrl] = useState("");
  const addModal = useDisclosure();

  const handleAddStream = () => {
    if (streamUrl && onAddStream) {
      onAddStream(streamUrl);
      setStreamUrl("");
      addModal.onClose();
    }
  };

  const liveStreams = streams.filter((s) => s.isLive);
  const offlineStreams = streams.filter((s) => !s.isLive);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Available Streams</h4>
        {showAddButton && onAddStream && (
          <Button
            size="sm"
            variant="flat"
            startContent={
              <Icon icon="solar:add-circle-bold" className="w-4 h-4" />
            }
            onClick={addModal.onOpen}
          >
            Add Stream
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {liveStreams.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-danger rounded-full animate-pulse" />
              <span className="text-sm font-medium">Live Now</span>
            </div>
            <div className="grid gap-2">
              {liveStreams.map((stream) => (
                <StreamCard
                  key={stream.id}
                  stream={stream}
                  isSelected={selectedStreamId === stream.id}
                  onClick={() => onSelectStream(stream)}
                />
              ))}
            </div>
          </div>
        )}

        {offlineStreams.length > 0 && (
          <div>
            <span className="text-sm font-medium text-default-500 mb-2 block">
              Offline
            </span>
            <div className="grid gap-2">
              {offlineStreams.map((stream) => (
                <StreamCard
                  key={stream.id}
                  stream={stream}
                  isSelected={selectedStreamId === stream.id}
                  onClick={() => onSelectStream(stream)}
                  compact
                />
              ))}
            </div>
          </div>
        )}

        {streams.length === 0 && (
          <div className="text-center py-8">
            <Icon
              icon="solar:video-frame-bold"
              className="w-12 h-12 mx-auto text-default-300 mb-2"
            />
            <p className="text-default-500">No streams available</p>
          </div>
        )}
      </div>

      {/* Add Stream Modal */}
      <Modal isOpen={addModal.isOpen} onClose={addModal.onClose}>
        <ModalContent>
          <ModalHeader>Add Stream</ModalHeader>
          <ModalBody>
            <Input
              label="Stream URL"
              placeholder="https://twitch.tv/channel or https://youtube.com/watch?v=..."
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              startContent={
                <Icon icon="solar:link-bold" className="text-default-400" />
              }
            />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-default-500">Supported:</span>
              <Icon icon="mdi:twitch" className="w-4 h-4 text-[#9146FF]" />
              <Icon icon="mdi:youtube" className="w-4 h-4 text-[#FF0000]" />
              <Icon
                icon="simple-icons:kick"
                className="w-4 h-4 text-[#53FC18]"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={addModal.onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleAddStream}
              isDisabled={!streamUrl}
            >
              Add Stream
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

/**
 * Multi-Stream Viewer
 */
export function MultiStreamViewer({
  streams,
  maxStreams = 4,
  defaultLayout = "single",
  showChat = true,
  className = "",
}: MultiStreamViewerProps) {
  const [layout, setLayout] = useState<"single" | "dual" | "quad">(
    defaultLayout
  );
  const [activeStreams, setActiveStreams] = useState<StreamInfo[]>(
    streams.slice(0, maxStreams)
  );
  const [mainStreamIndex, setMainStreamIndex] = useState(0);
  const [chatOpen, setChatOpen] = useState(showChat);
  const [isMuted, setIsMuted] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  useEffect(() => {
    setActiveStreams(streams.slice(0, maxStreams));
  }, [streams, maxStreams]);

  const layoutConfig = useMemo(() => {
    switch (layout) {
      case "single":
        return { cols: 1, rows: 1 };
      case "dual":
        return { cols: 2, rows: 1 };
      case "quad":
        return { cols: 2, rows: 2 };
    }
  }, [layout]);

  const visibleStreams = activeStreams.slice(
    0,
    layoutConfig.cols * layoutConfig.rows
  );
  const mainStream = activeStreams[mainStreamIndex];

  return (
    <Card
      className={`${className} ${
        isTheaterMode ? "fixed inset-0 z-50 rounded-none" : ""
      }`}
    >
      <CardHeader className="flex items-center justify-between p-3 border-b border-divider">
        <div className="flex items-center gap-2">
          <Icon icon="solar:tv-bold" className="w-5 h-5 text-primary" />
          <span className="font-semibold">Stream Viewer</span>
          {mainStream?.isLive && (
            <Chip size="sm" color="danger" variant="flat">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse" />
                LIVE
              </span>
            </Chip>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Layout Selector */}
          <Dropdown>
            <DropdownTrigger>
              <Button size="sm" variant="flat" isIconOnly>
                <Icon icon="solar:widget-bold" className="w-4 h-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              selectedKeys={[layout]}
              selectionMode="single"
              onSelectionChange={(keys) =>
                setLayout(Array.from(keys)[0] as typeof layout)
              }
            >
              <DropdownItem
                key="single"
                startContent={
                  <Icon icon="solar:square-bold" className="w-4 h-4" />
                }
              >
                Single View
              </DropdownItem>
              <DropdownItem
                key="dual"
                startContent={
                  <Icon icon="solar:slider-vertical-bold" className="w-4 h-4" />
                }
              >
                Dual View
              </DropdownItem>
              <DropdownItem
                key="quad"
                startContent={
                  <Icon icon="solar:widget-4-bold" className="w-4 h-4" />
                }
              >
                Quad View
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          {/* Mute Toggle */}
          <Button
            size="sm"
            variant="flat"
            isIconOnly
            onClick={() => setIsMuted(!isMuted)}
          >
            <Icon
              icon={
                isMuted ? "solar:volume-cross-bold" : "solar:volume-loud-bold"
              }
              className="w-4 h-4"
            />
          </Button>

          {/* Chat Toggle */}
          {mainStream?.platform !== "kick" && (
            <Button
              size="sm"
              variant={chatOpen ? "solid" : "flat"}
              isIconOnly
              onClick={() => setChatOpen(!chatOpen)}
            >
              <Icon icon="solar:chat-round-bold" className="w-4 h-4" />
            </Button>
          )}

          {/* Theater Mode */}
          <Button
            size="sm"
            variant="flat"
            isIconOnly
            onClick={() => setIsTheaterMode(!isTheaterMode)}
          >
            <Icon
              icon={
                isTheaterMode
                  ? "solar:minimize-square-bold"
                  : "solar:maximize-square-bold"
              }
              className="w-4 h-4"
            />
          </Button>
        </div>
      </CardHeader>

      <CardBody className="p-0">
        <div
          className={`flex ${
            isTheaterMode ? "h-[calc(100vh-60px)]" : "h-[500px]"
          }`}
        >
          {/* Stream Grid */}
          <div className={`flex-1 ${chatOpen ? "" : "w-full"}`}>
            {layout === "single" ? (
              mainStream && (
                <StreamEmbed
                  stream={mainStream}
                  muted={isMuted}
                  height="100%"
                />
              )
            ) : (
              <div
                className="grid h-full gap-1 p-1"
                style={{
                  gridTemplateColumns: `repeat(${layoutConfig.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${layoutConfig.rows}, 1fr)`,
                }}
              >
                {visibleStreams.map((stream, index) => (
                  <div
                    key={stream.id}
                    className={`relative ${
                      index === mainStreamIndex ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setMainStreamIndex(index)}
                  >
                    <StreamEmbed
                      stream={stream}
                      muted={index !== mainStreamIndex || isMuted}
                      height="100%"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                      {stream.channelName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Panel */}
          {chatOpen && mainStream && mainStream.platform !== "kick" && (
            <div className="w-[340px] border-l border-divider">
              <StreamChat stream={mainStream} height="100%" />
            </div>
          )}
        </div>

        {/* Stream Selector Bar */}
        {activeStreams.length > 1 && layout === "single" && (
          <div className="p-2 border-t border-divider flex items-center gap-2 overflow-x-auto">
            {activeStreams.map((stream, index) => (
              <Button
                key={stream.id}
                size="sm"
                variant={index === mainStreamIndex ? "solid" : "flat"}
                className="flex-shrink-0"
                onClick={() => setMainStreamIndex(index)}
              >
                <Icon
                  icon={PLATFORM_ICONS[stream.platform]}
                  className="w-4 h-4 mr-1"
                  style={{
                    color:
                      index === mainStreamIndex
                        ? "white"
                        : PLATFORM_COLORS[stream.platform],
                  }}
                />
                {stream.channelName}
                {stream.isLive && (
                  <span className="w-1.5 h-1.5 bg-danger rounded-full ml-1" />
                )}
              </Button>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

/**
 * Tournament Stream Widget (compact version for tournament pages)
 */
export function TournamentStreamWidget({
  streams,
  title = "Live Streams",
  className = "",
}: {
  streams: StreamInfo[];
  title?: string;
  className?: string;
}) {
  const [selectedStream, setSelectedStream] = useState<StreamInfo | null>(
    streams.find((s) => s.isLive) || streams[0] || null
  );
  const [expanded, setExpanded] = useState(false);

  const liveCount = streams.filter((s) => s.isLive).length;

  if (!selectedStream) {
    return (
      <Card className={className}>
        <CardBody className="p-4 text-center">
          <Icon
            icon="solar:video-frame-bold"
            className="w-8 h-8 mx-auto text-default-300 mb-2"
          />
          <p className="text-sm text-default-500">No streams available</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="p-3 border-b border-divider">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Icon icon="solar:tv-bold" className="w-5 h-5" />
            <span className="font-semibold">{title}</span>
            {liveCount > 0 && (
              <Chip size="sm" color="danger" variant="flat">
                {liveCount} Live
              </Chip>
            )}
          </div>
          <Button
            size="sm"
            variant="light"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <div className={expanded ? "aspect-video" : "aspect-[21/9]"}>
          <StreamEmbed stream={selectedStream} muted={!expanded} />
        </div>

        {streams.length > 1 && (
          <div className="p-2 border-t border-divider">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {streams.map((stream) => (
                <button
                  key={stream.id}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0
                    ${
                      selectedStream.id === stream.id
                        ? "bg-primary text-white"
                        : "bg-default-100 hover:bg-default-200"
                    }
                  `}
                  onClick={() => setSelectedStream(stream)}
                >
                  <Icon
                    icon={PLATFORM_ICONS[stream.platform]}
                    className="w-4 h-4"
                    style={{
                      color:
                        selectedStream.id === stream.id
                          ? "white"
                          : PLATFORM_COLORS[stream.platform],
                    }}
                  />
                  <span className="text-sm font-medium">
                    {stream.channelName}
                  </span>
                  {stream.isLive && (
                    <span className="w-1.5 h-1.5 bg-danger rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// Default export
const StreamingComponents = {
  StreamEmbed,
  StreamChat,
  StreamCard,
  StreamSelector,
  MultiStreamViewer,
  TournamentStreamWidget,
};

export default StreamingComponents;
