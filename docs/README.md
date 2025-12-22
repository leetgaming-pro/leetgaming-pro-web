# LeetGaming Web Frontend - Documentation

> Next.js 14+ application for the LeetGaming competitive gaming platform

**Last Updated**: November 29, 2025

## Quick Links

- [Architecture](./ARCHITECTURE.md) - **START HERE** - Complete technical architecture
- [Status Report](./STATUS_REPORT.md) - Current implementation status
- [Brand Guidelines](./BRAND-GUIDELINES.md) - Logos, colors, components
- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Development roadmap
- [UX Implementation](./UX_IMPLEMENTATION.md) - UI/UX documentation
- [Next Steps](./NEXT_STEPS.md) - Immediate priorities
- [SDK Documentation](../types/replay-api/README.md) - API SDK reference

---

## Project Structure

```
leetgaming-pro-web/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (proxy to backend)
│   ├── signin/            # Authentication pages
│   ├── signup/            # Registration
│   ├── onboarding/        # User onboarding flow
│   ├── match-making/      # Matchmaking wizard
│   ├── tournaments/       # Tournament pages
│   ├── teams/             # Team/squad management
│   ├── players/           # Player profiles
│   ├── replays/           # Replay management
│   ├── wallet/            # Wallet/payments
│   ├── cloud/             # Cloud storage
│   ├── ranked/            # Ranked mode
│   ├── leaderboards/      # Global rankings
│   ├── admin/             # Admin dashboard
│   └── [other pages]/     # Additional routes
│
├── components/            # React components
│   ├── auth/              # Auth components (signin, signup, auth-sync)
│   ├── default-layout/    # Layout + providers
│   ├── match-making/      # Matchmaking wizard components
│   ├── onboarding/        # Onboarding flow components
│   ├── tournaments/       # Tournament components
│   ├── teams/             # Team components
│   ├── players/           # Player components
│   ├── wallet/            # Wallet components
│   ├── logo/              # Logo components
│   ├── toast/             # Toast notifications
│   ├── search/            # Global search
│   └── ui/                # Base UI components
│
├── contexts/              # React Context providers
│   └── sdk-context.tsx    # SDK provider
│
├── hooks/                 # Custom React hooks
│   ├── use-auth.ts        # Auth hooks (useAuth, useRequireAuth, useOptionalAuth)
│   ├── use-wallet.ts      # Wallet operations
│   ├── use-matchmaking.ts # Matchmaking queue
│   ├── use-tournament.ts  # Tournament operations
│   ├── use-payment.ts     # Payment processing
│   ├── use-lobby.ts       # Lobby management + WebSocket
│   ├── use-subscription.ts # Subscription management
│   └── use-notifications.ts # Notifications
│
├── types/                 # TypeScript type definitions
│   └── replay-api/        # Backend API types & SDK
│       ├── sdk.ts         # Main SDK class
│       ├── auth.ts        # RID token manager
│       ├── *.sdk.ts       # Domain SDK wrappers
│       └── *.types.ts     # Type definitions
│
├── config/               # Configuration files
├── public/               # Static assets (logos, images)
├── styles/               # Global CSS (globals.css)
└── e2e/                  # Playwright E2E tests
```

---

## Technology Stack

| Technology   | Version | Purpose                         |
| ------------ | ------- | ------------------------------- |
| Next.js      | 14.x    | React framework with App Router |
| React        | 18.x    | UI library                      |
| TypeScript   | 5.x     | Type safety                     |
| Tailwind CSS | 3.x     | Utility-first styling           |
| NextUI       | 2.x     | Component library               |
| NextAuth.js  | 4.x     | Authentication                  |
| Playwright   | 1.x     | E2E testing                     |

---

## Key Features

### Implemented ✅

- **Authentication**: Steam OAuth, Google OAuth via NextAuth
- **Wallet System**: Balance display, transaction history
- **Checkout Flow**: Stripe integration, payment processing
- **Matchmaking Wizard**: Multi-step lobby creation with real SDK
- **Tournament System**: Bracket display, listing, details
- **Player Profiles**: Search, view, creation modal
- **Team Management**: Create, search, join squads
- **Replay Management**: Upload, list, view replays
- **Ranked Mode**: Rating display, match history
- **Leaderboards**: Player and team rankings

### SDK Integration ✅

All pages use the centralized SDK via `useSDK()` hook or domain hooks:

```typescript
// Direct SDK access
const { sdk } = useSDK();
const players = await sdk.playerProfiles.searchPlayerProfiles({ game_id: 'cs2' });

// Or use domain hooks
const { balance, deposit, withdraw } = useWallet();
const { joinQueue, leaveQueue, isSearching } = useMatchmaking();
```

**Available SDK APIs:**
- `onboarding` - Steam/Google OAuth onboarding
- `squads` - Squad/team CRUD operations
- `playerProfiles` - Player management
- `matches` - Match queries
- `replayFiles` - Replay management
- `wallet` - Financial operations
- `matchmaking` - Queue management with polling
- `lobbies` - Lobby management + WebSocket
- `tournaments` - Tournament operations
- `payment` - Payment processing
- `challenges` - VAR/dispute system
- `highlights` - Highlight extraction
- `blockchain` - Web3 integration

---

## E2E Test Coverage

| Test Suite   | Status | Tests                          |
| ------------ | ------ | ------------------------------ |
| Homepage     | ✅     | Basic smoke tests              |
| Auth         | ✅     | Login/logout flows             |
| Matchmaking  | ✅     | Wizard flow tests              |
| Tournaments  | ✅     | Listing, details, registration |
| Teams        | ✅     | Search, create, filters        |
| Players      | ✅     | Search, profiles               |
| Ranked       | ✅     | Stats, match history           |
| Leaderboards | ✅     | Rankings, filters              |
| Payments     | ✅     | Checkout flows                 |
| Replays      | ✅     | Upload, listing                |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run E2E tests
npm run e2e
```

---

## Environment Variables

Required variables in `.env.local`:

```env
# Backend API
NEXT_PUBLIC_REPLAY_API_URL=http://localhost:8080

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

---

## Commands

| Command          | Description              |
| ---------------- | ------------------------ |
| `npm run dev`    | Start development server |
| `npm run build`  | Production build         |
| `npm run lint`   | Run ESLint               |
| `npm run e2e`    | Run Playwright E2E tests |
| `npm run e2e:ui` | Run E2E with UI          |
