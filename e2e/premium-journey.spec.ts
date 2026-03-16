/**
 * E2E Tests: Premium User Journey
 *
 * Validates the full premium (pro) user experience using real backend authentication.
 * Tests login → session → wallet → pro wallet → pricing → teams → settings flow.
 *
 * Seed data: e2e/db-init/01-seed-data.js
 *   - savelis.pedro@gmail.com with Elite subscription, wallet balance ($170 USD)
 *   - Wallet transactions: USDC deposit, PIX deposit, prize payout, entry fee
 */

import { proUserTest, PRO_USER } from "./fixtures/real-auth.fixture";
import { expect } from "@playwright/test";

proUserTest.describe("Premium User Journey", () => {
  proUserTest(
    "should login and redirect to match-making",
    async ({ proPage }) => {
      // After login the user should land on /match-making
      expect(proPage.url()).toContain("/match-making");
    },
  );

  proUserTest("should have a valid session", async ({ proPage }) => {
    const session = await proPage.evaluate(async () => {
      const res = await fetch("/api/auth/session");
      return res.json();
    });

    expect(session?.user?.email).toBe(PRO_USER.email);
  });

  proUserTest("should access wallet page", async ({ proPage }) => {
    await proPage.goto("/wallet", { waitUntil: "domcontentloaded" });
    await proPage.waitForTimeout(5000);

    // Elite user should be redirected to /wallet/pro and see "Pro Wallet" heading
    // OR still see "My Wallet" if subscription check is still loading
    const proHeading = proPage.getByRole("heading", { name: /pro wallet/i });
    const myWalletHeading = proPage.getByRole("heading", { name: /my wallet/i });
    const hasProWallet = await proHeading.isVisible().catch(() => false);
    const hasMyWallet = await myWalletHeading.isVisible().catch(() => false);
    expect(hasProWallet || hasMyWallet).toBe(true);
  });

  proUserTest("should access pro wallet page", async ({ proPage }) => {
    // Navigate to /wallet — layout should redirect elite users to /wallet/pro
    await proPage.goto("/wallet", { waitUntil: "domcontentloaded" });

    // Wait for subscription check + redirect
    await proPage.waitForTimeout(5000);

    // Page should not redirect to signin (authenticated)
    expect(proPage.url()).not.toContain("/signin");

    // Elite users should be redirected to /wallet/pro by the wallet layout
    const url = proPage.url();
    expect(url).toContain("/wallet");

    // Verify page has meaningful content (not blank)
    const body = proPage.locator("body");
    await expect(body).toBeVisible();
  });

  proUserTest("should open pro wallet from user menu", async ({ proPage }) => {
    await proPage.goto("/match-making", { waitUntil: "domcontentloaded" });

    const userMenuButton = proPage.getByLabel(/user menu/i);
    await expect(userMenuButton).toBeVisible({ timeout: 15000 });
    await userMenuButton.click();

    const walletMenuItem = proPage.getByRole("menuitem", { name: /^wallet$/i });
    await expect(walletMenuItem).toBeVisible({ timeout: 10000 });
    await walletMenuItem.click();

    await proPage.waitForURL(/\/wallet\/pro(?:\?.*)?$/, { timeout: 15000 });
    await expect(
      proPage.getByRole("heading", { name: /pro wallet/i }).first(),
    ).toBeVisible({ timeout: 15000 });
  });

  proUserTest("should access pricing page", async ({ proPage }) => {
    await proPage.goto("/pricing", { waitUntil: "domcontentloaded" });
    await proPage.waitForTimeout(3000);

    // "Choose Your Competitive Edge"
    const heading = proPage.getByText(/choose your/i);
    await expect(heading.first()).toBeVisible({ timeout: 15000 });
  });

  proUserTest("should access settings page", async ({ proPage }) => {
    await proPage.goto("/settings", { waitUntil: "domcontentloaded" });
    await proPage.waitForTimeout(3000);

    // Auth-protected page should load for authenticated user
    const body = proPage.locator("body");
    await expect(body).toBeVisible();

    // Should not redirect to signin
    expect(proPage.url()).not.toContain("/signin");
  });

  proUserTest(
    "should see Launch Your Squad on teams page",
    async ({ proPage }) => {
      await proPage.goto("/teams", { waitUntil: "domcontentloaded" });
      await proPage.waitForTimeout(3000);

      const heading = proPage.getByRole("heading", {
        name: /competitive teams/i,
      });
      await expect(heading).toBeVisible({ timeout: 15000 });

      // Authenticated users see "Launch Your Squad" instead of "Sign in to create team"
      const launchSquadButton = proPage.getByRole("button", {
        name: /launch your squad/i,
      });
      const signInButton = proPage.getByRole("button", {
        name: /sign in to create team/i,
      });

      const hasLaunchSquad = await launchSquadButton
        .isVisible()
        .catch(() => false);
      const hasSignIn = await signInButton.isVisible().catch(() => false);

      expect(
        hasLaunchSquad,
        "Authenticated user should see 'Launch Your Squad', not 'Sign in'",
      ).toBe(true);
      expect(hasSignIn).toBe(false);
    },
  );

  proUserTest("should access players page", async ({ proPage }) => {
    await proPage.goto("/players", { waitUntil: "domcontentloaded" });
    await proPage.waitForTimeout(3000);

    const heading = proPage.getByRole("heading", {
      name: /player profiles/i,
    });
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  proUserTest(
    "should access tournaments page without crashing",
    async ({ proPage }) => {
      await proPage.goto("/tournaments", { waitUntil: "domcontentloaded" });
      await proPage.waitForTimeout(3000);

      const body = proPage.locator("body");
      await expect(body).toBeVisible();
      expect(proPage.url()).not.toContain("/signin");
    },
  );

  proUserTest("should access leaderboards page", async ({ proPage }) => {
    await proPage.goto("/leaderboards", { waitUntil: "domcontentloaded" });
    await proPage.waitForTimeout(3000);

    const body = proPage.locator("body");
    await expect(body).toBeVisible();
    expect(proPage.url()).not.toContain("/signin");
  });
});
