# TEST-004: Matchmaking Wizard - Region Selection Tests

## Story Details
- **Type:** Story
- **Epic:** EPIC-001 (E2E Test Coverage)
- **Priority:** Critical
- **Story Points:** 3
- **Assignee:** QA Team
- **Labels:** `matchmaking`, `wizard`, `region-selection`, `e2e-test`
- **Sprint:** Sprint 2
- **Dependencies:** TEST-001 (Infrastructure), TEST-002 (data-testid)

## User Story

**As a** Player
**I want** to select my preferred region for matchmaking
**So that** I get matched with players in my geographical area for low latency

## Description

Implement comprehensive E2E tests for Step 0 (Region Selection) of the matchmaking wizard, covering all region options, automatic selection, validation, and state persistence.

### Component Under Test
- **File:** `/components/match-making/choose-region-form.tsx`
- **Context:** `/components/match-making/wizard-context.tsx`
- **State Field:** `region: string`

### Regions to Test
- **South America:** Brazil East, Bogotá, Santiago, Lima
- **North America:** West US, East US, Toronto, Montreal, Chicago, Dallas, Seattle
- **Europe:** Frankfurt, London, Paris, Dublin, Amsterdam, Stockholm, Milan, Madrid, Zurich
- **Middle East:** Dubai
- **Africa:** Cape Town
- **Asia Pacific:** Guangzhou/Shenzhen, Beijing, Shanghai, Singapore/Jakarta, Mumbai, Seoul/Tokyo, Bangkok, Sydney, Hong Kong, Taipei

## Acceptance Criteria

### Test Cases (8 tests)

#### TC-001: Region Tabs Display
- [ ] All region tabs visible: S.America, N.America, Europe, Middle East, Africa, Asia Pacific
- [ ] Default tab selected (based on user location or first tab)
- [ ] Tab click switches content
- [ ] Active tab has visual indicator

**Test Code:**
```typescript
test('should display all region tabs', async ({ page }) => {
  await page.goto('/match-making');

  const tabs = ['S.America', 'N.America', 'Europe', 'Middle East', 'Africa', 'Asia Pacific'];
  for (const tab of tabs) {
    await expect(page.locator(`[role="tab"]:has-text("${tab}")`)).toBeVisible();
  }
});
```

#### TC-002: Region Selection Within Tab
- [ ] User can select radio button for specific region
- [ ] Only one region can be selected at a time
- [ ] Selected region shows visual feedback (border color change)
- [ ] Recommended region shows badge/icon

**Test Code:**
```typescript
test('should select region and show visual feedback', async ({ page }) => {
  await page.goto('/match-making');

  // Select Brazil East
  await page.click('[data-testid="region-tab-south-america"]');
  await page.click('[data-testid="region-radio-region11"]');

  // Verify selection
  const selected = page.locator('[data-testid="region-radio-region11"]');
  await expect(selected).toBeChecked();
  await expect(selected).toHaveClass(/border-secondary/);
});
```

#### TC-003: Automatic Region Selection
- [ ] "Automatically select lowest latency" button visible
- [ ] Button click triggers ping test (or mock)
- [ ] Best region automatically selected
- [ ] User can override automatic selection

**Test Code:**
```typescript
test('should automatically select best region', async ({ page, apiClient }) => {
  // Mock ping results
  await apiClient.mockRegionPing(page, {
    'region11': 25, // Brazil East - best
    'region7': 150,
    'region10': 200
  });

  await page.goto('/match-making');
  await page.click('[data-testid="auto-select-region-button"]');

  // Wait for ping test
  await page.waitForTimeout(1000);

  // Verify Brazil East selected
  await expect(page.locator('[data-testid="region-radio-region11"]')).toBeChecked();
});
```

#### TC-004: State Persistence
- [ ] Selected region saved to wizard context
- [ ] Region persists when navigating to next step
- [ ] Region persists when navigating back to region step
- [ ] Region displayed in review step

**Test Code:**
```typescript
test('should persist region selection across navigation', async ({ page }) => {
  await page.goto('/match-making');

  // Select region
  await page.click('[data-testid="region-radio-region7"]'); // West US

  // Navigate to next step
  await page.click('[data-testid="wizard-next-button"]');
  await expect(page).toHaveURL(/game-mode/);

  // Navigate back
  await page.click('[data-testid="wizard-back-button"]');

  // Verify region still selected
  await expect(page.locator('[data-testid="region-radio-region7"]')).toBeChecked();
});
```

#### TC-005: Recommended Region Badge
- [ ] Recommended badge displays for optimal region
- [ ] Badge shows "Recommended" text
- [ ] Network icon displays next to badge
- [ ] Badge styling matches design (secondary color)

**Test Code:**
```typescript
test('should display recommended badge for optimal region', async ({ page }) => {
  await page.goto('/match-making');

  // Brazil East should show recommended badge
  const recommendedBadge = page.locator('[data-testid="region-11-recommended-badge"]');
  await expect(recommendedBadge).toBeVisible();
  await expect(recommendedBadge).toContainText('Recommended');

  // Check for network icon
  const networkIcon = page.locator('[data-testid="region-11-network-icon"]');
  await expect(networkIcon).toBeVisible();
});
```

#### TC-006: Tab Navigation
- [ ] Clicking different tabs shows different regions
- [ ] Tab content animates on switch
- [ ] Previous selection cleared when changing tabs
- [ ] Selected region updates based on active tab

**Test Code:**
```typescript
test('should switch regions when changing tabs', async ({ page }) => {
  await page.goto('/match-making');

  // Select region in S.America tab
  await page.click('[data-testid="region-tab-south-america"]');
  await page.click('[data-testid="region-radio-region11"]');

  // Switch to N.America tab
  await page.click('[data-testid="region-tab-north-america"]');

  // Verify different regions visible
  await expect(page.locator('[data-testid="region-radio-region7"]')).toBeVisible(); // West US
  await expect(page.locator('[data-testid="region-radio-region11"]')).not.toBeVisible(); // Brazil
});
```

#### TC-007: Required Field Validation
- [ ] Cannot proceed to next step without selecting region
- [ ] "Next" button disabled when no region selected
- [ ] Error message displays if advancing without selection
- [ ] Error clears once region selected

**Test Code:**
```typescript
test('should require region selection before proceeding', async ({ page }) => {
  await page.goto('/match-making');

  // Try to click Next without selection
  const nextButton = page.locator('[data-testid="wizard-next-button"]');
  await expect(nextButton).toBeDisabled();

  // Select region
  await page.click('[data-testid="region-radio-region7"]');

  // Next button should be enabled
  await expect(nextButton).toBeEnabled();
});
```

#### TC-008: Context State Update
- [ ] `updateState({ region: value })` called on selection
- [ ] Wizard context contains selected region value
- [ ] Region value matches selected radio button value
- [ ] Context accessible from other wizard steps

**Test Code:**
```typescript
test('should update wizard context with selected region', async ({ page }) => {
  await page.goto('/match-making');

  // Select region
  await page.click('[data-testid="region-radio-region10"]'); // Frankfurt

  // Check context (via dev tools or API call)
  const wizardState = await page.evaluate(() => {
    return window.__WIZARD_STATE__; // Exposed for testing
  });

  expect(wizardState.region).toBe('region10');
});
```

## Technical Implementation

### Test File Structure
```
e2e/matchmaking/wizard/region-selection.spec.ts
```

### Page Object Model
```typescript
// e2e/page-objects/matchmaking-wizard-page.ts
export class MatchmakingWizardPage extends BasePage {
  async selectRegionTab(tabName: string) {
    await this.page.click(`[data-testid="region-tab-${tabName}"]`);
  }

  async selectRegion(regionId: string) {
    await this.page.click(`[data-testid="region-radio-${regionId}"]`);
  }

  async clickAutoSelectRegion() {
    await this.page.click('[data-testid="auto-select-region-button"]');
  }

  async goToNextStep() {
    await this.page.click('[data-testid="wizard-next-button"]');
  }

  async goToPreviousStep() {
    await this.page.click('[data-testid="wizard-back-button"]');
  }

  async getSelectedRegion(): Promise<string | null> {
    const checked = await this.page.locator('[data-testid^="region-radio"]:checked');
    return await checked.getAttribute('value');
  }
}
```

### Test Data
```typescript
const REGIONS = {
  'south-america': ['region11', 'region12', 'region13', 'region14'],
  'north-america': ['region7', 'region8', 'region9', 'region23', 'region24', 'region25', 'region26'],
  'europe': ['region10', 'region15', 'region16', 'region17', 'region18', 'region19', 'region20', 'region21', 'region22'],
  'middle-east': ['region31'],
  'africa': ['region32'],
  'asia-pacific': ['region1', 'region2', 'region3', 'region4', 'region5', 'region6', 'region27', 'region28', 'region29', 'region30']
};
```

## Required Component Updates

### Add data-testid Attributes
```typescript
// choose-region-form.tsx updates needed:

<Tabs data-testid="region-tabs">
  <Tab key="south-america" data-testid="region-tab-south-america">
    <Radio data-testid="region-radio-region11" value="region11">
      Brazil East
    </Radio>
    ...
  </Tab>
  ...
</Tabs>

<Button data-testid="auto-select-region-button">
  Automatically select the region with lowest latency
</Button>
```

## Definition of Done

- [x] All 8 test cases implemented
- [x] Tests pass consistently (no flakiness)
- [x] Page object model created
- [x] Component updated with data-testid attributes
- [x] Code review approved
- [x] Tests integrated into CI/CD pipeline
- [x] Test coverage >95% for region selection flow

## Testing Checklist

- [ ] Tests run in Chromium, Firefox, WebKit
- [ ] Tests pass in mobile viewport (Pixel 5, iPhone 12)
- [ ] Tests handle slow network conditions
- [ ] Tests handle API failures gracefully
- [ ] Visual regression tests passing
- [ ] Accessibility tests passing (keyboard navigation)

## Notes

### Edge Cases to Consider
- User location detection fails → default to first tab
- Ping test timeout → fallback to manual selection
- Multiple rapid tab switches → debounce behavior
- Region list empty → show error message

### Performance Considerations
- Tab switch animation should complete within 500ms
- Region list render time <200ms
- Ping test should timeout after 5 seconds

## Related Tickets
- **Depends on:** TEST-001 (Infrastructure)
- **Depends on:** TEST-002 (data-testid Attributes)
- **Blocks:** TEST-005 (Game Mode Tests)
- **Related:** TEST-009 (Wizard Navigation)

## Time Estimate
- **Test Implementation:** 1.5 days
- **Component Updates:** 0.5 days
- **Review & Fixes:** 1 day
- **Total:** 3 days (3 story points)
