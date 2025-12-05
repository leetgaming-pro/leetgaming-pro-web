# LeetGaming PRO Web

Next.js frontend for the LeetGaming PRO platform.

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:3030**

---

## Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run Playwright E2E tests |

---

## Project Structure

```
leetgaming-pro-web/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth routes
│   ├── api/                # API routes
│   ├── ranked/             # Ranked system
│   ├── leaderboards/       # Global rankings
│   ├── players/            # Player profiles
│   ├── teams/              # Team management
│   ├── replays/            # Replay library
│   ├── supply/             # Marketplace
│   └── ...
├── components/             # React components
│   ├── ui/                 # UI primitives
│   └── ...
├── types/                  # TypeScript types
│   └── replay-api/         # API SDK
├── lib/                    # Utilities
├── public/                 # Static assets
└── e2e/                    # Playwright tests
```

---

## Environment Variables

Create `.env.local` in the project root:

```env
# API Connection
REPLAY_API_URL=http://localhost:8080

# Authentication
NEXTAUTH_URL=http://localhost:3030/api/auth
NEXTAUTH_SECRET=<openssl rand -base64 32>

# OAuth Providers
STEAM_API_KEY=<your-steam-api-key>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

---

## Development

### Running Against Local API

```bash
# Option 1: Start full platform (recommended)
cd ..
make local-up

# Option 2: Run only the frontend (requires API running separately)
npm run dev
```

### Running Against Kubernetes

When running `make local-up` from the root, the web frontend is deployed to Kubernetes and accessible at http://localhost:3030.

To deploy changes to Kubernetes:

```bash
cd ..
make local-update
```

---

## Testing

### Unit Tests (Jest)

```bash
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### E2E Tests (Playwright)

```bash
# Against development server
npm run test:e2e

# Against Kubernetes deployment
PLAYWRIGHT_BASE_URL=http://localhost:3030 npx playwright test
```

---

## TypeScript SDK

The `types/replay-api/` directory contains a TypeScript SDK for the Replay API:

- **RIDTokenManager** - Authentication and token lifecycle
- **SearchBuilder** - Fluent API for building queries
- **UploadClient** - File upload with progress tracking
- **ReplayAPISDK** - High-level SDK wrapping all APIs

See [types/replay-api/README.md](./types/replay-api/README.md) for documentation.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI Library:** NextUI 2.3.6
- **Styling:** Tailwind CSS
- **Icons:** Iconify
- **Auth:** NextAuth.js
- **Testing:** Jest + Playwright

---

## Full Platform

To run the entire platform (web + API + databases):

```bash
cd ..
make local-up      # Start everything
make local-down    # Stop everything
```

See [root README](../README.md) for more details.

---

## Jira

[LeetGaming Project Board](https://leetgaming.atlassian.net/jira/software/projects/LGPFRONT)

---

<div align="center">
  <sub>Built with ❤️ by the LeetGaming PRO Platform team</sub>
</div>
