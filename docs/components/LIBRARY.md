# Component Library

> UI component catalog for the LeetGaming web frontend

**Last Updated**: November 29, 2025

## Directory Structure

```
components/
├── match-making/           # Matchmaking wizard
│   ├── wizard-context.tsx  # State management with SDK
│   ├── game-mode-form.tsx
│   ├── choose-region-form.tsx
│   ├── squad-form.tsx
│   ├── prize-distribution-selector.tsx
│   └── review-confirm-form.tsx
├── tournaments/            # Tournament components
│   └── tournament-bracket.tsx
├── teams/                  # Team/squad management
│   ├── team-card/
│   ├── team-form/
│   │   └── launch-your-squad-button.tsx  # Creates squads via SDK
│   └── invite-member/
├── players/                # Player components
│   ├── player-creation-modal.tsx  # Creates profiles via SDK
│   ├── player-search-input/
│   └── mini-player-card/
├── wallet/                 # Wallet components
│   ├── wallet-card.tsx
│   └── modals/
├── checkout/               # Payment flow
│   ├── checkout-flow.tsx
│   └── stripe-checkout-form.tsx
├── filters/                # Filter components
│   └── ctas/
│       └── material-button/
│           └── battle-button.tsx
├── replay/                 # Replay components
│   ├── upload/
│   └── game-events/
└── layouts/                # Layout components
    └── centered-content.tsx
```

---

## Key Components

### Matchmaking

| Component | Description | SDK Integration |
|-----------|-------------|-----------------|
| `WizardContext` | State management | ✅ MatchmakingAPI |
| `GameModeForm` | Game mode selection | - |
| `ChooseRegionForm` | Region selection | - |
| `SquadForm` | Squad selection | - |
| `PrizeDistributionSelector` | Prize split config | - |
| `ReviewConfirmForm` | Final confirmation | - |

### Teams

| Component | Description | SDK Integration |
|-----------|-------------|-----------------|
| `LaunchYourSquadButton` | Create squad modal | ✅ SquadAPI.createSquad() |
| `TeamCard` | Team display card | - |
| `PlayerSearchInput` | Search players | - |

### Players

| Component | Description | SDK Integration |
|-----------|-------------|-----------------|
| `PlayerCreationModal` | Create profile modal | ✅ PlayerProfileAPI.createPlayerProfile() |
| `MiniPlayerCard` | Compact player card | - |

### Tournaments

| Component | Description | SDK Integration |
|-----------|-------------|-----------------|
| `TournamentBracket` | Bracket visualization | - |

---

## SDK-Integrated Components

These components now use real SDK calls instead of mock data:

### `wizard-context.tsx`
```typescript
// Uses MatchmakingAPI for queue operations
const response = await matchmakingSDK.joinQueue({
  player_id: playerId,
  preferences: { ... },
  player_mmr: 1500,
});
```

### `launch-your-squad-button.tsx`
```typescript
// Uses SquadAPI for squad creation
const squad = await sdk.squads.createSquad({
  game_id: formData.game,
  name: formData.displayName,
  symbol: formData.symbol,
  description: formData.description,
});
```

### `player-creation-modal.tsx`
```typescript
// Uses PlayerProfileAPI for profile creation
const profile = await sdk.playerProfiles.createPlayerProfile({
  game_id: formData.game,
  nickname: formData.displayName,
  slug_uri: formData.slug,
  roles: formData.role ? [formData.role] : undefined,
});
```

---

## Component Patterns

### Loading States
All components use consistent loading patterns:
```tsx
{isLoading && <Spinner size="lg" label="Loading..." />}
```

### Error States
Error handling with retry:
```tsx
{error && (
  <Card className="bg-danger-50">
    <CardBody>
      <Icon icon="solar:danger-triangle-bold" />
      <p>{error}</p>
    </CardBody>
  </Card>
)}
```

### Form Validation
Using controlled inputs with validation:
```tsx
const validateForm = (): boolean => {
  if (!formData.name || formData.name.length < 3) {
    setError("Name must be at least 3 characters");
    return false;
  }
  return true;
};
```

---

## Icon Usage

Using Iconify with Solar icons:
```tsx
import { Icon } from '@iconify/react';

<Icon icon="solar:users-group-two-rounded-bold-duotone" width={28} />
<Icon icon="solar:check-circle-bold" width={20} />
<Icon icon="solar:danger-triangle-bold" width={20} />
```

---

## Styling

Using NextUI + Tailwind CSS:
- Cards with gradient backgrounds
- Chips for status indicators
- Progress bars for completion
- Consistent color scheme (primary/secondary)
