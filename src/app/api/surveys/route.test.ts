import { NextResponse } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const requireSessionMock = vi.fn();
const getFamilyRepositoryMock = vi.fn(() => ({ checkReadiness: vi.fn() }));
const buildSurveysResponseMock = vi.fn();
const cookieGetMock = vi.fn();

vi.mock("@/lib/api-guard", () => ({
  requireSession: requireSessionMock,
}));

vi.mock("@/lib/data", () => ({
  getFamilyRepository: getFamilyRepositoryMock,
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: cookieGetMock,
  }),
}));

vi.mock("@/lib/surveys/server", () => ({
  buildSurveysResponse: buildSurveysResponseMock,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/surveys", () => {
  it("returns unauthorized when no session exists", async () => {
    requireSessionMock.mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );
    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(401);
    expect(getFamilyRepositoryMock).not.toHaveBeenCalled();
  });

  it("returns survey summaries when authorized", async () => {
    requireSessionMock.mockResolvedValueOnce(null);
    cookieGetMock.mockReturnValue(undefined);
    buildSurveysResponseMock.mockResolvedValueOnce({
      active: [],
      past: [],
    });

    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ active: [], past: [] });
    expect(buildSurveysResponseMock).toHaveBeenCalledOnce();
  });
});
