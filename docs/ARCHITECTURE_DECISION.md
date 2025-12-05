# Architecture Decision: Direct replay-api Integration

## Decision

**Call replay-api endpoints directly from frontend components** instead of creating Next.js API route wrappers.

## Context

The LeetGaming Pro web app has two main services:
1. **leetgaming-pro-web** (Next.js frontend)
2. **replay-api** (Go backend with MongoDB)

The replay-api already provides comprehensive REST endpoints for all features:
- Matchmaking: `/matchmaking/queue`, `/matchmaking/session/{id}`, `/matchmaking/pools/{game_id}`
- Squads: `/squads`, `/squads/{id}`, `/squads/{id}/members`
- Players: `/players`
- Lobbies: `/api/lobbies` with WebSocket support
- Prize Pools: `/api/matchmaking/prize-pools`

## Rationale

### Why Direct Integration is Better

1. **No Duplication**
   - Avoid maintaining duplicate API logic
   - Single source of truth in replay-api
   - No sync issues between layers

2. **Better Performance**
   - Eliminates extra network hop (Client → Next.js → replay-api → Next.js → Client)
   - Reduced latency
   - Direct connection: Client → replay-api

3. **Simpler Architecture**
   - Fewer moving parts
   - Less code to maintain
   - Clear separation: UI in Next.js, Business logic in replay-api

4. **Real-time Capabilities**
   - WebSocket connections work naturally
   - No proxy complexity
   - Direct event streaming

### When to Use Next.js API Routes

Only use Next.js API routes for:

1. **Server-Side Operations**
   - Operations requiring server-side secrets
   - Token exchange/refresh
   - Server-side rendering data fetching

2. **Authentication Middleware**
   - Session validation before calling replay-api
   - Adding auth tokens to requests
   - Rate limiting

3. **Response Transformation**
   - When replay-api format needs adaptation for UI
   - Aggregating multiple replay-api calls
   - Caching strategies

## Implementation Strategy

### Phase 1: Update Components to Call replay-api Directly

```typescript
// ❌ OLD: Via Next.js wrapper
const response = await fetch('/api/squads?player_id=123');

// ✅ NEW: Direct to replay-api
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';

const response = await fetch(`${ReplayApiSettingsMock.baseUrl}/squads?player_id=123`, {
  headers: {
    'Authorization': `Bearer ${token}`, // Get from NextAuth session
  },
});
```

### Phase 2: Create Reusable API Client

```typescript
// lib/replay-api-client.ts
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { getSession } from 'next-auth/react';

class ReplayApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const session = await getSession();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': session?.user ? `Bearer ${session.accessToken}` : '',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Squads
  async getSquads(playerId: string) {
    return this.request(`/squads?player_id=${playerId}`);
  }

  async getSquad(id: string) {
    return this.request(`/squads/${id}`);
  }

  async createSquad(data: any) {
    return this.request('/squads', { method: 'POST', body: JSON.stringify(data) });
  }

  // Matchmaking
  async joinQueue(data: any) {
    return this.request('/matchmaking/queue', { method: 'POST', body: JSON.stringify(data) });
  }

  async leaveQueue(sessionId: string) {
    return this.request(`/matchmaking/queue/${sessionId}`, { method: 'DELETE' });
  }

  async getSessionStatus(sessionId: string) {
    return this.request(`/matchmaking/session/${sessionId}`);
  }

  // Players
  async searchPlayers(query: string) {
    return this.request(`/players?search=${encodeURIComponent(query)}`);
  }
}

export const apiClient = new ReplayApiClient(ReplayApiSettingsMock.baseUrl);
```

### Phase 3: Update Components

```typescript
// components/match-making/squad-form.tsx
import { apiClient } from '@/lib/replay-api-client';
import { useEffect, useState } from 'react';

export function SquadForm() {
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSquads() {
      try {
        const session = await getSession();
        if (!session?.user?.id) return;

        const data = await apiClient.getSquads(session.user.id);
        setSquads(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadSquads();
  }, []);

  // ... rest of component
}
```

## Migration Plan

### Immediate Actions (Today)

1. ✅ Remove unnecessary Next.js API wrapper routes:
   - Delete `/app/api/squads/route.ts` (just created, not needed)
   - Keep `/app/api/matchmaking/queue/route.ts` only if needed for auth middleware

2. ✅ Create `lib/replay-api-client.ts` - Centralized API client

3. ✅ Update components one by one:
   - `squad-form.tsx` - Replace mock data with real API calls
   - `choose-region-form.tsx` - Add auto-detect functionality
   - Other components as needed

### Short Term (This Week)

4. Add authentication token management
5. Add error handling and retry logic
6. Add loading states
7. Test with real replay-api backend

### Medium Term (Next Week)

8. Add WebSocket support for real-time updates
9. Implement caching strategies
10. Add optimistic UI updates
11. Performance optimization

## Benefits Realized

1. **Simplified Stack**
   - No API wrapper layer to maintain
   - Direct communication
   - Clear architecture

2. **Better Developer Experience**
   - Single place to update API logic (replay-api)
   - Type-safe with TypeScript
   - Easier debugging

3. **Production Ready**
   - Scalable architecture
   - No bottlenecks
   - Real-time capable

## Decision Log

- **Date**: 2025-11-23
- **Decision Maker**: Development Team
- **Status**: Approved
- **Review Date**: 2025-12-01

## Related Documents

- `IMPLEMENTATION_PLAN.md` - Full implementation roadmap
- `types/replay-api/README.md` - SDK documentation
- `jira-tickets/EPIC-001-E2E-Test-Coverage.md` - Testing strategy

---

**Conclusion**: This architecture decision simplifies the stack, improves performance, and aligns with microservices best practices. The frontend focuses on UI/UX while the replay-api handles all business logic and data persistence.
