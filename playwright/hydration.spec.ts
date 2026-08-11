import { expect, test } from "@playwright/test";
import { loginAndRevealBrowse } from "./helpers";

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

  await loginAndRevealBrowse(page);

  const browseMember = page.getByRole("button", { name: /McPeak/i }).first();

  // Reloading while authenticated forces SSR of FamilyAppBar, which is where
  // desktop media-query mismatch shows up.
  await page.reload();
  await expect(browseMember).toBeVisible();

  expect(hydrationErrors, hydrationErrors.join("\n---\n")).toEqual([]);
});
