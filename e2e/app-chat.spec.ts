import { expect, test } from "@playwright/test";
import { answer, fakeBot, sse } from "./fake-bot";

/** Zaprex web app (/app) chat, against a mocked bot API (no sign-in, no model calls, no spend). */
test.describe("Zaprex app: chat", () => {
  test("signed out shows Sign in with Ingot", async ({ page }) => {
    await fakeBot(page, { signedIn: false });
    await page.goto("/app");
    await expect(page.getByTestId("app-signed-out")).toBeVisible();
    await expect(page.getByTestId("app-sign-in")).toHaveText(/Sign in with Ingot/);
  });

  test("Sign in sends the browser to Ingot SSO with a state and return_to", async ({ page }) => {
    await fakeBot(page, { signedIn: false });
    await page.goto("/app");
    const [request] = await Promise.all([
      page.waitForRequest(req => req.isNavigationRequest() && !req.url().startsWith(page.url().split("/app")[0] + "/app")),
      page.getByTestId("app-sign-in").click(),
    ]);
    const url = new URL(request.url());
    expect(url.searchParams.get("state")).toMatch(/^[0-9a-f]{48}$/);
    expect(url.searchParams.get("return_to")).toMatch(/\/auth\/callback$/);
  });

  test("answers a message, streamed, with Markdown rendered (no raw **)", async ({ page }) => {
    const bot = await fakeBot(page, { replies: [sse({ type: "start", model: "ingot" }, { type: "text", text: "Here is **bold** and a list:\n\n- one\n- two\n\n`code`" }, { type: "done", task: null, usage: null })] });
    await page.goto("/app");
    await expect(page.getByTestId("zaprex-app")).toBeVisible();
    await page.getByTestId("app-input").fill("Hello Rex");
    await page.getByTestId("app-send").click();
    const reply = page.getByTestId("app-message").filter({ has: page.locator("[data-role]") }).or(page.locator('[data-testid="app-message"][data-role="bot"]')).last();
    await expect(reply).toContainText("Here is bold and a list");
    await expect(reply.locator("strong")).toHaveText("bold");
    await expect(reply.locator("li")).toHaveCount(2);
    await expect(reply).not.toContainText("**");
    expect(bot.talkBodies[0]).toMatchObject({ text: "Hello Rex" });
  });

  test("Hebrew messages and input lay out right to left (dir=auto)", async ({ page }) => {
    await fakeBot(page, { replies: [answer("שלום! **זאפרקס** כאן.\n\n- פריט ראשון\n- second item")] });
    await page.goto("/app");
    const input = page.getByTestId("app-input");
    await expect(input).toHaveAttribute("dir", "auto");
    await input.fill("מה שלומך?");
    expect(await input.evaluate(el => getComputedStyle(el).direction)).toBe("rtl");
    await page.getByTestId("app-send").click();
    const mine = page.locator('[data-testid="app-message"][data-role="user"]').last();
    await expect(mine).toContainText("מה שלומך?");
    expect(await mine.locator("p").first().evaluate(el => getComputedStyle(el).direction)).toBe("rtl");
    const reply = page.locator('[data-testid="app-message"][data-role="bot"]').last();
    await expect(reply).toContainText("פריט ראשון");
    expect(await reply.locator("p").nth(1).evaluate(el => getComputedStyle(el).direction)).toBe("rtl");
    // The list follows the message (Hebrew first), so its bullets sit on the right, English item included.
    expect(await reply.locator("ul").evaluate(el => getComputedStyle(el).direction)).toBe("rtl");
  });

  test("a new deploy reloads an idle window on focus, or offers Reload when a draft is open", async ({ page }) => {
    await fakeBot(page);
    let live = "";
    await page.route("**/api/version", async route => (live ? route.fulfill({ json: { build: live } }) : route.continue()));
    await page.goto("/app");
    await expect(page.getByTestId("zaprex-app")).toBeVisible();
    await page.getByTestId("app-input").fill("half-written message");
    live = "dpl_newer";
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(page.getByTestId("app-update")).toBeVisible();
    await expect(page.getByTestId("app-input")).toHaveValue("half-written message");
    await page.reload();
    await expect(page.getByTestId("zaprex-app")).toBeVisible();
    const reloaded = page.waitForEvent("load");
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await reloaded;
  });

  test("an empty reply shows an error with Retry, and Retry resends", async ({ page }) => {
    const bot = await fakeBot(page, { replies: [sse({ type: "start", model: "ingot" }), answer("Second try worked.")] });
    await page.goto("/app");
    await page.getByTestId("app-input").fill("Are you there?");
    await page.getByTestId("app-send").click();
    await expect(page.getByTestId("app-error")).toBeVisible();
    await page.getByTestId("app-retry").click();
    await expect(page.locator('[data-testid="app-message"][data-role="bot"]').last()).toContainText("Second try worked.");
    expect(bot.talkBodies).toHaveLength(2);
    expect(bot.talkBodies[1]).toMatchObject({ text: "Are you there?" });
  });

  test("a server error is shown, never a silent drop", async ({ page }) => {
    await fakeBot(page, { talkStatus: 500 });
    await page.goto("/app");
    await page.getByTestId("app-input").fill("Break please");
    await page.getByTestId("app-send").click();
    await expect(page.getByTestId("app-error")).toBeVisible();
    await expect(page.getByTestId("app-retry")).toBeVisible();
  });

  test("a web-search turn (search event, then text) renders the sourced answer", async ({ page }) => {
    await fakeBot(page, { replies: [sse({ type: "start", model: "ingot" }, { type: "search", query: "election results today" }, { type: "text", text: "According to sources, ..." }, { type: "done", task: null, usage: null })] });
    await page.goto("/app");
    await page.getByTestId("app-input").fill("Who won the election today?");
    await page.getByTestId("app-send").click();
    await expect(page.locator('[data-testid="app-message"][data-role="bot"]').last()).toContainText("According to sources");
  });

  test("Reply quotes a message and sends replyTo", async ({ page }) => {
    const bot = await fakeBot(page, { replies: [answer("First answer about tests."), answer("Follow-up.")] });
    await page.goto("/app");
    await page.getByTestId("app-input").fill("Tell me about tests");
    await page.getByTestId("app-send").click();
    const reply = page.locator('[data-testid="app-message"][data-role="bot"]').last();
    await expect(reply).toContainText("First answer about tests.");
    await reply.hover();
    await reply.getByTestId("app-reply").click();
    await expect(page.getByTestId("app-reply-chip")).toContainText("First answer about tests.");
    await page.getByTestId("app-input").fill("More please");
    await page.getByTestId("app-send").click();
    await expect.poll(() => bot.talkBodies.length).toBe(2);
    expect(bot.talkBodies[1]).toMatchObject({ text: "More please", replyTo: { text: expect.stringContaining("First answer about tests.") } });
  });

  test("thumbs up / down toggle and save, thumbs down asks why", async ({ page }) => {
    const bot = await fakeBot(page, { replies: [answer("Rate me.")] });
    await page.goto("/app");
    await page.getByTestId("app-input").fill("Hi");
    await page.getByTestId("app-send").click();
    const reply = page.locator('[data-testid="app-message"][data-role="bot"]').last();
    await expect(reply).toContainText("Rate me.");
    await reply.hover();
    await reply.getByTestId("app-like").click();
    await expect(reply.getByTestId("app-like")).toHaveAttribute("aria-pressed", "true");
    await reply.getByTestId("app-like").click();
    await expect(reply.getByTestId("app-like")).toHaveAttribute("aria-pressed", "false");
    await reply.hover();
    await reply.getByTestId("app-dislike").click();
    await expect(page.getByTestId("app-feedback-form")).toBeVisible();
    await page.getByTestId("app-feedback-reason").fill("Too short");
    await page.getByTestId("app-feedback-send").click();
    await expect.poll(() => bot.feedback.map(entry => entry.body.value)).toEqual([1, 0, -1, -1]);
    expect(bot.feedback.at(-1)?.body).toMatchObject({ value: -1, reason: "Too short" });
  });

  test("no right sidebar: New chat and Search chats in the header", async ({ page }) => {
    await fakeBot(page);
    await page.goto("/app");
    await expect(page.getByTestId("app-new-chat")).toBeVisible();
    await page.getByTestId("app-search-chats").click();
    await expect(page.getByTestId("app-chats-panel")).toBeVisible();
    await expect(page.getByTestId("app-chat-item")).toHaveCount(3);
    await page.getByTestId("app-chat-search").fill("login");
    await expect(page.getByTestId("app-chat-item")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("app-chats-panel")).toBeHidden();
    await page.getByTestId("app-new-chat").click();
    await expect(page.getByTestId("app-chat-title")).toHaveText("New chat");
    const box = await page.getByTestId("zaprex-app").boundingBox();
    const aside = await page.locator("aside").filter({ visible: true }).count();
    expect(aside).toBe(0);
    expect(box?.width ?? 0).toBeGreaterThan(600);
  });

  test("+ opens a file picker, shows a chip, and sends the attachment", async ({ page }) => {
    const bot = await fakeBot(page, { replies: [answer("Got your file.")] });
    await page.goto("/app");
    const [chooser] = await Promise.all([page.waitForEvent("filechooser"), page.getByTestId("app-plus").click()]);
    await chooser.setFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("hello from a file") });
    await expect(page.getByTestId("app-attachment")).toHaveCount(1);
    await expect(page.getByTestId("app-attachment")).toContainText("notes.txt");
    await expect(page.getByTestId("app-task-toggle")).toBeDisabled();
    await page.getByTestId("app-input").fill("Read this");
    await page.getByTestId("app-send").click();
    await expect.poll(() => bot.talkBodies.length).toBe(1);
    const attachments = bot.talkBodies[0].attachments as { name: string }[];
    expect(attachments?.[0]?.name).toBe("notes.txt");
  });

  test("Task mode starts a run instead of chatting", async ({ page }) => {
    const bot = await fakeBot(page);
    await page.goto("/app");
    await page.getByTestId("app-task-toggle").click();
    await expect(page.getByTestId("app-task-toggle")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("app-plus")).toBeDisabled();
    await page.getByTestId("app-input").fill("Fix the flaky test");
    await page.getByTestId("app-send").click();
    await expect.poll(() => bot.chatPosts.length).toBe(1);
    expect(bot.chatPosts[0]).toMatchObject({ text: "Fix the flaky test" });
    expect(bot.talkBodies).toHaveLength(0);
  });

  test("free plan without Zaprex sees the upsell, composer locked", async ({ page }) => {
    await fakeBot(page, { entitlement: { enabled: false, plan: "free", reason: "upgrade_required" } });
    await page.goto("/app");
    await expect(page.getByTestId("app-upsell")).toBeVisible();
    await expect(page.getByTestId("app-input")).toBeDisabled();
  });

  test("mobile: composer visible, no horizontal scroll @mobile", async ({ page }) => {
    await fakeBot(page, { replies: [answer("Small screen reply.")] });
    await page.goto("/app");
    await expect(page.getByTestId("app-composer")).toBeInViewport();
    await page.getByTestId("app-input").fill("hi");
    await page.getByTestId("app-send").click();
    await expect(page.locator('[data-testid="app-message"][data-role="bot"]').last()).toContainText("Small screen reply.");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
