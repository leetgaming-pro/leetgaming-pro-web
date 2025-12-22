# E2E Tests for LeetGaming.PRO Web

> **End-to-End Testing with Playwright**
>
> **Last Updated:** December 22, 2025  
> **Test Framework:** Playwright

---

## Quick Start

```bash
# Install dependencies
npm install

# Run all E2E tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# Run specific test file
npx playwright test auth.spec.ts

# Run tests in headed mode
npx playwright test --headed

# Generate test report
npx playwright show-report
```

---

## Test Structure

```
e2e/
├── README.md                    # This file
├── global-setup.ts              # Test setup and configuration
├── fixtures/                    # Test fixtures and utilities
│   ├── auth.fixture.ts          # Authentication helpers
│   ├── console-errors.fixture.ts # Console error tracking
│   └── matchmaking.fixture.ts   # Matchmaking helpers
├── page-objects/                # Page Object Model classes
│   ├── matchmaking.page.ts      # Matchmaking page interactions
│   └── payment.page.ts          # Payment flow interactions
│
├── auth.spec.ts                 # Authentication tests
├── console-errors.spec.ts       # Console error detection
├── highlights.spec.ts           # Highlights page tests
├── homepage.spec.ts             # Homepage tests
├── hpa-scaling.spec.ts          # HPA scaling tests
├── leaderboards.spec.ts         # Leaderboard tests
├── match-detail.spec.ts         # Match detail page tests
├── matchmaking.spec.ts          # Matchmaking wizard tests
├── payments.spec.ts             # Payment flow tests
├── players.spec.ts              # Player profile tests
├── ranked.spec.ts               # Ranked mode tests
├── replays.spec.ts              # Replay viewer tests
├── routes.spec.ts               # Route navigation tests
├── search.spec.ts               # Search functionality tests
├── settings.spec.ts             # Settings page tests
├── teams.spec.ts                # Team/squad tests
├── tournaments.spec.ts          # Tournament tests
└── wallet.spec.ts               # Wallet operations tests
```

---

## Test Categories

| Category | File(s) | Purpose |
|----------|---------|---------|
| **Authentication** | `auth.spec.ts` | Login, signup, OAuth flows |
| **Matchmaking** | `matchmaking.spec.ts` | 6-step wizard, queue joining |
| **Payments** | `payments.spec.ts`, `wallet.spec.ts` | Deposits, withdrawals |
| **Content** | `replays.spec.ts`, `highlights.spec.ts` | Media viewing |
| **Social** | `teams.spec.ts`, `players.spec.ts` | Squad management |
| **Competition** | `tournaments.spec.ts`, `ranked.spec.ts` | Competitive features |
| **Navigation** | `routes.spec.ts`, `homepage.spec.ts` | Page routing |

---

## Writing Tests

### Page Object Pattern

```typescript
// page-objects/example.page.ts
export class ExamplePage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/example');
  }
  
  async clickButton() {
    await this.page.click('[data-testid="example-button"]');
  }
}

// example.spec.ts
test('should work', async ({ page }) => {
  const examplePage = new ExamplePage(page);
  await examplePage.goto();
  await examplePage.clickButton();
});
```

### Using Fixtures

```typescript
import { test } from './fixtures/auth.fixture';

test('authenticated user flow', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  await expect(authenticatedPage).toHaveURL('/dashboard');
});
```

---

## Best Practices

### ✅ Do

- Use `data-testid` attributes for selectors
- Use Page Object Model for reusable interactions
- Test mobile viewports (375px, 768px)
- Wait for network idle before assertions
- Use meaningful test descriptions

### ❌ Don't

- Use fragile CSS selectors (`.class-name`)
- Hard-code delays (`page.waitForTimeout`)
- Test implementation details
- Skip error handling tests

---

## Running in CI

Tests run automatically in GitHub Actions on:
- Pull requests to `main`
- Merges to `main`

See `.github/workflows/e2e.yml` for configuration.

---

## Related Documentation

| Document | Location |
|----------|----------|
| E2E Epic | `/docs/jira-tickets/EPIC-001-E2E-Test-Coverage.md` |
| Playwright Config | `/playwright.config.ts` |
| Test Infrastructure | `/docs/jira-tickets/TEST-001-Test-Infrastructure-Setup.md` |

---

*Maintained by the Platform Engineering team.*

