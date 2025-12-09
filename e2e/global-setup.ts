/**
 * Global E2E Test Setup
 * Enforces console error checking across ALL E2E tests
 * 
 * This ensures that React hydration errors, API errors, and runtime
 * exceptions are captured and cause test failures in CI.
 */

import { test as base, expect, ConsoleMessage } from '@playwright/test';

// Patterns for errors that should ALWAYS fail tests
const CRITICAL_ERRORS = [
  /Hydration failed/i,
  /Text content does not match/i,
  /There was an error while hydrating/i,
  /Cannot read properties of (undefined|null)/,
  /TypeError:/,
  /ReferenceError:/,
  /Unhandled Runtime Error/,
  /Application error: a client-side exception has occurred/,
  /ChunkLoadError/,
  /Loading chunk \d+ failed/,
  /each child in a list should have a unique "key" prop/i,
  /Cannot update a component .* while rendering a different component/,
  /Maximum update depth exceeded/,
  /Minified React error/,
  /Invariant Violation/,
  /Warning: Invalid hook call/,
  /Objects are not valid as a React child/,
];

// Patterns to ignore (dev tooling, extensions, etc.)
const IGNORED_PATTERNS = [
  /Download the React DevTools/,
  /Third-party cookie/,
  /net::ERR_BLOCKED_BY_CLIENT/,
  /favicon\.ico/,
  /\[HMR\]/,
  /webpack/i,
  /ResizeObserver loop/,
  /chrome-extension:/,
  /Source map/,
  /ERR_CONNECTION_REFUSED/,
];

function shouldIgnore(text: string): boolean {
  return IGNORED_PATTERNS.some(p => p.test(text));
}

function isCritical(text: string): boolean {
  return CRITICAL_ERRORS.some(p => p.test(text));
}

/**
 * Extended test that automatically tracks console errors
 * and fails on critical errors when running in CI
 */
export const test = base.extend<{
  consoleErrors: string[];
  assertNoConsoleErrors: () => void;
}>({
  consoleErrors: async ({ page }, use) => {
    const errors: string[] = [];
    
    const handleConsole = (msg: ConsoleMessage) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!shouldIgnore(text)) {
          errors.push(text);
          if (isCritical(text)) {
            console.error(`🚨 [CRITICAL E2E ERROR] ${text}`);
          } else {
            console.warn(`⚠️ [E2E Console Error] ${text}`);
          }
        }
      }
    };

    const handlePageError = (error: Error) => {
      const text = `${error.name}: ${error.message}`;
      if (!shouldIgnore(text)) {
        errors.push(text);
        console.error(`🚨 [CRITICAL PAGE ERROR] ${text}`);
      }
    };

    page.on('console', handleConsole);
    page.on('pageerror', handlePageError);

    await use(errors);

    page.off('console', handleConsole);
    page.off('pageerror', handlePageError);
  },

  assertNoConsoleErrors: async ({ consoleErrors }, use) => {
    await use(() => {
      const criticalErrors = consoleErrors.filter(e => isCritical(e));
      
      if (criticalErrors.length > 0) {
        throw new Error(
          `Test detected ${criticalErrors.length} critical console error(s):\n` +
          criticalErrors.map((e, i) => `  ${i + 1}. ${e}`).join('\n')
        );
      }
      
      // In CI with FAIL_ON_CONSOLE_ERROR=true, fail on any error
      if (process.env.CI && process.env.FAIL_ON_CONSOLE_ERROR === 'true') {
        if (consoleErrors.length > 0) {
          throw new Error(
            `Test detected ${consoleErrors.length} console error(s) (strict mode):\n` +
            consoleErrors.map((e, i) => `  ${i + 1}. ${e}`).join('\n')
          );
        }
      }
    });
  },
});

// Re-export expect for convenience
export { expect };

/**
 * Hook to run after each test - reports console errors
 */
test.afterEach(async ({ consoleErrors }, testInfo) => {
  if (consoleErrors.length > 0) {
    // Attach errors to test report
    const errorReport = consoleErrors.map((e, i) => `${i + 1}. ${e}`).join('\n');
    await testInfo.attach('console-errors', {
      body: errorReport,
      contentType: 'text/plain',
    });

    // In CI, fail tests with critical errors
    if (process.env.CI) {
      const criticalErrors = consoleErrors.filter(e => isCritical(e));
      if (criticalErrors.length > 0) {
        testInfo.status = 'failed';
        // Log the error - Playwright will handle the failure
        console.error(`Critical console errors detected:\n${criticalErrors.join('\n')}`);
      }
    }
  }
});
