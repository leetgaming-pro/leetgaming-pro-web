/**
 * Matchmaking Page Object
 * Follows Page Object Pattern for maintainable and reusable test code
 * Covers the 5-step matchmaking wizard flow
 */

import { Page, Locator, expect } from '@playwright/test';

/**
 * Lobby status enum for type safety
 */
export enum LobbyStatus {
  WAITING_FOR_PLAYERS = 'waiting_for_players',
  READY_CHECK = 'ready_check',
  STARTING = 'starting',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

/**
 * Game modes available
 */
export enum GameMode {
  COMPETITIVE = 'competitive',
  CASUAL = 'casual',
  RANKED = 'ranked',
  CUSTOM = 'custom',
}

/**
 * Regions available
 */
export enum Region {
  NA = 'na',
  EU = 'eu',
  SA = 'sa',
  ASIA = 'asia',
}

/**
 * Matchmaking wizard step data
 */
export interface MatchmakingFormData {
  region: Region;
  gameMode: GameMode;
  squadSize?: number;
  entryFee?: number;
  scheduledTime?: Date;
}

/**
 * Page Object for Matchmaking pages
 * Encapsulates all matchmaking-related interactions
 */
export class MatchmakingPage {
  readonly page: Page;

  // Navigation locators
  readonly matchmakingLink: Locator;
  readonly playButton: Locator;

  // Wizard step indicators
  readonly stepIndicator: Locator;
  readonly currentStep: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly submitButton: Locator;

  // Step 1: Region selection
  readonly regionSelect: Locator;
  readonly regionCards: Locator;

  // Step 2: Game mode selection
  readonly gameModeSelect: Locator;
  readonly gameModeCards: Locator;

  // Step 3: Squad formation
  readonly squadSizeSelect: Locator;
  readonly invitePlayerInput: Locator;
  readonly squadMembersList: Locator;

  // Step 4: Schedule
  readonly scheduleNowOption: Locator;
  readonly scheduleLaterOption: Locator;
  readonly dateTimePicker: Locator;

  // Step 5: Prize distribution
  readonly entryFeeInput: Locator;
  readonly prizePoolPreview: Locator;
  readonly termsCheckbox: Locator;

  // Queue status
  readonly queueStatus: Locator;
  readonly queuePosition: Locator;
  readonly estimatedWait: Locator;
  readonly leaveQueueButton: Locator;

  // Lobby
  readonly lobbyContainer: Locator;
  readonly playerSlots: Locator;
  readonly readyButton: Locator;
  readonly startMatchButton: Locator;
  readonly cancelLobbyButton: Locator;
  readonly lobbyChat: Locator;

  // Common elements
  readonly loadingSpinner: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly toastNotification: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navigation
    this.matchmakingLink = page.locator('a[href="/match-making"]');
    this.playButton = page.locator('button:has-text("Play"), a:has-text("Play")');

    // Wizard navigation
    this.stepIndicator = page.locator('nav[aria-label="Progress"], [data-testid="step-indicator"], .wizard-steps');
    this.currentStep = page.locator('[aria-current="step"], [data-testid="current-step"]');
    this.nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")');
    this.backButton = page.locator('button:has-text("Back"), button:has-text("Previous")');
    this.submitButton = page.locator('button:has-text("Find Match"), button:has-text("Submit"), button[type="submit"]');

    // Step 1: Region
    this.regionSelect = page.locator('[data-testid="region-select"], select[name="region"]');
    this.regionCards = page.locator('[data-testid="region-card"], .region-option');

    // Step 2: Game mode
    this.gameModeSelect = page.locator('[data-testid="game-mode-select"], select[name="gameMode"]');
    this.gameModeCards = page.locator('[data-testid="game-mode-card"], .game-mode-option');

    // Step 3: Squad
    this.squadSizeSelect = page.locator('[data-testid="squad-size"], select[name="squadSize"]');
    this.invitePlayerInput = page.locator('input[placeholder*="Invite"], input[name="invitePlayer"]');
    this.squadMembersList = page.locator('[data-testid="squad-members"], .squad-list');

    // Step 4: Schedule
    this.scheduleNowOption = page.locator('[data-testid="schedule-now"], input[value="now"]');
    this.scheduleLaterOption = page.locator('[data-testid="schedule-later"], input[value="later"]');
    this.dateTimePicker = page.locator('input[type="datetime-local"], [data-testid="date-picker"]');

    // Step 5: Prize
    this.entryFeeInput = page.locator('input[name="entryFee"], [data-testid="entry-fee"]');
    this.prizePoolPreview = page.locator('[data-testid="prize-pool-preview"], .prize-preview');
    this.termsCheckbox = page.locator('input[type="checkbox"][name="terms"], [data-testid="terms-checkbox"]');

    // Queue
    this.queueStatus = page.locator('[data-testid="queue-status"], .queue-status');
    this.queuePosition = page.locator('[data-testid="queue-position"], .queue-position');
    this.estimatedWait = page.locator('[data-testid="estimated-wait"], .estimated-wait');
    this.leaveQueueButton = page.locator('button:has-text("Leave Queue"), button:has-text("Cancel")');

    // Lobby
    this.lobbyContainer = page.locator('[data-testid="lobby"], .lobby-container');
    this.playerSlots = page.locator('[data-testid="player-slot"], .player-slot');
    this.readyButton = page.locator('button:has-text("Ready"), [data-testid="ready-button"]');
    this.startMatchButton = page.locator('button:has-text("Start Match"), [data-testid="start-match"]');
    this.cancelLobbyButton = page.locator('button:has-text("Cancel Lobby"), [data-testid="cancel-lobby"]');
    this.lobbyChat = page.locator('[data-testid="lobby-chat"], .lobby-chat');

    // Common
    this.loadingSpinner = page.locator('[data-testid="loading"], .loading-spinner, [role="progressbar"]');
    this.errorMessage = page.locator('[data-testid="error-message"], .error-message, [role="alert"]');
    this.successMessage = page.locator('[data-testid="success-message"], .success-message');
    this.toastNotification = page.locator('[data-testid="toast"], .toast, [role="status"]');
  }

  /**
   * Navigate to matchmaking page
   */
  async goto(): Promise<void> {
    await this.page.goto('/match-making');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Navigate to matchmaking via Play button in navbar
   */
  async gotoViaNavbar(): Promise<void> {
    await this.playButton.first().click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get current wizard step number
   */
  async getCurrentStep(): Promise<number> {
    const stepText = await this.currentStep.first().textContent();
    const match = stepText?.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  }

  /**
   * Wait for wizard to load
   */
  async waitForWizardLoad(): Promise<void> {
    await this.stepIndicator.first().waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Select region in step 1
   */
  async selectRegion(region: Region): Promise<void> {
    // Try card-based selection first
    const regionCard = this.page.locator(`[data-region="${region}"], [data-testid="region-${region}"]`);
    if (await regionCard.isVisible()) {
      await regionCard.click();
    } else {
      // Fallback to select dropdown
      await this.regionSelect.selectOption(region);
    }
  }

  /**
   * Select game mode in step 2
   */
  async selectGameMode(mode: GameMode): Promise<void> {
    const modeCard = this.page.locator(`[data-mode="${mode}"], [data-testid="mode-${mode}"]`);
    if (await modeCard.isVisible()) {
      await modeCard.click();
    } else {
      await this.gameModeSelect.selectOption(mode);
    }
  }

  /**
   * Configure squad in step 3
   */
  async configureSquad(size: number, invites?: string[]): Promise<void> {
    if (await this.squadSizeSelect.isVisible()) {
      await this.squadSizeSelect.selectOption(size.toString());
    }

    if (invites) {
      for (const invite of invites) {
        await this.invitePlayerInput.fill(invite);
        await this.page.keyboard.press('Enter');
      }
    }
  }

  /**
   * Configure schedule in step 4
   */
  async configureSchedule(scheduleNow: boolean, dateTime?: Date): Promise<void> {
    if (scheduleNow) {
      await this.scheduleNowOption.click();
    } else if (dateTime) {
      await this.scheduleLaterOption.click();
      const formattedDate = dateTime.toISOString().slice(0, 16);
      await this.dateTimePicker.fill(formattedDate);
    }
  }

  /**
   * Configure prize pool in step 5
   */
  async configurePrizePool(entryFee: number, acceptTerms: boolean = true): Promise<void> {
    await this.entryFeeInput.fill(entryFee.toString());

    if (acceptTerms) {
      const isChecked = await this.termsCheckbox.isChecked();
      if (!isChecked) {
        await this.termsCheckbox.click();
      }
    }
  }

  /**
   * Go to next wizard step
   */
  async nextStep(): Promise<void> {
    await this.nextButton.first().click();
    await this.waitForLoading();
  }

  /**
   * Go to previous wizard step
   */
  async previousStep(): Promise<void> {
    await this.backButton.first().click();
    await this.waitForLoading();
  }

  /**
   * Submit matchmaking form and join queue
   */
  async submitMatchmaking(): Promise<void> {
    await this.submitButton.click();
    await this.waitForLoading();
  }

  /**
   * Complete full matchmaking wizard
   */
  async completeWizard(data: MatchmakingFormData): Promise<void> {
    await this.waitForWizardLoad();

    // Step 1: Region
    await this.selectRegion(data.region);
    await this.nextStep();

    // Step 2: Game mode
    await this.selectGameMode(data.gameMode);
    await this.nextStep();

    // Step 3: Squad (skip if not provided)
    if (data.squadSize) {
      await this.configureSquad(data.squadSize);
    }
    await this.nextStep();

    // Step 4: Schedule
    await this.configureSchedule(!data.scheduledTime, data.scheduledTime);
    await this.nextStep();

    // Step 5: Prize pool
    if (data.entryFee !== undefined) {
      await this.configurePrizePool(data.entryFee);
    }

    // Submit
    await this.submitMatchmaking();
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoading(): Promise<void> {
    try {
      await this.loadingSpinner.waitFor({ state: 'visible', timeout: 1000 });
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 });
    } catch {
      // Loading might not appear for fast responses
    }
  }

  /**
   * Leave matchmaking queue
   */
  async leaveQueue(): Promise<void> {
    await this.leaveQueueButton.click();
    await this.waitForLoading();
  }

  /**
   * Get queue position
   */
  async getQueuePosition(): Promise<number | null> {
    try {
      const text = await this.queuePosition.textContent();
      const match = text?.match(/\d+/);
      return match ? parseInt(match[0]) : null;
    } catch {
      return null;
    }
  }

  /**
   * Wait for lobby to be created
   */
  async waitForLobby(timeout: number = 60000): Promise<void> {
    await this.lobbyContainer.waitFor({ state: 'visible', timeout });
  }

  /**
   * Mark player as ready
   */
  async setReady(): Promise<void> {
    await this.readyButton.click();
    await this.waitForLoading();
  }

  /**
   * Start match (host only)
   */
  async startMatch(): Promise<void> {
    await this.startMatchButton.click();
    await this.waitForLoading();
  }

  /**
   * Cancel lobby (host only)
   */
  async cancelLobby(): Promise<void> {
    await this.cancelLobbyButton.click();
    await this.waitForLoading();
  }

  /**
   * Get number of players in lobby
   */
  async getPlayerCount(): Promise<number> {
    return await this.playerSlots.locator('[data-filled="true"], .player-joined').count();
  }

  /**
   * Get number of ready players
   */
  async getReadyCount(): Promise<number> {
    return await this.playerSlots.locator('[data-ready="true"], .player-ready').count();
  }

  /**
   * Expect to be in queue
   */
  async expectInQueue(): Promise<void> {
    await expect(this.queueStatus).toBeVisible({ timeout: 10000 });
  }

  /**
   * Expect to be in lobby
   */
  async expectInLobby(): Promise<void> {
    await expect(this.lobbyContainer).toBeVisible({ timeout: 10000 });
  }

  /**
   * Expect error message
   */
  async expectError(message?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  /**
   * Expect success message
   */
  async expectSuccess(message?: string): Promise<void> {
    await expect(this.successMessage).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(this.successMessage).toContainText(message);
    }
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string | null> {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 2000 });
      return await this.errorMessage.textContent();
    } catch {
      return null;
    }
  }
}
