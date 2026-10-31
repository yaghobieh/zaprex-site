import { expect, test, type Page } from "@playwright/test";
import { fakeBot } from "./fake-bot";

/** Phone navigation and mobile fit. Runs on the iphone-13 (WebKit) and pixel-7 (Chromium) projects only. */
const MENU_PAGES = ["/", "/docs", "/docs/quick-start", "/about", "/app"];
const FIT_PAGES = ["/", "/docs", "/docs/quick-start", "/docs/plans-and-limits", "/docs/models", "/about", "/app"];
const MENU_LINKS = ["Home", "Docs", "Open the Zaprex app", "About", "Pricing and plans", "Templates store", "Download Ingot", "GitHub", "Back to Ingot"];
const HOME_SECTIONS = ["Demo", "How it works", "Features", "Routines", "Security", "Pricing", "FAQ", "Early access"];

async function signedOut(page: Page) {
  await page.route("**/api/me", route => route.fulfill({ status: 401, contentType: "application/json", body: '{"error":"unauthorized"}' }));
}

function toggleOf(page: Page) {
  return page.locator('[data-testid="mobile-nav-toggle"]:visible');
}

async function openMenu(page: Page) {
  const toggle = toggleOf(page);
  await expect(toggle).toBeVisible();
  const id = await toggle.getAttribute("aria-controls");
  await toggle.click();
  const menu = page.locator(`[id="${id}"]`);
  await expect(menu).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  return { toggle, menu };
}

async function overflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}

test.describe("mobile nav @mobile-nav", () => {
  test.beforeEach(async ({ page }) => { await signedOut(page); });

  for (const path of MENU_PAGES) {
    test(`${path}: hamburger opens a menu with every link and closes on Escape`, async ({ page }) => {
      await page.goto(path);
      const toggle = toggleOf(page);
      await expect(toggle).toHaveCount(1);
      await expect(toggle).toHaveAttribute("aria-label", "Menu");
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await expect(toggle).toHaveAttribute("aria-controls", /.+/);
      const box = await toggle.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);

      const { menu } = await openMenu(page);
      await expect(menu).toHaveAttribute("role", "dialog");
      for (const name of MENU_LINKS) await expect(menu.getByRole("link", { name, exact: true })).toBeVisible();
      if (path === "/") for (const name of HOME_SECTIONS) await expect(menu.getByRole("link", { name, exact: true })).toBeVisible();
      await expect(menu.getByTestId("mobile-nav-beta")).toBeVisible();
      await expect(menu.getByRole("radiogroup", { name: "Theme" })).toBeVisible();
      await expect(menu.getByTestId("sign-in")).toBeVisible();
      if (path !== "/app") await expect(menu.getByTestId("mobile-nav-ask-rex")).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("data-scroll-locked", "");
      expect(await overflow(page), "menu open: horizontal scroll").toBeLessThanOrEqual(0);

      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await expect(toggle).toBeFocused();
      await expect(page.locator("html")).not.toHaveAttribute("data-scroll-locked");
    });
  }

  test("closes on backdrop tap and on the close button", async ({ page }) => {
    await page.goto("/about");
    let { menu } = await openMenu(page);
    await page.locator('[data-testid="mobile-nav-backdrop"]:visible').click({ position: { x: 10, y: 300 } });
    await expect(menu).toBeHidden();
    ({ menu } = await openMenu(page));
    await menu.getByRole("button", { name: "Close menu" }).click();
    await expect(menu).toBeHidden();
  });

  test("closes on link tap: page link navigates, in-page link scrolls", async ({ page }) => {
    await page.goto("/");
    let { menu } = await openMenu(page);
    await menu.getByRole("link", { name: "FAQ", exact: true }).click();
    await expect(menu).toBeHidden();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
    ({ menu } = await openMenu(page));
    await menu.getByRole("link", { name: "Docs", exact: true }).click();
    await expect(page).toHaveURL(/\/docs$/);
    await expect(page.getByTestId("docs-title")).toBeVisible();
    await expect(page.locator('[role="dialog"]:visible')).toHaveCount(0);
  });

  test("theme toggle inside the menu works in light and dark", async ({ page }) => {
    await page.goto("/docs");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "dark");
    const { menu } = await openMenu(page);
    await menu.getByRole("radio", { name: "Light" }).click();
    await expect(html).toHaveAttribute("data-theme", "light");
    await expect(menu).toBeVisible();
    await menu.getByRole("radio", { name: "Dark" }).click();
    await expect(html).toHaveAttribute("data-theme", "dark");
  });

  test("RTL: the menu slides in from the left edge", async ({ page }) => {
    await page.goto("/about");
    await page.evaluate(() => { document.documentElement.dir = "rtl"; });
    const { menu } = await openMenu(page);
    await expect.poll(async () => (await menu.boundingBox())!.x).toBeLessThanOrEqual(1);
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test("Ask Rex opens from the menu", async ({ page }) => {
    await page.goto("/docs");
    await expect(page.getByTestId("ask-rex-trigger")).toBeVisible();
    const { menu } = await openMenu(page);
    await menu.getByTestId("mobile-nav-ask-rex").click();
    await expect(menu).toBeHidden();
    await expect(page.getByTestId("ask-rex-trigger")).toHaveAttribute("aria-expanded", "true");
  });

  test("docs: the sidebar opens as a drawer and closes on link tap and Escape", async ({ page }) => {
    await page.goto("/docs/quick-start");
    const toggle = page.getByTestId("docs-drawer-toggle");
    await expect(toggle).toBeVisible();
    expect((await toggle.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await toggle.click();
    const drawer = page.locator("#docs-drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Quick start" })).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(toggle).toBeFocused();
    await toggle.click();
    await drawer.getByRole("link", { name: "Models", exact: true }).click();
    await expect(page).toHaveURL(/\/docs\/models$/);
    await expect(drawer).toBeHidden();
  });

  test("app, signed in: the phone chat bar carries the menu", async ({ page }) => {
    await page.unrouteAll();
    await fakeBot(page);
    await page.goto("/app");
    await expect(page.getByTestId("zaprex-app")).toBeVisible();
    await expect(page.getByTestId("app-bar-account")).toBeVisible();
    const { toggle, menu } = await openMenu(page);
    await expect(toggle).toHaveAttribute("aria-controls", "app-mobile-nav");
    for (const name of MENU_LINKS) await expect(menu.getByRole("link", { name, exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });
});

test.describe("mobile fit @mobile-nav", () => {
  test.beforeEach(async ({ page }) => { await signedOut(page); });

  for (const width of [375, 390]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      for (const path of FIT_PAGES) {
        await page.goto(path);
        await page.waitForLoadState("load");
        expect(await overflow(page), `${path} at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test("device viewport: scrollWidth <= innerWidth on main pages", async ({ page }) => {
    for (const path of FIT_PAGES) {
      await page.goto(path);
      await page.waitForLoadState("load");
      const m = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));
      expect(m.scroll, path).toBeLessThanOrEqual(m.inner);
    }
  });
});
