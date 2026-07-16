import { describe, expect, it } from "vitest";
import { MemoryFamilyRepository } from "@/lib/data/memory-repository";
import {
  buildSurveyResultsResponse,
  buildSurveysResponse,
  submitSurveyResponse,
} from "@/lib/surveys/server";

const VALID_BODY = {
  respondentName: "Alex McPeak",
  attendanceLikelihood: "likely",
  golfInterest: "yes",
  golfFormatPreference: "either",
  luncheonHeadcount: 2,
  dinnerHeadcount: 2,
  pontoonInterest: "maybe",
  lodgingNeeded: false,
} as const;

describe("survey server helpers", () => {
  it("builds active and past lists from repository activation records", async () => {
    const repository = new MemoryFamilyRepository();
    const initial = await buildSurveysResponse({
      repository,
      nowMs: 1_000,
      isCompleted: () => false,
    });

    expect(initial.active).toHaveLength(1);
    expect(initial.past).toHaveLength(0);

    const farFuture = Date.UTC(2050, 0, 1);
    const later = await buildSurveysResponse({
      repository,
      nowMs: farFuture,
      isCompleted: () => false,
    });
    expect(later.active).toHaveLength(0);
    expect(later.past).toHaveLength(1);
  });

  it("builds survey results with aggregates and newest-first responses", async () => {
    const repository = new MemoryFamilyRepository();

    await repository.createSurveyResponse({
      id: "survey#2027-reunion-interest#response#old",
      slug: "2027-reunion-interest",
      createdAt: 100,
      payload: {
        respondentName: "Taylor McPeak",
        attendanceLikelihood: "likely",
        golfInterest: "yes",
        golfFormatPreference: "either",
        luncheonHeadcount: 2,
        dinnerHeadcount: 3,
        pontoonInterest: "maybe",
        lodgingNeeded: true,
        lodgingDetails: "Near the lake",
        comments: "Will bring snacks",
      },
    });

    await repository.createSurveyResponse({
      id: "survey#2027-reunion-interest#response#new",
      slug: "2027-reunion-interest",
      createdAt: 200,
      payload: {
        respondentName: "Jordan McPeak",
        attendanceLikelihood: "definitely",
        golfInterest: "no",
        golfFormatPreference: "no-golf",
        luncheonHeadcount: 1,
        dinnerHeadcount: 1,
        pontoonInterest: "yes",
        lodgingNeeded: false,
        comments: "See everyone there",
      },
    });

    const results = await buildSurveyResultsResponse({
      repository,
      slug: "2027-reunion-interest",
    });

    expect(results.responseCount).toBe(2);
    expect(results.responses.map((response) => response.id)).toEqual([
      "survey#2027-reunion-interest#response#new",
      "survey#2027-reunion-interest#response#old",
    ]);
    expect(results.totals.lodgingNeededCount).toBe(1);
    expect(results.totals.lodgingNotNeededCount).toBe(1);
    expect(results.totals.luncheonHeadcountTotal).toBe(3);
    expect(results.totals.dinnerHeadcountTotal).toBe(4);
    expect(
      results.totals.attendanceLikelihood.find(
        (choice) => choice.value === "definitely",
      )?.count,
    ).toBe(1);
    expect(
      results.totals.attendanceLikelihood.find(
        (choice) => choice.value === "likely",
      )?.count,
    ).toBe(1);
  });
});

describe("submitSurveyResponse", () => {
  it("accepts a Survey Submission and persists it", async () => {
    const repository = new MemoryFamilyRepository();
    const nowMs = 1_000;

    const result = await submitSurveyResponse({
      repository,
      slug: "2027-reunion-interest",
      body: VALID_BODY,
      nowMs,
      alreadyCompleted: false,
    });

    expect(result).toEqual({
      ok: true,
      submitted: true,
      slug: "2027-reunion-interest",
      submittedAt: nowMs,
      closesAt: expect.any(Number),
    });
    if (!result.ok) {
      throw new Error("expected success");
    }
    expect(result.closesAt).toBeGreaterThan(nowMs);

    const responses = await repository.listSurveyResponses(
      "2027-reunion-interest",
    );
    expect(responses).toHaveLength(1);
    expect(responses[0]?.payload.respondentName).toBe("Alex McPeak");
    expect(responses[0]?.slug).toBe("2027-reunion-interest");
    expect(responses[0]?.createdAt).toBe(nowMs);
  });

  it("returns not_found for an unknown Survey slug", async () => {
    const repository = new MemoryFamilyRepository();

    await expect(
      submitSurveyResponse({
        repository,
        slug: "not-a-survey",
        body: VALID_BODY,
        nowMs: 1_000,
        alreadyCompleted: false,
      }),
    ).resolves.toEqual({ ok: false, reason: "not_found" });
  });

  it("returns closed when the Survey is no longer active", async () => {
    const repository = new MemoryFamilyRepository();
    const openedAt = 1_000;
    await repository.ensureSurveyActivation(
      "2027-reunion-interest",
      3,
      openedAt,
    );
    const farFuture = Date.UTC(2050, 0, 1);

    await expect(
      submitSurveyResponse({
        repository,
        slug: "2027-reunion-interest",
        body: VALID_BODY,
        nowMs: farFuture,
        alreadyCompleted: false,
      }),
    ).resolves.toEqual({ ok: false, reason: "closed" });
  });

  it("returns already_completed when the browser already submitted", async () => {
    const repository = new MemoryFamilyRepository();

    await expect(
      submitSurveyResponse({
        repository,
        slug: "2027-reunion-interest",
        body: VALID_BODY,
        nowMs: 1_000,
        alreadyCompleted: true,
      }),
    ).resolves.toEqual({ ok: false, reason: "already_completed" });
  });

  it("returns invalid_payload for a bad body", async () => {
    const repository = new MemoryFamilyRepository();

    await expect(
      submitSurveyResponse({
        repository,
        slug: "2027-reunion-interest",
        body: { bad: true },
        nowMs: 1_000,
        alreadyCompleted: false,
      }),
    ).resolves.toEqual({ ok: false, reason: "invalid_payload" });
  });

  it("returns duplicate_respondent when the name was already used", async () => {
    const repository = new MemoryFamilyRepository();
    const nowMs = 1_000;

    const first = await submitSurveyResponse({
      repository,
      slug: "2027-reunion-interest",
      body: VALID_BODY,
      nowMs,
      alreadyCompleted: false,
    });
    expect(first.ok).toBe(true);

    await expect(
      submitSurveyResponse({
        repository,
        slug: "2027-reunion-interest",
        body: {
          ...VALID_BODY,
          respondentName: " alex   mcpeak ",
        },
        nowMs: nowMs + 1,
        alreadyCompleted: false,
      }),
    ).resolves.toEqual({ ok: false, reason: "duplicate_respondent" });
  });
});
