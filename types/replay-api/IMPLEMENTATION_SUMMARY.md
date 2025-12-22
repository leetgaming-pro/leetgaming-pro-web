# Replay API SDK Implementation - Summary

## Overview

The LeetGaming Pro frontend uses a comprehensive TypeScript SDK for interacting with the replay-api backend. The SDK provides type-safe access to all API endpoints with automatic authentication, retry logic, and React integration.

## Architecture

### SDK Provider Pattern

The SDK is provided globally via React Context:

```typescript
// App wraps everything with SDKProvider
<SDKProvider>
  <App />
</SDKProvider>

// Components access SDK via hook
const { sdk } = useSDK();
const players = await sdk.playerProfiles.searchPlayerProfiles({ game_id: 'cs2' });
```

### Provider Hierarchy

```
NextUIProvider
  └── NextThemesProvider
        └── SessionProvider (NextAuth)
              └── AuthSync (RID token sync)
                    └── SDKProvider (API SDK)
                          └── GlobalSearchProvider
                                └── ToastProvider
                                      └── Navbar + BreadcrumbBar + Main Content + Footer
```

**Note**: The provider hierarchy ensures:
- SDK is available before search (GlobalSearch uses SDK)
- Toast notifications are available everywhere
- Auth sync happens before SDK initialization

## Core Components

### 1. SDK Context (`/contexts/sdk-context.tsx`)

Provides a single SDK instance across the application:

```typescript
import { useSDK } from '@/contexts/sdk-context';

function MyComponent() {
  const { sdk, isReady } = useSDK();
  // SDK is memoized and consistent
}
```

### 2. Auth Hooks (`/hooks/use-auth.ts`)

Three authentication hooks for different use cases:

```typescript
// General auth state
const { isAuthenticated, user, signOut } = useAuth();

// Protected routes (auto-redirect)
const { isAuthenticated, isLoading, isRedirecting } = useRequireAuth();

// Public pages with optional auth
const { isAuthenticated, redirectToSignIn } = useOptionalAuth();
```

### 3. Domain Hooks

Pre-built hooks with state management for each domain:

| Hook | Features |
|------|----------|
| `useWallet()` | Balance, transactions, deposit/withdraw |
| `useMatchmaking()` | Queue join/leave, session polling |
| `useLobby()` | Create/join lobbies, ready state, WebSocket |
| `useTournament()` | List, register, brackets, prizes |
| `usePayment()` | Payment intents, confirmation, refunds |
| `useSubscription()` | Plans, subscribe, cancel, pause |
| `useNotifications()` | Fetch, mark read, delete |
| `useAuthExtensions()` | MFA setup, email verify, password reset |

## SDK APIs

The main `ReplayAPISDK` class provides access to all APIs:

```typescript
sdk.onboarding      // Steam/Google onboarding
sdk.squads          // Squad/team management
sdk.playerProfiles  // Player profile CRUD
sdk.matches         // Match queries
sdk.replayFiles     // Replay file management
sdk.shareTokens     // Share token creation
sdk.wallet          // Wallet operations
sdk.lobbies         // Lobby management
sdk.prizePools      // Prize pool operations
sdk.payment         // Payment processing
sdk.matchmaking     // Queue operations
sdk.tournaments     // Tournament management
sdk.search          // Global search
sdk.matchAnalytics  // Match analytics
sdk.challenges      // VAR/dispute system
sdk.highlights      // Highlight clips
sdk.blockchain      // Blockchain operations
```

## Authentication Flow

```
1. User signs in (Steam/Google/Email)
   ↓
2. NextAuth creates session
   ↓
3. AuthSync detects session change
   ↓
4. Backend onboarding returns RID token
   ↓
5. RIDTokenManager stores token
   ↓
6. All SDK requests include auth headers
   ↓
7. useAuth() hooks reflect authenticated state
```

### RID Token

The Resource Identity (RID) token is crucial for backend authorization:

- Stored in localStorage via `RIDTokenManager`
- Auto-injected in `X-Resource-Owner-ID` header
- Validated on every protected API call
- `useRequireAuth()` ensures RID presence

## Type System

### Enums

```typescript
GameIDKey        // cs2, csgo, valorant, lol, dota2
NetworkIDKey     // valve, faceit, esea, community
VisibilityTypeKey // public, restricted, private, custom
SessionStatus    // searching, found, starting, in_game, completed
TournamentStatus // draft, registration_open, in_progress, completed
```

### Entities

All entities extend `BaseEntity`:

```typescript
interface BaseEntity {
  id: string;
  visibility_level: IntendedAudienceKey;
  visibility_type: VisibilityTypeKey;
  resource_owner: ResourceOwner;
  created_at: Date;
  updated_at: Date;
}
```

Key entities:
- `User`, `Profile`, `Group`, `Membership`
- `Squad`, `SquadMembership`, `PlayerProfile`
- `ReplayFile`, `Match`, `Round`
- `Tournament`, `TournamentParticipant`
- `WalletBalance`, `Transaction`
- `Payment`, `Subscription`

## File Structure

```
contexts/
└── sdk-context.tsx       # SDK provider

hooks/
├── use-auth.ts           # Auth hooks
├── use-replay-api.ts     # SDK wrapper (legacy)
├── use-wallet.ts         # Wallet operations
├── use-matchmaking.ts    # Matchmaking
├── use-lobby.ts          # Lobby management
├── use-tournament.ts     # Tournaments
├── use-payment.ts        # Payments
├── use-subscription.ts   # Subscriptions
├── use-notifications.ts  # Notifications
└── use-auth-extensions.ts # MFA, password reset

types/replay-api/
├── sdk.ts                # Main SDK class
├── replay-api.client.ts  # HTTP client
├── auth.ts               # RIDTokenManager
├── settings.ts           # Enums, config
├── entities.types.ts     # Entity interfaces
├── wallet.sdk.ts         # Wallet API
├── wallet.types.ts       # Wallet types
├── matchmaking.sdk.ts    # Matchmaking API
├── matchmaking.types.ts  # Matchmaking types
├── lobby.sdk.ts          # Lobby API
├── lobby.types.ts        # Lobby types
├── tournament.sdk.ts     # Tournament API
├── tournament.types.ts   # Tournament types
├── payment.sdk.ts        # Payment API
├── payment.types.ts      # Payment types
├── challenge.sdk.ts      # Challenge API
├── challenge.types.ts    # Challenge types
├── highlights.sdk.ts     # Highlights API
├── highlights.types.ts   # Highlights types
└── blockchain.sdk.ts     # Blockchain API
```

## Usage Examples

### Basic SDK Usage

```typescript
import { useSDK } from '@/contexts/sdk-context';

function PlayerList() {
  const { sdk } = useSDK();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    sdk.playerProfiles.searchPlayerProfiles({ game_id: 'cs2' })
      .then(setPlayers);
  }, [sdk]);

  return <PlayerGrid players={players} />;
}
```

### Domain Hook Usage

```typescript
import { useWallet } from '@/hooks/use-wallet';

function WalletView() {
  const { balance, isLoadingBalance, deposit } = useWallet();

  if (isLoadingBalance) return <Spinner />;

  return (
    <div>
      <h2>Balance: {balance?.total_usd}</h2>
      <Button onClick={() => deposit({ amount: 100, currency: 'USDC' })}>
        Deposit $100
      </Button>
    </div>
  );
}
```

### Protected Route

```typescript
import { useRequireAuth } from '@/hooks/use-auth';

function ProtectedPage() {
  const { isAuthenticated, isLoading, user } = useRequireAuth();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return null; // Redirecting...

  return <Dashboard user={user} />;
}
```

## Error Handling

The SDK includes automatic retry with exponential backoff:

```typescript
// Retry on 5xx, 429, network errors
// Backoff: 1s, 2s, 4s...

const response = await sdk.client.get('/endpoint');

if (response.error) {
  console.error('Failed:', response.error.message);
  console.error('Status:', response.status);
}
```

## Testing

E2E tests verify the auth flow:

```typescript
// e2e/auth.spec.ts
test('should redirect users with session but no RID', async ({ page }) => {
  // Mock session WITHOUT RID
  await page.route('**/api/auth/session', ...);
  await page.goto('/match-making');
  // Should redirect to signin
  expect(page.url()).toContain('signin');
});
```

## Best Practices

1. **Use domain hooks** for common operations
2. **Use `useRequireAuth()`** for protected pages
3. **Use `useOptionalAuth()`** for public pages with auth features
4. **Never use `useSession()` directly** in components (use auth hooks)
5. **SDK is provided globally** - no need to instantiate

## Status

- ✅ SDK Provider implemented
- ✅ All domain hooks centralized
- ✅ Auth hooks standardized
- ✅ Type safety complete
- ✅ E2E tests passing
- ✅ Documentation updated

**Last Updated**: 2025-12-22
