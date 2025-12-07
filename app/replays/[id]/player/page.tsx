"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { ReplayAPISDK } from "@/types/replay-api/sdk";
import { ReplayApiSettingsMock } from "@/types/replay-api/settings";
import { logger } from "@/lib/logger";
import { Card, CardBody, Button, Chip, Spinner, Slider, Tabs, Tab, Avatar } from "@nextui-org/react";
import { MatchKillEvent, ScoreboardPlayer } from "@/types/replay-api/match-analytics.sdk";

interface ReplayMeta {
  id: string;
  gameId: string;
  matchId?: string;
  status: string;
  createdAt: string;
  size?: number;
}

interface KillEvent {
  tick: number;
  killer: string;
  victim: string;
  weapon: string;
  headshot?: boolean;
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
  const [totalTicks, setTotalTicks] = useState<number>(6000);
  const [killfeed, setKillfeed] = useState<KillEvent[]>([]);
  const [scoreboard, setScoreboard] = useState<ScoreboardPlayer[]>([]);
  const [team1Score, setTeam1Score] = useState<number>(0);
  const [team2Score, setTeam2Score] = useState<number>(0);
  const [eventsLoaded, setEventsLoaded] = useState<boolean>(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [totalRounds, setTotalRounds] = useState<number>(0);
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
      // Fetch replay metadata
      const all = await sdkRef.current!.replayFiles.searchReplayFiles({ id: replayId });
      const found = Array.isArray(all) ? all.find(r => r.id === replayId) : null;
      if (!found) {
        setError("Replay not found");
        return;
      }

      const replayMeta: ReplayMeta = {
        id: found.id,
        gameId: found.gameId,
        matchId: found.matchId,
        status: found.status,
        createdAt: new Date(found.createdAt).toISOString(),
        size: found.size,
      };
      setMeta(replayMeta);

      // Fetch events, scoreboard, and timeline using replay-specific endpoints
      if (found.gameId && found.id) {
        try {
          // Fetch replay events (kills, rounds, etc.)
          const eventsData = await sdkRef.current!.replayFiles.getReplayEvents(found.gameId, found.id);
          if (eventsData && eventsData.events) {
            // Transform events to local format
            const kills: KillEvent[] = eventsData.events
              .filter((e: any) => e.Type === 'kill' || e.type === 'kill')
              .map((k: any) => ({
                tick: k.TickID || k.tick || 0,
                killer: k.killer_name || k.killer || 'Unknown',
                victim: k.victim_name || k.victim || 'Unknown',
                weapon: k.weapon || 'Unknown',
                headshot: k.headshot || false,
              }));
            setKillfeed(kills);
            setTotalTicks(eventsData.total_events || 6000);
            setEventsLoaded(true);
          }

          // Fetch replay scoreboard
          const scoreboardData = await sdkRef.current!.replayFiles.getReplayScoreboard(found.gameId, found.id);
          if (scoreboardData && scoreboardData.teams) {
            // Extract players from team scoreboards
            const allPlayers: ScoreboardPlayer[] = [];
            scoreboardData.teams.forEach((team: any, teamIdx: number) => {
              if (team.Players) {
                team.Players.forEach((p: any) => {
                  allPlayers.push({
                    player_id: p.ID || p.id || `player-${teamIdx}`,
                    player_name: p.Nickname || p.nickname || p.Name || 'Unknown',
                    team: teamIdx === 0 ? 'CT' : 'T',
                    kills: p.Kills || p.kills || 0,
                    deaths: p.Deaths || p.deaths || 0,
                    assists: p.Assists || p.assists || 0,
                    adr: p.ADR || p.adr || 0,
                  });
                });
              }
            });
            setScoreboard(allPlayers);
            if (scoreboardData.teams.length >= 2) {
              setTeam1Score(scoreboardData.teams[0]?.TeamScore || 0);
              setTeam2Score(scoreboardData.teams[1]?.TeamScore || 0);
            }
          }

          // Fetch replay timeline
          const timelineData = await sdkRef.current!.replayFiles.getReplayTimeline(found.gameId, found.id);
          if (timelineData && timelineData.timeline) {
            setTimeline(timelineData.timeline);
            setTotalRounds(timelineData.total_rounds || 0);
          }
        } catch (eventsError) {
          // Events API may not be available for all replays - this is not a critical error
          logger.warn("Failed to load replay events", eventsError);
          setKillfeed([]);
          setTotalTicks(6000);
        }
      } else {
        // No game ID - events not available
        setKillfeed([]);
        setTotalTicks(6000);
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
            {/* Scoreboard */}
            <Card>
              <CardBody>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold">Scoreboard</h2>
                  {scoreboard.length > 0 && (
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <span className="text-blue-400">{team1Score}</span>
                      <span className="text-default-400">:</span>
                      <span className="text-orange-400">{team2Score}</span>
                    </div>
                  )}
                </div>
                {scoreboard.length === 0 ? (
                  <p className="text-xs text-default-500">
                    {eventsLoaded ? "No player stats available." : "Loading scoreboard..."}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-default-400 border-b border-divider">
                          <th className="text-left py-1 px-1">Player</th>
                          <th className="text-center px-1">K</th>
                          <th className="text-center px-1">D</th>
                          <th className="text-center px-1">A</th>
                          <th className="text-center px-1">ADR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scoreboard.map((player, idx) => (
                          <tr key={player.player_id || idx} className="border-b border-divider/50 last:border-0">
                            <td className="py-1.5 px-1">
                              <div className="flex items-center gap-1.5">
                                <Avatar size="sm" name={player.player_name?.charAt(0) || '?'} className="w-5 h-5 text-tiny" />
                                <span className={`font-medium ${player.team === 'CT' ? 'text-blue-400' : player.team === 'T' ? 'text-orange-400' : ''}`}>
                                  {player.player_name || player.player_id}
                                </span>
                              </div>
                            </td>
                            <td className="text-center px-1 text-success">{player.kills}</td>
                            <td className="text-center px-1 text-danger">{player.deaths}</td>
                            <td className="text-center px-1 text-default-400">{player.assists}</td>
                            <td className="text-center px-1">{player.adr?.toFixed(0) || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                    {timeline.length === 0 ? (
                      <p className="text-xs text-default-500">No timeline data available.</p>
                    ) : (
                      <>
                        <p className="text-xs text-default-400 mb-2">Total Rounds: {totalRounds}</p>
                        {timeline.map((round, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-default-50 rounded px-2 py-1.5">
                            <span className="font-medium">Round {round.round}</span>
                            <span className={`font-medium ${round.team === 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                              {round.team_name || (round.team === 0 ? 'CT' : 'T')}
                            </span>
                            <Chip size="sm" variant="flat" color={round.winner ? 'success' : 'default'}>
                              {round.type}
                            </Chip>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </div>
        </div>
      )}
    </div>
  );
}
