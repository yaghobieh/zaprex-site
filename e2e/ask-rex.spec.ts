import { expect, test, type Page, type Route } from "@playwright/test";

/** Ask Rex: the widget posts to ingot-server's site ask route with site "zaprex". The route is mocked here, so nothing calls a model. */
const ASK_ROUTE = "**/api/site/ask";
const LONG_ANSWER = Array.from({ length: 14 }, (_, i) => `Line ${i + 1}: Zaprex asks before risky steps and waits for your approval [1].`).join("\n");

async function mockAsk(page: Page, bodies: unknown[]) {
  const sent: Record<string, unknown>[] = [];
  await page.route(ASK_ROUTE, async (route: Route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "Content-Type" } });
    sent.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, headers: { "access-control-allow-origin": "*" }, contentType: "application/json", body: JSON.stringify(bodies.shift()) });
  });
  return sent;
}

async function openRex(page: Page, path = "/docs") {
  await page.goto(path);
  await page.getByTestId("ask-rex-trigger").click();
  const widget = page.getByTestId("ask-rex");
  await expect(widget.getByTestId("ask-rex-header")).toContainText("Ask Rex");
  return widget;
}

async function ask(page: Page, question: string) {
  const box = page.getByTestId("ask-rex").getByRole("textbox");
  await box.fill(question);
  await box.press("Enter");
}

test("Ask Rex answers from the Zaprex docs with sources, and long answers start at their first line @mobile", async ({ page }) => {
  const sent = await mockAsk(page, [
    { answer: LONG_ANSWER, refused: false, sources: [{ n: 1, title: "Approvals and safety", url: "/docs/approvals-and-safety" }, { n: 2, title: "MCP servers", url: "https://www.ingotide.com/docs/mcp" }], model: "Rex" },
  ]);
  const widget = await openRex(page);
  await expect(widget).toContainText("Hi, I’m Rex");
  await expect(widget).toContainText("can be wrong");
  await ask(page, "What needs my approval?");
  const answer = widget.getByTestId("ask-rex-answer").last();
  await expect(answer).toContainText("Line 1:");
  await expect(answer.getByRole("link", { name: "[1] Approvals and safety" })).toHaveAttribute("href", "/docs/approvals-and-safety");
  await expect(answer.getByRole("link", { name: "[2] MCP servers · Ingot" })).toBeVisible();
  expect(sent[0]).toMatchObject({ question: "What needs my approval?", site: "zaprex", history: [] });
  await expect.poll(async () => {
    const list = widget.locator(".Bear-Chat__messages");
    const [listTop, answerTop] = await Promise.all([list.evaluate(el => el.getBoundingClientRect().top), answer.evaluate(el => el.getBoundingClientRect().top)]);
    return answerTop - listTop;
  }).toBeLessThan(80);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, "horizontal scroll").toBeLessThanOrEqual(1);
});

test("Ask Rex refuses off-topic questions and points to the docs", async ({ page }) => {
  await mockAsk(page, [{ answer: "server refusal", refused: true, sources: [], model: "Rex" }]);
  const widget = await openRex(page, "/");
  await ask(page, "Write me a poem about the ocean");
  const answer = widget.getByTestId("ask-rex-answer").last();
  await expect(answer).toContainText("I can only answer questions about Zaprex and Ingot");
  await expect(answer.getByTestId("ask-rex-docs")).toHaveAttribute("href", "/docs");
  await expect(answer.getByTestId("ask-rex-sources")).toHaveCount(0);
});

test("Ask Rex explains rate limits and is not shown in the Zaprex app", async ({ page }) => {
  await page.route(ASK_ROUTE, route => route.fulfill({ status: 429, headers: { "access-control-allow-origin": "*" }, contentType: "application/json", body: JSON.stringify({ error: "site_ask_rate_limited", scope: "minute" }) }));
  const widget = await openRex(page);
  await ask(page, "What is Zaprex?");
  await expect(widget.getByTestId("ask-rex-error")).toHaveText("That’s a lot of questions. Try again in a minute.");
  await page.goto("/app");
  await expect(page.getByTestId("ask-rex-trigger")).toHaveCount(0);
});

test("/site-knowledge.json publishes the docs, FAQ and plans with site-relative links", async ({ request }) => {
  const response = await request.get("/site-knowledge.json");
  expect(response.status()).toBe(200);
  const body = (await response.json()) as { version: string; chunks: { id: string; url: string; text: string }[] };
  expect(body.version).toMatch(/^[0-9a-f]{12}$/);
  expect(body.chunks.every(chunk => chunk.url.startsWith("/") && !chunk.url.startsWith("//"))).toBe(true);
  expect(body.chunks.find(chunk => chunk.id === "pricing/zaprex-plans")?.text).toContain("$6 a month");
});
