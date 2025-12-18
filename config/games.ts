/**
 * @fileoverview Games Configuration Registry
 * @module config/games
 *
 * Central configuration for all supported games on LeetGaming.PRO platform.
 * This configuration drives the entire game-related UX across:
 * - Matchmaking
 * - Replay Analysis
 * - Tournaments
 * - Player Profiles
 * - Rankings/Leaderboards
 */

import type { GameConfig, GameId, GameCategory } from "../types/games";

/**
 * Complete game configurations with features, settings, and integration details
 */
export const GAME_CONFIGS: Record<GameId, GameConfig> = {
  cs2: {
    id: "cs2",
    name: "Counter-Strike 2",
    shortName: "CS2",
    slug: "counter-strike-2",
    category: "tactical-fps",
    icon: "simple-icons:counterstrike",
    logo: "/games/cs2/logo.svg",
    banner: "/games/cs2/banner.svg",
    color: {
      primary: "#F7B93E",
      secondary: "#1A1A1A",
      accent: "#FF6B00",
    },
    description: "Premier tactical FPS with competitive 5v5 gameplay",

    // Platform Integration
    integration: {
      platform: "steam",
      appId: "730",
      apiEnabled: true,
      replaySupport: true,
      rankingSupport: true,
      statsApiUrl:
        "https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/",
    },

    // Replay Configuration
    replay: {
      formats: ["dem"],
      maxFileSize: 250 * 1024 * 1024, // 250MB
      parser: "demoinfocs-golang",
      features: [
        "kill-feed",
        "economy-tracking",
        "utility-analysis",
        "positioning-heatmaps",
        "round-by-round",
        "player-stats",
        "trade-kills",
        "flash-assists",
        "clutch-analysis",
      ],
    },

    // Matchmaking Configuration
    matchmaking: {
      teamSize: 5,
      modes: [
        { id: "competitive", name: "Competitive", teamSize: 5, ranked: true },
        { id: "wingman", name: "Wingman", teamSize: 2, ranked: true },
        { id: "casual", name: "Casual", teamSize: 10, ranked: false },
        { id: "deathmatch", name: "Deathmatch", teamSize: 16, ranked: false },
      ],
      maps: [
        { id: "de_mirage", name: "Mirage", active: true, competitive: true },
        { id: "de_inferno", name: "Inferno", active: true, competitive: true },
        { id: "de_dust2", name: "Dust II", active: true, competitive: true },
        { id: "de_nuke", name: "Nuke", active: true, competitive: true },
        { id: "de_ancient", name: "Ancient", active: true, competitive: true },
        { id: "de_anubis", name: "Anubis", active: true, competitive: true },
        { id: "de_vertigo", name: "Vertigo", active: true, competitive: true },
        {
          id: "de_overpass",
          name: "Overpass",
          active: false,
          competitive: true,
        },
      ],
      mapVetoEnabled: true,
      mapVetoFormat: "ban-ban-ban-ban-pick-pick-remaining",
      anticheatRequired: true,
      anticheatProviders: ["vac", "faceit-ac", "leetguard"],
    },

    // Ranking Configuration
    ranking: {
      system: "elo-mmr",
      tiers: [
        { id: "silver1", name: "Silver I", minRating: 0, icon: "🥈" },
        { id: "silver2", name: "Silver II", minRating: 1000, icon: "🥈" },
        { id: "silver3", name: "Silver III", minRating: 1100, icon: "🥈" },
        { id: "silver4", name: "Silver IV", minRating: 1200, icon: "🥈" },
        {
          id: "silverelite",
          name: "Silver Elite",
          minRating: 1300,
          icon: "🥈",
        },
        {
          id: "silverelitemaster",
          name: "Silver Elite Master",
          minRating: 1400,
          icon: "🥈",
        },
        { id: "goldnova1", name: "Gold Nova I", minRating: 1500, icon: "⭐" },
        { id: "goldnova2", name: "Gold Nova II", minRating: 1600, icon: "⭐" },
        { id: "goldnova3", name: "Gold Nova III", minRating: 1700, icon: "⭐" },
        {
          id: "goldnovamaster",
          name: "Gold Nova Master",
          minRating: 1800,
          icon: "⭐",
        },
        {
          id: "masterguardian1",
          name: "Master Guardian I",
          minRating: 1900,
          icon: "🛡️",
        },
        {
          id: "masterguardian2",
          name: "Master Guardian II",
          minRating: 2000,
          icon: "🛡️",
        },
        {
          id: "masterguardianelite",
          name: "Master Guardian Elite",
          minRating: 2100,
          icon: "🛡️",
        },
        {
          id: "dmg",
          name: "Distinguished Master Guardian",
          minRating: 2200,
          icon: "🛡️",
        },
        {
          id: "legendaryeagle",
          name: "Legendary Eagle",
          minRating: 2300,
          icon: "🦅",
        },
        {
          id: "legendaryeaglemaster",
          name: "Legendary Eagle Master",
          minRating: 2400,
          icon: "🦅",
        },
        {
          id: "suprememaster",
          name: "Supreme Master First Class",
          minRating: 2500,
          icon: "💎",
        },
        { id: "global", name: "Global Elite", minRating: 2600, icon: "🌍" },
      ],
      placements: 10,
      decayEnabled: true,
      decayDays: 30,
    },

    // Stats tracked
    stats: [
      "kills",
      "deaths",
      "assists",
      "kd_ratio",
      "adr",
      "hsp",
      "clutches_won",
      "clutches_lost",
      "first_kills",
      "first_deaths",
      "flash_assists",
      "trade_kills",
      "utility_damage",
      "mvp_stars",
    ],

    // Feature flags
    features: {
      tournaments: true,
      coaching: true,
      teamFinder: true,
      replayAnalysis: true,
      liveMatches: true,
      betting: false, // Regulated
      trading: true,
    },

    // Priority
    priority: 1,
    active: true,
    launchDate: new Date("2024-01-15"),
  },

  valorant: {
    id: "valorant",
    name: "VALORANT",
    shortName: "VAL",
    slug: "valorant",
    category: "tactical-fps",
    icon: "simple-icons:valorant",
    logo: "/games/valorant/logo.svg",
    banner: "/games/valorant/banner.svg",
    color: {
      primary: "#FF4655",
      secondary: "#0F1923",
      accent: "#BD3944",
    },
    description: "Character-based tactical shooter by Riot Games",

    integration: {
      platform: "riot",
      appId: "valorant",
      apiEnabled: true,
      replaySupport: false, // VOD only
      rankingSupport: true,
      statsApiUrl: "https://api.henrikdev.xyz/valorant/v1",
    },

    replay: {
      formats: ["mp4", "webm"], // VOD-based
      maxFileSize: 500 * 1024 * 1024,
      parser: "vod-vision-ai",
      features: [
        "kill-feed",
        "ability-usage",
        "economy-tracking",
        "agent-performance",
        "round-by-round",
        "player-stats",
        "ultimate-tracking",
      ],
    },

    matchmaking: {
      teamSize: 5,
      modes: [
        { id: "competitive", name: "Competitive", teamSize: 5, ranked: true },
        { id: "unrated", name: "Unrated", teamSize: 5, ranked: false },
        { id: "swiftplay", name: "Swiftplay", teamSize: 5, ranked: false },
        { id: "spike-rush", name: "Spike Rush", teamSize: 5, ranked: false },
        { id: "escalation", name: "Escalation", teamSize: 5, ranked: false },
        {
          id: "team-deathmatch",
          name: "Team Deathmatch",
          teamSize: 5,
          ranked: false,
        },
      ],
      maps: [
        { id: "ascent", name: "Ascent", active: true, competitive: true },
        { id: "bind", name: "Bind", active: true, competitive: true },
        { id: "haven", name: "Haven", active: true, competitive: true },
        { id: "split", name: "Split", active: true, competitive: true },
        { id: "icebox", name: "Icebox", active: true, competitive: true },
        { id: "breeze", name: "Breeze", active: true, competitive: true },
        { id: "fracture", name: "Fracture", active: true, competitive: true },
        { id: "pearl", name: "Pearl", active: true, competitive: true },
        { id: "lotus", name: "Lotus", active: true, competitive: true },
        { id: "sunset", name: "Sunset", active: true, competitive: true },
        { id: "abyss", name: "Abyss", active: true, competitive: true },
      ],
      mapVetoEnabled: true,
      mapVetoFormat: "ban-ban-pick-pick-remaining",
      anticheatRequired: true,
      anticheatProviders: ["vanguard", "leetguard"],
    },

    ranking: {
      system: "elo-rr",
      tiers: [
        { id: "iron1", name: "Iron 1", minRating: 0, icon: "🔩" },
        { id: "iron2", name: "Iron 2", minRating: 100, icon: "🔩" },
        { id: "iron3", name: "Iron 3", minRating: 200, icon: "🔩" },
        { id: "bronze1", name: "Bronze 1", minRating: 300, icon: "🥉" },
        { id: "bronze2", name: "Bronze 2", minRating: 400, icon: "🥉" },
        { id: "bronze3", name: "Bronze 3", minRating: 500, icon: "🥉" },
        { id: "silver1", name: "Silver 1", minRating: 600, icon: "🥈" },
        { id: "silver2", name: "Silver 2", minRating: 700, icon: "🥈" },
        { id: "silver3", name: "Silver 3", minRating: 800, icon: "🥈" },
        { id: "gold1", name: "Gold 1", minRating: 900, icon: "🥇" },
        { id: "gold2", name: "Gold 2", minRating: 1000, icon: "🥇" },
        { id: "gold3", name: "Gold 3", minRating: 1100, icon: "🥇" },
        { id: "platinum1", name: "Platinum 1", minRating: 1200, icon: "💠" },
        { id: "platinum2", name: "Platinum 2", minRating: 1300, icon: "💠" },
        { id: "platinum3", name: "Platinum 3", minRating: 1400, icon: "💠" },
        { id: "diamond1", name: "Diamond 1", minRating: 1500, icon: "💎" },
        { id: "diamond2", name: "Diamond 2", minRating: 1600, icon: "💎" },
        { id: "diamond3", name: "Diamond 3", minRating: 1700, icon: "💎" },
        { id: "ascendant1", name: "Ascendant 1", minRating: 1800, icon: "🌟" },
        { id: "ascendant2", name: "Ascendant 2", minRating: 1900, icon: "🌟" },
        { id: "ascendant3", name: "Ascendant 3", minRating: 2000, icon: "🌟" },
        { id: "immortal1", name: "Immortal 1", minRating: 2100, icon: "⚡" },
        { id: "immortal2", name: "Immortal 2", minRating: 2200, icon: "⚡" },
        { id: "immortal3", name: "Immortal 3", minRating: 2300, icon: "⚡" },
        { id: "radiant", name: "Radiant", minRating: 2400, icon: "👑" },
      ],
      placements: 5,
      decayEnabled: true,
      decayDays: 14,
    },

    stats: [
      "kills",
      "deaths",
      "assists",
      "kd_ratio",
      "adr",
      "hsp",
      "first_bloods",
      "clutches",
      "aces",
      "plants",
      "defuses",
      "ability_casts",
      "ultimate_kills",
    ],

    features: {
      tournaments: true,
      coaching: true,
      teamFinder: true,
      replayAnalysis: true, // VOD-based
      liveMatches: true,
      betting: false,
      trading: false, // No trading in Valorant
    },

    priority: 2,
    active: true,
    launchDate: new Date("2024-02-01"),
  },

  freefire: {
    id: "freefire",
    name: "Free Fire",
    shortName: "FF",
    slug: "free-fire",
    category: "battle-royale",
    icon: "game-icons:fire",
    logo: "/games/freefire/logo.svg",
    banner: "/games/freefire/banner.svg",
    color: {
      primary: "#FF5722",
      secondary: "#1A1A1A",
      accent: "#FFC107",
    },
    description: "Mobile battle royale with fast-paced action",

    integration: {
      platform: "garena",
      appId: "free-fire",
      apiEnabled: true,
      replaySupport: false,
      rankingSupport: true,
    },

    replay: {
      formats: ["mp4"],
      maxFileSize: 200 * 1024 * 1024,
      parser: "vod-mobile",
      features: ["kill-feed", "match-summary", "player-stats"],
    },

    matchmaking: {
      teamSize: 4,
      modes: [
        {
          id: "battle-royale",
          name: "Battle Royale",
          teamSize: 4,
          ranked: true,
        },
        { id: "clash-squad", name: "Clash Squad", teamSize: 4, ranked: true },
        { id: "lone-wolf", name: "Lone Wolf", teamSize: 1, ranked: false },
      ],
      maps: [
        { id: "bermuda", name: "Bermuda", active: true, competitive: true },
        { id: "kalahari", name: "Kalahari", active: true, competitive: true },
        { id: "purgatory", name: "Purgatory", active: true, competitive: true },
        { id: "alpine", name: "Alpine", active: true, competitive: true },
      ],
      mapVetoEnabled: false,
      anticheatRequired: true,
      anticheatProviders: ["garena-ac", "leetguard"],
    },

    ranking: {
      system: "tiered",
      tiers: [
        { id: "bronze", name: "Bronze", minRating: 0, icon: "🥉" },
        { id: "silver", name: "Silver", minRating: 1000, icon: "🥈" },
        { id: "gold", name: "Gold", minRating: 1500, icon: "🥇" },
        { id: "platinum", name: "Platinum", minRating: 2000, icon: "💠" },
        { id: "diamond", name: "Diamond", minRating: 2500, icon: "💎" },
        { id: "heroic", name: "Heroic", minRating: 3000, icon: "🦸" },
        { id: "grandmaster", name: "Grandmaster", minRating: 3500, icon: "👑" },
      ],
      placements: 0,
      decayEnabled: true,
      decayDays: 7,
    },

    stats: ["kills", "deaths", "damage", "headshots", "wins", "top10"],

    features: {
      tournaments: true,
      coaching: true,
      teamFinder: true,
      replayAnalysis: false,
      liveMatches: true,
      betting: false,
      trading: false,
    },

    priority: 3,
    active: true,
    launchDate: new Date("2024-03-01"),
  },

  pubg: {
    id: "pubg",
    name: "PUBG: Battlegrounds",
    shortName: "PUBG",
    slug: "pubg",
    category: "battle-royale",
    icon: "simple-icons:pubg",
    logo: "/games/pubg/logo.svg",
    banner: "/games/pubg/banner.svg",
    color: {
      primary: "#F2A900",
      secondary: "#1A1A1A",
      accent: "#E8B923",
    },
    description: "Original battle royale experience",

    integration: {
      platform: "steam",
      appId: "578080",
      apiEnabled: true,
      replaySupport: true,
      rankingSupport: true,
      statsApiUrl: "https://api.pubg.com/shards/steam",
    },

    replay: {
      formats: ["replay"],
      maxFileSize: 100 * 1024 * 1024,
      parser: "pubg-replay-parser",
      features: [
        "kill-feed",
        "positioning-heatmaps",
        "loot-tracking",
        "vehicle-paths",
        "circle-analysis",
      ],
    },

    matchmaking: {
      teamSize: 4,
      modes: [
        { id: "squad", name: "Squad", teamSize: 4, ranked: true },
        { id: "duo", name: "Duo", teamSize: 2, ranked: true },
        { id: "solo", name: "Solo", teamSize: 1, ranked: true },
        { id: "tdm", name: "Team Deathmatch", teamSize: 8, ranked: false },
      ],
      maps: [
        { id: "erangel", name: "Erangel", active: true, competitive: true },
        { id: "miramar", name: "Miramar", active: true, competitive: true },
        { id: "vikendi", name: "Vikendi", active: true, competitive: true },
        { id: "sanhok", name: "Sanhok", active: true, competitive: true },
        { id: "taego", name: "Taego", active: true, competitive: true },
        { id: "deston", name: "Deston", active: true, competitive: true },
        { id: "rondo", name: "Rondo", active: true, competitive: true },
      ],
      mapVetoEnabled: true,
      mapVetoFormat: "pick-pick-random",
      anticheatRequired: true,
      anticheatProviders: ["battleye", "leetguard"],
    },

    ranking: {
      system: "tiered-survival",
      tiers: [
        { id: "bronze", name: "Bronze", minRating: 0, icon: "🥉" },
        { id: "silver", name: "Silver", minRating: 1500, icon: "🥈" },
        { id: "gold", name: "Gold", minRating: 2000, icon: "🥇" },
        { id: "platinum", name: "Platinum", minRating: 2500, icon: "💠" },
        { id: "diamond", name: "Diamond", minRating: 3000, icon: "💎" },
        { id: "master", name: "Master", minRating: 3500, icon: "🎖️" },
      ],
      placements: 5,
      decayEnabled: true,
      decayDays: 14,
    },

    stats: [
      "kills",
      "deaths",
      "wins",
      "top10",
      "damage",
      "headshots",
      "longest_kill",
      "vehicle_destroys",
    ],

    features: {
      tournaments: true,
      coaching: true,
      teamFinder: true,
      replayAnalysis: true,
      liveMatches: true,
      betting: false,
      trading: true,
    },

    priority: 4,
    active: true,
    launchDate: new Date("2024-03-15"),
  },

  r6: {
    id: "r6",
    name: "Rainbow Six Siege",
    shortName: "R6S",
    slug: "rainbow-six-siege",
    category: "tactical-fps",
    icon: "simple-icons:ubisoft",
    logo: "/games/r6/logo.svg",
    banner: "/games/r6/banner.svg",
    color: {
      primary: "#F5A623",
      secondary: "#1A1A1A",
      accent: "#4A90D9",
    },
    description: "Tactical team-based shooter with destructible environments",

    integration: {
      platform: "ubisoft",
      appId: "rainbow-six-siege",
      apiEnabled: true,
      replaySupport: true,
      rankingSupport: true,
    },

    replay: {
      formats: ["rec"],
      maxFileSize: 50 * 1024 * 1024,
      parser: "r6-dissect",
      features: [
        "kill-feed",
        "operator-picks",
        "gadget-usage",
        "round-by-round",
        "player-stats",
      ],
    },

    matchmaking: {
      teamSize: 5,
      modes: [
        { id: "ranked", name: "Ranked", teamSize: 5, ranked: true },
        { id: "unranked", name: "Unranked", teamSize: 5, ranked: false },
        { id: "standard", name: "Standard", teamSize: 5, ranked: false },
        { id: "quick-match", name: "Quick Match", teamSize: 5, ranked: false },
      ],
      maps: [
        { id: "bank", name: "Bank", active: true, competitive: true },
        { id: "border", name: "Border", active: true, competitive: true },
        { id: "chalet", name: "Chalet", active: true, competitive: true },
        { id: "clubhouse", name: "Clubhouse", active: true, competitive: true },
        { id: "coastline", name: "Coastline", active: true, competitive: true },
        { id: "consulate", name: "Consulate", active: true, competitive: true },
        {
          id: "kafe",
          name: "Kafe Dostoyevsky",
          active: true,
          competitive: true,
        },
        { id: "oregon", name: "Oregon", active: true, competitive: true },
        {
          id: "theme-park",
          name: "Theme Park",
          active: true,
          competitive: true,
        },
        { id: "villa", name: "Villa", active: true, competitive: true },
      ],
      mapVetoEnabled: true,
      mapVetoFormat: "ban-ban-pick-pick-remaining",
      anticheatRequired: true,
      anticheatProviders: ["battleye", "leetguard"],
    },

    ranking: {
      system: "elo-mmr",
      tiers: [
        { id: "copper5", name: "Copper V", minRating: 0, icon: "🟤" },
        { id: "copper4", name: "Copper IV", minRating: 1100, icon: "🟤" },
        { id: "copper3", name: "Copper III", minRating: 1200, icon: "🟤" },
        { id: "copper2", name: "Copper II", minRating: 1300, icon: "🟤" },
        { id: "copper1", name: "Copper I", minRating: 1400, icon: "🟤" },
        { id: "bronze5", name: "Bronze V", minRating: 1500, icon: "🥉" },
        { id: "bronze4", name: "Bronze IV", minRating: 1600, icon: "🥉" },
        { id: "bronze3", name: "Bronze III", minRating: 1700, icon: "🥉" },
        { id: "bronze2", name: "Bronze II", minRating: 1800, icon: "🥉" },
        { id: "bronze1", name: "Bronze I", minRating: 1900, icon: "🥉" },
        { id: "silver5", name: "Silver V", minRating: 2000, icon: "🥈" },
        { id: "silver4", name: "Silver IV", minRating: 2100, icon: "🥈" },
        { id: "silver3", name: "Silver III", minRating: 2200, icon: "🥈" },
        { id: "silver2", name: "Silver II", minRating: 2300, icon: "🥈" },
        { id: "silver1", name: "Silver I", minRating: 2400, icon: "🥈" },
        { id: "gold3", name: "Gold III", minRating: 2500, icon: "🥇" },
        { id: "gold2", name: "Gold II", minRating: 2600, icon: "🥇" },
        { id: "gold1", name: "Gold I", minRating: 2700, icon: "🥇" },
        { id: "platinum3", name: "Platinum III", minRating: 2800, icon: "💠" },
        { id: "platinum2", name: "Platinum II", minRating: 3000, icon: "💠" },
        { id: "platinum1", name: "Platinum I", minRating: 3200, icon: "💠" },
        { id: "emerald3", name: "Emerald III", minRating: 3400, icon: "💚" },
        { id: "emerald2", name: "Emerald II", minRating: 3600, icon: "💚" },
        { id: "emerald1", name: "Emerald I", minRating: 3800, icon: "💚" },
        { id: "diamond3", name: "Diamond III", minRating: 4000, icon: "💎" },
        { id: "diamond2", name: "Diamond II", minRating: 4200, icon: "💎" },
        { id: "diamond1", name: "Diamond I", minRating: 4400, icon: "💎" },
        { id: "champion", name: "Champion", minRating: 4600, icon: "👑" },
      ],
      placements: 10,
      decayEnabled: true,
      decayDays: 14,
    },

    stats: [
      "kills",
      "deaths",
      "assists",
      "kd_ratio",
      "win_rate",
      "headshot_rate",
      "melee_kills",
    ],

    features: {
      tournaments: true,
      coaching: true,
      teamFinder: true,
      replayAnalysis: true,
      liveMatches: true,
      betting: false,
      trading: false,
    },

    priority: 5,
    active: true,
    launchDate: new Date("2024-04-01"),
  },

  tibia: {
    id: "tibia",
    name: "Tibia",
    shortName: "TIBIA",
    slug: "tibia",
    category: "mmorpg",
    icon: "game-icons:skull-crossbones",
    logo: "/games/tibia/logo.svg",
    banner: "/games/tibia/banner.svg",
    color: {
      primary: "#8B4513",
      secondary: "#2C1810",
      accent: "#DAA520",
    },
    description: "Classic MMORPG with rich PvP and guild warfare",

    integration: {
      platform: "cipsoft",
      appId: "tibia",
      apiEnabled: true,
      replaySupport: false,
      rankingSupport: true,
      statsApiUrl: "https://api.tibiadata.com/v3",
    },

    replay: {
      formats: [],
      maxFileSize: 0,
      parser: null,
      features: [],
    },

    matchmaking: {
      teamSize: 0, // Guild-based
      modes: [
        { id: "guild-war", name: "Guild War", teamSize: 0, ranked: true },
        { id: "pvp-arena", name: "PvP Arena", teamSize: 1, ranked: true },
      ],
      maps: [],
      mapVetoEnabled: false,
      anticheatRequired: false,
      anticheatProviders: [],
    },

    ranking: {
      system: "experience",
      tiers: [],
      placements: 0,
      decayEnabled: false,
      decayDays: 0,
    },

    stats: [
      "level",
      "experience",
      "deaths",
      "kills",
      "guild_rank",
      "magic_level",
      "skills",
    ],

    features: {
      tournaments: true,
      coaching: false,
      teamFinder: true, // Guild finder
      replayAnalysis: false,
      liveMatches: false,
      betting: false,
      trading: true, // In-game economy
    },

    priority: 6,
    active: true,
    launchDate: new Date("2024-06-01"),
  },

  dota2: {
    id: "dota2",
    name: "Dota 2",
    shortName: "DOTA",
    slug: "dota-2",
    category: "moba",
    icon: "simple-icons:dota2",
    logo: "/games/dota2/logo.svg",
    banner: "/games/dota2/banner.svg",
    color: {
      primary: "#C23C2A",
      secondary: "#1A1A1A",
      accent: "#9E2720",
    },
    description: "Premier competitive MOBA by Valve",

    integration: {
      platform: "steam",
      appId: "570",
      apiEnabled: true,
      replaySupport: true,
      rankingSupport: true,
      statsApiUrl: "https://api.opendota.com/api",
    },

    replay: {
      formats: ["dem"],
      maxFileSize: 100 * 1024 * 1024,
      parser: "opendota",
      features: [
        "kill-feed",
        "gold-exp-graphs",
        "item-timings",
        "ward-placement",
        "teamfight-analysis",
        "draft-analysis",
        "lane-analysis",
      ],
    },

    matchmaking: {
      teamSize: 5,
      modes: [
        { id: "ranked", name: "Ranked All Pick", teamSize: 5, ranked: true },
        {
          id: "captains-mode",
          name: "Captains Mode",
          teamSize: 5,
          ranked: true,
        },
        { id: "turbo", name: "Turbo", teamSize: 5, ranked: false },
        { id: "all-pick", name: "All Pick", teamSize: 5, ranked: false },
      ],
      maps: [
        {
          id: "dota-map",
          name: "The Dota Map",
          active: true,
          competitive: true,
        },
      ],
      mapVetoEnabled: false,
      anticheatRequired: true,
      anticheatProviders: ["vac", "leetguard"],
    },

    ranking: {
      system: "mmr-medals",
      tiers: [
        { id: "herald1", name: "Herald 1", minRating: 0, icon: "🌱" },
        { id: "herald2", name: "Herald 2", minRating: 154, icon: "🌱" },
        { id: "herald3", name: "Herald 3", minRating: 308, icon: "🌱" },
        { id: "herald4", name: "Herald 4", minRating: 462, icon: "🌱" },
        { id: "herald5", name: "Herald 5", minRating: 616, icon: "🌱" },
        { id: "guardian1", name: "Guardian 1", minRating: 770, icon: "🛡️" },
        { id: "guardian2", name: "Guardian 2", minRating: 924, icon: "🛡️" },
        { id: "guardian3", name: "Guardian 3", minRating: 1078, icon: "🛡️" },
        { id: "guardian4", name: "Guardian 4", minRating: 1232, icon: "🛡️" },
        { id: "guardian5", name: "Guardian 5", minRating: 1386, icon: "🛡️" },
        { id: "crusader1", name: "Crusader 1", minRating: 1540, icon: "⚔️" },
        { id: "crusader2", name: "Crusader 2", minRating: 1694, icon: "⚔️" },
        { id: "crusader3", name: "Crusader 3", minRating: 1848, icon: "⚔️" },
        { id: "crusader4", name: "Crusader 4", minRating: 2002, icon: "⚔️" },
        { id: "crusader5", name: "Crusader 5", minRating: 2156, icon: "⚔️" },
        { id: "archon1", name: "Archon 1", minRating: 2310, icon: "🏅" },
        { id: "archon2", name: "Archon 2", minRating: 2464, icon: "🏅" },
        { id: "archon3", name: "Archon 3", minRating: 2618, icon: "🏅" },
        { id: "archon4", name: "Archon 4", minRating: 2772, icon: "🏅" },
        { id: "archon5", name: "Archon 5", minRating: 2926, icon: "🏅" },
        { id: "legend1", name: "Legend 1", minRating: 3080, icon: "⭐" },
        { id: "legend2", name: "Legend 2", minRating: 3234, icon: "⭐" },
        { id: "legend3", name: "Legend 3", minRating: 3388, icon: "⭐" },
        { id: "legend4", name: "Legend 4", minRating: 3542, icon: "⭐" },
        { id: "legend5", name: "Legend 5", minRating: 3696, icon: "⭐" },
        { id: "ancient1", name: "Ancient 1", minRating: 3850, icon: "🔮" },
        { id: "ancient2", name: "Ancient 2", minRating: 4004, icon: "🔮" },
        { id: "ancient3", name: "Ancient 3", minRating: 4158, icon: "🔮" },
        { id: "ancient4", name: "Ancient 4", minRating: 4312, icon: "🔮" },
        { id: "ancient5", name: "Ancient 5", minRating: 4466, icon: "🔮" },
        { id: "divine1", name: "Divine 1", minRating: 4620, icon: "✨" },
        { id: "divine2", name: "Divine 2", minRating: 4820, icon: "✨" },
        { id: "divine3", name: "Divine 3", minRating: 5020, icon: "✨" },
        { id: "divine4", name: "Divine 4", minRating: 5220, icon: "✨" },
        { id: "divine5", name: "Divine 5", minRating: 5420, icon: "✨" },
        { id: "immortal", name: "Immortal", minRating: 5620, icon: "👑" },
      ],
      placements: 10,
      decayEnabled: false,
      decayDays: 0,
    },

    stats: [
      "kills",
      "deaths",
      "assists",
      "last_hits",
      "denies",
      "gpm",
      "xpm",
      "hero_damage",
      "tower_damage",
      "healing",
    ],

    features: {
      tournaments: true,
      coaching: true,
      teamFinder: true,
      replayAnalysis: true,
      liveMatches: true,
      betting: false,
      trading: true,
    },

    priority: 7,
    active: true,
    launchDate: new Date("2024-04-15"),
  },

  lol: {
    id: "lol",
    name: "League of Legends",
    shortName: "LoL",
    slug: "league-of-legends",
    category: "moba",
    icon: "simple-icons:leagueoflegends",
    logo: "/games/lol/logo.svg",
    banner: "/games/lol/banner.svg",
    color: {
      primary: "#C89B3C",
      secondary: "#0A1428",
      accent: "#0397AB",
    },
    description: "World's most popular competitive MOBA",

    integration: {
      platform: "riot",
      appId: "league-of-legends",
      apiEnabled: true,
      replaySupport: true,
      rankingSupport: true,
      statsApiUrl: "https://api.riotgames.com/lol",
    },

    replay: {
      formats: ["rofl"],
      maxFileSize: 50 * 1024 * 1024,
      parser: "lol-replay-parser",
      features: [
        "kill-feed",
        "gold-exp-graphs",
        "item-timings",
        "ward-placement",
        "teamfight-analysis",
        "draft-analysis",
        "objective-control",
      ],
    },

    matchmaking: {
      teamSize: 5,
      modes: [
        {
          id: "ranked-solo",
          name: "Ranked Solo/Duo",
          teamSize: 5,
          ranked: true,
        },
        { id: "ranked-flex", name: "Ranked Flex", teamSize: 5, ranked: true },
        {
          id: "normal-draft",
          name: "Normal Draft",
          teamSize: 5,
          ranked: false,
        },
        { id: "aram", name: "ARAM", teamSize: 5, ranked: false },
      ],
      maps: [
        {
          id: "summoners-rift",
          name: "Summoner's Rift",
          active: true,
          competitive: true,
        },
        {
          id: "howling-abyss",
          name: "Howling Abyss",
          active: true,
          competitive: false,
        },
      ],
      mapVetoEnabled: false,
      anticheatRequired: true,
      anticheatProviders: ["vanguard", "leetguard"],
    },

    ranking: {
      system: "lp-tiers",
      tiers: [
        { id: "iron4", name: "Iron IV", minRating: 0, icon: "🔩" },
        { id: "iron3", name: "Iron III", minRating: 100, icon: "🔩" },
        { id: "iron2", name: "Iron II", minRating: 200, icon: "🔩" },
        { id: "iron1", name: "Iron I", minRating: 300, icon: "🔩" },
        { id: "bronze4", name: "Bronze IV", minRating: 400, icon: "🥉" },
        { id: "bronze3", name: "Bronze III", minRating: 500, icon: "🥉" },
        { id: "bronze2", name: "Bronze II", minRating: 600, icon: "🥉" },
        { id: "bronze1", name: "Bronze I", minRating: 700, icon: "🥉" },
        { id: "silver4", name: "Silver IV", minRating: 800, icon: "🥈" },
        { id: "silver3", name: "Silver III", minRating: 900, icon: "🥈" },
        { id: "silver2", name: "Silver II", minRating: 1000, icon: "🥈" },
        { id: "silver1", name: "Silver I", minRating: 1100, icon: "🥈" },
        { id: "gold4", name: "Gold IV", minRating: 1200, icon: "🥇" },
        { id: "gold3", name: "Gold III", minRating: 1300, icon: "🥇" },
        { id: "gold2", name: "Gold II", minRating: 1400, icon: "🥇" },
        { id: "gold1", name: "Gold I", minRating: 1500, icon: "🥇" },
        { id: "platinum4", name: "Platinum IV", minRating: 1600, icon: "💠" },
        { id: "platinum3", name: "Platinum III", minRating: 1700, icon: "💠" },
        { id: "platinum2", name: "Platinum II", minRating: 1800, icon: "💠" },
        { id: "platinum1", name: "Platinum I", minRating: 1900, icon: "💠" },
        { id: "emerald4", name: "Emerald IV", minRating: 2000, icon: "💚" },
        { id: "emerald3", name: "Emerald III", minRating: 2100, icon: "💚" },
        { id: "emerald2", name: "Emerald II", minRating: 2200, icon: "💚" },
        { id: "emerald1", name: "Emerald I", minRating: 2300, icon: "💚" },
        { id: "diamond4", name: "Diamond IV", minRating: 2400, icon: "💎" },
        { id: "diamond3", name: "Diamond III", minRating: 2500, icon: "💎" },
        { id: "diamond2", name: "Diamond II", minRating: 2600, icon: "💎" },
        { id: "diamond1", name: "Diamond I", minRating: 2700, icon: "💎" },
        { id: "master", name: "Master", minRating: 2800, icon: "🎖️" },
        { id: "grandmaster", name: "Grandmaster", minRating: 3200, icon: "⚡" },
        { id: "challenger", name: "Challenger", minRating: 3600, icon: "👑" },
      ],
      placements: 5,
      decayEnabled: true,
      decayDays: 28,
    },

    stats: [
      "kills",
      "deaths",
      "assists",
      "cs",
      "vision_score",
      "gold_earned",
      "damage_dealt",
      "damage_taken",
      "objectives",
    ],

    features: {
      tournaments: true,
      coaching: true,
      teamFinder: true,
      replayAnalysis: true,
      liveMatches: true,
      betting: false,
      trading: false,
    },

    priority: 8,
    active: true,
    launchDate: new Date("2024-05-01"),
  },
};

/**
 * Helper functions for game configuration
 */

export function getGameById(id: GameId): GameConfig | undefined {
  return GAME_CONFIGS[id];
}

export function getActiveGames(): GameConfig[] {
  return Object.values(GAME_CONFIGS)
    .filter((game) => game.active)
    .sort((a, b) => a.priority - b.priority);
}

export function getGamesByCategory(category: GameCategory): GameConfig[] {
  return Object.values(GAME_CONFIGS)
    .filter((game) => game.category === category && game.active)
    .sort((a, b) => a.priority - b.priority);
}

export function getGamesWithFeature(
  feature: keyof GameConfig["features"]
): GameConfig[] {
  return Object.values(GAME_CONFIGS)
    .filter((game) => game.active && game.features[feature])
    .sort((a, b) => a.priority - b.priority);
}

export function getGamesWithReplaySupport(): GameConfig[] {
  return Object.values(GAME_CONFIGS)
    .filter((game) => game.active && game.integration.replaySupport)
    .sort((a, b) => a.priority - b.priority);
}

export function getGameMaps(
  gameId: GameId,
  competitiveOnly = false
): GameConfig["matchmaking"]["maps"] {
  const game = GAME_CONFIGS[gameId];
  if (!game) return [];

  return competitiveOnly
    ? game.matchmaking.maps.filter((m) => m.competitive && m.active)
    : game.matchmaking.maps.filter((m) => m.active);
}

export function getGameModes(
  gameId: GameId,
  rankedOnly = false
): GameConfig["matchmaking"]["modes"] {
  const game = GAME_CONFIGS[gameId];
  if (!game) return [];

  return rankedOnly
    ? game.matchmaking.modes.filter((m) => m.ranked)
    : game.matchmaking.modes;
}

export function getRankTier(
  gameId: GameId,
  rating: number
): GameConfig["ranking"]["tiers"][0] | undefined {
  const game = GAME_CONFIGS[gameId];
  if (!game) return undefined;

  const tiers = [...game.ranking.tiers].sort(
    (a, b) => b.minRating - a.minRating
  );
  return tiers.find((tier) => rating >= tier.minRating);
}

/**
 * Game category configuration
 */
export const GAME_CATEGORIES: Record<
  GameCategory,
  { name: string; icon: string; description: string }
> = {
  "tactical-fps": {
    name: "Tactical FPS",
    icon: "solar:target-bold",
    description: "Strategic first-person shooters with team-based gameplay",
  },
  "battle-royale": {
    name: "Battle Royale",
    icon: "solar:crown-bold",
    description: "Last player/team standing survival games",
  },
  moba: {
    name: "MOBA",
    icon: "solar:gamepad-bold",
    description: "Multiplayer online battle arena games",
  },
  mmorpg: {
    name: "MMORPG",
    icon: "solar:castle-bold",
    description: "Massively multiplayer online role-playing games",
  },
  fighting: {
    name: "Fighting",
    icon: "solar:boxing-glove-bold",
    description: "Competitive one-on-one fighting games",
  },
  sports: {
    name: "Sports",
    icon: "solar:football-bold",
    description: "Sports simulation and racing games",
  },
  card: {
    name: "Card Games",
    icon: "solar:card-bold",
    description: "Digital collectible card games",
  },
  rts: {
    name: "RTS",
    icon: "solar:map-bold",
    description: "Real-time strategy games",
  },
};

/**
 * Default export for easy importing
 */
export default GAME_CONFIGS;
