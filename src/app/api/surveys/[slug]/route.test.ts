import { NextResponse } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const requireSessionMock = vi.fn();
const repository = {
  listSurveyResponses: vi.fn(),
};
const getFamilyRepositoryMock = vi.fn(() => repository);
const buildSurveyResultsResponseMock = vi.fn();
const submitSurveyResponseMock = vi.fn();
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
  buildSurveyResultsResponse: buildSurveyResultsResponseMock,
  submitSurveyResponse: submitSurveyResponseMock,
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
    await expect(response.json()).resolves.toEqual({
      error: "Survey not found.",
    });
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

describe("POST /api/surveys/[slug]", () => {
  it("returns unauthorized when no session exists", async () => {
    requireSessionMock.mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({}),
      }),
      {
        params: Promise.resolve({ slug: "2027-reunion-interest" }),
      },
    );

    expect(response.status).toBe(401);
    expect(submitSurveyResponseMock).not.toHaveBeenCalled();
  });

  it("maps submit failure reasons to HTTP responses", async () => {
    requireSessionMock.mockResolvedValueOnce(null);
    cookieGetMock.mockReturnValueOnce(undefined);
    submitSurveyResponseMock.mockResolvedValueOnce({
      ok: false,
      reason: "closed",
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ respondentName: "Ada" }),
      }),
      {
        params: Promise.resolve({ slug: "2027-reunion-interest" }),
      },
    );

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toEqual({
      error: "This survey has closed.",
    });
  });

  it("returns success and sets completion cookie", async () => {
    requireSessionMock.mockResolvedValueOnce(null);
    cookieGetMock.mockReturnValueOnce(undefined);
    submitSurveyResponseMock.mockResolvedValueOnce({
      ok: true,
      submitted: true,
      slug: "2027-reunion-interest",
      submittedAt: 1_000,
      closesAt: 2_000,
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ respondentName: "Ada" }),
      }),
      {
        params: Promise.resolve({ slug: "2027-reunion-interest" }),
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      submitted: true,
      slug: "2027-reunion-interest",
      submittedAt: 1_000,
      closesAt: 2_000,
    });
    expect(
      response.cookies.get("family_survey_completed_2027-reunion-interest")
        ?.value,
    ).toBe("1");
    expect(submitSurveyResponseMock).toHaveBeenCalledWith(
      expect.objectContaining({
        repository,
        slug: "2027-reunion-interest",
        alreadyCompleted: false,
        body: { respondentName: "Ada" },
      }),
    );
  });

  it("passes alreadyCompleted when the completion cookie is set", async () => {
    requireSessionMock.mockResolvedValueOnce(null);
    cookieGetMock.mockReturnValueOnce({ value: "1" });
    submitSurveyResponseMock.mockResolvedValueOnce({
      ok: false,
      reason: "already_completed",
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({}),
      }),
      {
        params: Promise.resolve({ slug: "2027-reunion-interest" }),
      },
    );

    expect(response.status).toBe(409);
    expect(submitSurveyResponseMock).toHaveBeenCalledWith(
      expect.objectContaining({
        alreadyCompleted: true,
      }),
    );
  });
});
