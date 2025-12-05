# TEST-001: Test Infrastructure Setup

## Story Details
- **Type:** Story
- **Epic:** EPIC-001 (E2E Test Coverage)
- **Priority:** Critical
- **Story Points:** 5
- **Assignee:** QA Team
- **Labels:** `infrastructure`, `playwright`, `testing-framework`, `foundation`
- **Sprint:** Sprint 1
- **Dependencies:** None (foundational work)

## User Story

**As a** QA Engineer
**I want** a robust test infrastructure with page objects, fixtures, and utilities
**So that** I can write maintainable, reusable E2E tests efficiently

## Description

Set up the foundational Playwright testing infrastructure including page object models, custom fixtures, test utilities, and helper functions that will be used across all test suites.

### Components to Create

1. **Page Object Models (POM)**
   - Base page class with common methods
   - Page-specific classes for each major page/component
   - Reusable component objects (modals, forms, buttons)

2. **Custom Fixtures**
   - Authenticated user fixture
   - API client fixture
   - Test data factory fixture
   - Screenshot/video capture fixture

3. **Test Utilities**
   - Authentication helpers (login, logout, session)
   - API mock response builders
   - Data generators (users, matches, replays)
   - Wait strategies and timing utilities
   - Custom Playwright matchers

4. **Test Data Management**
   - Test data seed scripts
   - Data cleanup utilities
   - Factory functions for entities

## Acceptance Criteria

### Page Object Models
- [ ] Base page class created with common methods:
  - `goto(url)` - Navigate to page
  - `wait ForPageLoad()` - Wait for page ready
  - `takeScreenshot(name)` - Capture screenshot
  - `getElement(selector)` - Get element with retry
  - `clickElement(selector)` - Click with wait
  - `fillInput(selector, value)` - Fill form input

- [ ] Page-specific classes created:
  - `SignInPage` - Sign in page interactions
  - `MatchmakingWizardPage` - Wizard navigation
  - `LobbyPage` - Lobby interactions
  - `ReplayPage` - Replay browsing
  - `ProfilePage` - Player profile

- [ ] Component objects created:
  - `ModalComponent` - Modal interactions
  - `FormComponent` - Form helpers
  - `NavigationComponent` - Nav menu
  - `NotificationComponent` - Toast notifications

### Custom Fixtures
- [ ] `authenticatedUser` fixture provides:
  - Logged-in browser context
  - Session cookies set
  - User profile data available
  - Automatic cleanup after test

- [ ] `apiClient` fixture provides:
  - HTTP client with base URL
  - Authentication headers
  - Request/response logging
  - Error handling

- [ ] `testData` fixture provides:
  - User factory functions
  - Match factory functions
  - Replay factory functions
  - Squad factory functions

### Test Utilities
- [ ] Authentication helpers:
  ```typescript
  await auth.login(page, { email, password })
  await auth.loginWithSteam(page)
  await auth.logout(page)
  const isAuthenticated = await auth.checkSession(page)
  ```

- [ ] API mocking helpers:
  ```typescript
  await mockAPI.interceptRoute(page, '/api/lobbies', mockResponse)
  await mockAPI.mockLobbyList(page, lobbies)
  await mockAPI.mockError(page, '/api/matches', 500)
  ```

- [ ] Data generators:
  ```typescript
  const user = generateUser({ role: 'player' })
  const match = generateMatch({ gameMode: 'competitive' })
  const replay = generateReplay({ duration: 3600 })
  ```

- [ ] Custom matchers:
  ```typescript
  expect(element).toBeVisibleAndEnabled()
  expect(element).toHaveExactText('Match Found')
  expect(response).toMatchAPISchema(schema)
  ```

### Test Data Management
- [ ] Seed script creates test data in database
- [ ] Cleanup script removes test data after execution
- [ ] Factory pattern for creating test entities
- [ ] Data isolation between tests

### Documentation
- [ ] README created for test infrastructure
- [ ] Page object usage examples documented
- [ ] Fixture usage guide written
- [ ] Best practices guide published

## Technical Implementation

### File Structure
```
e2e/
├── fixtures/
│   ├── auth-fixture.ts          # Authentication fixture
│   ├── api-fixture.ts            # API client fixture
│   ├── test-data-fixture.ts      # Test data factory
│   └── screenshot-fixture.ts     # Screenshot helper
├── page-objects/
│   ├── base-page.ts             # Base page class
│   ├── signin-page.ts           # Sign in page
│   ├── matchmaking-wizard-page.ts
│   ├── lobby-page.ts
│   ├── replay-page.ts
│   └── components/
│       ├── modal-component.ts
│       ├── form-component.ts
│       └── navigation-component.ts
├── utils/
│   ├── auth-helpers.ts          # Login/logout utilities
│   ├── api-mocks.ts             # API mock builders
│   ├── data-generators.ts       # Test data factories
│   ├── wait-strategies.ts       # Timing utilities
│   └── custom-matchers.ts       # Custom Playwright matchers
├── test-data/
│   ├── seed.ts                  # Database seed script
│   ├── cleanup.ts               # Cleanup script
│   └── factories/
│       ├── user-factory.ts
│       ├── match-factory.ts
│       └── replay-factory.ts
└── docs/
    ├── README.md
    ├── page-objects-guide.md
    ├── fixtures-guide.md
    └── best-practices.md
```

### Example: Base Page Class
```typescript
// e2e/page-objects/base-page.ts
import { Page, Locator } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async goto(url: string) {
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getElement(selector: string): Promise<Locator> {
    return this.page.locator(selector);
  }

  async clickElement(selector: string) {
    const element = await this.getElement(selector);
    await element.waitFor({ state: 'visible' });
    await element.click();
  }

  async fillInput(selector: string, value: string) {
    const input = await this.getElement(selector);
    await input.waitFor({ state: 'visible' });
    await input.fill(value);
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true
    });
  }
}
```

### Example: Authentication Fixture
```typescript
// e2e/fixtures/auth-fixture.ts
import { test as base } from '@playwright/test';

type AuthFixture = {
  authenticatedPage: Page;
  user: {
    id: string;
    email: string;
    username: string;
  };
};

export const test = base.extend<AuthFixture>({
  authenticatedPage: async ({ page }, use) => {
    // Perform login
    await page.goto('/signin');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="signin-button"]');
    await page.waitForURL('/dashboard');

    // Use the authenticated page
    await use(page);

    // Cleanup: logout
    await page.click('[data-testid="logout-button"]');
  },

  user: async ({ }, use) => {
    const user = {
      id: 'test-user-123',
      email: 'test@example.com',
      username: 'TestPlayer',
    };
    await use(user);
  },
});
```

## Definition of Done

- [x] All page object models created and tested
- [x] All custom fixtures implemented
- [x] All test utilities functional
- [x] Test data management scripts working
- [x] Documentation complete and reviewed
- [x] Code review approved
- [x] Example tests written demonstrating usage
- [x] CI/CD integration verified

## Testing Checklist

- [ ] Page objects can navigate and interact with elements
- [ ] Fixtures provide expected functionality
- [ ] Utilities handle edge cases gracefully
- [ ] Data generators create valid test data
- [ ] Cleanup scripts remove all test data
- [ ] Documentation examples work as written

## Notes

### Important Considerations
- Use data-testid attributes for element selection (stable selectors)
- Implement proper wait strategies (avoid hard-coded sleeps)
- Create factory functions for all test entities
- Ensure test data isolation (no shared state between tests)
- Add retry logic for flaky selectors

### Future Enhancements
- Visual regression testing integration (Percy)
- Performance monitoring integration
- Test report generation and dashboards
- Parallel execution optimization

## Related Tickets
- **Blocks:** TEST-003 (Authentication Tests)
- **Blocks:** TEST-004 (Wizard Region Tests)
- **Blocks:** All other test tickets
- **Related:** TEST-002 (data-testid Attributes)

## Time Estimate
- **Development:** 3 days
- **Testing:** 1 day
- **Documentation:** 1 day
- **Total:** 5 days (5 story points)
