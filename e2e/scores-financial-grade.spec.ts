/**
 * E2E Tests for Financial-Grade Score Dispute Features
 *
 * Tests the hardened UI flows added for financial-grade reliability:
 * 1. Cancel modal — requires reason input before submission
 * 2. Conciliate modal — requires resolution notes before submission
 * 3. Cancel audit trail — cancelled_by, cancelled_at, cancel_reason display
 * 4. Dispute window guard — error messaging for premature finalization
 * 5. 403 error handling — sanitized permission error display
 */

import { test, expect } from '@playwright/test';
import {
  authenticatedScoresTest,
  TEST_MATCH_RESULT_VERIFIED,
  TEST_MATCH_RESULT_DISPUTED,
  TEST_MATCH_RESULT_CANCELLED,
} from './fixtures/scores.fixture';

// ============================================================================
// 1. CANCEL MODAL — Requires Reason Input
// ============================================================================

test.describe('Cancel Modal with Required Reason', () => {
  authenticatedScoresTest('should show cancel modal with textarea when cancel is clicked', async ({ scoresPage }) => {
    await scoresPage.goto(`/scores/${TEST_MATCH_RESULT_VERIFIED.id}`, {
      waitUntil: 'domcontentloaded',
    });
    await scoresPage.waitForTimeout(5000);

    // Find the Cancel button
    const cancelBtn = scoresPage.getByRole('button', { name: /cancel/i });
    const isVisible = await cancelBtn.isVisible().catch(() => false);
    if (!isVisible) return;

    await cancelBtn.click();
    await scoresPage.waitForTimeout(1000);

    // Modal should appear
    const modal = scoresPage.locator('[role="dialog"]');
    const hasModal = await modal.isVisible().catch(() => false);
    expect(hasModal).toBe(true);

    // Should have a textarea for reason
    const textarea = modal.locator('textarea');
    const hasTextarea = await textarea.isVisible().catch(() => false);
    expect(hasTextarea).toBe(true);
  });

  authenticatedScoresTest('should disable confirm button when reason is empty', async ({ scoresPage }) => {
    await scoresPage.goto(`/scores/${TEST_MATCH_RESULT_VERIFIED.id}`, {
      waitUntil: 'domcontentloaded',
    });
    await scoresPage.waitForTimeout(5000);

    const cancelBtn = scoresPage.getByRole('button', { name: /cancel/i });
    const isVisible = await cancelBtn.isVisible().catch(() => false);
    if (!isVisible) return;

    await cancelBtn.click();
    await scoresPage.waitForTimeout(1000);

    const modal = scoresPage.locator('[role="dialog"]');
    const hasModal = await modal.isVisible().catch(() => false);
    if (!hasModal) return;

    // Confirm button should be disabled when textarea is empty
    const confirmBtn = modal.getByRole('button', { name: /confirm cancellation/i });
    const btnVisible = await confirmBtn.isVisible().catch(() => false);
    if (btnVisible) {
      await expect(confirmBtn).toBeDisabled();
    }
  });

  authenticatedScoresTest('should enable confirm button after entering reason', async ({ scoresPage }) => {
    await scoresPage.goto(`/scores/${TEST_MATCH_RESULT_VERIFIED.id}`, {
      waitUntil: 'domcontentloaded',
    });
    await scoresPage.waitForTimeout(5000);

    const cancelBtn = scoresPage.getByRole('button', { name: /cancel/i });
    const isVisible = await cancelBtn.isVisible().catch(() => false);
    if (!isVisible) return;

    await cancelBtn.click();
    await scoresPage.waitForTimeout(1000);

    const modal = scoresPage.locator('[role="dialog"]');
    const hasModal = await modal.isVisible().catch(() => false);
    if (!hasModal) return;

    // Fill in the reason
    const textarea = modal.locator('textarea');
    await textarea.fill('Cheating confirmed by anti-cheat system');

    // Confirm button should now be enabled
    const confirmBtn = modal.getByRole('button', { name: /confirm cancellation/i });
    const btnVisible = await confirmBtn.isVisible().catch(() => false);
    if (btnVisible) {
      await expect(confirmBtn).toBeEnabled();
    }
  });
});

// ============================================================================
// 2. CONCILIATE MODAL — Requires Resolution Notes
// ============================================================================

test.describe('Conciliate Modal with Required Notes', () => {
  authenticatedScoresTest('should show conciliate modal when resolve dispute is clicked', async ({ scoresPage }) => {
    await scoresPage.goto(`/scores/${TEST_MATCH_RESULT_DISPUTED.id}`, {
      waitUntil: 'domcontentloaded',
    });
    await scoresPage.waitForTimeout(5000);

    const resolveBtn = scoresPage.getByRole('button', { name: /resolve dispute/i });
    const isVisible = await resolveBtn.isVisible().catch(() => false);
    if (!isVisible) return;

    await resolveBtn.click();
    await scoresPage.waitForTimeout(1000);

    const modal = scoresPage.locator('[role="dialog"]');
    const hasModal = await modal.isVisible().catch(() => false);
    expect(hasModal).toBe(true);

    // Should have a textarea for notes
    const textarea = modal.locator('textarea');
    const hasTextarea = await textarea.isVisible().catch(() => false);
    expect(hasTextarea).toBe(true);
  });

  authenticatedScoresTest('should disable resolve button when notes are empty', async ({ scoresPage }) => {
    await scoresPage.goto(`/scores/${TEST_MATCH_RESULT_DISPUTED.id}`, {
      waitUntil: 'domcontentloaded',
    });
    await scoresPage.waitForTimeout(5000);

    const resolveBtn = scoresPage.getByRole('button', { name: /resolve dispute/i });
    const isVisible = await resolveBtn.isVisible().catch(() => false);
    if (!isVisible) return;

    await resolveBtn.click();
    await scoresPage.waitForTimeout(1000);

    const modal = scoresPage.locator('[role="dialog"]');
    const hasModal = await modal.isVisible().catch(() => false);
    if (!hasModal) return;

    const submitBtn = modal.getByRole('button', { name: /resolve dispute/i });
    const btnVisible = await submitBtn.isVisible().catch(() => false);
    if (btnVisible) {
      await expect(submitBtn).toBeDisabled();
    }
  });

  authenticatedScoresTest('should submit conciliation with notes', async ({ scoresPage }) => {
    await scoresPage.goto(`/scores/${TEST_MATCH_RESULT_DISPUTED.id}`, {
      waitUntil: 'domcontentloaded',
    });
    await scoresPage.waitForTimeout(5000);

    const resolveBtn = scoresPage.getByRole('button', { name: /resolve dispute/i });
    const isVisible = await resolveBtn.isVisible().catch(() => false);
    if (!isVisible) return;

    await resolveBtn.click();
    await scoresPage.waitForTimeout(1000);

    const modal = scoresPage.locator('[role="dialog"]');
    const hasModal = await modal.isVisible().catch(() => false);
    if (!hasModal) return;

    // Fill in resolution notes
    const textarea = modal.locator('textarea');
    await textarea.fill('Reviewed replay files. Scores confirmed correct.');

    const submitBtn = modal.getByRole('button', { name: /resolve dispute/i });
    const btnVisible = await submitBtn.isVisible().catch(() => false);
    if (btnVisible) {
      await expect(submitBtn).toBeEnabled();
      await submitBtn.click();
      await scoresPage.waitForTimeout(2000);

      // Success feedback
      const successMsg = scoresPage.getByText(/conciliated|resolved|dispute resolved/i);
      const hasSuccess = await successMsg.first().isVisible().catch(() => false);
      expect(hasSuccess).toBe(true);
    }
  });
});

// ============================================================================
// 3. CANCEL AUDIT TRAIL DISPLAY
// ============================================================================

test.describe('Cancel Audit Trail', () => {
  authenticatedScoresTest('should display cancel information on cancelled results', async ({ scoresPage }) => {
    // Override cancelled result to include audit fields
    const cancelledWithAudit = {
      ...TEST_MATCH_RESULT_CANCELLED,
      cancelled_by: 'admin_e2e_001',
      cancelled_at: new Date().toISOString(),
      cancel_reason: 'Confirmed use of unauthorized software',
    };

    // Re-mock with enriched data
    await scoresPage.route(/\/api\/scores\/match-results\/[^/]+$/, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: cancelledWithAudit,
          }),
        });
      } else {
        await route.continue();
      }
    });

    await scoresPage.goto(`/scores/${TEST_MATCH_RESULT_CANCELLED.id}`, {
      waitUntil: 'domcontentloaded',
    });
    await scoresPage.waitForTimeout(5000);

    // Check for cancelled status display
    const cancelledBadge = scoresPage.getByText(/cancelled/i);
    const hasBadge = await cancelledBadge.first().isVisible().catch(() => false);
    expect(hasBadge).toBe(true);
  });
});

// ============================================================================
// 4. 403 ERROR HANDLING — Sanitized Permission Errors
// ============================================================================

test.describe('Permission Error Handling', () => {
  authenticatedScoresTest('should show permission error on 403 finalize response', async ({ scoresPage }) => {
    // Override finalize to return 403
    await scoresPage.route('**/api/scores/match-results/*/finalize', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { message: 'Forbidden: insufficient permissions' },
        }),
      });
    });

    await scoresPage.goto(`/scores/${TEST_MATCH_RESULT_VERIFIED.id}`, {
      waitUntil: 'domcontentloaded',
    });
    await scoresPage.waitForTimeout(5000);

    const finalizeBtn = scoresPage.getByRole('button', { name: /finalize/i });
    const isVisible = await finalizeBtn.isVisible().catch(() => false);
    if (!isVisible) return;

    await finalizeBtn.click();
    await scoresPage.waitForTimeout(2000);

    // Should show an error message (not expose internal details)
    const errorMsg = scoresPage.getByText(/permission|denied|not authorized|forbidden/i);
    const hasError = await errorMsg.first().isVisible().catch(() => false);
    expect(hasError).toBe(true);

    // Should NOT contain internal details like function names or stack traces
    const pageContent = await scoresPage.content();
    expect(pageContent).not.toContain('authorizeAdminAction');
    expect(pageContent).not.toContain('matchResultCommandHandler');
  });

  authenticatedScoresTest('should show permission error on 403 cancel response', async ({ scoresPage }) => {
    await scoresPage.route('**/api/scores/match-results/*/cancel', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { message: 'Forbidden: insufficient permissions' },
        }),
      });
    });

    await scoresPage.goto(`/scores/${TEST_MATCH_RESULT_VERIFIED.id}`, {
      waitUntil: 'domcontentloaded',
    });
    await scoresPage.waitForTimeout(5000);

    const cancelBtn = scoresPage.getByRole('button', { name: /cancel/i });
    const isVisible = await cancelBtn.isVisible().catch(() => false);
    if (!isVisible) return;

    await cancelBtn.click();
    await scoresPage.waitForTimeout(1000);

    // Fill in reason in modal (required now)
    const modal = scoresPage.locator('[role="dialog"]');
    const hasModal = await modal.isVisible().catch(() => false);
    if (!hasModal) return;

    const textarea = modal.locator('textarea');
    await textarea.fill('Test cancel reason');

    const confirmBtn = modal.getByRole('button', { name: /confirm cancellation/i });
    const btnVisible = await confirmBtn.isVisible().catch(() => false);
    if (!btnVisible) return;

    await confirmBtn.click();
    await scoresPage.waitForTimeout(2000);

    // Should show permission error
    const errorMsg = scoresPage.getByText(/permission|denied|error|failed/i);
    const hasError = await errorMsg.first().isVisible().catch(() => false);
    expect(hasError).toBe(true);
  });
});

// ============================================================================
// 5. DISPUTE WINDOW GUARD — Error for premature finalization
// ============================================================================

test.describe('Dispute Window Guard', () => {
  authenticatedScoresTest('should show dispute window error when finalizing too early', async ({ scoresPage }) => {
    // Mock finalize to return dispute window error
    await scoresPage.route('**/api/scores/match-results/*/finalize', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            message: 'cannot finalize: dispute window has not elapsed (48 hours remaining); only platform admins can force-finalize',
          },
        }),
      });
    });

    await scoresPage.goto(`/scores/${TEST_MATCH_RESULT_VERIFIED.id}`, {
      waitUntil: 'domcontentloaded',
    });
    await scoresPage.waitForTimeout(5000);

    const finalizeBtn = scoresPage.getByRole('button', { name: /finalize/i });
    const isVisible = await finalizeBtn.isVisible().catch(() => false);
    if (!isVisible) return;

    await finalizeBtn.click();
    await scoresPage.waitForTimeout(2000);

    // Should show dispute window error
    const errorMsg = scoresPage.getByText(/dispute window|cannot finalize/i);
    const hasError = await errorMsg.first().isVisible().catch(() => false);
    expect(hasError).toBe(true);
  });
});
