/**
 * Payment Page Object
 * Follows Page Object Pattern for maintainable and reusable test code
 * Implements DRY and Single Responsibility principles
 */

import { Page, Locator, FrameLocator, expect } from '@playwright/test';

/**
 * Payment status enum for type safety
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

/**
 * Payment provider enum
 */
export enum PaymentProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  CRYPTO = 'crypto',
}

/**
 * Payment form data interface
 */
export interface PaymentFormData {
  amount: number;
  currency?: string;
  provider?: PaymentProvider;
}

/**
 * Stripe card details interface
 */
export interface StripeCardDetails {
  cardNumber: string;
  expiry: string;
  cvc: string;
  zip?: string;
}

/**
 * Page Object for Payment pages
 * Encapsulates all payment-related interactions
 */
export class PaymentPage {
  readonly page: Page;

  // Locators - defined once, used everywhere (DRY)
  readonly amountInput: Locator;
  readonly currencySelect: Locator;
  readonly providerSelect: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly paymentsList: Locator;
  readonly statusBadge: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly loadingSpinner: Locator;

  // Stripe Elements locators
  readonly stripeCardFrame: FrameLocator;
  readonly stripeSubmitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators
    this.amountInput = page.locator('input[name="amount"]');
    this.currencySelect = page.locator('select[name="currency"]');
    this.providerSelect = page.locator('select[name="provider"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.cancelButton = page.locator('button[data-testid="cancel-payment"]');
    this.paymentsList = page.locator('[data-testid="payments-list"]');
    this.statusBadge = page.locator('[data-testid="payment-status"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.successMessage = page.locator('[data-testid="success-message"]');
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    this.stripeCardFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
    this.stripeSubmitButton = page.locator('button[data-testid="stripe-pay"]');
  }

  /**
   * Navigate to wallet page (deposit functionality is within modals)
   */
  async gotoDeposit(): Promise<void> {
    await this.page.goto('/wallet');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000);
  }

  /**
   * Navigate to wallet page (payments history is part of the wallet page)
   */
  async gotoHistory(): Promise<void> {
    await this.page.goto('/wallet');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000);
  }

  /**
   * Navigate to checkout page
   */
  async gotoCheckout(): Promise<void> {
    await this.page.goto('/wallet');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000);
  }

  /**
   * Fill payment form with provided data
   */
  async fillPaymentForm(data: PaymentFormData): Promise<void> {
    await this.amountInput.fill(data.amount.toString());

    if (data.currency) {
      await this.currencySelect.selectOption(data.currency);
    }

    if (data.provider) {
      await this.providerSelect.selectOption(data.provider);
    }
  }

  /**
   * Submit payment form
   */
  async submitPayment(): Promise<void> {
    await this.submitButton.click();
    // Wait for loading to complete
    await this.waitForPaymentProcessing();
  }

  /**
   * Wait for payment processing to complete
   */
  async waitForPaymentProcessing(): Promise<void> {
    // Wait for loading spinner to appear and disappear
    try {
      await this.loadingSpinner.waitFor({ state: 'visible', timeout: 2000 });
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 });
    } catch {
      // Spinner might not appear for fast responses
    }
  }

  /**
   * Fill Stripe card details
   * Note: Stripe Elements are in an iframe
   */
  async fillStripeCard(card: StripeCardDetails): Promise<void> {
    // Wait for Stripe iframe to load
    const cardNumberFrame = this.page.frameLocator('iframe[name*="card-number"]');
    const expiryFrame = this.page.frameLocator('iframe[name*="expiry"]');
    const cvcFrame = this.page.frameLocator('iframe[name*="cvc"]');

    // Fill card number
    await cardNumberFrame.locator('input[name="cardnumber"]').fill(card.cardNumber);

    // Fill expiry
    await expiryFrame.locator('input[name="exp-date"]').fill(card.expiry);

    // Fill CVC
    await cvcFrame.locator('input[name="cvc"]').fill(card.cvc);

    // Fill ZIP if provided
    if (card.zip) {
      const zipFrame = this.page.frameLocator('iframe[name*="postal"]');
      await zipFrame.locator('input[name="postal"]').fill(card.zip);
    }
  }

  /**
   * Complete Stripe payment
   */
  async completeStripePayment(): Promise<void> {
    await this.stripeSubmitButton.click();
    await this.waitForPaymentProcessing();
  }

  /**
   * Cancel payment
   */
  async cancelPayment(): Promise<void> {
    await this.cancelButton.click();
    await this.waitForPaymentProcessing();
  }

  /**
   * Get payment status from UI
   */
  async getPaymentStatus(): Promise<string> {
    await this.statusBadge.waitFor({ state: 'visible' });
    return await this.statusBadge.textContent() || '';
  }

  /**
   * Get error message if present
   */
  async getErrorMessage(): Promise<string | null> {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 2000 });
      return await this.errorMessage.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Get success message if present
   */
  async getSuccessMessage(): Promise<string | null> {
    try {
      await this.successMessage.waitFor({ state: 'visible', timeout: 2000 });
      return await this.successMessage.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Check if payment was successful
   */
  async expectPaymentSuccess(): Promise<void> {
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
  }

  /**
   * Check if payment failed
   */
  async expectPaymentFailure(): Promise<void> {
    await expect(this.errorMessage).toBeVisible({ timeout: 10000 });
  }

  /**
   * Get all payments from list
   */
  async getPaymentsCount(): Promise<number> {
    const items = this.paymentsList.locator('[data-testid="payment-item"]');
    return await items.count();
  }

  /**
   * Get payment by index from list
   */
  getPaymentByIndex(index: number): Locator {
    return this.paymentsList.locator('[data-testid="payment-item"]').nth(index);
  }

  /**
   * Click on a payment to view details
   */
  async viewPaymentDetails(index: number): Promise<void> {
    const payment = this.getPaymentByIndex(index);
    await payment.click();
    await this.page.waitForLoadState('networkidle');
  }
}

/**
 * Test card numbers for Stripe testing
 * Using Stripe test cards - https://stripe.com/docs/testing
 */
export const TestCards = {
  SUCCESS: {
    cardNumber: '4242424242424242',
    expiry: '12/34',
    cvc: '123',
    zip: '12345',
  },
  DECLINED: {
    cardNumber: '4000000000000002',
    expiry: '12/34',
    cvc: '123',
    zip: '12345',
  },
  INSUFFICIENT_FUNDS: {
    cardNumber: '4000000000009995',
    expiry: '12/34',
    cvc: '123',
    zip: '12345',
  },
  REQUIRES_AUTH: {
    cardNumber: '4000002500003155',
    expiry: '12/34',
    cvc: '123',
    zip: '12345',
  },
} as const;
