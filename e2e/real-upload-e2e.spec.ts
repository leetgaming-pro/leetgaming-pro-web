/**
 * Real E2E Upload Test — No Mocks (except auth)
 *
 * Tests the actual upload flow against the real backend:
 * 1. Loads upload page
 * 2. Selects sound.dem file
 * 3. Clicks upload (hits real API through Next.js proxy)
 * 4. Waits for processing to complete
 * 5. Navigates to replay detail page
 * 6. Verifies replay info renders (status, game, scoreboard)
 *
 * Prerequisites:
 * - K8s web-frontend on port 3030
 * - Backend API accessible via proxy at /api/games/*
 * - sound.dem in e2e/fixtures/demo-files/
 */

import { test, expect, Page, ConsoleMessage } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3030";
const SOUND_DEM_PATH = path.join(__dirname, "fixtures/demo-files/sound.dem");

// Errors to ignore in console (non-critical)
const IGNORED_CONSOLE_PATTERNS = [
  /Download the React DevTools/,
  /Third-party cookie/,
  /favicon\.ico/,
  /\[HMR\]/,
  /webpack/i,
  /net::/,
  /Failed to load resource/,
  /hydration/i,
  /Please sign in/i,
  /401/,
  /rid.*expired/i,
  /Omitting fields/,
  /notifications/i,
  /NEXT_REDIRECT/,
  /session.*error/i,
];

/**
 * Setup console error tracking — collects all errors and warns
 */
function trackConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (IGNORED_CONSOLE_PATTERNS.some((p) => p.test(text))) return;
    errors.push(text);
  });
  return errors;
}

/**
 * Create mock auth/session endpoints so the upload page renders the form
 * and ensureSession() completes successfully (guest upload flow)
 */
async function mockAuthForUpload(page: Page) {
  // Mock NextAuth session — guest user
  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          id: "e2e-real-upload-user",
          uid: "e2e-real-upload-user",
          name: "E2E Real Upload",
          email: "e2e-real@leetgaming.gg",
          image: null,
          rid: "e2e-test-rid",
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      }),
    });
  });

  await page.route("**/api/auth/csrf", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ csrfToken: "e2e-csrf-token" }),
    });
  });

  await page.route("**/api/auth/providers", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        google: { id: "google", name: "Google", type: "oauth" },
        steam: { id: "steam", name: "Steam", type: "oauth" },
      }),
    });
  });

  // ensureSession calls this to get RID headers
  await page.route("**/api/auth/rid/headers", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ headers: {} }),
    });
  });

  // Guest onboarding
  await page.route("**/onboarding/guest", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  // Mock subscriptions/plans that the navbar fetches
  await page.route("**/subscriptions/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ plan: "free" }),
    });
  });

  // Mock players endpoint
  await page.route("**/api/players/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [] }),
    });
  });

  // Mock notifications
  await page.route("**/notifications**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ notifications: [], unread: 0 }),
    });
  });
}

test.describe("Real Upload E2E — sound.dem", () => {
  test.beforeEach(async () => {
    // Verify sound.dem exists
    expect(fs.existsSync(SOUND_DEM_PATH)).toBeTruthy();
  });

  test("upload sound.dem through browser, verify processing and replay page", async ({
    page,
  }) => {
    test.setTimeout(180_000); // 3 min for upload + processing

    const consoleErrors = trackConsoleErrors(page);

    // Setup auth mocks (but NOT API mocks — we want real backend)
    await mockAuthForUpload(page);

    // Step 1: Navigate to upload page — wait for network idle
    await page.goto(`${BASE_URL}/upload`, { waitUntil: "networkidle" });

    // Wait for the upload form to render (look for the dropzone text)
    await expect(
      page.getByText(/drag.*drop|browse files/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // Step 2: Select sound.dem via the hidden file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.waitFor({ state: "attached", timeout: 10_000 });
    await fileInput.setInputFiles(SOUND_DEM_PATH);

    // Wait for file info card to show (file name visible)
    await expect(
      page.getByText(/sound\.dem/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Step 3: Click the Upload Replay button
    // Wait for the button to settle (auth loading completes)
    const uploadButton = page.getByRole("button", { name: /upload replay/i });
    await expect(uploadButton).toBeVisible({ timeout: 10_000 });
    // Wait for it to be enabled (not disabled by auth loading)
    await expect(uploadButton).toBeEnabled({ timeout: 10_000 });
    // Use force:true since React re-renders can destabilize the element
    await uploadButton.click({ force: true });

    // Step 4: Wait for "Upload Complete!" modal
    await expect(
      page.getByText(/upload complete/i).first()
    ).toBeVisible({ timeout: 120_000 });

    // Step 5: Click "View Match Stats" button in the success modal
    const viewStatsButton = page.getByRole("button", {
      name: /view match stats/i,
    });

    if (await viewStatsButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await viewStatsButton.click({ force: true });

      // Wait for navigation to match/replay page
      await page.waitForURL(/\/(matches|replays)\//, { timeout: 15_000 });

      // Verify page content loads (not stuck on spinner)
      const contentLoaded = await Promise.race([
        page
          .getByText(/completed|ready|replay|match|scoreboard|team|player|CS2/i)
          .first()
          .waitFor({ timeout: 30_000 })
          .then(() => "content"),
        page
          .getByText(/error|failed|not found/i)
          .first()
          .waitFor({ timeout: 30_000 })
          .then(() => "error"),
      ]).catch(() => "timeout");

      expect(contentLoaded).not.toBe("timeout");

      if (contentLoaded === "content") {
        const hasContent = await page
          .getByText(/completed|ready|CS2|replay|watch/i)
          .first()
          .isVisible()
          .catch(() => false);
        expect(hasContent).toBeTruthy();
      }
    }

    // Step 6: Verify no critical console errors
    const criticalErrors = consoleErrors.filter(
      (e) =>
        /TypeError|ReferenceError|Cannot read properties|Unhandled/i.test(e) &&
        !/net::|Failed to load/i.test(e)
    );

    if (criticalErrors.length > 0) {
      console.log("Critical console errors found:", criticalErrors);
    }
    expect(criticalErrors).toHaveLength(0);
  });

  test("upload via API proxy and verify replay detail page renders", async ({
    page,
  }) => {
    test.setTimeout(120_000);

    const consoleErrors = trackConsoleErrors(page);
    await mockAuthForUpload(page);

    // Step 1: Upload directly via API proxy (simulates XHR from browser)
    const uploadResponse = await page.request.post(
      `${BASE_URL}/api/games/cs2/replays`,
      {
        multipart: {
          file: {
            name: "sound.dem",
            mimeType: "application/octet-stream",
            buffer: fs.readFileSync(SOUND_DEM_PATH),
          },
          title: "E2E Real Upload Test",
        },
      }
    );

    expect(uploadResponse.status()).toBe(201);
    const uploadData = await uploadResponse.json();
    const replayId = uploadData.id;
    expect(replayId).toBeTruthy();
    console.log(`Upload created replay: ${replayId}, status: ${uploadData.status}, original_replay_id: ${uploadData.original_replay_id || "none"}`);

    // Step 2: Poll status until completed (max 2 min)
    let status = uploadData.status;
    if (status === "Processing" || status === "Pending") {
      for (let i = 0; i < 40; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const statusResp = await page.request.get(
          `${BASE_URL}/api/games/cs2/replays/${replayId}/status`
        );
        const statusData = await statusResp.json();
        status = statusData.status;
        console.log(`Poll ${i + 1}: status=${status}`);
        if (status === "Completed" || status === "Failed") break;
      }
    }
    expect(status).toBe("Completed");

    // Step 3: Verify scoreboard is available (retry up to 3 times)
    let scoreboardStatus = 0;
    for (let attempt = 0; attempt < 3; attempt++) {
      const scoreboardResp = await page.request.get(
        `${BASE_URL}/api/games/cs2/replays/${replayId}/scoreboard`
      );
      scoreboardStatus = scoreboardResp.status();
      console.log(`Scoreboard attempt ${attempt + 1}: status=${scoreboardStatus}`);
      if (scoreboardStatus === 200) {
        const scoreboard = await scoreboardResp.json();
        expect(scoreboard.scoreboard.team_scoreboards).toHaveLength(2);
        break;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    expect(scoreboardStatus).toBe(200);

    // Step 4: Navigate to replay detail page
    await page.goto(`${BASE_URL}/replays/${replayId}`, {
      waitUntil: "domcontentloaded",
    });

    // Step 5: Verify replay page renders properly (not stuck loading)
    await expect(
      page.getByText(/completed|ready/i).first()
    ).toBeVisible({ timeout: 30_000 });

    // Verify the page shows game info
    await expect(page.getByText(/CS2/i).first()).toBeVisible({ timeout: 5_000 });

    // Verify page has actual content (not just a spinner)
    const hasReplayContent = await page
      .getByText(/replay.*ready|watch.*replay|upload|CS2/i)
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasReplayContent).toBeTruthy();

    // Step 6: No critical console errors
    const criticalErrors = consoleErrors.filter(
      (e) =>
        /TypeError|ReferenceError|Cannot read properties|Unhandled/i.test(e) &&
        !/net::|Failed to load/i.test(e)
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
