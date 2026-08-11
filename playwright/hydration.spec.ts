import { expect, test } from "@playwright/test";

const loginAnswer = process.env.PLAYWRIGHT_LOGIN_ANSWER ?? "smoke-answer";

test("authenticated desktop home does not hydration-mismatch", async ({
  page,
}) => {
  const hydrationErrors: string[] = [];

  page.on("pageerror", (error) => {
    if (/hydrat/i.test(error.message)) {
      hydrationErrors.push(error.message);
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat/i.test(message.text())) {
      hydrationErrors.push(message.text());
    }
  });

  await page.goto("/");
  await page.getByRole("textbox").first().fill(loginAnswer);
  await page.getByRole("button", { name: "Login" }).click();

  const browseMember = page.getByRole("button", { name: /McPeak/i }).first();
  const surveyDialog = page.getByRole("dialog", {
    name: /family reunion interest survey/i,
  });
  await Promise.race([
    browseMember.waitFor({ state: "visible", timeout: 30_000 }),
    surveyDialog.waitFor({ state: "visible", timeout: 30_000 }),
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

  // Reloading while authenticated forces SSR of FamilyAppBar, which is where
  // desktop media-query mismatch shows up.
  await page.reload();
  await expect(browseMember).toBeVisible();

  expect(hydrationErrors, hydrationErrors.join("\n---\n")).toEqual([]);
});
