/**
 * Teams Components Exports
 */

// Existing components
export { SquadCreationModal } from "./squad-creation-modal";
export { default as UserAutocomplete } from "./user-autocomplete";

// Team statistics
export {
  TeamStatsDashboard,
  createSampleTeamStats,
  type TeamStatsDashboardProps,
  type TeamStats,
  type TeamMemberStats,
} from "./team-stats-dashboard";

// Scrim Scheduler
export {
  ScrimScheduler,
  type ScrimRequest,
  type ScrimStatus,
  type ScrimType,
  type ScrimSchedulerProps,
} from "./scrim-scheduler";

// Opponent Research
export {
  OpponentResearch,
  OpponentQuickView,
  OpponentComparisonCard,
} from "./opponent-research";

// Team Branding
export {
  TeamBranding,
  TeamLogoUploader,
  TeamColorBadge,
} from "./team-branding";
