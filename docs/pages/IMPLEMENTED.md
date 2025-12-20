# Implemented Pages Reference

> All implemented routes in the LeetGaming web frontend

**Last Updated**: November 29, 2025

## Route Overview

### Public Routes

| Route      | Status  | Description         |
| ---------- | ------- | ------------------- |
| `/`        | ✅ Done | Landing page        |
| `/landing` | ✅ Done | Alternate landing   |
| `/about`   | ✅ Done | About page          |
| `/pricing` | ✅ Done | Subscription plans  |
| `/signin`  | ✅ Done | Sign in page        |
| `/signup`  | ✅ Done | Sign up page        |
| `/blog`    | ✅ Done | Blog index          |
| `/news`    | ✅ Done | News feed           |
| `/help`    | ✅ Done | Help/support center |

### Dashboard Routes (Auth Required)

| Route               | Status  | Description                     |
| ------------------- | ------- | ------------------------------- |
| `/cloud`            | ✅ Done | User dashboard (replay storage) |
| `/cloud/[group_id]` | ✅ Done | Group detail                    |
| `/ranked`           | ✅ Done | Ranked mode with stats          |
| `/analytics`        | ✅ Done | Analytics dashboard             |
| `/notifications`    | ✅ Done | Notification center             |
| `/settings`         | ✅ Done | User settings                   |

### Matchmaking Routes

| Route                    | Status  | Description                      |
| ------------------------ | ------- | -------------------------------- |
| `/match-making`          | ✅ Done | Matchmaking wizard with real SDK |
| `/match-making/enhanced` | ✅ Done | Enhanced wizard                  |

### Tournament Routes

| Route               | Status  | Description                |
| ------------------- | ------- | -------------------------- |
| `/tournaments`      | ✅ Done | Tournament list with API   |
| `/tournaments/[id]` | ✅ Done | Tournament detail with API |

### Match Routes

| Route                     | Status  | Description       |
| ------------------------- | ------- | ----------------- |
| `/match/[matchid]`        | ✅ Done | Match detail view |
| `/match/[matchid]/rounds` | ✅ Done | Round list        |

### Replay Routes

| Route           | Status  | Description          |
| --------------- | ------- | -------------------- |
| `/replays`      | ✅ Done | Replay list with SDK |
| `/replays/[id]` | ✅ Done | Replay detail        |
| `/upload`       | ✅ Done | Replay upload        |

### Player Routes

| Route               | Status  | Description               |
| ------------------- | ------- | ------------------------- |
| `/players`          | ✅ Done | Player search with SDK    |
| `/players/[id]`     | ✅ Done | Player profile            |
| `/players/register` | ✅ Done | Player registration modal |

### Team Routes

| Route         | Status  | Description              |
| ------------- | ------- | ------------------------ |
| `/teams`      | ✅ Done | Team/squad list with SDK |
| `/teams/[id]` | ✅ Done | Team detail              |

### Wallet & Payment Routes

| Route               | Status  | Description       |
| ------------------- | ------- | ----------------- |
| `/wallet`           | ✅ Done | Wallet management |
| `/checkout`         | ✅ Done | Payment flow      |
| `/checkout/success` | ✅ Done | Payment success   |

### Leaderboards

| Route           | Status  | Description                   |
| --------------- | ------- | ----------------------------- |
| `/leaderboards` | ✅ Done | Player/Team rankings with SDK |

### Highlights & Content Routes

| Route             | Status  | Description                                    |
| ----------------- | ------- | ---------------------------------------------- |
| `/highlights`     | ✅ Done | Game highlights - clutches, aces, multi-kills  |
| `/highlights/[id]`| 🔄 WIP  | Single highlight detail page                   |

The Highlights page is a state-of-the-art showcase of epic gaming moments featuring:
- **Infinite scroll** with intersection observer for smooth loading
- **Category filtering** by event type (Clutch, Ace, MultiKill, Headshot, etc.)
- **Map filtering** for all CS2 competitive maps
- **Sorting options** - Most Recent, Most Viewed, Most Liked, Kill Count
- **Featured highlights** section for trending content
- **Video player modal** for viewing highlights inline
- **Like & Share** functionality with clipboard/native share fallback
- **Responsive design** with beautiful animations via Framer Motion
- **Mock data fallback** when API is unavailable

### Utility Routes

| Route         | Status  | Description          |
| ------------- | ------- | -------------------- |
| `/search`     | ✅ Done | Search results       |
| `/supply`     | ✅ Done | Supply/inventory     |
| `/onboarding` | ✅ Done | User onboarding flow |
| `/docs`       | ✅ Done | Documentation        |

---

## API Routes

| Route                                   | Method      | Description         |
| --------------------------------------- | ----------- | ------------------- |
| `/api/auth/[...nextauth]`               | ALL         | NextAuth handlers   |
| `/api/payments`                         | ALL         | Payment CRUD        |
| `/api/webhooks/stripe`                  | POST        | Stripe webhook      |
| `/api/match-making/queue`               | POST/DELETE | Queue operations    |
| `/api/match-making/session/[sessionId]` | GET         | Session status      |
| `/api/match-making/lobbies`             | ALL         | Lobby CRUD          |
| `/api/onboarding/complete`              | POST        | Complete onboarding |
| `/api/upload`                           | POST        | Upload file         |

---

## SDK Integration Status

All pages now use real SDK integration via `types/replay-api/`:

| Page                | SDK Used                   | Methods                                           |
| ------------------- | -------------------------- | ------------------------------------------------- |
| `/tournaments`      | TournamentAPI              | `listTournaments()`, `getTournament()`            |
| `/tournaments/[id]` | TournamentAPI              | `getTournament()` with API fallback               |
| `/teams`            | SquadAPI                   | `searchSquads()`, `createSquad()`                 |
| `/players`          | PlayerProfileAPI           | `searchPlayerProfiles()`, `createPlayerProfile()` |
| `/leaderboards`     | PlayerProfileAPI, SquadAPI | `getLeaderboard()`                                |
| `/match-making`     | MatchmakingAPI             | `joinQueue()`, `leaveQueue()`, polling            |
| `/replays`          | ReplayFileAPI              | `searchReplayFiles()`                             |
| `/cloud`            | ReplayFileAPI              | `searchReplayFiles()`                             |
| `/match/[id]`       | MatchAPI                   | `getMatch()`                                      |
| `/highlights`       | HighlightsAPI              | `getHighlights()`, `getTrendingHighlights()`, `getClutches()`, `getAces()` |
