import { expect, test } from "@playwright/test";

const loginAnswer = process.env.PLAYWRIGHT_LOGIN_ANSWER ?? "smoke-answer";

test("non-destructive smoke: login, browse, health, export, logout", async ({
  page,
}) => {
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

  const membersResponse = await page.request.get("/api/members");
  expect(membersResponse.status()).toBe(200);
  const membersPayload = (await membersResponse.json()) as {
    members: unknown[];
  };
  expect(membersPayload.members.length).toBeGreaterThan(0);

  // Active surveys auto-open after login and aria-hide the browse list.
  const surveyDialog = page.getByRole("dialog");
  if (await surveyDialog.isVisible({ timeout: 8_000 }).catch(() => false)) {
    const dontAskAgain = surveyDialog.getByRole("checkbox", {
      name: /don't ask again/i,
    });
    if (await dontAskAgain.isVisible().catch(() => false)) {
      await dontAskAgain.click();
    }
    await surveyDialog.getByRole("button", { name: /^close$/i }).click();
    await expect(surveyDialog).toBeHidden();
  }

  await expect(
    page.locator('[data-testid^="member-row-"]').first(),
  ).toBeVisible();

  const live = await page.request.get("/api/health/live");
  expect(live.status()).toBe(200);

  const ready = await page.request.get("/api/health/ready");
  expect(ready.status()).toBe(200);

  const mailingExport = await page.request.get("/api/export/mailing");
  expect(mailingExport.status()).toBe(200);
  expect(mailingExport.headers()["content-type"]).toContain("text/csv");

  const logout = await page.request.post("/api/auth/logout");
  expect(logout.status()).toBe(200);
  await page.reload();
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
});

test("full smoke (staging): member update and revert", async ({ request }) => {
  test.skip(
    process.env.SMOKE_ALLOW_WRITES !== "true",
    "Set SMOKE_ALLOW_WRITES=true for full staging smoke.",
  );

  const loginResponse = await request.post("/api/auth/login", {
    data: { answer: loginAnswer },
  });
  expect(loginResponse.status()).toBe(200);

  const listResponse = await request.get("/api/members");
  expect(listResponse.status()).toBe(200);
  const listPayload = (await listResponse.json()) as {
    members: Array<Record<string, unknown>>;
  };
  const member = listPayload.members[0];
  expect(member).toBeDefined();

  const originalHobbies = String(member?.hobbies ?? "");
  const updatedMember = {
    ...member,
    hobbies: `${originalHobbies} [smoke]`.trim(),
  };

  const updateResponse = await request.put(`/api/members/${member?.id}`, {
    data: updatedMember,
  });
  expect(updateResponse.status()).toBe(200);

  const revertedMember = {
    ...member,
    hobbies: originalHobbies,
  };
  const revertResponse = await request.put(`/api/members/${member?.id}`, {
    data: revertedMember,
  });
  expect(revertResponse.status()).toBe(200);
});
