import { NextResponse } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const requireSessionMock = vi.fn();
const listPhonesMock = vi.fn();
const getFamilyRepositoryMock = vi.fn(() => ({
  listPhones: listPhonesMock,
}));

vi.mock("@/lib/api-guard", () => ({
  requireSession: requireSessionMock,
}));

vi.mock("@/lib/data", () => ({
  getFamilyRepository: getFamilyRepositoryMock,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/phones", () => {
  it("returns unauthorized when session is missing", async () => {
    requireSessionMock.mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );
    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(401);
  });

  it("returns phones when authorized", async () => {
    requireSessionMock.mockResolvedValueOnce(null);
    listPhonesMock.mockResolvedValueOnce(["555-0123"]);

    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      phones: ["555-0123"],
    });
  });
});
