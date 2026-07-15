import { NextResponse } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };
const mutableEnv = process.env as Record<string, string | undefined>;

function resetAuthEnv(): void {
  for (const key of [
    "NODE_ENV",
    "FAMILY_LOGIN_ANSWER",
    "FAMILY_SESSION_SECRET",
    "FAMILY_DDB_TABLE",
    "FAMILY_USE_IN_MEMORY_DB",
    "FAMILY_USE_COGNITO_CREDENTIALS",
  ]) {
    if (key in ORIGINAL_ENV) {
      process.env[key] = ORIGINAL_ENV[key];
    } else {
      delete process.env[key];
    }
  }
}

beforeEach(() => {
  vi.useRealTimers();
});

afterEach(() => {
  resetAuthEnv();
  vi.resetModules();
});

describe("auth helpers", () => {
  it("creates verifiable session tokens that expire", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T12:00:00.000Z"));
    const { createSessionToken, verifySessionToken } = await import(
      "@/lib/auth"
    );
    const token = createSessionToken();

    expect(verifySessionToken(token)).toBe(true);
    vi.advanceTimersByTime(1000 * 60 * 60 * 9);
    expect(verifySessionToken(token)).toBe(false);
  });

  it("applies secure cookie flags in production", async () => {
    mutableEnv.NODE_ENV = "production";
    mutableEnv.FAMILY_DDB_TABLE = "mcpeak";
    mutableEnv.FAMILY_USE_IN_MEMORY_DB = "false";
    mutableEnv.FAMILY_SESSION_SECRET = "x".repeat(40);
    mutableEnv.FAMILY_LOGIN_ANSWER = "new london";
    const { applySessionCookie } = await import("@/lib/auth");
    const response = NextResponse.json({ ok: true });
    applySessionCookie(response);

    const cookie = response.cookies.get("family_session");
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("lax");
    expect(cookie?.secure).toBe(true);
  });

  it("supports FAMILY_LOGIN_ANSWER override", async () => {
    mutableEnv.FAMILY_LOGIN_ANSWER = "new london";
    const { isValidLoginAnswer } = await import("@/lib/auth");

    expect(isValidLoginAnswer("New London")).toBe(true);
    expect(isValidLoginAnswer("Wrong Place")).toBe(false);
  });
});
