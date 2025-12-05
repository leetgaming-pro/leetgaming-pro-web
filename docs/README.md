# LeetGaming Web Frontend - Documentation

> Next.js 14+ application for the LeetGaming competitive gaming platform

**Last Updated**: November 29, 2025

## Quick Links

- [Status Report](./STATUS_REPORT.md) - Current implementation status
- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Development roadmap
- [UX Implementation](./UX_IMPLEMENTATION.md) - UI/UX documentation
- [Next Steps](./NEXT_STEPS.md) - Immediate priorities

---

## Project Structure

```
leetgaming-pro-web/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (proxy to backend)
│   ├── match-making/      # Matchmaking wizard
│   ├── tournaments/       # Tournament pages
│   ├── teams/             # Team/squad management
│   ├── players/           # Player profiles
│   ├── replays/           # Replay management
│   ├── wallet/            # Wallet/payments
│   ├── ranked/            # Ranked mode
│   ├── leaderboards/      # Global rankings
│   └── [other pages]/     # Additional routes
├── components/            # React components
│   ├── match-making/      # Matchmaking wizard components
│   ├── tournaments/       # Tournament components
│   ├── teams/             # Team components
│   ├── players/           # Player components
│   ├── wallet/            # Wallet components
│   └── ui/                # Base UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── types/                 # TypeScript type definitions
│   └── replay-api/        # Backend API types & SDK
├── config/               # Configuration files
├── public/               # Static assets
└── e2e/                  # Playwright E2E tests
```

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| NextUI | 2.x | Component library |
| NextAuth.js | 4.x | Authentication |
| Playwright | 1.x | E2E testing |

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

All major pages now use real SDK integration:
- `MatchmakingAPI` - Queue management with polling
- `SquadAPI` - Squad CRUD operations
- `PlayerProfileAPI` - Player management
- `TournamentAPI` - Tournament operations
- `WalletAPI` - Financial operations

---

## E2E Test Coverage

| Test Suite | Status | Tests |
|------------|--------|-------|
| Homepage | ✅ | Basic smoke tests |
| Auth | ✅ | Login/logout flows |
| Matchmaking | ✅ | Wizard flow tests |
| Tournaments | ✅ | Listing, details, registration |
| Teams | ✅ | Search, create, filters |
| Players | ✅ | Search, profiles |
| Ranked | ✅ | Stats, match history |
| Leaderboards | ✅ | Rankings, filters |
| Payments | ✅ | Checkout flows |
| Replays | ✅ | Upload, listing |

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

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run e2e` | Run Playwright E2E tests |
| `npm run e2e:ui` | Run E2E with UI |
