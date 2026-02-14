#!/usr/bin/env node

/**
 * Simple validation script to check if match/replay/highlights pages load correctly
 * and display professional esports branding elements
 */

const puppeteer = require("playwright");

async function validatePage(url, expectedElements) {
  console.log(`\n🔍 Validating ${url}...`);

  const browser = await puppeteer.chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);

    const results = {};

    for (const [name, selector] of Object.entries(expectedElements)) {
      try {
        const element = await page.$(selector);
        results[name] = element !== null;
        console.log(`  ${results[name] ? "✅" : "❌"} ${name}: ${selector}`);
      } catch (error) {
        results[name] = false;
        console.log(`  ❌ ${name}: ${selector} (error: ${error.message})`);
      }
    }

    await browser.close();
    return results;
  } catch (error) {
    console.log(`  ❌ Failed to load page: ${error.message}`);
    await browser.close();
    return { error: error.message };
  }
}

async function main() {
  console.log(
    "🚀 Starting page validation for match/replay/highlights journey...\n"
  );

  const baseUrl = "http://localhost:3030";

  // Common branding elements to check on all pages
  const commonBranding = {
    BreadcrumbBar:
      '[data-testid="breadcrumb-bar"], nav[aria-label*="breadcrumb"]',
    EsportsButton:
      '[data-testid="esports-button"], button[class*="esports-button"]',
    "Gradient Header": '[class*="bg-gradient-to-r"]',
    "Professional Typography": '[class*="electrolize"], h1, h2',
  };

  // Page-specific validations
  const validations = [
    {
      name: "Matches Page",
      url: `${baseUrl}/matches`,
      elements: {
        ...commonBranding,
        "Match Grid": '[data-testid="match-grid"], .grid',
        "Filter Controls": '[data-testid="filters"], .filter',
        "Match Cards": '[data-testid="match-card"], article, .card',
      },
    },
    {
      name: "Highlights Page",
      url: `${baseUrl}/highlights`,
      elements: {
        ...commonBranding,
        "Highlights Grid": '[data-testid="highlights-grid"], .grid',
        "Category Filters": '[data-testid="category-filters"]',
        "Highlight Cards": '[data-testid="highlight-card"], article, .card',
      },
    },
    {
      name: "Replays Page",
      url: `${baseUrl}/replays`,
      elements: {
        ...commonBranding,
        "Replays Grid": '[data-testid="replays-grid"], .grid',
        "Upload Button": '[data-testid="upload-button"]',
        "Filter Controls": '[data-testid="filters"], .filter',
      },
    },
    {
      name: "Match Detail Page",
      url: `${baseUrl}/matches/cs2/test-match-123`,
      elements: {
        ...commonBranding,
        "Match Header": '[data-testid="match-header"]',
        "Analytics Tabs": '[data-testid="analytics-tabs"], [role="tablist"]',
        "3-Column Layout": '.grid-cols-3, [class*="grid-cols-3"]',
      },
    },
  ];

  const results = {};

  for (const validation of validations) {
    results[validation.name] = await validatePage(
      validation.url,
      validation.elements
    );
  }

  console.log("\n📊 Validation Summary:");
  console.log("=".repeat(50));

  let totalChecks = 0;
  let passedChecks = 0;

  for (const [pageName, pageResults] of Object.entries(results)) {
    console.log(`\n${pageName}:`);
    if (pageResults.error) {
      console.log(`  ❌ Page failed to load: ${pageResults.error}`);
      continue;
    }

    for (const [elementName, passed] of Object.entries(pageResults)) {
      totalChecks++;
      if (passed) passedChecks++;
      console.log(`  ${passed ? "✅" : "❌"} ${elementName}`);
    }
  }

  console.log("\n🎯 Overall Results:");
  console.log(`  Total checks: ${totalChecks}`);
  console.log(`  Passed: ${passedChecks}`);
  console.log(`  Failed: ${totalChecks - passedChecks}`);
  console.log(
    `  Success rate: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`
  );

  if (passedChecks === totalChecks) {
    console.log(
      "\n🎉 All validations passed! Professional esports branding is working correctly."
    );
    process.exit(0);
  } else {
    console.log(
      "\n⚠️  Some validations failed. Check the branding implementation."
    );
    process.exit(1);
  }
}

main().catch(console.error);
