/**
 * Console Errors Fixture for E2E Tests
 * Captures and reports browser console errors during tests
 * 
 * This fixture ensures that React errors, API errors, and runtime exceptions
 * are caught during E2E tests - the same errors you'd see in the browser console.
 */

import { test as base, Page, ConsoleMessage } from '@playwright/test';

// Error patterns to ignore (third-party scripts, expected warnings, etc.)
const IGNORED_ERROR_PATTERNS = [
  /Download the React DevTools/,
  /Third-party cookie will be blocked/,
  /net::ERR_BLOCKED_BY_CLIENT/, // Ad blockers
  /favicon\.ico.*404/,
  /\[HMR\]/, // Hot Module Replacement messages in dev
  /webpack/i, // Webpack dev messages
];

// Critical error patterns that should ALWAYS fail the test
const CRITICAL_ERROR_PATTERNS = [
  /Hydration failed/i,
  /Text content does not match/i,
  /There was an error while hydrating/i,
  /Cannot read properties of (undefined|null)/,
  /is not a function/,
  /is not defined/,
  /Unhandled Runtime Error/,
  /Application error: a client-side exception has occurred/,
  /ChunkLoadError/,
  /Loading chunk \d+ failed/,
  /each child in a list should have a unique "key" prop/i,
  /Cannot update a component .* while rendering a different component/,
  /Maximum update depth exceeded/,
  /Minified React error/,
];

export interface ConsoleError {
  type: 'error' | 'warning' | 'pageerror';
  text: string;
  location?: string;
  timestamp: number;
  isCritical: boolean;
}

export interface ConsoleErrorsContext {
  page: Page;
  errors: ConsoleError[];
  warnings: ConsoleError[];
  getErrorSummary: () => string;
  hasErrors: () => boolean;
  hasCriticalErrors: () => boolean;
  clearErrors: () => void;
}

function shouldIgnoreError(text: string): boolean {
  return IGNORED_ERROR_PATTERNS.some(pattern => pattern.test(text));
}

function isCriticalError(text: string): boolean {
  return CRITICAL_ERROR_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Extended test with console error tracking
 * Use this for all E2E tests to catch runtime errors
 */
export const testWithConsoleErrors = base.extend<{ consoleErrors: ConsoleErrorsContext }>({
  consoleErrors: async ({ page }, use) => {
    const errors: ConsoleError[] = [];
    const warnings: ConsoleError[] = [];

    // Capture console messages
    const handleConsoleMessage = (msg: ConsoleMessage) => {
      const text = msg.text();
      const type = msg.type();
      
      if (shouldIgnoreError(text)) {
        return;
      }

      const error: ConsoleError = {
        type: type === 'error' ? 'error' : 'warning',
        text,
        location: msg.location()?.url,
        timestamp: Date.now(),
        isCritical: isCriticalError(text),
      };

      if (type === 'error') {
        errors.push(error);
        console.error(`[E2E Console Error] ${text}`);
      } else if (type === 'warning' && text.toLowerCase().includes('error')) {
        warnings.push(error);
        console.warn(`[E2E Console Warning] ${text}`);
      }
    };

    // Capture page errors (uncaught exceptions)
    const handlePageError = (error: Error) => {
      const text = error.message;
      
      if (shouldIgnoreError(text)) {
        return;
      }

      errors.push({
        type: 'pageerror',
        text: `${error.name}: ${error.message}\n${error.stack || ''}`,
        timestamp: Date.now(),
        isCritical: true, // Page errors are always critical
      });
      console.error(`[E2E Page Error] ${error.message}`);
    };

    page.on('console', handleConsoleMessage);
    page.on('pageerror', handlePageError);

    const context: ConsoleErrorsContext = {
      page,
      errors,
      warnings,
      getErrorSummary: () => {
        if (errors.length === 0) {
          return 'No console errors detected';
        }
        
        const critical = errors.filter(e => e.isCritical);
        const nonCritical = errors.filter(e => !e.isCritical);
        
        let summary = `\n╔══════════════════════════════════════════════════════════════╗\n`;
        summary += `║  CONSOLE ERRORS DETECTED: ${errors.length} total                      ║\n`;
        summary += `╠══════════════════════════════════════════════════════════════╣\n`;
        
        if (critical.length > 0) {
          summary += `║  🚨 CRITICAL ERRORS: ${critical.length}                                  ║\n`;
          critical.forEach((err, i) => {
            summary += `║  ${i + 1}. ${err.text.substring(0, 55)}...${' '.repeat(Math.max(0, 3))}║\n`;
          });
        }
        
        if (nonCritical.length > 0) {
          summary += `║  ⚠️  OTHER ERRORS: ${nonCritical.length}                                    ║\n`;
          nonCritical.forEach((err, i) => {
            summary += `║  ${i + 1}. ${err.text.substring(0, 55)}...${' '.repeat(Math.max(0, 3))}║\n`;
          });
        }
        
        summary += `╚══════════════════════════════════════════════════════════════╝\n`;
        
        return summary;
      },
      hasErrors: () => errors.length > 0,
      hasCriticalErrors: () => errors.some(e => e.isCritical),
      clearErrors: () => {
        errors.length = 0;
        warnings.length = 0;
      },
    };

    await use(context);

    // Cleanup listeners
    page.off('console', handleConsoleMessage);
    page.off('pageerror', handlePageError);

    // After test: Report if there were errors
    if (errors.length > 0) {
      console.log(context.getErrorSummary());
      
      // In CI, fail the test if critical errors were found
      if (process.env.CI && context.hasCriticalErrors()) {
        throw new Error(
          `Test completed but found ${errors.filter(e => e.isCritical).length} critical console errors:\n` +
          errors.filter(e => e.isCritical).map(e => `  - ${e.text}`).join('\n')
        );
      }
    }
  },
});

/**
 * Strict console errors test - fails on ANY console error
 * Use this for critical user flows (checkout, login, etc.)
 */
export const strictConsoleTest = base.extend<{ strictPage: Page }>({
  strictPage: async ({ page }, use) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error' && !shouldIgnoreError(msg.text())) {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      if (!shouldIgnoreError(error.message)) {
        errors.push(`PageError: ${error.message}`);
      }
    });

    await use(page);

    // Fail test if any errors occurred
    if (errors.length > 0) {
      throw new Error(
        `Console errors detected during test:\n${errors.map(e => `  ❌ ${e}`).join('\n')}`
      );
    }
  },
});

export { base as test };
