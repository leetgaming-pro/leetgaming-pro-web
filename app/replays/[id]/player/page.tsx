"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";
import { Card, CardBody, Button, Chip, Spinner, Slider, Tabs, Tab } from "@nextui-org/react";

interface ReplayMeta {
  id: string;
  gameId: string;
  status: string;
  createdAt: string;
  size?: number;
}

interface KillEvent {
  tick: number;
  killer: string;
  victim: string;
  weapon: string;
}

export default function ReplayPlayerPage() {
  const params = useParams();
  const replayId = params?.id as string | undefined;
  const sdkRef = useRef<ReplayAPISDK>();

  const [meta, setMeta] = useState<ReplayMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState<boolean>(false);
  const [currentTick, setCurrentTick] = useState<number>(0);
  const [totalTicks, setTotalTicks] = useState<number>(6000); // placeholder until real metadata (e.g. 10 min @ 10 ticks/sec)
  const [killfeed, setKillfeed] = useState<KillEvent[]>([]);
  const animationRef = useRef<number>();

  // Initialize SDK once
  if (!sdkRef.current) {
    sdkRef.current = new ReplayAPISDK(ReplayApiSettingsMock, logger);
  }

  const fetchReplay = useCallback(async () => {
    if (!replayId) return;
    setLoading(true);
    setError(null);
    try {
      // Placeholder: real endpoint should expose single replay metadata
      const all = await sdkRef.current!.replayFiles.searchReplayFiles({ id: replayId });
      const found = Array.isArray(all) ? all.find(r => r.id === replayId) : null;
      if (!found) {
        setError("Replay not found");
      } else {
        setMeta({
          id: found.id,
          gameId: found.gameId,
          status: found.status,
          createdAt: new Date(found.createdAt).toISOString(),
          size: found.size,
        });
        // Events endpoint not yet implemented; keep empty killfeed until backend provides data
        setKillfeed([]);
        setTotalTicks(0);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to load replay";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [replayId]);

  useEffect(() => {
    fetchReplay();
  }, [fetchReplay]);

  const stepPlayback = useCallback(() => {
    setCurrentTick(prev => {
      const next = prev + 10; // advance 10 ticks per frame step (approx 0.16s at 60fps)
      if (next >= totalTicks) {
        setPlaying(false);
        return totalTicks;
      }
      return next;
    });
    if (playing) {
      animationRef.current = requestAnimationFrame(stepPlayback);
    }
  }, [playing, totalTicks]);

  useEffect(() => {
    if (playing) {
      animationRef.current = requestAnimationFrame(stepPlayback);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [playing, stepPlayback]);

  const togglePlay = () => setPlaying(p => !p);
  const handleSeek = (val: number | number[]) => {
    const v = Array.isArray(val) ? val[0] : val;
    setCurrentTick(v);
  };

  const currentKills = killfeed.filter(k => k.tick <= currentTick).slice(-8).reverse();

  return (
    <div className="px-4 py-6 max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Replay Player</h1>
      {loading && (
        <div className="flex items-center gap-3"><Spinner /> <span>Loading replay...</span></div>
      )}
      {error && (
        <Card className="mb-6"><CardBody className="text-danger">{error}</CardBody></Card>
      )}
      {meta && !loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player & Timeline */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardBody>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Chip size="sm" color="primary" variant="flat">{meta.gameId.toUpperCase()}</Chip>
                    <Chip size="sm" color={meta.status === "Completed" || meta.status === "Ready" ? "success" : meta.status === "Failed" ? "danger" : "warning"}>{meta.status}</Chip>
                  </div>
                  <span className="text-xs text-default-400">Created {new Date(meta.createdAt).toLocaleString()}</span>
                </div>
                {/* Playback surface placeholder */}
                <div className="relative w-full h-[420px] rounded-medium bg-default-100 flex items-center justify-center text-default-500">
                  <span className="text-sm">Playback canvas (minimap / POV / overlay)</span>
                </div>
                {/* Controls */}
                <div className="mt-4 flex items-center gap-4">
                  <Button size="sm" onPress={togglePlay} color={playing ? "danger" : "primary"}>
                    {playing ? "Pause" : "Play"}
                  </Button>
                  <Button size="sm" onPress={() => setCurrentTick(Math.max(0, currentTick - 200))} variant="flat">-10s</Button>
                  <Button size="sm" onPress={() => setCurrentTick(Math.min(totalTicks, currentTick + 200))} variant="flat">+10s</Button>
                  <div className="flex-1">
                    <Slider
                      aria-label="Timeline"
                      size="sm"
                      step={10}
                      maxValue={totalTicks}
                      value={currentTick}
                      onChange={handleSeek}
                      className="max-w-full"
                    />
                  </div>
                  <span className="text-xs w-24 text-right">{currentTick} / {totalTicks}</span>
                </div>
              </CardBody>
            </Card>
            {/* Scoreboard will populate from future stats/events API */}
            <Card>
              <CardBody>
                <h2 className="text-sm font-semibold mb-2">Scoreboard</h2>
                <p className="text-xs text-default-500">No player stats available.</p>
              </CardBody>
            </Card>
          </div>
          {/* Side Panels */}
            <div className="space-y-4">
              <Tabs aria-label="Replay Panels" size="sm" radius="md" variant="bordered" className="w-full">
                <Tab key="killfeed" title="Killfeed">
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                    {currentKills.length === 0 && (
                        <p className="text-xs text-default-400">No kill events.</p>
                      )}
                    {currentKills.map((k, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-default-50 rounded px-2 py-1">
                        <span className="font-medium">{k.killer}</span>
                        <span className="text-default-400">▶</span>
                        <span>{k.victim}</span>
                        <span className="text-default-500">{k.weapon}</span>
                        <span className="text-default-400">t:{k.tick}</span>
                      </div>
                    ))}
                  </div>
                </Tab>
                <Tab key="info" title="Info">
                  <div className="text-xs space-y-2">
                    <p><strong>ID:</strong> {meta.id}</p>
                    <p><strong>Game:</strong> {meta.gameId}</p>
                    <p><strong>Status:</strong> {meta.status}</p>
                    <p><strong>Created:</strong> {new Date(meta.createdAt).toLocaleString()}</p>
                    {meta.size && <p><strong>Size:</strong> {(meta.size / 1024 / 1024).toFixed(2)} MB</p>}
                  </div>
                </Tab>
                <Tab key="timeline" title="Timeline">
                  <div className="text-xs text-default-500">Future: rounds, economy, objective events.</div>
                </Tab>
              </Tabs>
            </div>
        </div>
      )}
    </div>
  );
}
