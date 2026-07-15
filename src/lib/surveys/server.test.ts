import { describe, expect, it } from "vitest";
import { MemoryFamilyRepository } from "@/lib/data/memory-repository";
import {
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
});
