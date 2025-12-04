# LeetGaming Pro - E2E Test Coverage JIRA Tickets

## Epic Overview
**EPIC-001: Comprehensive E2E Test Coverage**
- **Total Tickets:** 28 stories + 1 epic = 29 tickets
- **Total Story Points:** 143 points
- **Duration:** 10 weeks
- **Target:** 300-400 Playwright E2E tests
- **Coverage Goal:** 95%+ application coverage

## Ticket Index

### Epic
- [EPIC-001](./EPIC-001-E2E-Test-Coverage.md) - Comprehensive E2E Test Coverage (Epic)

### Phase 1: Foundation (Week 1-2) - 13 points
- [TEST-001](./TEST-001-Test-Infrastructure-Setup.md) - Test Infrastructure Setup (5 points) ✅ Created
- [TEST-002](#test-002-component-data-testid-attributes) - Component data-testid Attributes (8 points)

### Phase 2: Critical Paths (Week 3-4) - 35 points
- [TEST-003](#test-003-authentication-flow-tests) - Authentication Flow Tests (5 points)
- [TEST-004](./TEST-004-Wizard-Region-Selection-Tests.md) - Wizard Region Selection Tests (3 points) ✅ Created
- [TEST-005](#test-005-wizard-game-mode-tests) - Wizard Game Mode Tests (3 points)
- [TEST-006](#test-006-wizard-squad-formation-tests) - Wizard Squad Formation Tests (3 points)
- [TEST-007](#test-007-wizard-schedule-tests) - Wizard Schedule Tests (3 points)
- [TEST-008](#test-008-wizard-prize-distribution-tests) - Wizard Prize Distribution Tests (3 points)
- [TEST-009](#test-009-wizard-review--navigation-tests) - Wizard Review & Navigation Tests (3 points)
- [TEST-010](#test-010-lobby-create--browse-tests) - Lobby Create & Browse Tests (5 points)
- [TEST-011](#test-011-lobby-lifecycle-tests) - Lobby Lifecycle Tests (5 points)
- [TEST-012](#test-012-prize-pool-operations-tests) - Prize Pool Operations Tests (5 points)

### Phase 3: High-Value Features (Week 5-6) - 23 points
- [TEST-013](#test-013-replay-upload--management-tests) - Replay Upload & Management Tests (5 points)
- [TEST-014](#test-014-squad-management-tests) - Squad Management Tests (5 points)
- [TEST-015](#test-015-queue-management-tests) - Queue Management Tests (5 points)
- [TEST-016](#test-016-form-validation-tests) - Form Validation Tests (8 points)

### Phase 4: API Integration (Week 7) - 18 points
- [TEST-017](#test-017-api-integration-tests---auth) - API Integration Tests - Auth (3 points)
- [TEST-018](#test-018-api-integration-tests---matchmaking) - API Integration Tests - Matchmaking (5 points)
- [TEST-019](#test-019-api-integration-tests---lobbies) - API Integration Tests - Lobbies (5 points)
- [TEST-020](#test-020-api-integration-tests---prize-pools) - API Integration Tests - Prize Pools (5 points)

### Phase 5: Additional Features (Week 8) - 15 points
- [TEST-021](#test-021-player-profile-tests) - Player Profile Tests (5 points)
- [TEST-022](#test-022-search-functionality-tests) - Search Functionality Tests (5 points)
- [TEST-023](#test-023-wallet-operation-tests) - Wallet Operation Tests (5 points)

### Phase 6: Quality Assurance (Week 9) - 21 points
- [TEST-024](#test-024-accessibility-compliance-tests) - Accessibility Compliance Tests (8 points)
- [TEST-025](#test-025-performance-benchmark-tests) - Performance Benchmark Tests (5 points)
- [TEST-026](#test-026-visual-regression-tests) - Visual Regression Tests (8 points)

### Phase 7: Edge Cases (Week 10) - 10 points
- [TEST-027](#test-027-error-handling-tests) - Error Handling Tests (5 points)
- [TEST-028](#test-028-edge-case-tests) - Edge Case Tests (5 points)

---

## Detailed Ticket Summaries

### TEST-002: Component data-testid Attributes
**Priority:** Critical | **Points:** 8 | **Phase:** 1

**Summary:** Add data-testid attributes to 100+ components across the application for stable test selectors.

**Key Deliverables:**
- Add data-testid to all forms in matchmaking wizard
- Add data-testid to all lobby components
- Add data-testid to replay management components
- Add data-testid to navigation and modal components
- Document naming convention

**Acceptance Criteria:**
- [ ] All buttons have `[data-testid="{component}-{action}-button"]`
- [ ] All inputs have `[data-testid="{component}-{field}-input"]`
- [ ] All radio/checkboxes have `[data-testid="{component}-{option}-{type}"]`
- [ ] All tabs have `[data-testid="{component}-tab-{name}"]`
- [ ] Naming convention documented

**Components to Update:**
- Wizard forms (6 files)
- Lobby components (4 files)
- Replay components (3 files)
- Auth components (2 files)
- Navigation components (2 files)
- Modal/dialog components (2 files)

---

### TEST-003: Authentication Flow Tests
**Priority:** Critical | **Points:** 5 | **Phase:** 2

**Summary:** Comprehensive E2E tests for authentication flows including Steam OAuth, session management, and protected routes.

**Test Scenarios (20 tests):**
- Sign in with Steam OAuth (mock flow)
- Sign up flow with email/Steam
- Session persistence across navigation
- Protected route access (authenticated vs unauthenticated)
- Sign out functionality
- Session expiration handling
- OAuth error scenarios
- Redirect after authentication
- Remember me functionality
- Multiple concurrent sessions

**Key APIs:**
- `/api/auth/[...nextauth]`
- `/api/auth/session`
- `/api/auth/error`

---

### TEST-005: Wizard Game Mode Tests
**Priority:** Critical | **Points:** 3 | **Phase:** 2

**Summary:** E2E tests for game mode selection step (Step 1) of matchmaking wizard.

**Test Scenarios (8 tests):**
- Display all game modes (Casual, Elimination, Best of 3, Best of 5)
- Select game mode and show visual feedback
- Tier mapping (casual→free, competitive→premium, ranked→pro)
- State persistence across navigation
- Required field validation
- Context state update
- Icon display for each mode
- Mode description display

**Component:** `game-mode-form.tsx`

---

### TEST-006: Wizard Squad Formation Tests
**Priority:** Critical | **Points:** 3 | **Phase:** 2

**Summary:** E2E tests for squad/team selection step (Step 2) of matchmaking wizard.

**Test Scenarios (8 tests):**
- Display user's teams in accordion
- Pick-up party tab (friend search)
- Select team from list
- Squad ID saved to context
- Team member display
- Create new team link
- Friend search functionality
- State persistence

**Component:** `squad-form.tsx`

---

### TEST-007: Wizard Schedule Tests
**Priority:** Critical | **Points:** 3 | **Phase:** 2

**Summary:** E2E tests for schedule preferences step (Step 3) of matchmaking wizard.

**Test Scenarios (8 tests):**
- Date range picker functionality
- Weekly routine checkbox selection
- Time window input
- Instant vs scheduled toggle
- State persistence (scheduleStart, scheduleEnd, weeklyRoutine)
- Add more time slots
- Time zone display
- Validation (end date after start date)

**Component:** `schedule-information-form.tsx`

---

### TEST-008: Wizard Prize Distribution Tests
**Priority:** Critical | **Points:** 3 | **Phase:** 2

**Summary:** E2E tests for prize distribution selection step (Step 4) of matchmaking wizard.

**Test Scenarios (8 tests):**
- Display all distribution rules (Winner Takes All, Top 3, Proportional, Equal)
- Select distribution rule
- Expected pool amount display
- Rule description display
- Prize pool card preview
- State persistence (distributionRule, expectedPool)
- Prize breakdown visualization
- Minimum/maximum pool validation

**Component:** `prize-distribution-selector.tsx`

---

### TEST-009: Wizard Review & Navigation Tests
**Priority:** Critical | **Points:** 3 | **Phase:** 2

**Summary:** E2E tests for review/confirm step (Step 5) and overall wizard navigation.

**Test Scenarios (10 tests):**
- Review step displays all selections
- Forward navigation through all steps
- Backward navigation
- Direct step navigation via sidebar
- Wizard step indicators
- Progress bar display
- "Find Match" button functionality
- Cancel matchmaking
- Form data validation across all steps
- Matchmaking status display (searching, queue position)

**Component:** `review-confirm-form.tsx`, `App.tsx`

---

### TEST-010: Lobby Create & Browse Tests
**Priority:** Critical | **Points:** 5 | **Phase:** 2

**Summary:** E2E tests for creating new lobbies and browsing existing lobbies.

**Test Scenarios (15 tests):**
- Create lobby with all configuration options
- Browse lobby list with pagination
- Filter lobbies (game mode, region, status)
- Search lobbies
- Lobby card display (players, status, prize pool)
- Join public lobby
- Private lobby access
- Lobby limit validation (max players)
- Entry fee validation
- Distribution rule selection
- Lobby creation success/error handling

**APIs:**
- `POST /api/matchmaking/lobbies`
- `GET /api/matchmaking/lobbies`
- `GET /api/matchmaking/lobbies/stats`

---

### TEST-011: Lobby Lifecycle Tests
**Priority:** Critical | **Points:** 5 | **Phase:** 2

**Summary:** E2E tests for complete lobby lifecycle from creation to match start.

**Test Scenarios (15 tests):**
- Join lobby flow
- Leave lobby before ready
- Leave lobby after ready
- Ready/unready toggle
- Ready check display (all players)
- Start match when all ready (creator only)
- Lobby status transitions (waiting → ready_check → starting)
- Player disconnection handling
- Lobby expiration
- Lobby cancellation
- Real-time player updates (polling)
- Spectator mode
- Kick player (creator only)

**APIs:**
- `POST /api/matchmaking/lobbies/[lobby_id]/join`
- `DELETE /api/matchmaking/lobbies/[lobby_id]/leave`
- `PUT /api/matchmaking/lobbies/[lobby_id]/ready`
- `POST /api/matchmaking/lobbies/[lobby_id]/start`

---

### TEST-012: Prize Pool Operations Tests
**Priority:** Critical | **Points:** 5 | **Phase:** 2

**Summary:** E2E tests for prize pool lifecycle operations.

**Test Scenarios (12 tests):**
- Lock prize pool before match
- Distribute prizes after match (all distribution rules)
- Refund prize pool (cancelled match)
- File dispute
- Resolve dispute (admin)
- Transaction history display
- Wallet balance validation
- Entry fee collection
- Platform contribution calculation
- Payout notifications
- Escrow status

**APIs:**
- `POST /api/matchmaking/prize-pools/[pool_id]/lock`
- `POST /api/matchmaking/prize-pools/[pool_id]/distribute`
- `POST /api/matchmaking/prize-pools/[pool_id]/refund`
- `POST /api/matchmaking/prize-pools/[pool_id]/dispute`
- `POST /api/matchmaking/prize-pools/[pool_id]/resolve-dispute`

---

### TEST-013: Replay Upload & Management Tests
**Priority:** High | **Points:** 5 | **Phase:** 3

**Summary:** E2E tests for replay file upload, browsing, and management.

**Test Scenarios (12 tests):**
- Upload replay via drag-and-drop
- Upload replay via file picker
- Upload progress display
- File validation (size, type)
- Browse replays with pagination
- Filter replays (game, date, player, map)
- Search replays
- View replay details
- Share replay via token
- Download replay
- Delete replay
- Upload error handling

**Pages:** `/replays`, `/upload`
**APIs:** `POST /api/replays`, `GET /api/replays`

---

### TEST-014: Squad Management Tests
**Priority:** High | **Points:** 5 | **Phase:** 3

**Summary:** E2E tests for squad/team creation and management.

**Test Scenarios (12 tests):**
- Create new squad
- Invite players to squad
- Accept squad invitation
- Decline squad invitation
- Leave squad
- Update squad settings (name, tag, description)
- View squad statistics
- Squad matchmaking integration
- Remove squad member (captain only)
- Transfer squad leadership
- Squad search
- Squad privacy settings

**Pages:** `/teams`, `/teams/[id]`
**APIs:** `POST /api/squads`, `PUT /api/squads/[id]`

---

### TEST-015: Queue Management Tests
**Priority:** High | **Points:** 5 | **Phase:** 3

**Summary:** E2E tests for matchmaking queue operations.

**Test Scenarios (10 tests):**
- Join matchmaking queue
- Queue status display (position, estimated wait)
- Queue position updates (polling)
- Cancel queue
- Match found notification
- Queue timeout handling
- Pool statistics display
- Multiple queue handling
- Queue priority (premium users)
- Queue error scenarios

**APIs:**
- `POST /api/matchmaking/queue`
- `GET /api/matchmaking/session/[session_id]`
- `DELETE /api/matchmaking/queue/[session_id]`
- `GET /api/matchmaking/pools/[game_id]`

---

### TEST-016: Form Validation Tests
**Priority:** High | **Points:** 8 | **Phase:** 3

**Summary:** Comprehensive validation tests for all forms across the application.

**Test Scenarios (30 tests):**
- Email format validation
- Username format validation
- Password strength validation
- Required field enforcement
- Min/max length validation
- Numeric field validation (entry fees, MMR)
- Date validation (schedule forms)
- File upload validation (size, type)
- Squad size validation
- Entry fee limits
- Real-time validation feedback
- Error message display
- Form submission prevention when invalid
- Field highlighting on error

**Forms:**
- Sign up form
- Profile update form
- Squad creation form
- Lobby creation form
- All wizard forms

---

### TEST-017: API Integration Tests - Auth
**Priority:** High | **Points:** 3 | **Phase:** 4

**Summary:** Integration tests for authentication API endpoints.

**Test Scenarios (8 tests):**
- `/api/auth/session` - Get session
- `/api/auth/[...nextauth]` - OAuth flow
- Session cookie validation
- CSRF token validation
- Refresh token flow
- Session expiration
- Concurrent session handling
- API authentication middleware

---

### TEST-018: API Integration Tests - Matchmaking
**Priority:** High | **Points:** 5 | **Phase:** 4

**Summary:** Integration tests for matchmaking API endpoints.

**Test Scenarios (15 tests):**
- Queue join/leave
- Session status polling
- Pool statistics
- All request/response schemas validated
- Error response handling (400, 401, 403, 500)
- Rate limiting behavior
- Concurrent request handling

**Endpoints:** 4 matchmaking queue routes

---

### TEST-019: API Integration Tests - Lobbies
**Priority:** High | **Points:** 5 | **Phase:** 4

**Summary:** Integration tests for lobby API endpoints.

**Test Scenarios (18 tests):**
- Create/get/list lobbies
- Join/leave lobby
- Ready status toggle
- Start match
- Lobby statistics
- All CRUD operations
- Request/response validation
- Error handling

**Endpoints:** 7 lobby routes

---

### TEST-020: API Integration Tests - Prize Pools
**Priority:** High | **Points:** 5 | **Phase:** 4

**Summary:** Integration tests for prize pool API endpoints.

**Test Scenarios (15 tests):**
- Get prize pool
- Lock/distribute/refund operations
- Dispute creation and resolution
- Pool statistics
- Transaction validation
- Error scenarios

**Endpoints:** 7 prize pool routes

---

### TEST-021: Player Profile Tests
**Priority:** Medium | **Points:** 5 | **Phase:** 5

**Summary:** E2E tests for player profiles and statistics.

**Test Scenarios (12 tests):**
- View player profile
- Player statistics display
- Match history pagination
- Achievements/badges display
- Profile editing
- Avatar upload
- Privacy settings
- Profile search

**Pages:** `/players/[id]`

---

### TEST-022: Search Functionality Tests
**Priority:** Medium | **Points:** 5 | **Phase:** 5

**Summary:** E2E tests for global search functionality.

**Test Scenarios (12 tests):**
- Search players
- Search squads
- Search matches
- Search replays
- Autocomplete suggestions
- Search result pagination
- Filter combinations
- Search result sorting
- Empty search results
- Search performance

**Pages:** `/search`

---

### TEST-023: Wallet Operation Tests
**Priority:** Medium | **Points:** 5 | **Phase:** 5

**Summary:** E2E tests for wallet and transaction operations.

**Test Scenarios (12 tests):**
- View wallet balance
- Transaction history display
- Add funds flow
- Withdraw funds flow
- Purchase validation
- Transaction filtering
- Balance updates (real-time)
- Receipt generation
- Refund processing

---

### TEST-024: Accessibility Compliance Tests
**Priority:** High | **Points:** 8 | **Phase:** 6

**Summary:** Automated accessibility tests for WCAG 2.1 AA compliance.

**Test Scenarios (25 tests):**
- Keyboard navigation for all interactive elements
- Screen reader compatibility
- ARIA labels and roles
- Focus management
- Color contrast validation
- Alternative text for images
- Form label associations
- Skip links
- Heading hierarchy
- Live regions for dynamic content

**Tool:** Axe-core integration

---

### TEST-025: Performance Benchmark Tests
**Priority:** Medium | **Points:** 5 | **Phase:** 6

**Summary:** Performance benchmark tests for key user flows.

**Test Scenarios (15 tests):**
- Page load times (<3s)
- Wizard step transitions (<500ms)
- API response times (<200ms)
- Large list rendering performance
- Network throttling scenarios
- Animation performance (60fps)
- Memory leak detection
- Bundle size validation

**Tool:** Playwright Performance API

---

### TEST-026: Visual Regression Tests
**Priority:** Medium | **Points:** 8 | **Phase:** 6

**Summary:** Visual regression tests using screenshot comparison.

**Test Scenarios (20 tests):**
- Homepage visual snapshot
- All wizard steps screenshots
- Lobby states visual comparison
- Modal/dialog visual validation
- Responsive breakpoints (mobile, tablet, desktop)
- Dark/light theme comparison
- Component state variations
- Error state visuals

**Tool:** Percy or Playwright built-in

---

### TEST-027: Error Handling Tests
**Priority:** Medium | **Points:** 5 | **Phase:** 7

**Summary:** E2E tests for error scenarios and recovery.

**Test Scenarios (12 tests):**
- Network failures (offline mode)
- API timeouts
- Invalid API responses
- Authentication failures
- Session expiration during flow
- Form submission errors
- File upload failures
- Concurrent modification errors
- Graceful degradation
- Error message display
- Retry logic

---

### TEST-028: Edge Case Tests
**Priority:** Medium | **Points:** 5 | **Phase:** 7

**Summary:** E2E tests for edge cases and boundary conditions.

**Test Scenarios (15 tests):**
- Empty states (no data)
- Loading states
- Race conditions
- Browser back/forward navigation
- Page refresh during wizard
- Maximum input limits
- Minimum input limits
- Boundary values (0, negative, max int)
- Special characters in inputs
- Concurrent user actions
- Multiple tabs/windows
- Session conflicts

---

## Implementation Guidelines

### Naming Conventions
- **Ticket IDs:** `TEST-###`
- **Test Files:** `{feature-name}.spec.ts`
- **data-testid:** `{component}-{element}-{type}`
- **Page Objects:** `{PageName}Page`

### Story Point Scale (Fibonacci)
- 1 point = 1-2 hours
- 2 points = half day
- 3 points = 1 day
- 5 points = 2-3 days
- 8 points = 1 week
- 13 points = 2 weeks

### Acceptance Criteria Template
All tickets should include:
- [ ] Test scenarios documented
- [ ] Tests implemented and passing
- [ ] Page objects created (if needed)
- [ ] Component updates complete (data-testid)
- [ ] Code review approved
- [ ] CI/CD integration verified
- [ ] Documentation updated

### Dependencies
- **All tickets depend on:** TEST-001 (Infrastructure)
- **Most tickets depend on:** TEST-002 (data-testid)
- **Follow phase order** for optimal workflow

---

## Project Timeline

| Week | Phase | Tickets | Points |
|------|-------|---------|--------|
| 1-2 | Foundation | TEST-001, TEST-002 | 13 |
| 3-4 | Critical Paths | TEST-003 to TEST-012 | 35 |
| 5-6 | High-Value | TEST-013 to TEST-016 | 23 |
| 7 | API Integration | TEST-017 to TEST-020 | 18 |
| 8 | Additional | TEST-021 to TEST-023 | 15 |
| 9 | Quality | TEST-024 to TEST-026 | 21 |
| 10 | Edge Cases | TEST-027 to TEST-028 | 10 |
| **Total** | | **28 tickets** | **143 points** |

---

## Contact & Support

For questions or clarifications about any ticket:
1. Check the detailed ticket markdown file
2. Review the Epic-level documentation
3. Consult the test infrastructure README
4. Contact QA team lead

---

**Last Updated:** 2025-01-13
**Epic Owner:** QA Team
**Status:** Ready for Implementation (pending backend integration)
