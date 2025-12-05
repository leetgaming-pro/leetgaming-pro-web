/**
 * Onboarding Types and Enums
 */

export enum OnboardingStep {
  WELCOME = 'welcome',
  PROFILE = 'profile',
  GAMING_PREFERENCES = 'gaming_preferences',
  CONNECT_ACCOUNTS = 'connect_accounts',
  SUBSCRIPTION = 'subscription',
  COMPLETE = 'complete',
}

export enum GameTitle {
  CS2 = 'cs2',
  CSGO = 'csgo',
  VALORANT = 'valorant',
  LOL = 'lol',
  DOTA2 = 'dota2',
  APEX = 'apex',
  FORTNITE = 'fortnite',
  OVERWATCH = 'overwatch',
}

export enum Region {
  NA_EAST = 'na_east',
  NA_WEST = 'na_west',
  EU_WEST = 'eu_west',
  EU_EAST = 'eu_east',
  SA = 'sa',
  ASIA = 'asia',
  OCE = 'oce',
}

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
  PROFESSIONAL = 'professional',
}

export enum PlayStyle {
  CASUAL = 'casual',
  COMPETITIVE = 'competitive',
  BOTH = 'both',
}

export interface OnboardingProfile {
  displayName: string;
  bio: string;
  avatarUrl?: string;
  country: string;
}

export interface GamingPreferences {
  games: GameTitle[];
  primaryGame: GameTitle | null;
  region: Region | null;
  skillLevel: SkillLevel | null;
  playStyle: PlayStyle | null;
  lookingForTeam: boolean;
}

export interface ConnectedAccounts {
  steam?: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  discord?: {
    id: string;
    username: string;
  };
  twitch?: {
    id: string;
    username: string;
  };
}

export interface OnboardingState {
  currentStep: OnboardingStep;
  profile: OnboardingProfile;
  gamingPreferences: GamingPreferences;
  connectedAccounts: ConnectedAccounts;
  selectedPlan: 'free' | 'pro' | 'team' | null;
  completedSteps: OnboardingStep[];
}

export const GAME_INFO: Record<GameTitle, { name: string; icon: string; color: string }> = {
  [GameTitle.CS2]: { name: 'Counter-Strike 2', icon: 'simple-icons:counterstrike', color: '#DE9B35' },
  [GameTitle.CSGO]: { name: 'CS:GO', icon: 'simple-icons:counterstrike', color: '#DE9B35' },
  [GameTitle.VALORANT]: { name: 'Valorant', icon: 'simple-icons:valorant', color: '#FF4655' },
  [GameTitle.LOL]: { name: 'League of Legends', icon: 'simple-icons:leagueoflegends', color: '#0AC8B9' },
  [GameTitle.DOTA2]: { name: 'Dota 2', icon: 'simple-icons:dota2', color: '#BE1E2D' },
  [GameTitle.APEX]: { name: 'Apex Legends', icon: 'simple-icons:apexlegends', color: '#CD3333' },
  [GameTitle.FORTNITE]: { name: 'Fortnite', icon: 'simple-icons:fortnite', color: '#9B4BF5' },
  [GameTitle.OVERWATCH]: { name: 'Overwatch 2', icon: 'simple-icons:overwatch', color: '#FA9C1E' },
};

export const REGION_INFO: Record<Region, { name: string; flag: string }> = {
  [Region.NA_EAST]: { name: 'North America (East)', flag: '🇺🇸' },
  [Region.NA_WEST]: { name: 'North America (West)', flag: '🇺🇸' },
  [Region.EU_WEST]: { name: 'Europe (West)', flag: '🇪🇺' },
  [Region.EU_EAST]: { name: 'Europe (East)', flag: '🇪🇺' },
  [Region.SA]: { name: 'South America', flag: '🇧🇷' },
  [Region.ASIA]: { name: 'Asia', flag: '🇯🇵' },
  [Region.OCE]: { name: 'Oceania', flag: '🇦🇺' },
};

export const SKILL_LEVEL_INFO: Record<SkillLevel, { name: string; description: string }> = {
  [SkillLevel.BEGINNER]: { name: 'Beginner', description: 'Just starting out' },
  [SkillLevel.INTERMEDIATE]: { name: 'Intermediate', description: 'Know the basics well' },
  [SkillLevel.ADVANCED]: { name: 'Advanced', description: 'Competitive experience' },
  [SkillLevel.EXPERT]: { name: 'Expert', description: 'High-level ranked play' },
  [SkillLevel.PROFESSIONAL]: { name: 'Professional', description: 'Tournament/pro experience' },
};
