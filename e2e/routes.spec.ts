/**
 * Route Verification E2E Tests
 * 
 * These tests verify that all routes in the application are accessible
 * and don't return 404 errors. This is critical for catching broken links
 * during development.
 */

import { test, expect } from '@playwright/test';

// All public routes that should be accessible without authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/legal/terms',
  '/legal/privacy',
  '/legal/cookies',
  '/service-status',
  '/leaderboards',
  '/tournaments',
  '/ranked',
  '/matches',
  '/teams',
  '/replays',
  '/highlights',
  '/upload',
];

// Legacy routes that should redirect (not 404)
const LEGACY_REDIRECT_ROUTES = [
  { path: '/cloud/upload', redirectsTo: '/upload' },
  { path: '/cloud/replays', redirectsTo: '/replays' },
  { path: '/cloud/highlights', redirectsTo: '/highlights' },
];

// Routes that require authentication but should load the page (redirect to login or show auth prompt)
const AUTH_REQUIRED_ROUTES = [
  '/dashboard',
  '/settings',
  '/wallet',
  '/matchmaking',
];

test.describe('Public Routes', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} should be accessible`, async ({ page }) => {
      const response = await page.goto(route);
      
      // Should not be a 404
      expect(response?.status()).not.toBe(404);
      
      // Should not be a 500
      expect(response?.status()).toBeLessThan(500);
      
      // Wait for page to stabilize
      await page.waitForLoadState('domcontentloaded');
      
      // Should have some content
      const body = await page.locator('body').textContent();
      expect(body?.length).toBeGreaterThan(0);
    });
  }
});

test.describe('Legacy Redirect Routes', () => {
  for (const { path, redirectsTo } of LEGACY_REDIRECT_ROUTES) {
    test(`${path} should redirect to ${redirectsTo}`, async ({ page }) => {
      await page.goto(path);
      
      // Wait for redirect
      await page.waitForTimeout(1000);
      await page.waitForLoadState('domcontentloaded');
      
      // Should have been redirected
      expect(page.url()).toContain(redirectsTo);
    });
  }
});

test.describe('Auth-Required Routes', () => {
  for (const route of AUTH_REQUIRED_ROUTES) {
    test(`${route} should load or redirect (not 404)`, async ({ page }) => {
      const response = await page.goto(route);
      
      // Should not be a 404
      expect(response?.status()).not.toBe(404);
      
      // Should not be a 500
      expect(response?.status()).toBeLessThan(500);
      
      await page.waitForLoadState('domcontentloaded');
    });
  }
});

test.describe('Footer Links Verification', () => {
  test('all footer links should resolve without 404', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get all footer links
    const footerLinks = await page.locator('footer a[href^="/"]').all();
    const hrefs = new Set<string>();
    
    for (const link of footerLinks) {
      const href = await link.getAttribute('href');
      if (href && href.startsWith('/')) {
        hrefs.add(href);
      }
    }
    
    // Verify each footer link
    for (const href of Array.from(hrefs)) {
      const response = await page.goto(href);
      expect(response?.status(), `Footer link ${href} returned 404`).not.toBe(404);
    }
  });
});

test.describe('Navigation Links Verification', () => {
  test('sidebar navigation links should resolve without 404', async ({ page }) => {
    // Go to a page that shows the sidebar
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    
    // Get all navigation links from sidebar
    const navLinks = await page.locator('nav a[href^="/"], aside a[href^="/"]').all();
    const hrefs = new Set<string>();
    
    for (const link of navLinks) {
      const href = await link.getAttribute('href');
      if (href && href.startsWith('/') && !href.includes('[')) {
        hrefs.add(href);
      }
    }
    
    // Verify each nav link
    for (const href of Array.from(hrefs)) {
      const response = await page.goto(href);
      expect(response?.status(), `Nav link ${href} returned 404`).not.toBe(404);
    }
  });
});

test.describe('Matchmaking Routes', () => {
  test('/matchmaking should load matchmaking queue interface', async ({ page }) => {
    const response = await page.goto('/matchmaking');
    
    expect(response?.status()).not.toBe(404);
    await page.waitForLoadState('domcontentloaded');
    
    // Should show matchmaking interface or login prompt
    const hasMatchmakingContent = await page.locator('text=/match|queue|find/i').first().isVisible().catch(() => false);
    const hasLoginPrompt = await page.locator('text=/login|sign in/i').first().isVisible().catch(() => false);
    
    expect(hasMatchmakingContent || hasLoginPrompt).toBeTruthy();
  });
  
  test('/ranked should load ranked matches interface', async ({ page }) => {
    const response = await page.goto('/ranked');
    
    expect(response?.status()).not.toBe(404);
    await page.waitForLoadState('domcontentloaded');
    
    // Should show ranked matches or related content
    const body = await page.locator('body').textContent();
    expect(body?.toLowerCase()).toMatch(/ranked|match|leaderboard|competition/i);
  });
});

test.describe('API Route Prefetch Verification', () => {
  test('should not have 404 errors when prefetching links on homepage', async ({ page }) => {
    const failedRequests: string[] = [];
    
    // Listen for failed requests
    page.on('response', (response) => {
      if (response.status() === 404 && response.url().includes(page.url().split('/')[2])) {
        failedRequests.push(response.url());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Scroll down to trigger any lazy-loaded prefetches
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    
    // Filter out expected 404s (external resources, API calls without auth, etc.)
    const unexpectedFailures = failedRequests.filter(url => 
      !url.includes('/api/') && // API calls may 401/404 without auth
      !url.includes('_next/static') // Build artifacts
    );
    
    expect(unexpectedFailures, `Unexpected 404s: ${unexpectedFailures.join(', ')}`).toHaveLength(0);
  });
});

test.describe('Console Error Free Routes', () => {
  const criticalRoutes = ['/', '/ranked', '/tournaments', '/leaderboards', '/replays'];
  
  for (const route of criticalRoutes) {
    test(`${route} should load without console errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Filter out expected errors
          if (!text.includes('favicon') && !text.includes('analytics')) {
            consoleErrors.push(text);
          }
        }
      });
      
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      // Filter for critical errors only
      const criticalErrors = consoleErrors.filter(e =>
        e.includes('TypeError') ||
        e.includes('ReferenceError') ||
        e.includes('Uncaught') ||
        e.includes('Unhandled')
      );
      
      expect(criticalErrors, `Console errors on ${route}: ${criticalErrors.join('; ')}`).toHaveLength(0);
    });
  }
});
