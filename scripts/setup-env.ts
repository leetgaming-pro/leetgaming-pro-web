#!/usr/bin/env npx ts-node

/**
 * LeetGaming.PRO - Interactive Environment Setup
 *
 * This script guides you through setting up your local environment
 * by collecting required credentials and generating .env.local
 *
 * Usage: npx ts-node scripts/setup-env.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as crypto from 'crypto';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function printHeader(): void {
  console.log('\n');
  console.log(colorize('╔══════════════════════════════════════════════════════════════╗', 'cyan'));
  console.log(colorize('║                                                              ║', 'cyan'));
  console.log(colorize('║   ', 'cyan') + colorize('LeetGaming.PRO', 'bright') + colorize(' - Interactive Environment Setup          ║', 'cyan'));
  console.log(colorize('║                                                              ║', 'cyan'));
  console.log(colorize('╚══════════════════════════════════════════════════════════════╝', 'cyan'));
  console.log('\n');
}

function printSection(title: string): void {
  console.log('\n' + colorize(`━━━ ${title} ━━━`, 'yellow') + '\n');
}

function printInfo(text: string): void {
  console.log(colorize('ℹ ', 'blue') + text);
}

function printSuccess(text: string): void {
  console.log(colorize('✓ ', 'green') + text);
}

function printWarning(text: string): void {
  console.log(colorize('⚠ ', 'yellow') + text);
}

function printLink(text: string, url: string): void {
  console.log(colorize('  → ', 'dim') + text + ': ' + colorize(url, 'cyan'));
}

interface EnvConfig {
  // Application
  NEXT_PUBLIC_APP_URL: string;
  LEET_GAMING_PRO_URL: string;

  // Backend
  REPLAY_API_URL: string;
  NEXT_PUBLIC_REPLAY_API_URL: string;
  REPLAY_API_REGION: string;

  // Auth
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;

  // Steam
  STEAM_SECRET: string;
  STEAM_API_KEY: string;
  STEAM_CALLBACK_URL: string;
  STEAM_VHASH_SOURCE: string;

  // Google
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;

  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  NEXT_PUBLIC_STRIPE_PRO_PRICE_ID: string;
  NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID: string;

  // Feature flags
  NEXT_PUBLIC_ENABLE_WALLET: string;
  NEXT_PUBLIC_ENABLE_PRIZE_POOLS: string;
  NEXT_PUBLIC_ENABLE_TOURNAMENTS: string;
  NEXT_PUBLIC_ENABLE_AI_MATCHMAKING: string;
  NEXT_PUBLIC_ENABLE_CRYPTO: string;
  NEXT_PUBLIC_ENABLE_PAYPAL: string;

  // Development
  NODE_ENV: string;
  NEXT_TELEMETRY_DISABLED: string;
  LOG_LEVEL: string;
}

function generateSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64');
}

async function askYesNo(question: string, defaultValue: boolean = true): Promise<boolean> {
  const defaultHint = defaultValue ? '[Y/n]' : '[y/N]';
  const answer = await prompt(`${question} ${colorize(defaultHint, 'dim')}: `);

  if (answer === '') return defaultValue;
  return answer.toLowerCase().startsWith('y');
}

async function askWithDefault(question: string, defaultValue: string): Promise<string> {
  const answer = await prompt(`${question} ${colorize(`[${defaultValue}]`, 'dim')}: `);
  return answer || defaultValue;
}

async function askRequired(question: string, hint?: string): Promise<string> {
  let answer = '';
  while (!answer) {
    if (hint) {
      console.log(colorize(`  ${hint}`, 'dim'));
    }
    answer = await prompt(`${question}: `);
    if (!answer) {
      printWarning('This field is required.');
    }
  }
  return answer;
}

async function askOptional(question: string, hint?: string): Promise<string> {
  if (hint) {
    console.log(colorize(`  ${hint}`, 'dim'));
  }
  return await prompt(`${question} ${colorize('[optional]', 'dim')}: `);
}

async function main(): Promise<void> {
  printHeader();

  const envPath = path.join(process.cwd(), '.env.local');

  // Check for existing .env.local
  if (fs.existsSync(envPath)) {
    printWarning('.env.local already exists!');
    const overwrite = await askYesNo('Do you want to overwrite it?', false);
    if (!overwrite) {
      console.log('\nSetup cancelled. Your existing .env.local was not modified.');
      rl.close();
      return;
    }
    console.log('');
  }

  printInfo('This script will guide you through setting up your environment.');
  printInfo('Press Enter to use default values shown in brackets.\n');

  const config: Partial<EnvConfig> = {};

  // ═══════════════════════════════════════════════════════════════
  // APPLICATION URLS
  // ═══════════════════════════════════════════════════════════════
  printSection('Application URLs');

  config.NEXT_PUBLIC_APP_URL = await askWithDefault(
    'App URL (no trailing slash)',
    'http://localhost:3030'
  );
  config.LEET_GAMING_PRO_URL = config.NEXT_PUBLIC_APP_URL;
  config.NEXTAUTH_URL = config.NEXT_PUBLIC_APP_URL;

  // ═══════════════════════════════════════════════════════════════
  // BACKEND API
  // ═══════════════════════════════════════════════════════════════
  printSection('Backend API Configuration');

  printInfo('The replay-api backend provides matchmaking and game services.');
  printLink('Local dev', 'http://localhost:8080 or http://localhost:30800');
  printLink('Production', 'https://api.leetgaming.pro');
  console.log('');

  config.REPLAY_API_URL = await askWithDefault(
    'Backend API URL',
    'http://localhost:30800'
  );
  config.NEXT_PUBLIC_REPLAY_API_URL = config.REPLAY_API_URL;

  config.REPLAY_API_REGION = await askWithDefault(
    'Region (local, na-east, na-west, eu-west, eu-east, sa, asia, oce)',
    'local'
  );

  // ═══════════════════════════════════════════════════════════════
  // AUTHENTICATION
  // ═══════════════════════════════════════════════════════════════
  printSection('Authentication (NextAuth.js)');

  const generatedSecret = generateSecret();
  printInfo('A random secret has been generated for you.');
  printWarning('This secret MUST match your backend configuration.');
  console.log('');

  const useGeneratedSecret = await askYesNo('Use the generated secret?', true);
  if (useGeneratedSecret) {
    config.NEXTAUTH_SECRET = generatedSecret;
    printSuccess(`Secret: ${generatedSecret.substring(0, 20)}...`);
  } else {
    config.NEXTAUTH_SECRET = await askRequired('Enter your NEXTAUTH_SECRET');
  }

  // ═══════════════════════════════════════════════════════════════
  // STEAM OAUTH
  // ═══════════════════════════════════════════════════════════════
  printSection('Steam OAuth');

  printLink('Get your Steam API key', 'https://steamcommunity.com/dev/apikey');
  console.log('');

  const setupSteam = await askYesNo('Configure Steam authentication?', true);

  if (setupSteam) {
    config.STEAM_API_KEY = await askRequired('Steam API Key');
    config.STEAM_SECRET = config.STEAM_API_KEY; // Usually the same
    config.STEAM_CALLBACK_URL = `${config.NEXT_PUBLIC_APP_URL}/api/auth/callback/steam`;

    const generatedVhash = generateSecret(16);
    printInfo('A verification hash salt has been generated.');
    printWarning('This MUST match your backend STEAM_VHASH_SOURCE.');
    console.log('');

    const useGeneratedVhash = await askYesNo('Use the generated salt?', true);
    if (useGeneratedVhash) {
      config.STEAM_VHASH_SOURCE = generatedVhash;
    } else {
      config.STEAM_VHASH_SOURCE = await askRequired('Enter your STEAM_VHASH_SOURCE');
    }
  } else {
    config.STEAM_API_KEY = '';
    config.STEAM_SECRET = '';
    config.STEAM_CALLBACK_URL = '';
    config.STEAM_VHASH_SOURCE = '';
  }

  // ═══════════════════════════════════════════════════════════════
  // GOOGLE OAUTH
  // ═══════════════════════════════════════════════════════════════
  printSection('Google OAuth');

  printLink('Get Google credentials', 'https://console.cloud.google.com/apis/credentials');
  printInfo('Add authorized redirect URI:');
  printInfo(`  ${config.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`);
  console.log('');

  const setupGoogle = await askYesNo('Configure Google authentication?', true);

  if (setupGoogle) {
    config.GOOGLE_CLIENT_ID = await askRequired('Google Client ID');
    config.GOOGLE_CLIENT_SECRET = await askRequired('Google Client Secret');
  } else {
    config.GOOGLE_CLIENT_ID = '';
    config.GOOGLE_CLIENT_SECRET = '';
  }

  // ═══════════════════════════════════════════════════════════════
  // STRIPE PAYMENTS
  // ═══════════════════════════════════════════════════════════════
  printSection('Stripe Payments');

  printLink('Get Stripe API keys', 'https://dashboard.stripe.com/test/apikeys');
  printInfo('Use test keys (pk_test_, sk_test_) for development');
  console.log('');

  const setupStripe = await askYesNo('Configure Stripe payments?', true);

  if (setupStripe) {
    config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = await askRequired(
      'Stripe Publishable Key (pk_test_...)'
    );
    config.STRIPE_SECRET_KEY = await askRequired(
      'Stripe Secret Key (sk_test_...)'
    );

    printInfo('Set up webhook at: https://dashboard.stripe.com/test/webhooks');
    printInfo(`Endpoint: ${config.NEXT_PUBLIC_APP_URL}/api/webhooks/stripe`);
    console.log('');

    config.STRIPE_WEBHOOK_SECRET = await askOptional(
      'Stripe Webhook Secret (whsec_...)'
    ) || 'whsec_your_stripe_webhook_secret';

    printInfo('Create price IDs in Stripe Dashboard > Products');
    console.log('');

    config.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID = await askOptional(
      'Pro subscription Price ID'
    ) || 'price_your_pro_price_id';
    config.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID = await askOptional(
      'Team subscription Price ID'
    ) || 'price_your_team_price_id';
  } else {
    config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = '';
    config.STRIPE_SECRET_KEY = '';
    config.STRIPE_WEBHOOK_SECRET = '';
    config.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID = '';
    config.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID = '';
  }

  // ═══════════════════════════════════════════════════════════════
  // FEATURE FLAGS
  // ═══════════════════════════════════════════════════════════════
  printSection('Feature Flags');

  printInfo('Enable or disable platform features:');
  console.log('');

  config.NEXT_PUBLIC_ENABLE_WALLET = (await askYesNo('Enable Wallet?', true)).toString();
  config.NEXT_PUBLIC_ENABLE_PRIZE_POOLS = (await askYesNo('Enable Prize Pools?', true)).toString();
  config.NEXT_PUBLIC_ENABLE_TOURNAMENTS = (await askYesNo('Enable Tournaments?', true)).toString();
  config.NEXT_PUBLIC_ENABLE_AI_MATCHMAKING = (await askYesNo('Enable AI Matchmaking?', true)).toString();
  config.NEXT_PUBLIC_ENABLE_CRYPTO = (await askYesNo('Enable Crypto Payments?', false)).toString();
  config.NEXT_PUBLIC_ENABLE_PAYPAL = (await askYesNo('Enable PayPal?', false)).toString();

  // ═══════════════════════════════════════════════════════════════
  // DEVELOPMENT SETTINGS
  // ═══════════════════════════════════════════════════════════════
  printSection('Development Settings');

  config.NODE_ENV = await askWithDefault('Node environment', 'development');
  config.LOG_LEVEL = await askWithDefault('Log level (debug, info, warn, error)', 'info');
  config.NEXT_TELEMETRY_DISABLED = '1';

  // ═══════════════════════════════════════════════════════════════
  // GENERATE FILE
  // ═══════════════════════════════════════════════════════════════
  printSection('Generating .env.local');

  const envContent = `# ===========================================
# LEETGAMING.PRO - Generated Environment File
# ===========================================
# Generated: ${new Date().toISOString()}
#
# This file was generated by: npx ts-node scripts/setup-env.ts
# For manual configuration, see: .env.example
#

# ============================================
# Application URLs
# ============================================
NEXT_PUBLIC_APP_URL=${config.NEXT_PUBLIC_APP_URL}
LEET_GAMING_PRO_URL=${config.LEET_GAMING_PRO_URL}
NEXTAUTH_URL=${config.NEXTAUTH_URL}

# ============================================
# Backend API (replay-api)
# ============================================
REPLAY_API_URL=${config.REPLAY_API_URL}
NEXT_PUBLIC_REPLAY_API_URL=${config.NEXT_PUBLIC_REPLAY_API_URL}
REPLAY_API_REGION=${config.REPLAY_API_REGION}

# ============================================
# Authentication (NextAuth.js)
# ============================================
NEXTAUTH_SECRET=${config.NEXTAUTH_SECRET}

# ============================================
# Steam OAuth
# ============================================
STEAM_SECRET=${config.STEAM_SECRET}
STEAM_API_KEY=${config.STEAM_API_KEY}
STEAM_CALLBACK_URL=${config.STEAM_CALLBACK_URL}
STEAM_VHASH_SOURCE=${config.STEAM_VHASH_SOURCE}

# ============================================
# Google OAuth
# ============================================
GOOGLE_CLIENT_ID=${config.GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${config.GOOGLE_CLIENT_SECRET}

# ============================================
# Stripe Payments
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
STRIPE_SECRET_KEY=${config.STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${config.STRIPE_WEBHOOK_SECRET}
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=${config.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID}
NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID=${config.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID}

# ============================================
# Feature Flags
# ============================================
NEXT_PUBLIC_ENABLE_WALLET=${config.NEXT_PUBLIC_ENABLE_WALLET}
NEXT_PUBLIC_ENABLE_PRIZE_POOLS=${config.NEXT_PUBLIC_ENABLE_PRIZE_POOLS}
NEXT_PUBLIC_ENABLE_TOURNAMENTS=${config.NEXT_PUBLIC_ENABLE_TOURNAMENTS}
NEXT_PUBLIC_ENABLE_AI_MATCHMAKING=${config.NEXT_PUBLIC_ENABLE_AI_MATCHMAKING}
NEXT_PUBLIC_ENABLE_CRYPTO=${config.NEXT_PUBLIC_ENABLE_CRYPTO}
NEXT_PUBLIC_ENABLE_PAYPAL=${config.NEXT_PUBLIC_ENABLE_PAYPAL}

# ============================================
# Development & Build
# ============================================
NODE_ENV=${config.NODE_ENV}
NEXT_TELEMETRY_DISABLED=${config.NEXT_TELEMETRY_DISABLED}
LOG_LEVEL=${config.LOG_LEVEL}

# ============================================
# Optional: Add these manually if needed
# ============================================
# NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
# SENTRY_DSN=your_sentry_dsn_here
# STRAPI_URL=http://localhost:1337
# STRAPI_API_TOKEN=
`;

  fs.writeFileSync(envPath, envContent);

  printSuccess('.env.local has been created successfully!');
  console.log('');

  // ═══════════════════════════════════════════════════════════════
  // NEXT STEPS
  // ═══════════════════════════════════════════════════════════════
  printSection('Next Steps');

  console.log('1. Review your .env.local file and update any placeholder values');
  console.log('2. Ensure your backend (replay-api) uses matching secrets:');
  console.log(`   - NEXTAUTH_SECRET: ${config.NEXTAUTH_SECRET?.substring(0, 20)}...`);
  if (config.STEAM_VHASH_SOURCE) {
    console.log(`   - STEAM_VHASH_SOURCE: ${config.STEAM_VHASH_SOURCE.substring(0, 10)}...`);
  }
  console.log('3. Start the development server:');
  console.log(colorize('   npm run dev', 'green'));
  console.log('');

  printInfo('For more details, see: /docs/SETUP.md');
  printInfo('Need help? Visit: https://discord.gg/leetgaming');
  console.log('\n');

  rl.close();
}

main().catch((error) => {
  console.error('Setup failed:', error);
  rl.close();
  process.exit(1);
});
