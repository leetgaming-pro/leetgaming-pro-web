/**
 * Security validation utilities for financial-grade API routes
 *
 * Provides:
 * - Amount validation (bounds, precision, type safety)
 * - CSRF token validation for mutation endpoints
 * - Rate limiting (in-memory, suitable for single-instance deployments)
 * - Input sanitization helpers
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// ─── Amount Validation ──────────────────────────────────────────────────

/**
 * Validate a financial amount for safety
 * Catches: NaN, Infinity, negative, non-finite, excessive precision
 */
export function validateAmount(
  amount: unknown,
  opts: { min?: number; max?: number; fieldName?: string } = {},
): { valid: true; value: number } | { valid: false; error: string } {
  const { min = 0.01, max = 10000, fieldName = "amount" } = opts;

  if (amount === undefined || amount === null) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (typeof amount !== "number") {
    return { valid: false, error: `${fieldName} must be a number` };
  }

  if (!Number.isFinite(amount)) {
    return { valid: false, error: `${fieldName} must be a finite number` };
  }

  if (amount < min) {
    return { valid: false, error: `${fieldName} must be at least $${min}` };
  }

  if (amount > max) {
    return {
      valid: false,
      error: `${fieldName} cannot exceed $${max.toLocaleString()}`,
    };
  }

  // Check for excessive decimal precision (max 2 decimal places for USD)
  const decimals = amount.toString().split(".")[1];
  if (decimals && decimals.length > 2) {
    return {
      valid: false,
      error: `${fieldName} cannot have more than 2 decimal places`,
    };
  }

  return { valid: true, value: amount };
}

// ─── CSRF Validation ────────────────────────────────────────────────────

const CSRF_TOKEN_COOKIE = "csrf_token";

/**
 * Validate CSRF token using double-submit cookie pattern
 * The client must send the CSRF token from the cookie as an X-CSRF-Token header
 */
export function validateCSRFToken(request: NextRequest): boolean {
  const cookieStore = cookies();
  const storedToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value;
  const headerToken = request.headers.get("X-CSRF-Token");

  // Both must exist and match
  return !!storedToken && !!headerToken && storedToken === headerToken;
}

/**
 * Middleware wrapper: validates CSRF and returns 403 if invalid
 * Returns null if valid, or a NextResponse error if invalid
 */
export function requireCSRF(request: NextRequest): NextResponse | null {
  if (!validateCSRFToken(request)) {
    return NextResponse.json(
      { success: false, error: "Invalid or missing CSRF token" },
      { status: 403 },
    );
  }
  return null;
}

// ─── Rate Limiting ──────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/** In-memory rate limit store — keyed by identifier (email/IP) */
const rateLimitStore = new Map<string, RateLimitEntry>();

/** Cleanup stale entries every 5 minutes */
setInterval(
  () => {
    const now = Date.now();
    rateLimitStore.forEach((entry, key) => {
      if (entry.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    });
  },
  5 * 60 * 1000,
).unref?.();

/**
 * Check rate limit for an identifier
 * @returns null if allowed, NextResponse 429 if rate limited
 */
export function checkRateLimit(
  identifier: string,
  opts: {
    /** Maximum requests allowed in the window */
    maxRequests?: number;
    /** Window duration in milliseconds */
    windowMs?: number;
    /** Category for the rate limit (e.g., 'wallet-deposit') */
    category?: string;
  } = {},
): NextResponse | null {
  const { maxRequests = 10, windowMs = 60 * 1000, category = "default" } = opts;
  const key = `${category}:${identifier}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    // New window
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please try again later.",
        retry_after: retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(entry.resetAt / 1000).toString(),
        },
      },
    );
  }

  entry.count++;
  return null;
}

// ─── Preconfigured Rate Limits ──────────────────────────────────────────

/** Rate limits for financial operations */
export const RATE_LIMITS = {
  /** Deposit: 5 requests per minute */
  deposit: { maxRequests: 5, windowMs: 60 * 1000, category: "wallet-deposit" },
  /** Withdraw: 3 requests per minute */
  withdraw: {
    maxRequests: 3,
    windowMs: 60 * 1000,
    category: "wallet-withdraw",
  },
  /** Payment: 5 requests per minute */
  payment: { maxRequests: 5, windowMs: 60 * 1000, category: "payment" },
  /** Prize: 10 requests per minute */
  prize: { maxRequests: 10, windowMs: 60 * 1000, category: "wallet-prize" },
  /** Entry fee: 10 requests per minute */
  entryFee: {
    maxRequests: 10,
    windowMs: 60 * 1000,
    category: "wallet-entry-fee",
  },
  /** Refund: 3 requests per minute */
  refund: { maxRequests: 3, windowMs: 60 * 1000, category: "payment-refund" },
  /** Auth: 10 requests per minute */
  auth: { maxRequests: 10, windowMs: 60 * 1000, category: "auth" },
} as const;
