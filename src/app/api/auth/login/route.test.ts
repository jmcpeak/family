import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };
const mutableEnv = process.env as Record<string, string | undefined>;

function resetEnv(): void {
  for (const key of [
    "FAMILY_LOGIN_ANSWER",
    "FAMILY_SESSION_SECRET",
    "FAMILY_DDB_TABLE",
    "FAMILY_USE_IN_MEMORY_DB",
  ]) {
    if (key in ORIGINAL_ENV) {
      process.env[key] = ORIGINAL_ENV[key];
    } else {
      delete process.env[key];
    }
  }
}

async function loadRoute() {
  vi.resetModules();
  return import("./route");
}

afterEach(() => {
  resetEnv();
  vi.resetModules();
});

describe("POST /api/auth/login", () => {
  it("rejects malformed payloads", async () => {
    const { POST } = await loadRoute();
    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "content-type": "application/json" },
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid request body.",
    });
  });

  it("returns generic message for invalid answers", async () => {
    mutableEnv.FAMILY_LOGIN_ANSWER = "new london";
    const { POST } = await loadRoute();
    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ answer: "wrong" }),
        headers: { "content-type": "application/json" },
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid login credentials.",
    });
  });

  it("sets auth cookie on success", async () => {
    mutableEnv.FAMILY_LOGIN_ANSWER = "new london";
    const { POST } = await loadRoute();
    const response = await POST(
      new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ answer: "New London" }),
        headers: { "content-type": "application/json" },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ authenticated: true });
    expect(response.cookies.get("family_session")?.value).toBeTruthy();
  });
});
