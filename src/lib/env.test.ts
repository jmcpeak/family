import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };
const mutableEnv = process.env as Record<string, string | undefined>;
const ENV_KEYS = [
  "NODE_ENV",
  "FAMILY_DDB_TABLE",
  "FAMILY_USE_IN_MEMORY_DB",
  "FAMILY_SESSION_SECRET",
  "FAMILY_USE_COGNITO_CREDENTIALS",
];

function resetEnv(): void {
  for (const key of ENV_KEYS) {
    if (key in ORIGINAL_ENV) {
      process.env[key] = ORIGINAL_ENV[key];
    } else {
      delete process.env[key];
    }
  }
}

async function loadEnv() {
  vi.resetModules();
  return import("@/lib/env");
}

afterEach(() => {
  resetEnv();
  vi.resetModules();
});

describe("serverEnv production validation", () => {
  it("rejects production when in-memory mode is enabled", async () => {
    mutableEnv.NODE_ENV = "production";
    mutableEnv.FAMILY_DDB_TABLE = "mcpeak";
    mutableEnv.FAMILY_SESSION_SECRET = "x".repeat(40);
    mutableEnv.FAMILY_USE_IN_MEMORY_DB = "true";

    await expect(loadEnv()).rejects.toThrow("FAMILY_USE_IN_MEMORY_DB");
  });

  it("rejects production with default session secret", async () => {
    mutableEnv.NODE_ENV = "production";
    mutableEnv.FAMILY_DDB_TABLE = "mcpeak";
    mutableEnv.FAMILY_USE_IN_MEMORY_DB = "false";
    mutableEnv.FAMILY_SESSION_SECRET = "family-dev-session-secret";

    await expect(loadEnv()).rejects.toThrow(
      "FAMILY_SESSION_SECRET must be set to a strong secret",
    );
  });

  it("rejects Cognito browser credentials in production", async () => {
    mutableEnv.NODE_ENV = "production";
    mutableEnv.FAMILY_DDB_TABLE = "mcpeak";
    mutableEnv.FAMILY_USE_IN_MEMORY_DB = "false";
    mutableEnv.FAMILY_SESSION_SECRET = "x".repeat(40);
    mutableEnv.FAMILY_USE_COGNITO_CREDENTIALS = "true";

    await expect(loadEnv()).rejects.toThrow(
      "FAMILY_USE_COGNITO_CREDENTIALS must remain false in production.",
    );
  });

  it("requires an explicit production login answer", async () => {
    mutableEnv.NODE_ENV = "production";
    mutableEnv.FAMILY_DDB_TABLE = "mcpeak";
    mutableEnv.FAMILY_USE_IN_MEMORY_DB = "false";
    mutableEnv.FAMILY_SESSION_SECRET = "x".repeat(40);
    delete process.env.FAMILY_LOGIN_ANSWER;

    await expect(loadEnv()).rejects.toThrow(
      "FAMILY_LOGIN_ANSWER is required in production.",
    );
  });

  it("keeps development defaults outside production", async () => {
    mutableEnv.NODE_ENV = "development";
    delete process.env.FAMILY_DDB_TABLE;
    mutableEnv.FAMILY_USE_IN_MEMORY_DB = "true";
    delete process.env.FAMILY_SESSION_SECRET;

    const { serverEnv } = await loadEnv();
    expect(serverEnv.useInMemoryDb).toBe(true);
    expect(serverEnv.sessionSecret).toBe("family-dev-session-secret");
  });
});
