# Replay API SDK

Complete TypeScript SDK for the leetgaming-pro replay-api, implementing hierarchical resource ownership, authentication, and full CRUD operations.

## Features

- ✅ **Resource Ownership Model** - Hierarchical tenant→client→group→user ownership
- ✅ **Authentication** - RID token management with automatic header injection
- ✅ **Full CRUD Operations** - GET, POST, PUT, DELETE, PATCH with retry logic
- ✅ **File Upload** - Specialized client with progress tracking and status polling
- ✅ **Search & Filtering** - Fluent API for complex queries with visibility controls
- ✅ **Type Safety** - Complete TypeScript interfaces matching Go backend specs
- ✅ **Error Handling** - Automatic retry with exponential backoff
- ✅ **Visibility Controls** - Public/Private/Restricted/Custom access levels

## Installation

The SDK is already integrated into the project. Import from `@/types/replay-api`:

```typescript
import { ReplayAPISDK, getRIDTokenManager, SearchBuilder } from '@/types/replay-api';
```

## Quick Start

### Initialize SDK

```typescript
import { ReplayAPISDK } from '@/types/replay-api/sdk';
import { ReplayApiSettingsMock } from '@/types/replay-api/settings';
import { logger } from '@/lib/logger';

const sdk = new ReplayAPISDK(ReplayApiSettingsMock, logger);
```

### Authentication

The SDK automatically manages RID tokens through `RIDTokenManager`:

```typescript
import { getRIDTokenManager } from '@/types/replay-api/auth';

// After user signs in via Steam/Google OAuth
const tokenManager = getRIDTokenManager();

// Token is automatically stored and injected into requests
tokenManager.setFromOnboarding({
  profile: { id: 'profile-id', rid_source: 'steam', source_key: 'steam-id' },
  rid: 'rid-token-uuid',
  user_id: 'user-uuid'
});

// Check authentication status
if (tokenManager.isAuthenticated()) {
  // User is authenticated
}

// Get auth headers for manual requests
const headers = tokenManager.getAuthHeaders();
// { 'X-Resource-Owner-ID': 'rid-token-uuid', 'X-Intended-Audience': '1' }
```

### Resource Ownership

```typescript
import { ResourceOwner } from '@/types/replay-api/replay-file';

// Create ownership at different levels
const userOwner = ResourceOwner.fromUser('user-uuid', 'group-uuid');
const groupOwner = ResourceOwner.fromGroup('group-uuid');
const clientOwner = ResourceOwner.fromClient();
const tenantOwner = ResourceOwner.fromTenant();

// Check ownership level
if (userOwner.isUser()) {
  console.log('User-level ownership');
}

// Serialize for API
const json = userOwner.toJSON();
// { tenant_id: '...', client_id: '...', group_id: '...', user_id: '...' }
```

### Upload Replay Files

```typescript
import { UploadClient } from '@/types/replay-api/upload-client';
import { GameIDKey } from '@/types/replay-api/settings';

const uploadClient = new UploadClient(ReplayApiSettingsMock, logger);

const result = await uploadClient.uploadReplay(file, {
  gameId: GameIDKey.CounterStrike2,
  networkId: 'valve',
  onProgress: (progress) => {
    console.log(`${progress.phase}: ${progress.percentage}%`);
    // uploading: 50%
    // processing: 100%
    // completed: 100%
  }
});

if (result.success) {
  console.log('Replay uploaded:', result.replayFile);
} else {
  console.error('Upload failed:', result.error);
}
```

### Search & Filter

```typescript
import { SearchBuilder } from '@/types/replay-api/search-builder';

const search = new SearchBuilder()
  .withGameIds('cs2')
  .withResourceVisibilities('public')
  .withDateRanges([{
    start: '2024-01-01T00:00:00Z',
    end: '2024-12-31T23:59:59Z'
  }])
  .sortDesc('created_at')
  .paginate(1, 20)
  .build();

const response = await sdk.client.search(search);
```

### High-Level API Operations

#### Squads

```typescript
// Create squad
const squad = await sdk.squads.createSquad({
  game_id: 'cs2',
  name: 'My Team',
  symbol: 'MT',
  description: 'Competitive team',
  visibility_type: 'public'
});

// Search squads
const squads = await sdk.squads.searchSquads({
  game_id: 'cs2',
  name: 'Team'
});

// Update squad
await sdk.squads.updateSquad(squad.id, {
  description: 'Updated description'
});

// Delete squad
await sdk.squads.deleteSquad(squad.id);
```

#### Player Profiles

```typescript
// Create player profile
const profile = await sdk.playerProfiles.createPlayerProfile({
  game_id: 'cs2',
  nickname: 'ProPlayer',
  slug_uri: 'pro-player',
  roles: ['rifler', 'entry']
});

// Search profiles
const profiles = await sdk.playerProfiles.searchPlayerProfiles({
  game_id: 'cs2',
  nickname: 'Pro'
});
```

#### Matches

```typescript
// Get match
const match = await sdk.matches.getMatch('cs2', 'match-uuid');

// Search matches
const matches = await sdk.matches.searchMatches('cs2', {
  map: 'de_dust2',
  visibility: 'public'
});
```

#### Share Tokens

```typescript
// Create share token
const token = await sdk.shareTokens.createShareToken('cs2', 'replay-file-uuid', {
  expires_at: '2024-12-31T23:59:59Z'
});

// Revoke share token
await sdk.shareTokens.revokeShareToken('cs2', 'replay-file-uuid', 'token-uuid');
```

### Low-Level API Client

```typescript
// Direct HTTP methods
const response = await sdk.client.get('/custom/endpoint');
const created = await sdk.client.post('/custom/endpoint', { data: 'value' });
const updated = await sdk.client.put('/custom/endpoint/:id', { data: 'new' });
const deleted = await sdk.client.delete('/custom/endpoint/:id');

// Configure retry behavior
sdk.client.setMaxRetries(5);
sdk.client.setRetryDelay(2000);
sdk.client.setDefaultTimeout(60000);
```

## Type System

### Enums

- `GameIDKey` - cs2, csgo, valorant, lol, dota2
- `NetworkIDKey` - valve, faceit, esea, community, lan
- `VisibilityTypeKey` - public, restricted, private, custom
- `IntendedAudienceKey` - User(1), Group(2), Client(4), Tenant(8)
- `ReplayFileStatus` - Pending, Processing, Failed, Completed, Ready
- `MembershipType` - Owner, Admin, Member
- `SquadMembershipType` - Owner, Captain, Member
- `ProfileType` - User, Squad, Player
- `IdentifierSourceType` - Steam, Google, Discord, Epic

### Entities

All entity interfaces include:
- `BaseEntity` - id, visibility_level, visibility_type, resource_owner, timestamps
- `User`, `Group`, `Profile`, `Membership`, `RIDToken`
- `Squad`, `SquadMembership`, `PlayerProfile`
- `ReplayFile`, `Match`, `Round`, `ShareToken`

See `types/replay-api/entities.types.ts` for complete definitions.

## Architecture

The SDK follows SOLID principles and DRY:

```
types/replay-api/
├── index.ts              # Main entry point
├── settings.ts           # Enums, constants, API configuration
├── replay-file.ts        # ResourceOwner class + ReplayFile
├── entities.types.ts     # Complete entity interfaces
├── searchable.ts         # CSFilters (existing search types)
├── auth.ts              # RIDTokenManager
├── search-builder.ts    # Fluent search API
├── replay-api.client.ts # Low-level HTTP client
├── upload-client.ts     # Specialized upload client
└── sdk.ts               # High-level API wrappers
```

## Integration with NextAuth

The SDK automatically integrates with NextAuth. RID tokens are stored when users sign in:

```typescript
// app/api/auth/[...nextauth]/route.ts
import { getRIDTokenManager } from '@/types/replay-api/auth';

// Inside JWT callback
const { uid, rid } = await onboardingResponse.json();
getRIDTokenManager().setFromOnboarding({ profile, rid, user_id: uid });
```

## Error Handling

```typescript
const response = await sdk.client.get('/endpoint');

if (response.error) {
  console.error('Request failed:', response.error.message);
  console.error('Status:', response.status);
  console.error('Details:', response.error.details);
} else {
  console.log('Success:', response.data);
}
```

The client automatically retries on:
- 5xx server errors
- 429 rate limiting
- Network errors (AbortError, TypeError)

With exponential backoff: 1s, 2s, 4s...

## Advanced Usage

### Custom Request Options

```typescript
const controller = new AbortController();

const response = await sdk.client.get('/endpoint', {
  headers: { 'Custom-Header': 'value' },
  signal: controller.signal,
  timeout: 10000
});

// Cancel request
controller.abort();
```

### Batch Upload

```typescript
const files: File[] = [file1, file2, file3];

const results = await uploadClient.uploadBatch(
  files,
  { gameId: GameIDKey.CounterStrike2 },
  (completed, total, results) => {
    console.log(`Progress: ${completed}/${total}`);
  }
);
```

### Visibility Filtering

```typescript
const search = new SearchBuilder()
  .withRequestSource(ResourceOwner.fromUser('user-uuid'))
  .withIntendedAudience(IntendedAudienceKey.GroupAudienceIDKey)
  .withResourceVisibilities('restricted')
  .build();

// Only returns resources accessible to the user at group level
const results = await sdk.client.search(search);
```

## Contributing

When extending the SDK:

1. Add new enums to `settings.ts`
2. Add new entity interfaces to `entities.types.ts`
3. Add new API methods to `sdk.ts`
4. Update this README with usage examples

## License

See LICENSE file in project root.
