/**
 * Tournament Check-in Types
 * Per PRD E.3 - Tournament System
 */

import type { GameId } from "./games";

// Tournament status types
export type TournamentStatus =
  | "upcoming"
  | "registration-open"
  | "registration-closed"
  | "check-in-open"
  | "in-progress"
  | "bracket-stage"
  | "finals"
  | "completed"
  | "cancelled";

// Participant check-in status
export type CheckInStatus =
  | "not-started" // Check-in not yet open
  | "pending" // Check-in open, waiting for player
  | "checked-in" // Player has checked in
  | "missed" // Player missed check-in window
  | "substituted"; // Player was replaced by substitute

// Team check-in status
export type TeamCheckInStatus =
  | "not-started"
  | "partial" // Some members checked in
  | "complete" // All members checked in
  | "incomplete" // Check-in ended, missing members
  | "disqualified"; // Team disqualified for missing check-in

// Tournament format types
export type TournamentFormat =
  | "single-elimination"
  | "double-elimination"
  | "round-robin"
  | "swiss"
  | "ladder";

// Tournament tier/level
export type TournamentTier =
  | "open"
  | "amateur"
  | "semi-pro"
  | "professional"
  | "premier";

// Tournament participant
export interface TournamentParticipant {
  id: string;
  playerId: string;
  playerName: string;
  playerAvatar?: string;
  teamId?: string;
  teamName?: string;
  teamLogo?: string;
  role?: string; // Team role (captain, player, substitute)

  // Check-in data
  checkInStatus: CheckInStatus;
  checkInTime?: string;
  lastActivityTime?: string;

  // Match readiness
  isReady: boolean;
  readyTime?: string;

  // Connection status
  isOnline: boolean;
  lastOnline?: string;
}

// Team in tournament
export interface TournamentTeam {
  id: string;
  name: string;
  tag: string; // Short tag (3-5 chars)
  logo?: string;

  // Members
  captain: TournamentParticipant;
  players: TournamentParticipant[];
  substitutes: TournamentParticipant[];

  // Check-in
  checkInStatus: TeamCheckInStatus;
  checkedInCount: number;
  requiredCount: number;

  // Seeding
  seed?: number;
  rating?: number;
}

// Check-in window
export interface CheckInWindow {
  opensAt: string;
  closesAt: string;
  durationMinutes: number;

  // Grace period after close
  gracePeriodMinutes?: number;

  // Current state
  isOpen: boolean;
  timeRemaining?: number; // Seconds
}

// Tournament match
export interface TournamentMatch {
  id: string;
  tournamentId: string;
  roundNumber: number;
  matchNumber: number;

  // Teams/Players
  team1?: TournamentTeam | TournamentParticipant;
  team2?: TournamentTeam | TournamentParticipant;

  // Match details
  gameId: GameId;
  mapPool?: string[];
  selectedMap?: string;
  bestOf: 1 | 3 | 5;

  // Scheduling
  scheduledTime?: string;
  startTime?: string;
  endTime?: string;

  // Check-in
  checkInWindow?: CheckInWindow;
  team1CheckedIn: boolean;
  team2CheckedIn: boolean;

  // Results
  status: "pending" | "ready" | "in-progress" | "completed" | "cancelled";
  winnerId?: string;
  score?: {
    team1: number;
    team2: number;
  };

  // Stream/VOD
  streamUrl?: string;
  vodUrl?: string;
}

// Tournament summary for check-in UI
export interface TournamentCheckInInfo {
  id: string;
  name: string;
  gameId: GameId;
  format: TournamentFormat;
  tier: TournamentTier;

  // Status
  status: TournamentStatus;

  // Timing
  startTime: string;
  checkInWindow: CheckInWindow;

  // Participation
  isRegistered: boolean;
  userTeamId?: string;
  userParticipant?: TournamentParticipant;
  userTeam?: TournamentTeam;

  // Next match
  nextMatch?: TournamentMatch;

  // Prize info
  prizePool?: number;
  currency?: string;
}

// Real-time check-in update
export interface CheckInUpdate {
  type:
    | "player-checked-in"
    | "player-missed"
    | "team-complete"
    | "window-closing"
    | "match-ready";
  tournamentId: string;
  matchId?: string;
  participantId?: string;
  teamId?: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

// Check-in action result
export interface CheckInResult {
  success: boolean;
  status: CheckInStatus;
  message?: string;
  checkInTime?: string;

  // If team check-in
  teamStatus?: TeamCheckInStatus;
  teamCheckedInCount?: number;

  // Errors
  error?: {
    code: string;
    message: string;
  };
}

// Helper functions
export function getCheckInStatusLabel(status: CheckInStatus): string {
  const labels: Record<CheckInStatus, string> = {
    "not-started": "Not Started",
    pending: "Pending",
    "checked-in": "Checked In",
    missed: "Missed",
    substituted: "Substituted",
  };
  return labels[status];
}

export function getTeamCheckInStatusLabel(status: TeamCheckInStatus): string {
  const labels: Record<TeamCheckInStatus, string> = {
    "not-started": "Not Started",
    partial: "Partial",
    complete: "Complete",
    incomplete: "Incomplete",
    disqualified: "Disqualified",
  };
  return labels[status];
}

export function getTournamentStatusLabel(status: TournamentStatus): string {
  const labels: Record<TournamentStatus, string> = {
    upcoming: "Upcoming",
    "registration-open": "Registration Open",
    "registration-closed": "Registration Closed",
    "check-in-open": "Check-In Open",
    "in-progress": "In Progress",
    "bracket-stage": "Bracket Stage",
    finals: "Finals",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status];
}

export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function getCheckInProgress(team: TournamentTeam): number {
  if (team.requiredCount === 0) return 0;
  return Math.round((team.checkedInCount / team.requiredCount) * 100);
}

// Constants
export const CHECK_IN_WARNING_THRESHOLD = 300; // 5 minutes in seconds
export const CHECK_IN_CRITICAL_THRESHOLD = 60; // 1 minute in seconds
