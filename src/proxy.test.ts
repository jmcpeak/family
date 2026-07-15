import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };
const mutableEnv = process.env as Record<string, string | undefined>;
const ENV_KEYS = ["NODE_ENV", "CANONICAL_HOST"];

function resetEnv(): void {
  for (const key of ENV_KEYS) {
    if (key in ORIGINAL_ENV) {
      process.env[key] = ORIGINAL_ENV[key];
    } else {
      delete process.env[key];
    }
  }
}

async function loadProxy() {
  vi.resetModules();
  return import("@/proxy");
}

afterEach(() => {
  resetEnv();
  vi.resetModules();
});

describe("proxy", () => {
  it("redirects http requests to canonical https host in production", async () => {
    mutableEnv.NODE_ENV = "production";
    mutableEnv.CANONICAL_HOST = "mcpeakfamily.org";
    const { proxy } = await loadProxy();
    const request = new NextRequest("http://www.mcpeakfamily.org/path?x=1", {
      headers: {
        host: "www.mcpeakfamily.org",
        "x-forwarded-proto": "http",
      },
    });

    const response = proxy(request);
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://mcpeakfamily.org/path?x=1",
    );
  });

  it("skips redirects in non-production environments", async () => {
    mutableEnv.NODE_ENV = "development";
    const { proxy } = await loadProxy();
    const request = new NextRequest("http://www.mcpeakfamily.org/path", {
      headers: {
        host: "www.mcpeakfamily.org",
        "x-forwarded-proto": "http",
      },
    });

    const response = proxy(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
