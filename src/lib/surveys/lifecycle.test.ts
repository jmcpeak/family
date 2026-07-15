import { describe, expect, it } from "vitest";
import { addCalendarMonths, isSurveyActive } from "@/lib/surveys/lifecycle";
import type { SurveyActivationRecord } from "@/lib/surveys/types";

describe("survey lifecycle", () => {
  it("adds calendar months instead of fixed days", () => {
    const jan31 = Date.UTC(2026, 0, 31, 12, 0, 0);
    const result = addCalendarMonths(jan31, 3);
    const date = new Date(result);

    expect(date.getUTCMonth()).toBe(4);
    expect(date.getUTCDate()).toBe(1);
  });

  it("marks surveys active through closing timestamp", () => {
    const activation: SurveyActivationRecord = {
      slug: "2027-reunion-interest",
      openedAt: 1000,
      closesAt: 5000,
    };

    expect(isSurveyActive(activation, 5000)).toBe(true);
    expect(isSurveyActive(activation, 5001)).toBe(false);
  });
});
