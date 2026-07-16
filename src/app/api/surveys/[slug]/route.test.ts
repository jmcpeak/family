import { NextResponse } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const requireSessionMock = vi.fn();
const repository = {
  listSurveyResponses: vi.fn(),
};
const getFamilyRepositoryMock = vi.fn(() => repository);
const buildSurveyResultsResponseMock = vi.fn();

vi.mock("@/lib/api-guard", () => ({
  requireSession: requireSessionMock,
}));

vi.mock("@/lib/data", () => ({
  getFamilyRepository: getFamilyRepositoryMock,
}));

vi.mock("@/lib/surveys/server", () => ({
  buildSurveyResultsResponse: buildSurveyResultsResponseMock,
  hasDuplicateSurveyRespondent: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/surveys/[slug]", () => {
  it("returns unauthorized when no session exists", async () => {
    requireSessionMock.mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "2027-reunion-interest" }),
    });

    expect(response.status).toBe(401);
    expect(getFamilyRepositoryMock).not.toHaveBeenCalled();
  });

  it("returns not found for unknown survey slugs", async () => {
    requireSessionMock.mockResolvedValueOnce(null);

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "not-a-survey" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Survey not found." });
    expect(buildSurveyResultsResponseMock).not.toHaveBeenCalled();
  });

  it("returns survey results when authorized", async () => {
    requireSessionMock.mockResolvedValueOnce(null);
    buildSurveyResultsResponseMock.mockResolvedValueOnce({
      slug: "2027-reunion-interest",
      title: "2027 Family Reunion Interest Survey",
      responseCount: 1,
      totals: {
        attendanceLikelihood: [],
        golfInterest: [],
        golfFormatPreference: [],
        pontoonInterest: [],
        lodgingNeededCount: 0,
        lodgingNotNeededCount: 1,
        luncheonHeadcountTotal: 1,
        dinnerHeadcountTotal: 1,
      },
      responses: [],
    });

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "2027-reunion-interest" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      slug: "2027-reunion-interest",
      title: "2027 Family Reunion Interest Survey",
      responseCount: 1,
      totals: {
        attendanceLikelihood: [],
        golfInterest: [],
        golfFormatPreference: [],
        pontoonInterest: [],
        lodgingNeededCount: 0,
        lodgingNotNeededCount: 1,
        luncheonHeadcountTotal: 1,
        dinnerHeadcountTotal: 1,
      },
      responses: [],
    });
    expect(buildSurveyResultsResponseMock).toHaveBeenCalledWith({
      repository,
      slug: "2027-reunion-interest",
    });
  });
});
