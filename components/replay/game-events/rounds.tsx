"use client";

import React from "react";
import { Accordion, AccordionItem, Avatar, Card, Chip, Popover, PopoverContent, PopoverTrigger, Progress, Skeleton, Spacer } from "@nextui-org/react";
import { logo } from '@/components/primitives';
import SearchEvent from './search-event';
import BreadcrumbEvents from '@/components/replay/game-events/breadcrumb';
import ViewPlayerInfoCard from '@/components/replay/game-events/playercard/view-player-info-card';

export interface PlayerData {
  id: string;
  name: string;
  team: "T" | "CT";
  health?: number;
}

export interface KillEvent {
  id: string;
  killer: PlayerData;
  victim: PlayerData;
  weapon?: string;
  isHeadshot?: boolean;
}

export interface RoundEvent {
  id: string;
  type: "kill" | "clutch_start" | "clutch_progress" | "clutch_won" | "round_end";
  description?: string;
  players?: PlayerData[];
  killEvent?: KillEvent;
  clutchPlayer?: PlayerData;
  winningTeam?: "T" | "CT";
}

export interface RoundData {
  id: string;
  number: number;
  winner: "T" | "CT";
  mvpPlayer?: PlayerData;
  isPistol?: boolean;
  isClutch?: boolean;
  events: RoundEvent[];
  isLocked?: boolean;
  lockedMessage?: string;
}

export interface RoundsData {
  rounds: RoundData[];
}

interface RoundsProps {
  data?: RoundsData;
  isLoading?: boolean;
  onEventClick?: (roundId: string, eventId: string) => void;
  onPlayerClick?: (playerId: string) => void;
}

export default function Rounds({
  data,
  isLoading = false,
  onEventClick,
  onPlayerClick,
}: RoundsProps) {
  if (isLoading) {
    return (
      <div>
        <div className="">
          <BreadcrumbEvents />
          <SearchEvent />
          <Spacer y={10} />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-32 rounded-lg" />
                  <Skeleton className="h-4 w-48 rounded-lg" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.rounds.length === 0) {
    return (
      <div>
        <div className="">
          <BreadcrumbEvents />
          <SearchEvent />
          <Spacer y={10} />
        </div>
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-default-500">No round data available</p>
            <p className="text-small text-default-400">Upload a replay file to see round details</p>
          </div>
        </Card>
      </div>
    );
  }

  const getTeamColor = (team: "T" | "CT") => team === "T" ? "warning" : "primary";
  const getTeamTextClass = (team: "T" | "CT") => team === "T" ? "text-warning" : "text-primary";

  const renderRoundEvents = (round: RoundData) => {
    if (!round.events || round.events.length === 0) return null;

    return (
      <Accordion selectionMode="multiple">
        {round.events.map((event, index) => {
          if (event.type === "kill" && event.killEvent) {
            const { killer, victim } = event.killEvent;
            return (
              <AccordionItem
                key={event.id}
                aria-label={`Event ${index + 1}`}
                subtitle={<div></div>}
                title={
                  <div>
                    <span className={`${getTeamTextClass(killer.team)} ml-1`}>{killer.name}</span> defeated{" "}
                    <span className={`${getTeamTextClass(victim.team)} ml-1`}>{victim.name}</span>
                    {event.killEvent.weapon && <Chip size="sm" className="ml-2">{event.killEvent.weapon}</Chip>}
                    {event.killEvent.isHeadshot && <Chip size="sm" color="danger" className="ml-1">HS</Chip>}
                  </div>
                }
              >
                <Card isBlurred>
                  {killer.health !== undefined && (
                    <Progress
                      size="sm"
                      radius="sm"
                      classNames={{
                        base: "max-w-md",
                        track: "drop-shadow-md border border-default",
                        indicator: killer.health > 50
                          ? "bg-gradient-to-r from-green-500 to-lime-500"
                          : killer.health > 25
                            ? "bg-gradient-to-r from-orange-500 to-yellow-500"
                            : "bg-gradient-to-r from-red-500 to-orange-500",
                        label: "tracking-wider font-medium text-default-600",
                        value: "text-foreground/60",
                      }}
                      label={`Health: ${killer.health}`}
                      value={killer.health}
                      showValueLabel={false}
                    />
                  )}
                  {event.clutchPlayer && (
                    <>
                      <Spacer y={4} />
                      <Chip color="danger" variant="dot">
                        <span className={`${getTeamTextClass(event.clutchPlayer.team)} ml-1`}>{event.clutchPlayer.name}</span>
                        {" "}in <span className="text-danger">Clutch Situation</span>
                      </Chip>
                    </>
                  )}
                </Card>
              </AccordionItem>
            );
          }

          if (event.type === "round_end" && event.winningTeam) {
            const winningTeamName = round.events.find(e => e.clutchPlayer)?.clutchPlayer?.name;
            return (
              <AccordionItem
                key={event.id}
                aria-label={`Round End`}
                startContent={
                  <Avatar
                    isBordered
                    color={getTeamColor(event.winningTeam)}
                    radius="lg"
                    showFallback
                    name={event.winningTeam}
                  />
                }
                subtitle=""
                title={
                  <div>
                    <span className={logo({ color: event.winningTeam === "CT" ? "blue" : "yellow" })}>
                      {event.winningTeam === "CT" ? "Counter-Terrorists" : "Terrorists"} Win
                    </span>
                  </div>
                }
              >
                {winningTeamName && (
                  <Card isBlurred>
                    <Chip color="danger" variant="dot">
                      <Popover showArrow placement="bottom">
                        <PopoverTrigger>
                          <span className="text-primary ml-1 cursor-pointer">{winningTeamName}</span>
                        </PopoverTrigger>
                        <PopoverContent className="p-1">
                          <ViewPlayerInfoCard />
                        </PopoverContent>
                      </Popover>
                      <span className="text-success"> Clutch Won!</span>
                    </Chip>
                  </Card>
                )}
              </AccordionItem>
            );
          }

          return null;
        })}
      </Accordion>
    );
  };

  return (
    <div>
      <div className="">
        <BreadcrumbEvents />
        <SearchEvent />
        <Spacer y={10} />
      </div>
      <Accordion
        selectionMode="single"
        disabledKeys={data.rounds.filter(r => r.isLocked).map(r => r.id)}
        variant="shadow"
      >
        {data.rounds.map((round) => (
          <AccordionItem
            key={round.id}
            aria-label={`Round #${round.number}`}
            startContent={
              <Avatar
                isBordered
                color={getTeamColor(round.winner)}
                radius="lg"
                showFallback
                name={round.winner}
              />
            }
            subtitle={
              round.isLocked
                ? round.lockedMessage
                : round.mvpPlayer
                  ? `${round.mvpPlayer.name} is the MVP`
                  : `${round.winner === "T" ? "Terrorists" : "Counter-Terrorists"} win`
            }
            title={
              <div>
                Round #{round.number}
                {round.isPistol && (
                  <Chip variant="bordered" isDisabled className="ml-2">Pistol</Chip>
                )}
                {round.isClutch && (
                  <Chip color="danger" variant="dot" className="ml-2">Clutch</Chip>
                )}
                {round.isLocked && (
                  <>
                    <Spacer x={4} />
                    <Chip
                      variant="shadow"
                      classNames={{
                        base: "bg-gradient-to-br from-indigo-500 to-pink-500 border-small border-white/50 shadow-pink-500/30",
                        content: "drop-shadow shadow-black text-white",
                      }}
                    >
                      {round.lockedMessage || "Sign in to view details"}
                    </Chip>
                  </>
                )}
              </div>
            }
          >
            {renderRoundEvents(round)}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
