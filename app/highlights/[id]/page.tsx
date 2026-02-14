"use client";

/**
 * Highlight Detail Page - Shows detailed information about a specific highlight
 * Displays highlight metadata, video player, and related statistics
 */

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Spinner,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { ensureSession } from "@/types/replay-api/auth";
import { logger } from "@/lib/logger";
import { PageContainer } from "@/components/layout/page-container";
import { BreadcrumbBar } from "@/components/breadcrumb/breadcrumb-bar";
import { GameEvent } from "@/types/replay-api/highlights.types";

interface HighlightDetailState {
  highlight: GameEvent | null;
  loading: boolean;
  error: string | null;
}

export default function HighlightDetailPage() {
  const params = useParams();
  const router = useRouter();
  const highlightId = params?.id as string | undefined;

  const sdk = useMemo(
    () => new ReplayAPISDK(ReplayApiSettingsMock, logger),
    []
  );

  const [state, setState] = useState<HighlightDetailState>({
    highlight: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchHighlight = async () => {
      if (!highlightId) return;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Ensure user has authentication (guest token if not logged in)
        const hasSession = await ensureSession();
        if (!hasSession) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error:
              "Failed to establish session. Please try refreshing the page.",
          }));
          return;
        }

        // For now, we'll fetch highlights and find the specific one
        // In production, there should be a direct API endpoint for individual highlights
        const response = await sdk.highlights.getHighlights({
          game_id: "cs2",
          limit: 100,
        });

        const highlight = response.highlights.find((h) => h.id === highlightId);

        if (!highlight) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Highlight not found",
          }));
          return;
        }

        setState((prev) => ({
          ...prev,
          highlight,
          loading: false,
        }));
      } catch (e) {
        const errorMessage =
          e instanceof Error ? e.message : "Failed to load highlight";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        logger.error("Failed to fetch highlight", { highlightId, error: e });
      }
    };

    fetchHighlight();
  }, [highlightId, sdk]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (state.loading) {
    return (
      <PageContainer maxWidth="full" padding="none" className="min-h-screen">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Spinner size="lg" color="primary" />
            <p className="mt-4 text-default-500">Loading highlight...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (state.error || !state.highlight) {
    return (
      <PageContainer maxWidth="full" padding="none" className="min-h-screen">
        <div className="flex h-[calc(100vh_-_40px)] w-full gap-x-2 overflow-x-hidden">
          {/* Sidebar */}
          <div className="flex hidden h-full w-[380px] flex-shrink-0 flex-col items-start gap-y-6 rounded-none px-6 py-6 shadow-2xl lg:flex relative overflow-hidden bg-gradient-to-b from-[#34445C] via-[#2a3749] to-[#1e2a38] dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#0a0a0a] border-r border-[#34445C]/30 dark:border-[#DCFF37]/20">
            <div className="z-10">
              <div className="flex items-center gap-2">
                <Icon
                  icon="solar:play-bold"
                  className="text-[#FF4654] dark:text-[#DCFF37]"
                  width={28}
                />
                <div className="text-xl font-bold leading-7 text-white tracking-tight uppercase">
                  Highlight
                </div>
              </div>
              <div className="mt-2 text-sm font-medium leading-6 text-white/70 dark:text-[#DCFF37]/70">
                Epic moment details
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <BreadcrumbBar />
              <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md">
                  <CardBody className="text-center py-12">
                    <Icon
                      icon="solar:danger-circle-bold"
                      className="text-danger mx-auto mb-4"
                      width={64}
                    />
                    <h3 className="text-xl font-semibold mb-2 text-[#34445C] dark:text-[#F5F0E1]">
                      Highlight Not Found
                    </h3>
                    <p className="text-default-500 mb-6">
                      {state.error ||
                        "The requested highlight could not be found."}
                    </p>
                    <Button
                      color="primary"
                      onClick={() => router.push("/highlights")}
                    >
                      Back to Highlights
                    </Button>
                  </CardBody>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  const highlight = state.highlight;

  return (
    <PageContainer maxWidth="full" padding="none" className="min-h-screen">
      <div className="flex h-[calc(100vh_-_40px)] w-full gap-x-2 overflow-x-hidden">
        {/* Sidebar - LeetGaming brand */}
        <div className="flex hidden h-full w-[380px] flex-shrink-0 flex-col items-start gap-y-6 rounded-none px-6 py-6 shadow-2xl lg:flex relative overflow-hidden bg-gradient-to-b from-[#34445C] via-[#2a3749] to-[#1e2a38] dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#0a0a0a] border-r border-[#34445C]/30 dark:border-[#DCFF37]/20">
          {/* Diagonal corner accent */}
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#FF4654]/20 via-[#FFC700]/10 to-transparent dark:from-[#DCFF37]/10 dark:to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF4654] via-[#FFC700] to-[#FF4654] dark:from-[#DCFF37] dark:via-[#34445C] dark:to-[#DCFF37]" />

          <div className="z-10">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:play-bold"
                className="text-[#FF4654] dark:text-[#DCFF37]"
                width={28}
              />
              <div className="text-xl font-bold leading-7 text-white tracking-tight uppercase">
                {highlight.type}
              </div>
            </div>
            <div className="mt-2 text-sm font-medium leading-6 text-white/70 dark:text-[#DCFF37]/70">
              {highlight.primary_player?.display_name || "Unknown Player"}
            </div>

            {/* Highlight Stats */}
            <div className="mt-6 space-y-4">
              <div className="text-xs font-medium text-white/80 dark:text-[#DCFF37]/80 uppercase tracking-wide">
                Event Details
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-[#34445C]/50 dark:bg-[#1a1a1a]/50 rounded-none p-3 border border-[#FF4654]/30 dark:border-[#DCFF37]/30">
                  <div className="text-sm font-bold text-[#FF4654] dark:text-[#DCFF37]">
                    {highlight.kill_count || 1} Kill
                    {(highlight.kill_count || 1) !== 1 ? "s" : ""}
                  </div>
                  <div className="text-xs text-white/70 dark:text-[#DCFF37]/70">
                    {highlight.weapon || "Unknown Weapon"}
                  </div>
                </div>
                <div className="bg-[#34445C]/50 dark:bg-[#1a1a1a]/50 rounded-none p-3 border border-[#FF4654]/30 dark:border-[#DCFF37]/30">
                  <div className="text-sm font-bold text-[#FF4654] dark:text-[#DCFF37]">
                    Round {highlight.round_number || "?"}
                  </div>
                  <div className="text-xs text-white/70 dark:text-[#DCFF37]/70">
                    {highlight.map_name || "Unknown Map"}
                  </div>
                </div>
                <div className="bg-[#34445C]/50 dark:bg-[#1a1a1a]/50 rounded-none p-3 border border-[#FF4654]/30 dark:border-[#DCFF37]/30">
                  <div className="text-sm font-bold text-[#FF4654] dark:text-[#DCFF37]">
                    {highlight.views_count || 0}
                  </div>
                  <div className="text-xs text-white/70 dark:text-[#DCFF37]/70">
                    Views
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <BreadcrumbBar />
              <h1 className="text-3xl font-bold mt-4 text-[#34445C] dark:text-[#F5F0E1]">
                {highlight.type} by{" "}
                {highlight.primary_player?.display_name || "Unknown"}
              </h1>
              <p className="text-default-600 mt-2">
                {highlight.map_name || "Unknown Map"} • Round{" "}
                {highlight.round_number || "?"} •{" "}
                {formatDuration(highlight.event_time)}
              </p>
            </div>

            {/* Video Player */}
            <Card className="mb-6">
              <CardBody className="p-0">
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Icon icon="solar:play-bold" className="text-6xl mb-4" />
                      <h3 className="text-xl font-bold mb-2">
                        {highlight.type}
                      </h3>
                      <p className="text-lg">
                        Video playback would be implemented here
                      </p>
                      <p className="text-sm opacity-75 mt-2">
                        {highlight.primary_player?.display_name || "Unknown"} •{" "}
                        {highlight.weapon || "Unknown Weapon"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Highlight Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                    Event Information
                  </h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-default-600">Type:</span>
                    <Chip
                      size="sm"
                      color={
                        highlight.type === "Clutch"
                          ? "warning"
                          : highlight.type === "Ace"
                          ? "success"
                          : highlight.type === "MultiKill"
                          ? "primary"
                          : "default"
                      }
                      variant="flat"
                    >
                      {highlight.type}
                    </Chip>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-default-600">Player:</span>
                    <span className="font-medium">
                      {highlight.primary_player?.display_name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-default-600">Team:</span>
                    <span className="font-medium">
                      {highlight.primary_player?.team || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-default-600">Weapon:</span>
                    <span className="font-medium">
                      {highlight.weapon || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-default-600">Kills:</span>
                    <span className="font-medium">
                      {highlight.kill_count || 1}
                    </span>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-[#34445C] dark:text-[#F5F0E1]">
                    Match Context
                  </h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-default-600">Map:</span>
                    <span className="font-medium">
                      {highlight.map_name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-default-600">Round:</span>
                    <span className="font-medium">
                      {highlight.round_number || "?"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-default-600">Time:</span>
                    <span className="font-medium">
                      {formatDuration(highlight.event_time)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-default-600">Game:</span>
                    <span className="font-medium">
                      {highlight.game_id?.toUpperCase() || "CS2"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-default-600">Views:</span>
                    <span className="font-medium">
                      {highlight.views_count || 0}
                    </span>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <Button
                color="primary"
                variant="flat"
                startContent={<Icon icon="solar:arrow-left-bold" />}
                onClick={() => router.push("/highlights")}
              >
                Back to Highlights
              </Button>
              <Button
                color="primary"
                variant="flat"
                startContent={<Icon icon="solar:share-bold" />}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${highlight.type} by ${highlight.primary_player?.display_name}`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
              >
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
