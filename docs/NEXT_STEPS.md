# Next Steps - Implementation Guide

## Summary

**Backend**: ✅ Already follows hexagonal architecture with ports/adapters/usecases
**SDK**: ✅ Complete TypeScript SDK exists in `types/replay-api/`
**Frontend**: ⏳ Needs implementation (remove mock data, add real API calls)

## Architecture Analysis

### Backend (replay-api) - Already Properly Architected ✅

```
pkg/domain/squad/
├── entities/           # Domain entities
├── ports/
│   ├── in/            # Input ports (commands, queries)
│   └── out/           # Output ports (repositories)
├── services/          # Domain services
├── usecases/          # Application usecases (business logic)
└── value-objects/     # Domain value objects
```

**Example UseCase** (`create_squad.go`):
- ✅ Single Responsibility: Only handles squad creation
- ✅ Dependency Inversion: Depends on ports (interfaces), not concrete implementations
- ✅ Open/Closed: Can extend without modifying
- ✅ Interface Segregation: Uses specific reader/writer interfaces
- ✅ DRY: Reuses IAM entities and common validation

**Conclusion**: Backend architecture is solid. No changes needed.

### Frontend SDK - Already Complete ✅

```typescript
// types/replay-api/sdk.ts
export class OnboardingAPI { ... }
export class WalletAPI { ... }
export class LobbyAPI { ... }
export class PrizePoolAPI { ... }

// types/replay-api/matchmaking.sdk.ts
export class MatchmakingSDK {
  async joinQueue(request: JoinQueueRequest): Promise<JoinQueueResponse>
  async leaveQueue(sessionId: string): Promise<void>
  async getSessionStatus(sessionId: string): Promise<SessionStatusResponse>
  startPolling(sessionId, callback, onError): void
}
```

**Conclusion**: SDK is complete and follows SOLID principles. Just use it!

---

## Implementation Focus: Frontend Components

### Priority 1: Update squad-form.tsx (2-3 hours)

**File**: `/components/match-making/squad-form.tsx`
**Lines to Replace**: 37-66

**Current (Mock Data)**:
```typescript
const user = {
  name: "Pedro Savelis",
  avatar: "https://avatars.githubusercontent.com/u/3760203?v=4",
  username: "sound",
  // ... mock data
};

const teamMock = {
  id: "team-mock-1",
  displayName: "Eth3ernity*",
  // ... mock data
};

const teams = [teamMock];
```

**Replace With (Real Data)**:
```typescript
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';

export const SquadForm = () => {
  const { data: session } = useSession();
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSquads() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Call replay-api directly
        const response = await fetch(
          `${ReplayApiSettingsMock.baseUrl}/squads?player_id=${session.user.id}`,
          {
            headers: {
              'Authorization': session.accessToken ? `Bearer ${session.accessToken}` : '',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load squads');
        }

        const data = await response.json();
        setSquads(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSquads();
  }, [session]);

  if (loading) {
    return <div>Loading squads...</div>; // Add proper skeleton
  }

  if (error) {
    return <div>Error: {error}</div>; // Add proper error UI
  }

  // Rest of component using real `squads` data
};
```

**Why This Approach**:
- ✅ **Single Responsibility**: Component only handles UI
- ✅ **Dependency Inversion**: Depends on session interface, not concrete auth
- ✅ **DRY**: Reuses existing SDK/settings
- ✅ **Open/Closed**: Can add features without modifying fetch logic
- ✅ **Simple**: Direct API call, no unnecessary layers

### Priority 2: Add Loading States (2 hours)

Create reusable loading component following SOLID:

```typescript
// components/ui/skeleton.tsx
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular'
}) => {
  // Single Responsibility: Only handles skeleton display
  return <div className={cn('animate-pulse bg-gray-200', className)} />;
};

// Usage in squad-form.tsx
if (loading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}
```

### Priority 3: Add Error Handling (2 hours)

Create reusable error component:

```typescript
// components/ui/error-message.tsx
interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry }) => {
  // Single Responsibility: Only handles error display
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <p className="text-red-800">{error}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 text-red-600">
          Retry
        </button>
      )}
    </div>
  );
};
```

### Priority 4: Add Form Validation (2-3 hours)

Use Zod for type-safe validation following SOLID:

```typescript
// lib/validation/squad-schema.ts
import { z } from 'zod';

// Single Responsibility: Only defines squad validation rules
export const squadSchema = z.object({
  displayName: z.string().min(3).max(50),
  tag: z.string().min(2).max(6).toUpperCase(),
  members: z.array(z.string()).min(1).max(5),
});

export type SquadFormData = z.infer<typeof squadSchema>;

// Usage in component
import { squadSchema, SquadFormData } from '@/lib/validation/squad-schema';

function validateSquadForm(data: unknown): SquadFormData {
  return squadSchema.parse(data); // Throws if invalid
}
```

---

## SOLID Principles Application

### Single Responsibility Principle ✅
- **Backend**: Each usecase has one responsibility
- **Frontend**: Components do one thing (UI), validation separate, API calls separate

### Open/Closed Principle ✅
- **Backend**: Can extend usecases without modifying existing ones
- **Frontend**: Can add new components without changing existing ones

### Liskov Substitution Principle ✅
- **Backend**: All port implementations are interchangeable
- **Frontend**: All SDK instances follow same interface

### Interface Segregation Principle ✅
- **Backend**: Uses specific Reader/Writer interfaces, not one giant interface
- **Frontend**: Components receive only props they need

### Dependency Inversion Principle ✅
- **Backend**: Usecases depend on ports (interfaces), not concrete implementations
- **Frontend**: Components depend on session interface, not specific auth provider

---

## DRY Principles Application

### Backend ✅
- Reuses common domain entities (`common.ResourceOwner`)
- Reuses IAM entities for authentication
- Shared validation logic

### Frontend
- ✅ SDK already created - don't recreate
- ✅ Settings already defined - reuse `ReplayApiSettingsMock`
- ⏳ Create shared components (Skeleton, ErrorMessage) - reuse across forms

---

## Ports & Adapters Application

### Backend (Already Implemented) ✅

```
Domain (Core)
├── Entities
├── Value Objects
└── Usecases
    ↓ depends on (interfaces)
    Ports (Interfaces)
    ├── Input Ports (Commands/Queries)
    └── Output Ports (Repositories)
        ↓ implemented by
        Adapters
        ├── MongoDB Adapter
        ├── HTTP Adapter
        └── WebSocket Adapter
```

### Frontend (To Implement)

```
Components (UI)
    ↓ uses
    SDK (Port - Interface to backend)
        ↓ implements
        HTTP Client (Adapter)
            ↓ calls
            replay-api (Backend)
```

**Key Point**: Frontend already has the port (SDK) and adapter (HTTP client). Just need to use them!

---

## Implementation Checklist

### Today
- [x] Analysis complete
- [x] Documentation created
- [x] Architecture verified

### Tomorrow (4-6 hours)
- [ ] Update `squad-form.tsx` (remove mock data)
- [ ] Add loading states
- [ ] Test with real backend

### Day 3 (6-7 hours)
- [ ] Add error handling
- [ ] Create error/loading components
- [ ] Update all other forms

### Day 4 (3-5 hours)
- [ ] Add form validation with Zod
- [ ] Create validation schemas
- [ ] Add validation UI

### Day 5 (4-6 hours)
- [ ] Create modals
- [ ] Add session persistence
- [ ] Test end-to-end
- [ ] Deploy

---

## Key Takeaways

1. **Backend is done** ✅
   - Proper hexagonal architecture
   - SOLID principles followed
   - Ports & adapters implemented
   - Don't touch it!

2. **SDK is done** ✅
   - Complete TypeScript client
   - Follows SOLID principles
   - Don't recreate it!

3. **Frontend needs work** ⏳
   - Remove mock data
   - Call SDK/API directly
   - Add UI polish (loading, errors)
   - Follow SOLID in components

4. **Keep it simple**
   - Use what exists
   - Don't add unnecessary layers
   - DRY: Reuse components
   - SOLID: Single responsibility per component

---

## Next Command

```bash
# Open the file that needs updating
code /Users/psavelis/github.com/leetgaming-pro/leetgaming-pro-web/components/match-making/squad-form.tsx

# Focus on lines 37-66
# Replace mock data with real API call
# Add loading state
# Add error handling
```

---

**Ready to implement!** 🚀

The architecture is solid on the backend. Just need to connect the frontend properly following the same principles.
