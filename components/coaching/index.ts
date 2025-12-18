/**
 * Coaching Components Index
 * Per PRD D.4.3 and E.7 - Coaching Marketplace
 */

// Main components
export { CoachCard, CoachGrid } from "./coach-card";
export { CoachDirectory, FeaturedCoaches } from "./coach-directory";
export { BookingCalendar, MiniCalendar } from "./booking-calendar";
export { SessionBookingModal } from "./session-booking-modal";
export { CoachMessaging, MessagePreview } from "./coach-messaging";
export { SessionVideoReview, MarkerTimeline } from "./session-video-review";
export {
  StarRating,
  RatingsSummaryCard,
  ReviewsList,
  RatingBadge,
} from "./reviews-ratings";

// Re-export types
export type {
  Coach,
  CoachExpertise,
  CoachAchievement,
  CoachAvailability,
  CoachPricing,
  CoachReview,
  CoachStats,
  CoachingSession,
  TimeSlot,
  BookingRequest,
  BookingConfirmation,
  CoachFilters,
  CoachSearchResult,
  CoachApplication,
  CoachingMessage,
  Conversation,
  SessionType,
  SessionStatus,
  CoachStatus,
  SkillLevel,
} from "@/types/coaching";

// Re-export utilities
export {
  formatCoachPrice,
  getSessionTypeLabel,
  calculatePlatformFee,
  calculateCoachEarnings,
  formatDuration,
  isCoachOnline,
  getCoachStatusColor,
  SESSION_TYPE_LABELS,
  SESSION_DURATIONS,
  COACHING_PLATFORM_FEE,
  MIN_SESSION_PRICE,
  MAX_SESSION_PRICE,
  CANCELLATION_DEADLINE_HOURS,
  PAYOUT_DELAY_DAYS,
} from "@/types/coaching";
