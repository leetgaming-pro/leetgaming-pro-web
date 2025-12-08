/**
 * Sentry Client Configuration
 * This file configures the initialization of Sentry on the client.
 * The config you add here will be used whenever a users loads a page in their browser.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Only enable in production
  enabled: process.env.NODE_ENV === 'production' && !!SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Replay configuration
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Environment
  environment: process.env.NODE_ENV,

  // Release
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development',

  // Tags
  initialScope: {
    tags: {
      platform: 'web',
      product: 'leetgaming-pro',
    },
  },

  // Filter out known errors that are not actionable
  beforeSend(event, hint) {
    // Filter out network errors
    const error = hint.originalException as Error;
    if (error?.message?.includes('Failed to fetch')) {
      return null;
    }
    
    // Filter out extension errors
    if (error?.stack?.includes('chrome-extension://')) {
      return null;
    }

    return event;
  },

  // Ignore specific error types
  ignoreErrors: [
    // Random plugins/extensions
    'top.GLOBALS',
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'http://tt.teletrax.tv',
    'jigsaw is not defined',
    'ComboSelect',
    'http://loading.retry.wid498.com/',
    'atomicFindClose',
    // Facebook borance errors
    'fb_xd_fragment',
    // Chrome browser errors
    'ResizeObserver loop completed with undelivered notifications',
    // NextAuth errors that are expected
    'NEXT_REDIRECT',
  ],

  // Deny URLs that we don't want to track
  denyUrls: [
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    // Firefox extensions
    /^resource:\/\//i,
    /^moz-extension:\/\//i,
    // Safari extensions
    /^safari-extension:\/\//i,
    // Common ad/analytics scripts
    /googlesyndication\.com/i,
    /google-analytics\.com/i,
    /googletagmanager\.com/i,
  ],
});

