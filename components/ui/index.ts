/**
 * UI Components Index
 * Centralized exports for all UI components
 */

// Animated Elements
export { AnimatedCounter } from "./animated-counter";
export { SuccessConfetti } from "./success-confetti";

// Game-specific
export { GameLogo, GameLogoGrid } from "./game-logo";
export type { GameLogoSize, GameLogoVariant } from "./game-logo";
export { GameSelect, GameChip, GameBanner, GameIcon } from "./game-select";

// Buttons
export { EsportsButton } from "./esports-button";

// Loading States
export { Skeleton } from "./skeleton-loader";
export {
  EsportsSkeleton,
  EsportsSpinner,
  PageLoadingState,
  ReplayCardSkeleton,
  MatchCardSkeleton,
  StatsGridSkeleton,
  ChartSkeleton,
  TableSkeleton,
  ShimmerOverlay,
  ProcessingIndicator,
} from "./loading-states";

// Empty States
export {
  EmptyState,
  NoMatchesFound,
  NoReplaysFound,
  NoPlayerStats,
  ReplayProcessing,
  ErrorState,
  ComingSoon,
} from "./empty-states";

// Stat Displays
export {
  StatBadge,
  KDADisplay,
  RatingDisplay,
  ScoreDisplay,
  ProgressStat,
  EsportsStatCard,
  MiniStat,
  SideIndicator,
} from "./stat-displays";

// Mobile Navigation & Layout
export {
  MobileNavigation,
  MobileHeader,
  FloatingActionButton,
} from "./mobile-navigation";
export type { NavItem } from "./mobile-navigation";

export { BottomSheet, BottomSheetMenu } from "./bottom-sheet";

export { SwipeableTabs, PillTabs } from "./swipeable-tabs";

export {
  ResponsiveLayout,
  MobilePageWrapper,
  ResponsiveContainer,
  ResponsiveGrid,
  MobileSection,
} from "./responsive-layout";
