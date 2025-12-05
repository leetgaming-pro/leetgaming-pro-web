/**
 * Stats Type Definitions
 * Comprehensive stats interfaces matching Go backend structures
 * Based on replay-api/pkg/domain/cs/entities/*_stats.go
 */

/**
 * Base Stats Interface
 */
export interface Stats {
  timestamp?: string;
  resourceOwner?: any;
}

/**
 * Economy Stats
 * Tracks financial state and equipment purchases per round
 */
export interface EconomyStats extends Stats {
  state: EconomyState;
  lossBonus: StatNumberUnit;
  item: InventoryStats;
  budget: TeamBudgetStats;
}

export type EconomyState =
  | 'Undefined'
  | 'PistolRound'
  | 'FullBuy'
  | 'FullBuySecond'
  | 'HalfBuy'
  | 'HalfBuySecond'
  | 'HalfBuyUpgrade'
  | 'ForceBuy'
  | 'Eco'
  | 'EcoSecond'
  | 'AntiEco'
  | 'Save'
  | 'Mixed';

export interface StatNumberUnit {
  count: number;
  sum: number;
  avg?: number;
  min?: number;
  max?: number;
}

export interface InventoryStats {
  weapons: ItemWeaponEconomyStats[];
  armor: ItemArmorEconomyStats[];
  utility: ItemUtilityEconomyStats[];
}

export interface ItemWeaponEconomyStats {
  name: string;
  type: string;
  cost: number;
  currentSupply: number;
  backupSupply: number;
}

export interface ItemArmorEconomyStats {
  hasHelmet: boolean;
  hasKevlar: boolean;
  cost: number;
}

export interface ItemUtilityEconomyStats {
  type: 'flashbang' | 'smoke' | 'he_grenade' | 'molotov' | 'decoy';
  count: number;
  cost: number;
}

export interface TeamBudgetStats {
  teamMoney: number;
  avgMoney: number;
  spent: number;
  saved: number;
}

/**
 * Match Stats
 * Aggregate statistics for entire match
 */
export interface MatchStats extends Stats {
  matchId: string;
  gameState: GameStateStats;
  rules: GameRules;
  roundsStats: RoundStats[];
  header?: ReplayFileHeader;
}

export interface GameStateStats {
  matchId?: string;
  tickId: number;
  rules: GameRules;
  nades: Nade[];
  mollies: Molly[];
  equipments: Equipment[];
  packagePosition: Vector3;
  totalRoundsPlayed: number;
  phase: string;
  isWarmupPeriod: boolean;
  isFreezetimePeriod: boolean;
  isMatchStarted: boolean;
  overtimeCount: number;
}

export interface GameRules {
  roundTime: number;
  freezeTime: number;
  bombTime: number;
  maxRounds: number;
  overtimeMaxRounds?: number;
}

export interface RoundStats {
  roundNumber: number;
  winner: 'CT' | 'T';
  reason: string;
  duration: number;
  startTick: number;
  endTick: number;
  economyStats: EconomyStats;
  clutchStats?: ClutchSituationStats[];
  highlightStats?: HighlightStats[];
}

export interface ReplayFileHeader {
  fileSize: number;
  headerSize: number;
  serverName: string;
  clientName: string;
  mapName: string;
  gameDirectory: string;
  playbackTime: number;
  playbackTicks: number;
  playbackFrames: number;
  networkProtocol: number;
}

export interface Nade {
  throwerId?: string;
  position: Vector3;
  equipment: Equipment;
  ownerId: string;
  trajectory: Vector3[];
  trajectory2?: Vector3[];
}

export interface Equipment {
  ownerId?: string;
  position?: Vector3;
  name: string;
  type: string;
  currentSupply: number;
  backupSupply: number;
  supplyType: number;
  zoomLevel: number;
  recoilIndex: number;
}

export interface Molly {
  throwerId?: string;
  equipment: Equipment;
  ownerId?: string;
  trajectory: Vector3[];
  trajectory2?: Vector3[];
  convexHull2D: Vector2[];
  convexHull3D: Vector3[];
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Map Region Stats
 * Positional statistics for specific map areas
 */
export interface MapRegionStats extends Stats {
  areaId: number;
  areaName: string;
  kills: StatNumberUnit;
  deaths: StatNumberUnit;
  assists: StatNumberUnit;
  timeSpent: number;
  utilityUsed: number;
  damageDealt: number;
  damageTaken: number;
}

/**
 * Strategy Stats
 * Team and player strategy performance metrics
 */
export interface StrategyStats extends Stats {
  tickId: number;
  playerStrategyStats: Record<string, PlayerStrategyStats>;
}

export interface PlayerStrategyStats {
  strategy: StrategyType;
  winRate: number;
  winRateBreakdown: Record<StrategyType, number>;
  plantRate: number;
  defuseRate: number;
  entryFragRate: number;
  tradeFragRate: number;
  clutchRate: number;
  clutchWinRate: number;
}

export type StrategyType =
  | 'Unknown'
  | 'FullSave'
  | 'ForceBuy'
  | 'Eco'
  | 'Default'
  | 'SemiDefault'
  | 'BDefault'
  | 'ADefault'
  | 'StackA'
  | 'StackB'
  | 'LateStackA'
  | 'LateStackB'
  | 'RushA'
  | 'RushB'
  | 'RushMid'
  | 'FastA'
  | 'FastB'
  | 'DefaultA'
  | 'DefaultB'
  | 'SlowA'
  | 'SlowB'
  | 'FakeA'
  | 'FakeB'
  | 'ExecuteA'
  | 'ExecuteB'
  | 'ContactA'
  | 'ContactB'
  | 'ContactMid'
  | 'RetakeA'
  | 'RetakeB'
  | 'Split'
  | 'Aggressive'
  | 'Passive';

/**
 * Clutch Situation Stats
 * 1vX clutch scenarios and outcomes
 */
export interface ClutchSituationStats extends Stats {
  roundNumber: number;
  playerId?: string;
  networkPlayerId: number;
  opponentsStats: PlayerStats[];
  status: ClutchSituationStatus;
  situationType: string; // e.g., "1v1", "1v2", "1v3", "1v4", "1v5"
  startTick: number;
  endTick: number;
  killsInClutch: number;
  damageDealt: number;
  damageTaken: number;
  healthRemaining: number;
}

export type ClutchSituationStatus =
  | 'not_in_clutch_situation'
  | 'clutch_initiated'
  | 'clutch_progress'
  | 'clutch_lost'
  | 'clutch_won';

export interface PlayerStats {
  playerId: string;
  networkPlayerId: number;
  name: string;
  team: 'CT' | 'T';
  kills: number;
  deaths: number;
  assists: number;
  adr: number; // Average damage per round
  rating: number;
  kd: number;
  health: number;
  armor: number;
  equipment: Equipment[];
  position: Vector3;
}

/**
 * Highlight Stats
 * Notable moments and events in the match
 */
export interface HighlightStats extends Stats {
  highlightNumber: number;
  tick: number;
  highlightedEvent: any;
  longStartTick?: number;
  longEndTick?: number;
  shortStartTick?: number;
  shortEndTick?: number;
  eventStats: EventStats[];
  type: HighlightType;
  players: string[];
  rating: number; // How spectacular the highlight is
}

export type HighlightType =
  | 'Ace'
  | 'Quad Kill'
  | 'Triple Kill'
  | 'Double Kill'
  | 'Clutch'
  | 'Flash Bang Assist'
  | 'Wallbang'
  | 'No Scope'
  | 'Jump Shot'
  | 'Multi Frag'
  | 'Entry Frag'
  | 'Bomb Plant'
  | 'Bomb Defuse'
  | 'Team Wipe';

/**
 * Event Stats
 * Individual game events (kills, plants, defuses, etc.)
 */
export interface EventStats extends Stats {
  eventId: string;
  eventType: EventType;
  tick: number;
  playerId?: string;
  victimId?: string;
  assisterId?: string;
  weapon?: string;
  position?: Vector3;
  isHeadshot?: boolean;
  damage?: number;
  metadata?: Record<string, any>;
}

export type EventType =
  | 'Kill'
  | 'Death'
  | 'Assist'
  | 'BombPlanted'
  | 'BombDefused'
  | 'BombExploded'
  | 'RoundStart'
  | 'RoundEnd'
  | 'WeaponFire'
  | 'WeaponReload'
  | 'PlayerHurt'
  | 'PlayerJump'
  | 'PlayerFootstep'
  | 'FlashbangDetonate'
  | 'SmokeGrenadeDetonate'
  | 'HeGrenadeDetonate'
  | 'MolotovDetonate'
  | 'DecoyStarted'
  | 'ItemPickup'
  | 'ItemDrop'
  | 'ItemPurchase';
