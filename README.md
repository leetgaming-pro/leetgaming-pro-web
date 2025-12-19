# LeetGaming.PRO Web

Next.js 14 frontend for the LeetGaming.PRO esports platform.

[![Build Status](https://github.com/leetgaming-pro/leetgaming-pro-web/workflows/CI/badge.svg)](https://github.com/leetgaming-pro/leetgaming-pro-web/actions)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)

---

## Overview

The LeetGaming.PRO frontend provides:

| Feature | Description |
|---------|-------------|
| **Dashboard** | Player statistics, recent matches, notifications |
| **Matchmaking** | Queue management, skill-based pairing |
| **Tournaments** | Registration, brackets, live results |
| **Replay Viewer** | Match analysis, event timeline, scoreboard |
| **Wallet** | Balance management, transactions, payouts |
| **Team Management** | Squad creation, member invites, statistics |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3030
```

### With Full Platform

```bash
# From root directory
cd ..
make local-up
```

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript check |
| `npm test` | Run Jest tests |
| `npm run test:e2e` | Run Playwright E2E tests |

---

## Project Structure

```
leetgaming-pro-web/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth routes (signin, signup)
│   ├── api/                # API routes
│   │   └── auth/           # NextAuth.js
│   ├── dashboard/          # User dashboard
│   ├── match-making/       # Matchmaking wizard
│   ├── teams/              # Team management
│   ├── tournaments/        # Tournament system
│   ├── replays/            # Replay library
│   ├── wallet/             # Financial operations
│   └── ...
├── components/             # React components
│   ├── ui/                 # UI primitives
│   ├── match-making/       # Matchmaking components
│   ├── teams/              # Team components
│   ├── replay/             # Replay viewer
│   └── ...
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript definitions
│   └── replay-api/         # API SDK
├── lib/                    # Utilities
│   ├── api/                # API client
│   └── design/             # Design system
├── e2e/                    # Playwright tests
└── styles/                 # Global styles
```

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| UI Library | NextUI 2.3 |
| Styling | Tailwind CSS |
| Icons | Iconify |
| Authentication | NextAuth.js |
| State | React Hooks + SWR |
| Testing | Playwright + Jest |
| Error Tracking | Sentry |

---

## Configuration

### Environment Variables

Create `.env.local`:

```bash
# API
REPLAY_API_URL=http://localhost:8080

# NextAuth
NEXTAUTH_URL=http://localhost:3030
NEXTAUTH_SECRET=your-secret-at-least-32-chars

# OAuth Providers
STEAM_API_KEY=your-steam-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Sentry (optional)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

---

## API SDK

The `types/replay-api/` directory contains a typed SDK:

```typescript
import { sdk } from '@/lib/api/client';

// Players
const players = await sdk.players.list();
const player = await sdk.players.get(playerId);

// Squads
const squads = await sdk.squads.list();
const squad = await sdk.squads.create({ name, tag });

// Matchmaking
const session = await sdk.matchmaking.join(gameId);
```

**Never use hardcoded API routes:**

```typescript
// ✅ Correct
const data = await sdk.players.get(id);

// ❌ Wrong - never do this
const data = await fetch('/api/v1/players');
```

---

## Testing

### Unit Tests (Jest)

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# With UI
npx playwright test --ui

# Specific test
npx playwright test e2e/auth.spec.ts

# Debug mode
npx playwright test --debug
```

---

## Design System

### Brand Colors

```css
--leet-navy: #34445C;       /* Primary navy */
--leet-lime: #DCFF37;       /* Dark mode accent */
--leet-orange: #FF4654;     /* Light mode accent */
--leet-gold: #FFC700;       /* Gold accent */
--leet-cream: #F5F0E1;      /* Replaces white */
```

### Color Contrast Rules

| Background | Text Color |
|------------|------------|
| Navy (#34445C) | Cream (#F5F0E1) |
| Lime (#DCFF37) | Navy (#34445C) |
| Cream (#F5F0E1) | Navy (#34445C) |

### Component Guidelines

- Use `clip-path` for edgy buttons (no `rounded`)
- Use brand CSS variables
- Support both light and dark themes
- Test at 375px, 768px, 1024px, 1440px

---

## Development Guidelines

### TypeScript Standards

```typescript
// ✅ Use proper types
interface PlayerProps {
  id: string;
  name: string;
  rating: number;
}

// ❌ Never use any
const data: any; // Forbidden
```

### Component Pattern

```tsx
// Functional component with typed props
interface TeamCardProps {
  team: Team;
  onClick?: () => void;
}

export function TeamCard({ team, onClick }: TeamCardProps) {
  return (
    <div 
      className="bg-leet-navy p-4 clip-path-edgy"
      onClick={onClick}
    >
      <h3 className="text-leet-cream">{team.name}</h3>
    </div>
  );
}
```

### Hook Pattern

```typescript
// SWR-based data fetching
export function usePlayer(playerId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    playerId ? `/players/${playerId}` : null,
    () => sdk.players.get(playerId)
  );

  return {
    player: data,
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}
```

---

## Deployment

### Docker

```bash
# Build image
docker build -t leetgaming-web:latest .

# Run container
docker run -p 3030:3030 \
  -e REPLAY_API_URL="http://api:8080" \
  leetgaming-web:latest
```

### Kubernetes

```bash
# Deploy to cluster
kubectl apply -f k8s/web-frontend.yaml

# Check status
kubectl get pods -n leetgaming -l app=web-frontend

# View logs
kubectl logs -n leetgaming -l app=web-frontend
```

---

## Documentation

| Document | Location |
|----------|----------|
| Component Library | [docs/components/LIBRARY.md](./docs/components/LIBRARY.md) |
| Brand Guidelines | [docs/BRAND-GUIDELINES.md](./docs/BRAND-GUIDELINES.md) |
| Implementation Plan | [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) |
| SDK Types | [types/replay-api/README.md](./types/replay-api/README.md) |

---

## Contributing

1. Create feature branch
2. Follow TypeScript strict mode
3. Write tests for new features
4. Ensure mobile responsiveness
5. Test in both light/dark themes
6. Submit pull request

---

## License

Proprietary - © 2025 LeetGaming Pro. All rights reserved.

---

*Maintained by the LeetGaming Platform Engineering Team*  
*Last Updated: December 19, 2025*
