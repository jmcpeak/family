import { describe, expect, it } from "vitest";
import { MemoryFamilyRepository } from "@/lib/data/memory-repository";
import {
  buildSurveyResultsResponse,
  buildSurveysResponse,
  hasDuplicateSurveyRespondent,
} from "@/lib/surveys/server";

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

  it("detects duplicate respondents across submissions", async () => {
    const repository = new MemoryFamilyRepository();
    await repository.createSurveyResponse({
      id: "survey#2027-reunion-interest#response#1",
      slug: "2027-reunion-interest",
      createdAt: 123,
      payload: {
        respondentName: "Alex McPeak",
        attendanceLikelihood: "likely",
        golfInterest: "yes",
        golfFormatPreference: "either",
        luncheonHeadcount: 2,
        dinnerHeadcount: 2,
        pontoonInterest: "maybe",
        lodgingNeeded: false,
      },
    });

    await expect(
      hasDuplicateSurveyRespondent({
        repository,
        slug: "2027-reunion-interest",
        respondentName: " alex   mcpeak ",
      }),
    ).resolves.toBe(true);
    await expect(
      hasDuplicateSurveyRespondent({
        repository,
        slug: "2027-reunion-interest",
        respondentName: "Taylor McPeak",
      }),
    ).resolves.toBe(false);
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
