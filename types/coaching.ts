/**
 * Coaching System Types
 * Per PRD Appendix D.4.3 and E.7 - Coaching Marketplace
 */

import type { GameId } from "./games";

// Coach skill levels and expertise
export type SkillLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "professional";
export type CoachStatus = "available" | "busy" | "offline" | "on-session";
export type SessionType = "1on1" | "vod-review" | "team-coaching" | "bootcamp";
export type SessionStatus =
  | "scheduled"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "no-show";

// Coach Profile Types
export interface CoachExpertise {
  gameId: GameId;
  roles: string[]; // e.g., ['IGL', 'AWPer', 'Entry Fragger']
  rankAchieved: string; // e.g., 'Global Elite', 'Radiant'
  yearsPlaying: number;
  yearsCoaching: number;
  specialties: string[]; // e.g., ['Aim Training', 'Game Sense', 'Communication']
}

export interface CoachAchievement {
  id: string;
  title: string;
  description: string;
  type: "tournament" | "team" | "individual" | "certification";
  date: string;
  verified: boolean;
  icon?: string;
  link?: string;
}

export interface CoachAvailability {
  dayOfWeek: number; // 0-6, Sunday = 0
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timezone: string; // IANA timezone
}

export interface CoachPricing {
  sessionType: SessionType;
  durationMinutes: number;
  priceUsd: number;
  currency?: string;
  discountedPrice?: number;
  packageDiscount?: number; // % discount for package deals
}

export interface CoachReview {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  rating: number; // 1-5
  review: string;
  gameId: GameId;
  sessionType: SessionType;
  createdAt: string;
  verifiedPurchase: boolean;
  coachResponse?: string;
  helpful: number;
  reported: boolean;
}

export interface CoachStats {
  totalSessions: number;
  totalStudents: number;
  avgRating: number;
  totalReviews: number;
  responseRate: number; // % of inquiries responded to
  responseTime: number; // avg minutes to respond
  completionRate: number; // % of sessions completed
  repeatStudentRate: number; // % of students who book again
  hoursCoached: number;
  earnings: {
    totalUsd: number;
    thisMonthUsd: number;
    pendingUsd: number;
  };
}

export interface Coach {
  id: string;
  userId: string;
  displayName: string;
  tagline: string; // Short bio/headline
  bio: string; // Full bio
  avatar: string;
  banner?: string;
  country: string;
  languages: string[];
  timezone: string;

  // Gaming credentials
  expertise: CoachExpertise[];
  achievements: CoachAchievement[];

  // Coaching settings
  pricing: CoachPricing[];
  availability: CoachAvailability[];
  status: CoachStatus;
  acceptingStudents: boolean;

  // Stats and social proof
  stats: CoachStats;
  reviews: CoachReview[];
  featuredReview?: CoachReview;

  // Social links
  socialLinks: {
    twitch?: string;
    youtube?: string;
    twitter?: string;
    discord?: string;
    website?: string;
  };

  // Verification
  verified: boolean;
  identityVerified: boolean;
  proVerified: boolean; // Verified pro player
  stripeConnected: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastActive: string;
}

// Session Types
export interface CoachingSession {
  id: string;
  coachId: string;
  studentId: string;

  // Session details
  type: SessionType;
  gameId: GameId;
  topic: string;
  description?: string;

  // Scheduling
  scheduledAt: string;
  durationMinutes: number;
  endedAt?: string;
  timezone: string;

  // Financials
  priceUsd: number;
  platformFeeUsd: number;
  coachEarningsUsd: number;
  paymentStatus: "pending" | "paid" | "refunded" | "disputed";
  transactionId?: string;

  // Status
  status: SessionStatus;
  cancelledBy?: "coach" | "student" | "system";
  cancellationReason?: string;

  // Communication
  meetingLink?: string;
  chatEnabled: boolean;
  recordingUrl?: string;

  // Review
  reviewId?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Booking Flow Types
export interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  available: boolean;
  price?: number;
}

export interface BookingRequest {
  coachId: string;
  sessionType: SessionType;
  gameId: GameId;
  date: string;
  startTime: string;
  durationMinutes: number;
  timezone: string;
  topic: string;
  description?: string;
  promoCode?: string;
}

export interface BookingConfirmation {
  sessionId: string;
  coach: {
    id: string;
    displayName: string;
    avatar: string;
  };
  scheduledAt: string;
  durationMinutes: number;
  type: SessionType;
  gameId: GameId;
  topic: string;
  totalPaid: number;
  meetingLink?: string;
  calendarLink: string;
}

// Search and Filter Types
export interface CoachFilters {
  games?: GameId[];
  sessionTypes?: SessionType[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number; // minimum rating
  languages?: string[];
  availability?: {
    dayOfWeek?: number;
    timeRange?: {
      start: string;
      end: string;
    };
    timezone?: string;
  };
  sortBy?:
    | "rating"
    | "price-low"
    | "price-high"
    | "sessions"
    | "response-time"
    | "newest";
  verified?: boolean;
  proOnly?: boolean;
  acceptingStudents?: boolean;
}

export interface CoachSearchResult {
  coaches: Coach[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  filters: CoachFilters;
}

// Coach Application Types (for becoming a coach)
export interface CoachApplication {
  userId: string;

  // Basic info
  displayName: string;
  tagline: string;
  bio: string;

  // Gaming background
  expertise: CoachExpertise[];
  achievements: CoachAchievement[];
  proofLinks: string[]; // Links to profiles, VODs, etc.

  // Coaching plans
  proposedPricing: CoachPricing[];
  proposedAvailability: CoachAvailability[];

  // Requirements
  idVerificationComplete: boolean;
  stripeConnected: boolean;
  agreedToTerms: boolean;

  // Application status
  status: "pending" | "under-review" | "approved" | "rejected";
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;

  createdAt: string;
  updatedAt: string;
}

// Message Types for Coach-Student Communication
export interface CoachingMessage {
  id: string;
  sessionId?: string;
  senderId: string;
  senderType: "coach" | "student";
  recipientId: string;
  content: string;
  attachments?: {
    type: "image" | "video" | "file" | "replay";
    url: string;
    name: string;
    size?: number;
  }[];
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  coachId: string;
  studentId: string;
  lastMessage?: CoachingMessage;
  unreadCount: number;
  sessions: string[]; // session IDs
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface CoachingApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Platform Settings
export const COACHING_PLATFORM_FEE = 0.15; // 15% platform fee
export const MIN_SESSION_PRICE = 10; // $10 minimum
export const MAX_SESSION_PRICE = 500; // $500 maximum
export const CANCELLATION_DEADLINE_HOURS = 24; // 24 hour cancellation policy
export const PAYOUT_DELAY_DAYS = 7; // 7 days after session for payout

// Session Duration Options
export const SESSION_DURATIONS = [
  { minutes: 30, label: "30 minutes" },
  { minutes: 45, label: "45 minutes" },
  { minutes: 60, label: "1 hour" },
  { minutes: 90, label: "1.5 hours" },
  { minutes: 120, label: "2 hours" },
  { minutes: 180, label: "3 hours" },
] as const;

// Session Type Labels
export const SESSION_TYPE_LABELS: Record<
  SessionType,
  { label: string; description: string; icon: string }
> = {
  "1on1": {
    label: "1-on-1 Coaching",
    description:
      "Personal coaching session with live gameplay or replay review",
    icon: "solar:user-speak-bold",
  },
  "vod-review": {
    label: "VOD Review",
    description: "In-depth analysis of your recorded gameplay",
    icon: "solar:video-frame-play-bold",
  },
  "team-coaching": {
    label: "Team Coaching",
    description: "Group session for teams up to 5 players",
    icon: "solar:users-group-rounded-bold",
  },
  bootcamp: {
    label: "Bootcamp",
    description: "Intensive multi-day training program",
    icon: "solar:medal-star-bold",
  },
};

// Helper functions
export function formatCoachPrice(price: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function getSessionTypeLabel(type: SessionType): string {
  return SESSION_TYPE_LABELS[type]?.label || type;
}

export function calculatePlatformFee(price: number): number {
  return price * COACHING_PLATFORM_FEE;
}

export function calculateCoachEarnings(price: number): number {
  return price - calculatePlatformFee(price);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function isCoachOnline(
  lastActive: string,
  thresholdMinutes = 5
): boolean {
  const lastActiveDate = new Date(lastActive);
  const now = new Date();
  const diffMinutes = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60);
  return diffMinutes <= thresholdMinutes;
}

export function getCoachStatusColor(status: CoachStatus): string {
  switch (status) {
    case "available":
      return "success";
    case "busy":
      return "warning";
    case "on-session":
      return "primary";
    case "offline":
      return "default";
    default:
      return "default";
  }
}
