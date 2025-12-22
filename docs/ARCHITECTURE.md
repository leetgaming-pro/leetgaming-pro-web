# LeetGaming Pro Web - Architecture Documentation

**Last Updated**: December 22, 2025
**Status**: Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Provider Architecture](#provider-architecture)
3. [Authentication System](#authentication-system)
4. [SDK Architecture](#sdk-architecture)
5. [Routing & Pages](#routing--pages)
6. [Component Patterns](#component-patterns)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Theming & Branding](#theming--branding)
10. [Testing](#testing)

---

## Overview

LeetGaming Pro Web is a Next.js 14 application using the App Router with React Server Components. It connects to the `replay-api` backend (Go) for all data operations.

### Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 14.x |
| UI Library | React | 18.x |
| Type System | TypeScript | 5.x |
| Styling | Tailwind CSS + NextUI | 3.x / 2.x |
| Authentication | NextAuth.js | 4.x |
| Testing | Playwright | 1.x |
| State | React Context + Hooks | - |

---

## Provider Architecture

The application uses a carefully ordered provider hierarchy. **Order matters** because providers depend on each other.

### Provider Hierarchy

```
NextUIProvider (UI framework, router navigation)
  └── NextThemesProvider (dark/light mode switching)
        └── SessionProvider (NextAuth.js session management)
              └── AuthSync (RID token synchronization)
                    └── SDKProvider (API SDK singleton)
                          └── GlobalSearchProvider (search uses SDK)
                                └── ToastProvider (notifications)
                                      └── Application Content
```

### Files

| Provider | Location |
|----------|----------|
| `Providers` | `components/default-layout/providers.tsx` |
| `SDKProvider` | `contexts/sdk-context.tsx` |
| `ToastProvider` | `components/toast/toast-provider.tsx` |
| `GlobalSearchProvider` | `components/search/global-search-provider.tsx` |
| `AuthSync` | `components/auth/auth-sync.tsx` |

### Why This Order?

1. **NextUIProvider** must wrap everything (provides theme context)
2. **NextThemesProvider** provides theme to all UI components
3. **SessionProvider** provides NextAuth session (OAuth/credentials)
4. **AuthSync** synchronizes NextAuth session → RID token
5. **SDKProvider** uses RID token for authenticated API requests
6. **GlobalSearchProvider** uses SDK for search API calls
7. **ToastProvider** provides notifications for SDK operations

---

## Authentication System

### Two-Layer Authentication

LeetGaming uses two authentication layers:

1. **NextAuth Session** - OAuth/credentials login (Steam, Google, Email)
2. **RID Token** - Backend authentication token (Resource Identity Token)

A user is **fully authenticated** only when both exist:

```typescript
const isAuthenticated = session?.user && session.user.rid;
```

### Auth Hooks

| Hook | Use Case | Auto-Redirect |
|------|----------|---------------|
| `useAuth()` | General auth state | No |
| `useRequireAuth()` | Protected pages | Yes (to /signin) |
| `useOptionalAuth()` | Public pages with auth features | No |

### Usage Examples

```typescript
// Protected page (wallet, admin, matchmaking)
function WalletPage() {
  const { isAuthenticated, isLoading, user } = useRequireAuth();
  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return null; // Redirecting...
  return <WalletContent user={user} />;
}

// Public page with auth features (tournaments, players)
function TournamentsPage() {
  const { isAuthenticated, redirectToSignIn } = useOptionalAuth();
  
  const handleRegister = () => {
    if (!isAuthenticated) {
      redirectToSignIn('/tournaments'); // Redirect with callback
      return;
    }
    // Proceed with registration
  };
}

// General auth state (navbar, sidebar)
function Navbar() {
  const { isAuthenticated, signOut, user } = useAuth();
  return isAuthenticated ? <UserMenu user={user} /> : <SignInButton />;
}
```

### Auth Flow Diagram

```
User clicks "Sign In"
        ↓
/signin page (BrandedSignIn component)
        ↓
OAuth Provider (Steam/Google) or Email/Password
        ↓
NextAuth callback → /api/auth/[...nextauth]
        ↓
Backend onboarding → Returns RID token
        ↓
AuthSync stores RID in RIDTokenManager
        ↓
SDK requests include X-Resource-Owner-ID header
        ↓
User is fully authenticated ✓
```

### RID Token Manager

Located in `types/replay-api/auth.ts`:

```typescript
const tokenManager = getRIDTokenManager();

// Set token after login
tokenManager.setFromOnboarding(response);

// Check authentication
tokenManager.isAuthenticated(); // boolean

// Get headers for API requests (automatic in SDK)
tokenManager.getAuthHeaders();
// { 'X-Resource-Owner-ID': 'rid-uuid', 'X-Intended-Audience': '1' }

// Clear on logout
tokenManager.clear();
```

---

## SDK Architecture

### Centralized SDK Provider

The SDK is provided globally via React Context. Never create SDK instances directly in components.

```typescript
// ✅ CORRECT - Use the SDK hook
const { sdk } = useSDK();
const players = await sdk.playerProfiles.searchPlayerProfiles({ game_id: 'cs2' });

// ❌ WRONG - Don't create instances directly
const sdk = new ReplayAPISDK(settings, logger); // Don't do this!
```

### SDK API Modules

| Module | Purpose |
|--------|---------|
| `sdk.onboarding` | Steam/Google OAuth onboarding |
| `sdk.squads` | Team/squad CRUD |
| `sdk.playerProfiles` | Player profile management |
| `sdk.matches` | Match queries |
| `sdk.replayFiles` | Replay file management |
| `sdk.shareTokens` | Share token creation/revocation |
| `sdk.wallet` | Balance, transactions, deposit, withdraw |
| `sdk.lobbies` | Lobby management |
| `sdk.prizePools` | Prize pool operations |
| `sdk.payment` | Payment processing |
| `sdk.matchmaking` | Queue join/leave, polling |
| `sdk.tournaments` | Tournament CRUD, registration |
| `sdk.search` | Global search |
| `sdk.matchAnalytics` | Match analytics |
| `sdk.challenges` | VAR/dispute system |
| `sdk.highlights` | Highlight extraction |
| `sdk.blockchain` | Web3 integration |

### Domain Hooks

Pre-built hooks with state management:

| Hook | Features |
|------|----------|
| `useWallet()` | Balance, transactions, deposit/withdraw with loading/error states |
| `useMatchmaking()` | Queue join/leave, session polling, elapsed time |
| `useLobby()` | Lobby management + WebSocket real-time updates |
| `useTournament()` | Tournament listing, registration, computed properties |
| `usePayment()` | Payment intents, confirmation, refunds |
| `useSubscription()` | Plan listing, subscribe, cancel, pause |
| `useNotifications()` | Fetch, mark read, delete with polling |
| `useAuthExtensions()` | MFA setup, email verify, password reset |

---

## Routing & Pages

### Route Types

| Type | Auth Hook | Example Pages |
|------|-----------|---------------|
| **Protected** | `useRequireAuth()` | /wallet, /admin, /match-making, /checkout |
| **Public + Auth Features** | `useOptionalAuth()` | /tournaments, /players, /teams, /cloud |
| **Public Only** | None | /, /signin, /signup, /docs |

### Key Routes

```
app/
├── page.tsx                 # Landing page (public)
├── signin/page.tsx          # Sign in (public)
├── signup/page.tsx          # Sign up (public)
├── onboarding/page.tsx      # User onboarding (protected)
├── match-making/page.tsx    # Matchmaking wizard (protected)
├── wallet/page.tsx          # Wallet (protected)
├── checkout/page.tsx        # Payment checkout (protected)
├── admin/                   # Admin dashboard (protected + admin role)
│   ├── page.tsx
│   ├── members/page.tsx
│   └── reports/page.tsx
├── tournaments/             # Tournament system (public + auth features)
│   ├── page.tsx             # List
│   └── [id]/page.tsx        # Detail
├── players/                 # Player profiles (public + auth features)
│   ├── page.tsx             # Search
│   ├── register/page.tsx    # Registration (protected)
│   └── [id]/page.tsx        # Profile view
├── teams/                   # Team management (public + auth features)
│   ├── page.tsx             # Search
│   ├── create/page.tsx      # Creation (protected)
│   └── [id]/page.tsx        # Team view
├── cloud/page.tsx           # Cloud storage (public + auth features)
├── ranked/page.tsx          # Ranked stats (public + auth features)
└── leaderboards/page.tsx    # Rankings (public)
```

---

## Component Patterns

### Standard Page Structure

```typescript
'use client';

import { useRequireAuth } from '@/hooks/use-auth';
import { useSDK } from '@/contexts/sdk-context';
import { Spinner } from '@nextui-org/react';
import { PageContainer } from '@/components/page-container';
import { title } from '@/components/primitives';

export default function MyPage() {
  const { isAuthenticated, isLoading, user } = useRequireAuth();
  const { sdk } = useSDK();
  
  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      </PageContainer>
    );
  }
  
  // Auth redirect handled by hook
  if (!isAuthenticated) return null;
  
  return (
    <PageContainer maxWidth="xl" padding="md">
      <h1 className={title()}>Page Title</h1>
      {/* Content */}
    </PageContainer>
  );
}
```

### Form Validation Pattern

```typescript
const [formData, setFormData] = useState({ name: '', email: '' });
const [errors, setErrors] = useState<Record<string, string>>({});

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};
  
  if (!formData.name) {
    newErrors.name = 'Name is required';
  } else if (formData.name.length < 3) {
    newErrors.name = 'Name must be at least 3 characters';
  }
  
  if (!formData.email) {
    newErrors.email = 'Email is required';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  // Submit...
};

// In JSX:
<Input
  label="Name"
  value={formData.name}
  onValueChange={(v) => setFormData({ ...formData, name: v })}
  isInvalid={!!errors.name}
  errorMessage={errors.name}
/>
```

### Error Handling Pattern

```typescript
const { showToast } = useToast();
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
  setError(null);
  try {
    await sdk.someApi.action();
    showToast('Action completed!', 'success');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An error occurred';
    setError(message);
    showToast(message, 'error');
  }
};

// In JSX:
{error && <Chip color="danger">{error}</Chip>}
```

---

## State Management

### Local State (Component)

```typescript
const [data, setData] = useState<T | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Shared State (Context)

Available contexts:
- `SDKContext` - API SDK singleton
- `ToastContext` - Toast notifications
- `GlobalSearchContext` - Search state and results
- `WizardContext` - Matchmaking wizard state

### Server State (Domain Hooks)

Domain hooks manage server state with caching and refresh:

```typescript
const { 
  balance,          // Current data
  isLoadingBalance, // Loading state
  balanceError,     // Error message
  refreshBalance,   // Refetch function
} = useWallet();
```

---

## API Integration

### Request Flow

```
Component → Domain Hook → SDK → ReplayApiClient → Backend API
                              ↓
                        RIDTokenManager
                        (auth headers)
```

### Automatic Features

- **Retry logic** - 3 retries with exponential backoff
- **Error handling** - Structured error responses
- **Auth headers** - Auto-injected from RIDTokenManager
- **Timeout** - 30 second default

### API Routes (Proxy)

For server-side operations, API routes proxy to the backend:

```
app/api/
├── auth/[...nextauth]/route.ts  # NextAuth endpoints
├── players/route.ts              # Player operations
├── squads/route.ts               # Squad operations
├── matches/route.ts              # Match queries
└── replays/route.ts              # Replay operations
```

---

## Theming & Branding

### Color Palette

| Color | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| Primary | `#FF4654` (Orange) | `#DCFF37` (Lime) | CTAs, accents |
| Navy | `#34445C` | `#34445C` | Headers, backgrounds |
| Cream | `#F5F0E1` | `#F5F0E1` | Brand white |
| Gold | `#FFC700` | `#FFC700` | Gradients, premium |

### CSS Classes

- `.leet-card` - Standard card with edgy corners
- `.leet-btn-primary` - Primary button
- `.leet-icon-box` - Icon container with brand gradient
- `.leet-hero-icon` - Large centered icon for empty states

### Logo Usage

| Logo | File | Usage |
|------|------|-------|
| Text Only | `/logo-red-only-text.png` | Navbar, auth pages |
| Full Logo | `/logo-red-full.png` | Footer, marketing |
| Fox Only | `/logo-fox-mini.png` | Favicons |

---

## Testing

### E2E Tests (Playwright)

```bash
# Run all tests
npm run e2e

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Run with UI
npx playwright test --ui
```

### Test Coverage

- ✅ Authentication flows
- ✅ RID token validation
- ✅ Protected route access
- ✅ OAuth provider flows
- ✅ Form validation
- ✅ Error handling

---

## Quick Reference

### When to use which auth hook?

| Page Type | Hook | Redirects? |
|-----------|------|------------|
| Must be logged in | `useRequireAuth()` | Yes |
| Optional login | `useOptionalAuth()` | No |
| Just need auth state | `useAuth()` | No |

### How to make an API call?

```typescript
const { sdk } = useSDK();
const data = await sdk.moduleName.method(params);
```

### How to show a toast?

```typescript
const { showToast } = useToast();
showToast('Message', 'success'); // 'info' | 'success' | 'warning' | 'error'
```

### How to handle form errors?

```typescript
<Input isInvalid={!!errors.field} errorMessage={errors.field} />
```

---

**Document Version**: 1.0
**Last Updated**: December 22, 2025

