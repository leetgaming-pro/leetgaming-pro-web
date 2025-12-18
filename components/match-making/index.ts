/**
 * Match-Making Components Index
 * Exports for the matchmaking wizard and related components
 */

// Main wizard
export { default as MatchmakingWizard } from "./App";

// Wizard context
export { WizardProvider, useWizard, type WizardState } from "./wizard-context";

// Step forms
export { default as ChooseRegionForm } from "./choose-region-form";
export { default as GameModeForm } from "./game-mode-form";
export { default as SquadForm } from "./squad-form";
export { default as ScheduleInformationForm } from "./schedule-information-form";
export { PrizeDistributionSelector } from "./prize-distribution-selector";
export { default as ReviewConfirmForm } from "./review-confirm-form";

// UI Components
export { ButtonWithBorderGradient } from "./button-with-border-gradient";
export { MatchRewardsPreview } from "./match-rewards-preview";
export { default as MultistepNavigationButtons } from "./multistep-navigation-buttons";
export { default as MultistepSidebar } from "./multistep-sidebar";
export { PrizePoolCard } from "./prize-pool-card";
export { default as RowSteps } from "./row-steps";
export { default as SupportCard } from "./support-card";
export { default as VerticalSteps } from "./vertical-steps";

// Data exports
export {
  default as companyIndustries,
  type CompanyIndustryProps,
} from "./company-industries";
export {
  default as companyTypes,
  type CompanyTypeProps,
} from "./company-types";
export { default as countries, type countryProp } from "./countries";
export { default as usStates, type StateProps } from "./states";
