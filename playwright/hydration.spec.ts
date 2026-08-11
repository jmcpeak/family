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
  await expect(
    page
      .locator(
        '[data-testid^="member-row-"]:not([data-testid^="member-row-skeleton-"]):visible',
      )
      .first(),
  ).toBeVisible();

  // Reloading while authenticated forces SSR of FamilyAppBar, which is where
  // desktop media-query mismatch shows up.
  await page.reload();
  await expect(
    page
      .locator(
        '[data-testid^="member-row-"]:not([data-testid^="member-row-skeleton-"]):visible',
      )
      .first(),
  ).toBeVisible();

  expect(hydrationErrors, hydrationErrors.join("\n---\n")).toEqual([]);
});
