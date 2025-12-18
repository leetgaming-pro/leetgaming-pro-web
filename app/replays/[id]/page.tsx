"use client";

/**
 * Replay Detail Page
 * Shows replay metadata, preview, and navigation to player
 */

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Divider,
  Spinner,
  Avatar,
  Progress,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";

interface ReplayMeta {
  id: string;
  gameId: string;
  matchId?: string;
  status: "pending" | "processing" | "ready" | "failed";
  createdAt: string;
  updatedAt?: string;
  size?: number;
  duration?: number;
  map?: string;
  mode?: string;
  players?: string[];
  title?: string;
  description?: string;
  tags?: string[];
  visibility?: "public" | "private" | "unlisted";
  views?: number;
  likes?: number;
}

const statusConfig = {
  pending: {
    color: "warning" as const,
    icon: "solar:clock-circle-bold",
    label: "Pending",
  },
  processing: {
    color: "primary" as const,
    icon: "solar:refresh-bold",
    label: "Processing",
  },
  ready: {
    color: "success" as const,
    icon: "solar:check-circle-bold",
    label: "Ready",
  },
  failed: {
    color: "danger" as const,
    icon: "solar:danger-circle-bold",
    label: "Failed",
  },
};

export default function ReplayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const replayId = params?.id as string | undefined;

  const sdk = useMemo(
    () => new ReplayAPISDK(ReplayApiSettingsMock, logger),
    []
  );

  const [meta, setMeta] = useState<ReplayMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReplay = async () => {
      if (!replayId) return;

      setLoading(true);
      setError(null);

      try {
        const results = await sdk.replayFiles.searchReplayFiles({
          id: replayId,
        });
        const found = Array.isArray(results)
          ? results.find((r) => r.id === replayId)
          : null;

        if (!found) {
          setError("Replay not found");
          return;
        }

        setMeta({
          id: found.id,
          gameId: found.gameId || "cs2",
          matchId: found.matchId,
          status: (found.status as ReplayMeta["status"]) || "ready",
          createdAt: found.createdAt,
          updatedAt: found.updatedAt,
          size: found.size,
          duration: found.duration,
          map: found.map,
          mode: found.mode,
          players: found.players,
          title: found.title,
          description: found.description,
          tags: found.tags,
          visibility:
            (found.visibility as ReplayMeta["visibility"]) || "public",
          views: found.views || 0,
          likes: found.likes || 0,
        });
      } catch (e) {
        const errorMessage =
          e instanceof Error ? e.message : "Failed to load replay";
        setError(errorMessage);
        logger.error("Failed to fetch replay", { replayId, error: e });
      } finally {
        setLoading(false);
      }
    };

    fetchReplay();
  }, [replayId, sdk]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-default-500">Loading replay...</p>
        </div>
      </div>
    );
  }

  if (error || !meta) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-danger-50 dark:bg-danger-900/20">
          <CardBody className="text-center py-12">
            <Icon
              icon="solar:danger-circle-bold"
              className="mx-auto mb-4 text-danger"
              width={64}
            />
            <h2 className="text-xl font-semibold mb-2">Error Loading Replay</h2>
            <p className="text-default-600 mb-4">
              {error || "Replay not found"}
            </p>
            <Button color="primary" onPress={() => router.push("/replays")}>
              Back to Replays
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const status = statusConfig[meta.status] || statusConfig.pending;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => router.push("/replays")}
            >
              <Icon icon="solar:arrow-left-bold" width={20} />
            </Button>
            <h1 className="text-2xl font-bold">
              {meta.title || `Replay #${meta.id.slice(0, 8)}`}
            </h1>
            <Chip
              size="sm"
              color={status.color}
              variant="flat"
              startContent={<Icon icon={status.icon} width={14} />}
            >
              {status.label}
            </Chip>
          </div>
          <p className="text-default-500 ml-11">
            {meta.description || "No description provided"}
          </p>
        </div>

        <div className="flex gap-2">
          {meta.status === "ready" && (
            <Button
              color="primary"
              size="lg"
              startContent={<Icon icon="solar:play-bold" width={20} />}
              onPress={() => router.push(`/replays/${replayId}/player`)}
            >
              Watch Replay
            </Button>
          )}
          <Button
            variant="bordered"
            startContent={<Icon icon="solar:share-bold" width={18} />}
          >
            Share
          </Button>
          <Button
            variant="bordered"
            startContent={<Icon icon="solar:download-bold" width={18} />}
          >
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview Card */}
          <Card>
            <CardBody className="aspect-video bg-default-100 flex items-center justify-center relative overflow-hidden">
              {meta.status === "processing" ? (
                <div className="text-center">
                  <Spinner size="lg" color="primary" />
                  <p className="mt-4 text-default-600">Processing replay...</p>
                  <Progress
                    size="sm"
                    isIndeterminate
                    color="primary"
                    className="mt-4 max-w-xs"
                  />
                </div>
              ) : meta.status === "ready" ? (
                <div className="text-center">
                  <Icon
                    icon="solar:videocamera-record-bold"
                    width={80}
                    className="mx-auto mb-4 text-default-300"
                  />
                  <p className="text-lg font-semibold mb-2">Replay Ready</p>
                  <p className="text-sm text-default-500 mb-4">
                    Click &quot;Watch Replay&quot; to view
                  </p>
                  <Button
                    color="primary"
                    size="lg"
                    startContent={<Icon icon="solar:play-bold" width={24} />}
                    onPress={() => router.push(`/replays/${replayId}/player`)}
                  >
                    Watch Now
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Icon
                    icon={status.icon}
                    width={64}
                    className={`mx-auto mb-4 text-${status.color}`}
                  />
                  <p className="text-lg font-semibold">{status.label}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Tabs */}
          <Card>
            <CardBody>
              <Tabs aria-label="Replay details" color="primary">
                <Tab key="overview" title="Overview">
                  <div className="py-4 space-y-4">
                    {meta.players && meta.players.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-default-500 mb-2">
                          Players
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {meta.players.map((player, i) => (
                            <Chip
                              key={i}
                              variant="flat"
                              avatar={<Avatar name={player} size="sm" />}
                            >
                              {player}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    )}

                    {meta.tags && meta.tags.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-default-500 mb-2">
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {meta.tags.map((tag, i) => (
                            <Chip key={i} size="sm" variant="bordered">
                              {tag}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Tab>
                <Tab key="stats" title="Statistics">
                  <div className="py-4 text-center text-default-500">
                    <Icon
                      icon="solar:chart-2-bold"
                      width={48}
                      className="mx-auto mb-2 opacity-50"
                    />
                    <p>Statistics available after watching</p>
                  </div>
                </Tab>
                <Tab key="comments" title="Comments">
                  <div className="py-4 text-center text-default-500">
                    <Icon
                      icon="solar:chat-round-dots-bold"
                      width={48}
                      className="mx-auto mb-2 opacity-50"
                    />
                    <p>No comments yet</p>
                  </div>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Card */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Replay Info</h3>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              <div className="flex justify-between">
                <span className="text-default-500">Game</span>
                <Chip size="sm" variant="flat" color="primary">
                  {meta.gameId.toUpperCase()}
                </Chip>
              </div>

              {meta.map && (
                <div className="flex justify-between">
                  <span className="text-default-500">Map</span>
                  <span className="font-medium">{meta.map}</span>
                </div>
              )}

              {meta.mode && (
                <div className="flex justify-between">
                  <span className="text-default-500">Mode</span>
                  <span className="font-medium">{meta.mode}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-default-500">Duration</span>
                <span className="font-medium">
                  {formatDuration(meta.duration)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-default-500">Size</span>
                <span className="font-medium">{formatFileSize(meta.size)}</span>
              </div>

              <Divider />

              <div className="flex justify-between">
                <span className="text-default-500">Created</span>
                <span className="font-medium">
                  {new Date(meta.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-default-500">Visibility</span>
                <Chip
                  size="sm"
                  variant="flat"
                  color={meta.visibility === "public" ? "success" : "default"}
                  startContent={
                    <Icon
                      icon={
                        meta.visibility === "public"
                          ? "solar:eye-bold"
                          : "solar:eye-closed-bold"
                      }
                      width={14}
                    />
                  }
                >
                  {meta.visibility || "Public"}
                </Chip>
              </div>
            </CardBody>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Engagement</h3>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">
                    {meta.views?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-default-500">Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {meta.likes?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-default-500">Likes</div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardBody className="space-y-3">
              <Button
                fullWidth
                variant="flat"
                startContent={<Icon icon="solar:heart-bold" width={18} />}
              >
                Like Replay
              </Button>
              <Button
                fullWidth
                variant="flat"
                startContent={<Icon icon="solar:bookmark-bold" width={18} />}
              >
                Save to Collection
              </Button>
              <Button
                fullWidth
                variant="flat"
                color="danger"
                startContent={<Icon icon="solar:flag-bold" width={18} />}
              >
                Report
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
