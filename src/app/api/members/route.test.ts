import { NextResponse } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const requireSessionMock = vi.fn();
const listMembersMock = vi.fn();
const getLastUpdateMetadataMock = vi.fn();
const getFamilyRepositoryMock = vi.fn(() => ({
  listMembers: listMembersMock,
  getLastUpdateMetadata: getLastUpdateMetadataMock,
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

describe("GET /api/members", () => {
  it("returns unauthorized when session is missing", async () => {
    requireSessionMock.mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );
    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(getFamilyRepositoryMock).not.toHaveBeenCalled();
  });

  it("returns members and metadata when authorized", async () => {
    requireSessionMock.mockResolvedValueOnce(null);
    listMembersMock.mockResolvedValueOnce([
      { id: "member-1", firstName: "Ada" },
    ]);
    getLastUpdateMetadataMock.mockResolvedValueOnce({
      id: "lastUpdateDate",
      lastUpdated: 123,
      lastUpdatedID: "member-1",
    });

    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      members: [{ id: "member-1", firstName: "Ada" }],
      metadata: {
        id: "lastUpdateDate",
        lastUpdated: 123,
        lastUpdatedID: "member-1",
      },
    });
  });

  it("maps repository failures to safe server errors", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    requireSessionMock.mockResolvedValueOnce(null);
    listMembersMock.mockRejectedValueOnce(new Error("dynamodb unavailable"));

    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Unexpected server error.",
    });
    errorSpy.mockRestore();
  });
});
