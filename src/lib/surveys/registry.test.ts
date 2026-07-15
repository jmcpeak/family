import { describe, expect, it } from "vitest";
import {
  buildSurveySummary,
  getSurveyPath,
  isSurveySlug,
  parseSurveyPayload,
  parseSurveySlugFromPathname,
  splitSurveySummaries,
} from "@/lib/surveys/registry";
import type { SurveyActivationRecord } from "@/lib/surveys/types";

describe("survey registry", () => {
  it("parses a survey slug from pathnames", () => {
    expect(parseSurveySlugFromPathname("/surveys/2027-reunion-interest")).toBe(
      "2027-reunion-interest",
    );
    expect(parseSurveySlugFromPathname("/surveys/nope")).toBeNull();
    expect(parseSurveySlugFromPathname("/")).toBeNull();
  });

  it("validates payloads using the survey schema", () => {
    const payload = parseSurveyPayload("2027-reunion-interest", {
      respondentName: "Taylor McPeak",
      attendanceLikelihood: "likely",
      golfInterest: "yes",
      golfFormatPreference: "either",
      luncheonHeadcount: 2,
      dinnerHeadcount: 3,
      pontoonInterest: "maybe",
      lodgingNeeded: true,
      lodgingDetails: "Cabin near the lake",
      comments: "Looking forward to it",
    });

    expect(payload?.respondentName).toBe("Taylor McPeak");
    expect(
      parseSurveyPayload("2027-reunion-interest", { bad: true }),
    ).toBeNull();
  });

  it("splits active and past survey summaries", () => {
    const now = 1000;
    const activeActivation: SurveyActivationRecord = {
      slug: "2027-reunion-interest",
      openedAt: 500,
      closesAt: 5000,
    };
    const pastActivation: SurveyActivationRecord = {
      slug: "2027-reunion-interest",
      openedAt: 500,
      closesAt: 900,
    };

    const activeSummary = buildSurveySummary(activeActivation, false, now);
    const pastSummary = buildSurveySummary(pastActivation, true, now);
    const grouped = splitSurveySummaries([activeSummary, pastSummary]);

    expect(grouped.active).toHaveLength(1);
    expect(grouped.active[0]?.path).toBe(
      getSurveyPath("2027-reunion-interest"),
    );
    expect(grouped.past).toHaveLength(1);
    expect(grouped.past[0]?.completed).toBe(true);
  });

  it("recognizes supported survey slugs", () => {
    expect(isSurveySlug("2027-reunion-interest")).toBe(true);
    expect(isSurveySlug("other-survey")).toBe(false);
  });
});
