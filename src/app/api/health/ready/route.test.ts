import { afterEach, describe, expect, it, vi } from "vitest";

const checkReadinessMock = vi.fn();

vi.mock("@/lib/data", () => ({
  getFamilyRepository: () => ({
    checkReadiness: checkReadinessMock,
  }),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/health/ready", () => {
  it("returns ready when repository check passes", async () => {
    checkReadinessMock.mockResolvedValueOnce(undefined);
    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toMatchObject({
      ready: true,
    });
  });

  it("returns 503 when readiness fails", async () => {
    checkReadinessMock.mockRejectedValueOnce(new Error("ddb timeout"));
    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ready: false,
      error: "Service unavailable.",
    });
  });
});
