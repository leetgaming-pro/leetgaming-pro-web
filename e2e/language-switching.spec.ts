import { expect, test } from "@playwright/test";

async function switchLanguage(
  page: import("@playwright/test").Page,
  locale: string,
) {
  await page
    .getByTestId("language-selector-trigger")
    .filter({ visible: true })
    .first()
    .click();
  await page
    .getByTestId(`language-option-${locale}`)
    .filter({ visible: true })
    .first()
    .click();
  await page.waitForLoadState("domcontentloaded");
}

test.describe("Language switching", () => {
  test("updates the privacy page to Portuguese and persists after reload", async ({
    page,
  }) => {
    await page
      .context()
      .addCookies([
        {
          name: "leetgaming-locale",
          value: "en-US",
          domain: "localhost",
          path: "/",
        },
      ]);

    await page.goto("/legal/privacy", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { level: 1, name: "Privacy Policy" }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", /en/i);

    await switchLanguage(page, "pt-BR");

    await expect(
      page.getByRole("heading", { level: 1, name: "Política de Privacidade" }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.getByText("Informações da Conta")).toBeVisible();

    await page.reload({ waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { level: 1, name: "Política de Privacidade" }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  });

  test("updates the terms page to Simplified Chinese with server-rendered content", async ({
    page,
  }) => {
    await page
      .context()
      .addCookies([
        {
          name: "leetgaming-locale",
          value: "en-US",
          domain: "localhost",
          path: "/",
        },
      ]);

    await page.goto("/legal/terms", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { level: 1, name: "Terms of Service" }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", /en/i);

    await switchLanguage(page, "zh-CN");

    await expect(
      page.getByRole("heading", { level: 1, name: "服务条款" }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(
      page.getByRole("heading", { level: 2, name: /资格要求/ }),
    ).toBeVisible();
  });

  test("updates the investor overview page to Portuguese and persists after reload", async ({
    page,
  }) => {
    await page
      .context()
      .addCookies([
        {
          name: "leetgaming-locale",
          value: "en-US",
          domain: "localhost",
          path: "/",
        },
      ]);

    await page.goto("/investors", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /The All-in-One Esports Competition Platform/i,
      }),
    ).toBeVisible();

    await switchLanguage(page, "pt-BR");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /A plataforma completa de competições esports/i,
      }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.getByText("Oportunidade de mercado")).toBeVisible();

    await page.reload({ waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /A plataforma completa de competições esports/i,
      }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  });

  test("updates the investor deck to Simplified Chinese", async ({ page }) => {
    await page
      .context()
      .addCookies([
        {
          name: "leetgaming-locale",
          value: "en-US",
          domain: "localhost",
          path: "/",
        },
      ]);

    await page.goto("/investors/deck", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /The all-in-one esports competition platform powered by verified score intelligence/i,
      }),
    ).toBeVisible();

    await switchLanguage(page, "zh-CN");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /由经验证比分智能驱动的一体化电竞竞技平台/i,
      }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page.getByText("竞争 · 分析 · 收益")).toBeVisible();
  });

  test.describe("investor deck deep localization", () => {
    for (const scenario of [
      {
        locale: "es-ES",
        coverTitle:
          "La plataforma integral de competición esports impulsada por inteligencia de puntuación verificada",
        subtitle: "Competir · Analizar · Ganar",
        statLabel: "Jugadores",
        navNext: "Siguiente",
        navPrev: "Anterior",
      },
      {
        locale: "es-LA",
        coverTitle:
          "La plataforma integral de competencias esports impulsada por inteligencia de puntuación verificada",
        subtitle: "Competir · Analizar · Ganar",
        statLabel: "Jugadores",
        navNext: "Siguiente",
        navPrev: "Anterior",
      },
      {
        locale: "zh-CN",
        coverTitle: "由经验证比分智能驱动的一体化电竞竞技平台",
        subtitle: "竞争 · 分析 · 收益",
        statLabel: "玩家",
        navNext: "下一页",
        navPrev: "上一页",
      },
    ]) {
      test(`localizes investor deck content for ${scenario.locale}`, async ({
        page,
      }) => {
        await page
          .context()
          .addCookies([
            {
              name: "leetgaming-locale",
              value: "en-US",
              domain: "localhost",
              path: "/",
            },
          ]);

        await page.goto("/investors/deck", { waitUntil: "domcontentloaded" });
        await switchLanguage(page, scenario.locale);

        // Cover title
        await expect(
          page.getByRole("heading", { level: 1, name: scenario.coverTitle }),
        ).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute(
          "lang",
          scenario.locale,
        );

        // Cover subtitle
        await expect(
          page.getByText(scenario.subtitle, { exact: true }),
        ).toBeVisible();

        // Cover stat label (scoped to main to avoid nav/footer duplicates)
        await expect(
          page.getByRole("main").getByText(scenario.statLabel),
        ).toBeVisible();

        // Nav buttons are localized
        await expect(
          page.getByRole("button", { name: scenario.navNext }),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: scenario.navPrev }),
        ).toBeVisible();
      });
    }
  });

  test("updates the investor updates page to Spanish", async ({ page }) => {
    await page
      .context()
      .addCookies([
        {
          name: "leetgaming-locale",
          value: "en-US",
          domain: "localhost",
          path: "/",
        },
      ]);

    await page.goto("/investors/updates", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { level: 1, name: "Investor Updates" }),
    ).toBeVisible();

    await switchLanguage(page, "es-ES");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Actualizaciones para inversores",
      }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "es-ES");
    await expect(page.getByText("Mantente al día")).toBeVisible();
  });
});
