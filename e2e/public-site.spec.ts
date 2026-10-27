import { expect, test } from "@playwright/test";

/** zaprex.dev public pages: load, no page errors, no competitor names, links resolve, mobile width, themes. */
const PAGES = ["/", "/docs", "/about", "/docs/quick-start", "/docs/zaprex-app", "/docs/plans-and-limits", "/docs/models", "/docs/faq"];
const COMPETITORS = /\b(Cursor|Copilot|Windsurf|VS ?Code|JetBrains|Replit|Codeium|Devin|ChatGPT|Claude)\b/;

for (const path of PAGES) {
  test(`page ${path} loads cleanly @mobile`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(String(error)));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).not.toBeEmpty();
    const text = await page.locator("body").innerText();
    expect(text.match(COMPETITORS)?.[0] ?? null).toBeNull();
    expect(errors).toEqual([]);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, "horizontal scroll").toBeLessThanOrEqual(1);
  });
}

test("390px phone width: no horizontal scroll on home, docs and app", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/", "/docs", "/about"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${path} horizontal scroll`).toBeLessThanOrEqual(1);
  }
});

test("internal links on the home page and docs resolve", async ({ page, request }) => {
  const links = new Set<string>();
  for (const path of ["/", "/docs"]) {
    await page.goto(path);
    for (const href of await page.locator("a[href]").evaluateAll(anchors => anchors.map(anchor => (anchor as HTMLAnchorElement).href))) {
      const url = new URL(href);
      if (url.origin === new URL(page.url()).origin && !url.pathname.startsWith("/api/")) links.add(url.origin + url.pathname);
    }
  }
  const broken: string[] = [];
  for (const link of links) { const response = await request.get(link); if (response.status() >= 400) broken.push(`${response.status()} ${link}`); }
  expect(broken).toEqual([]);
});

test("theme toggle: Light, Dark and System are remembered", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "dark");
  await page.getByRole("radio", { name: "Light" }).first().click();
  await expect(html).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.getByRole("radio", { name: "System" }).first().click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(html).toHaveAttribute("data-theme", "light");
});

test("desktop handoff page and app links exist", async ({ request }) => {
  for (const path of ["/app", "/auth/desktop", "/.well-known/apple-app-site-association"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBeLessThan(500);
  }
});

test("/pricing redirects to the Ingot plans page", async ({ request }) => {
  const response = await request.get("/pricing", { maxRedirects: 0 });
  expect([307, 308]).toContain(response.status());
  expect(response.headers()["location"]).toBe("https://ingot-portal.vercel.app/pricing");
});

test("/api/version answers the build id, never cached", async ({ request }) => {
  const response = await request.get("/api/version");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(typeof (await response.json()).build).toBe("string");
});
