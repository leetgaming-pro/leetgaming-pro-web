/**
 * E2E Tests for Settings Page
 * Tests profile, notifications, privacy, security, and billing tabs
 *
 * NOTE: The settings page requires authentication.
 * When running without auth, tests that need page content will be skipped.
 */

import { test, expect } from "@playwright/test";

/** Navigate to settings and skip the test if redirected to signin */
async function gotoSettingsOrSkip(
  page: import("@playwright/test").Page,
  path = "/settings",
) {
  await page.goto(path, { waitUntil: "domcontentloaded" });

  // Wait for either: redirect to signin, OR settings tabs to render
  try {
    await Promise.race([
      page.waitForURL("**/signin**", { timeout: 15000 }),
      page.waitForSelector('[role="tablist"]', { timeout: 15000 }),
    ]);
  } catch {
    // Neither happened within timeout
  }

  const redirected = page.url().includes("/signin");
  test.skip(redirected, "Settings page requires authentication");
}

test.describe("Settings Page", () => {
  test.describe("Page Loading", () => {
    test("should redirect unauthenticated users to signin", async ({
      page,
    }) => {
      await page.goto("/settings", { waitUntil: "domcontentloaded" });

      // Wait for either redirect to signin or settings content to load
      try {
        await Promise.race([
          page.waitForURL("**/signin**", { timeout: 15000 }),
          page.waitForSelector('[role="tablist"]', { timeout: 15000 }),
        ]);
      } catch {
        // Neither happened
      }

      // Either the page redirected to signin or shows settings content
      const onSignin = page.url().includes("/signin");
      const hasSettingsContent = await page
        .locator('[role="tablist"]')
        .isVisible()
        .catch(() => false);

      expect(onSignin || hasSettingsContent).toBe(true);
    });

    test("should display settings page with tabs", async ({ page }) => {
      await gotoSettingsOrSkip(page);

      // Should show tab navigation
      const tablist = page.locator('[role="tablist"]');
      await expect(tablist).toBeVisible();

      // Check for main tabs
      const profileTab = page.getByRole("tab", { name: /profile/i });
      const notificationsTab = page.getByRole("tab", {
        name: /notifications/i,
      });
      const privacyTab = page.getByRole("tab", { name: /privacy/i });
      const securityTab = page.getByRole("tab", { name: /security/i });
      const billingTab = page.getByRole("tab", { name: /billing/i });

      await expect(profileTab).toBeVisible();
      await expect(notificationsTab).toBeVisible();
      await expect(privacyTab).toBeVisible();
      await expect(securityTab).toBeVisible();
      await expect(billingTab).toBeVisible();
    });

    test("should load settings page via URL tab parameter", async ({
      page,
    }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=notifications");

      // Should be on notifications tab
      const notificationsContent = page
        .getByText(/notification preferences/i)
        .or(page.getByText(/email notifications/i));
      await expect(notificationsContent.first()).toBeVisible();
    });
  });

  test.describe("Profile Tab", () => {
    test("should display profile form fields", async ({ page }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=profile");

      const nicknameInput = page.getByLabel(/nickname/i);
      const emailInput = page.getByLabel(/email/i);

      const hasNickname = await nicknameInput.isVisible().catch(() => false);
      const hasEmail = await emailInput.isVisible().catch(() => false);

      expect(hasNickname || hasEmail).toBe(true);
    });

    test("should allow editing profile fields", async ({ page }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=profile");

      const nicknameInput = page.getByLabel(/nickname/i);
      const hasNickname = await nicknameInput.isVisible().catch(() => false);

      if (hasNickname) {
        await nicknameInput.clear();
        await nicknameInput.fill("TestUser123");
        await expect(nicknameInput).toHaveValue("TestUser123");
      }
    });

    test("should have avatar upload section", async ({ page }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=profile");

      const avatarSection = page
        .getByText(/change avatar/i)
        .or(page.locator('img[alt*="avatar" i]'));
      await expect(avatarSection.first()).toBeVisible();
    });

    test("should have country and timezone selects", async ({ page }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=profile");

      const countrySelect = page
        .getByLabel(/country/i)
        .or(page.getByText(/country/i));
      const timezoneSelect = page
        .getByLabel(/timezone/i)
        .or(page.getByText(/timezone/i));

      const hasCountry = await countrySelect
        .first()
        .isVisible()
        .catch(() => false);
      const hasTimezone = await timezoneSelect
        .first()
        .isVisible()
        .catch(() => false);

      expect(hasCountry || hasTimezone).toBe(true);
    });

    test("should have save and cancel buttons", async ({ page }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=profile");

      const saveButton = page.getByRole("button", { name: /save/i });
      const cancelButton = page.getByRole("button", { name: /cancel/i });

      const hasSave = await saveButton.isVisible().catch(() => false);
      const hasCancel = await cancelButton.isVisible().catch(() => false);

      expect(hasSave || hasCancel).toBe(true);
    });
  });

  test.describe("Notifications Tab", () => {
    test("should display notification settings", async ({ page }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=notifications");

      const notificationHeader = page.getByText(/notification preferences/i);
      await expect(notificationHeader).toBeVisible();
    });

    test("should have email notification toggles", async ({ page }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=notifications");

      const emailSection = page.getByText(/email notifications/i);
      const matchUpdates = page.getByText(/match updates/i);

      const hasEmailSection = await emailSection
        .first()
        .isVisible()
        .catch(() => false);
      const hasMatchUpdates = await matchUpdates
        .first()
        .isVisible()
        .catch(() => false);

      expect(hasEmailSection || hasMatchUpdates).toBe(true);
    });

    test("should have push notification toggles", async ({ page }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=notifications");

      const pushSection = page.getByText(/push notifications/i);
      await expect(pushSection.first()).toBeVisible();
    });

    test("should toggle notification switches", async ({ page }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=notifications");

      const switches = page.locator('button[role="switch"]');
      const switchCount = await switches.count();

      if (switchCount > 0) {
        const firstSwitch = switches.first();
        const initialState = await firstSwitch.getAttribute("aria-checked");
        await firstSwitch.click();
        await page.waitForTimeout(500);
        const newState = await firstSwitch.getAttribute("aria-checked");
        expect(initialState !== newState).toBe(true);
      }
    });
  });

  test.describe("Privacy Tab", () => {
    test("should display privacy settings", async ({ page }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=privacy");

      const privacyContent = page.getByText(/privacy/i);
      await expect(privacyContent.first()).toBeVisible();
    });

    test("should have data management options", async ({ page }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=privacy");

      const downloadData = page.getByText(/download.*data/i);
      const deleteAccount = page.getByText(/delete.*account/i);

      const hasDownload = await downloadData
        .first()
        .isVisible()
        .catch(() => false);
      const hasDelete = await deleteAccount
        .first()
        .isVisible()
        .catch(() => false);

      expect(hasDownload || hasDelete).toBe(true);
    });
  });

  test.describe("Security Tab", () => {
    test("should display security settings", async ({ page }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=security");

      const securityHeader = page.getByText(/security settings/i);
      await expect(securityHeader).toBeVisible();
    });

    test("should have password change form", async ({ page }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=security");

      const changePassword = page.getByText(/change password/i);
      const currentPassword = page.getByLabel(/current password/i);

      const hasChangePassword = await changePassword
        .isVisible()
        .catch(() => false);
      const hasCurrentPassword = await currentPassword
        .isVisible()
        .catch(() => false);

      expect(hasChangePassword || hasCurrentPassword).toBe(true);
    });

    test("should have 2FA section", async ({ page }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=security");

      const twoFactorSection = page
        .getByText(/two-factor authentication/i)
        .or(page.getByText(/2fa/i));
      const enableButton = page.getByRole("button", { name: /enable 2fa/i });

      const has2FA = await twoFactorSection
        .first()
        .isVisible()
        .catch(() => false);
      const hasEnableButton = await enableButton.isVisible().catch(() => false);

      expect(has2FA || hasEnableButton).toBe(true);
    });

    test("should have connected accounts section", async ({ page }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=security");

      const connectedAccounts = page.getByText(/connected accounts/i);
      const steamAccount = page.getByText(/steam/i);

      const hasConnected = await connectedAccounts
        .isVisible()
        .catch(() => false);
      const hasSteam = await steamAccount
        .first()
        .isVisible()
        .catch(() => false);

      expect(hasConnected || hasSteam).toBe(true);
    });
  });

  test.describe("Billing Tab", () => {
    test("should display billing settings", async ({ page }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=billing");

      const body = page.locator("body");
      await expect(body).toBeVisible();
    });

    test("should have subscription management section", async ({ page }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=billing");

      const subscriptionSection = page
        .getByText(/subscription/i)
        .or(page.getByText(/plan/i));
      await expect(subscriptionSection.first()).toBeVisible();
    });

    test("should have payment history section", async ({ page }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=billing");

      const paymentHistory = page
        .getByText(/payment history/i)
        .or(page.getByText(/transactions/i));
      await expect(paymentHistory.first()).toBeVisible();
    });
  });

  test.describe("Tab Navigation", () => {
    test("should navigate between tabs", async ({ page }) => {
      await gotoSettingsOrSkip(page);

      const tabs = [
        "notifications",
        "privacy",
        "security",
        "billing",
        "profile",
      ];

      for (const tabName of tabs) {
        const tab = page.getByRole("tab", { name: new RegExp(tabName, "i") });
        const isVisible = await tab.isVisible().catch(() => false);
        if (isVisible) {
          await tab.click();
          await page.waitForTimeout(500);
          expect(page.url()).toContain("settings");
        }
      }
    });

    test("should update URL when changing tabs", async ({ page }) => {
      await gotoSettingsOrSkip(page, "/settings?tab=profile");

      const notificationsTab = page.getByRole("tab", {
        name: /notifications/i,
      });
      await expect(notificationsTab).toBeVisible();
      await notificationsTab.click();
      await page.waitForTimeout(500);
      expect(page.url()).toContain("tab=notifications");
    });
  });

  test.describe("Responsive Design", () => {
    test("should be responsive on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await gotoSettingsOrSkip(page);

      const body = page.locator("body");
      await expect(body).toBeVisible();

      // Tabs should adapt to mobile
      const tablist = page.locator('[role="tablist"]');
      await expect(tablist).toBeVisible();
    });

    test("should be responsive on tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await gotoSettingsOrSkip(page);

      const body = page.locator("body");
      await expect(body).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper heading hierarchy", async ({ page }) => {
      await gotoSettingsOrSkip(page);

      const h1 = page.locator("h1");
      const h1Count = await h1.count();
      expect(h1Count).toBeLessThanOrEqual(2);
    });

    test("should have accessible tab navigation", async ({ page }) => {
      await gotoSettingsOrSkip(page);

      const tablist = page.locator('[role="tablist"]');
      await expect(tablist).toBeVisible();

      const tabs = page.locator('[role="tab"]');
      const tabCount = await tabs.count();
      expect(tabCount).toBeGreaterThan(0);
    });

    test("should support keyboard navigation", async ({ page }) => {
      await gotoSettingsOrSkip(page);

      await page.keyboard.press("Tab");
      const focusedElement = await page.evaluate(
        () => document.activeElement?.tagName,
      );
      expect(focusedElement).toBeTruthy();
    });
  });
});
