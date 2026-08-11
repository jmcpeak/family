import { expect, type Page } from "@playwright/test";

const loginAnswer = process.env.PLAYWRIGHT_LOGIN_ANSWER ?? "smoke-answer";
const UI_READY_TIMEOUT_MS = 60_000;

/** Log in and wait until the browse list (or survey dialog) is ready. */
export async function loginAndRevealBrowse(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.getByText(/family reunion/i)).toBeVisible();

  await page.getByRole("textbox").first().fill(loginAnswer);
  await page.getByRole("button", { name: "Login" }).click();

  await expect
    .poll(async () => {
      const response = await page.request.get("/api/auth/session");
      if (!response.ok()) {
        return false;
      }
      const body = (await response.json()) as { authenticated?: boolean };
      return body.authenticated === true;
    })
    .toBe(true);

  // Cookie can be set before the client bundle finishes compiling on a cold
  // `next dev` (CI deletes .next before smoke). Wait for the login chrome to go.
  await expect(page.getByRole("button", { name: "Login" })).toBeHidden({
    timeout: UI_READY_TIMEOUT_MS,
  });

  const membersResponse = await page.request.get("/api/members");
  expect(membersResponse.status()).toBe(200);
  const membersPayload = (await membersResponse.json()) as {
    members: unknown[];
  };
  expect(membersPayload.members.length).toBeGreaterThan(0);

  const browseMember = page.getByRole("button", { name: /McPeak/i }).first();
  const surveyDialog = page.getByRole("dialog", {
    name: /family reunion interest survey/i,
  });

  await Promise.race([
    browseMember.waitFor({ state: "visible", timeout: UI_READY_TIMEOUT_MS }),
    surveyDialog.waitFor({ state: "visible", timeout: UI_READY_TIMEOUT_MS }),
  ]);

  if (await surveyDialog.isVisible().catch(() => false)) {
    await surveyDialog
      .getByRole("checkbox", { name: /don't ask again/i })
      .click();
    await surveyDialog.getByRole("button", { name: /^close$/i }).click();
    await expect(surveyDialog).toBeHidden();
  }

  await expect(page.locator(".MuiModal-backdrop")).toHaveCount(0);
  await expect(browseMember).toBeVisible();
}
