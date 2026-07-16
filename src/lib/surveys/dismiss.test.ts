import { afterEach, describe, expect, it, vi } from "vitest";
import {
  dismissSurveyAutoOpen,
  getSurveyDismissStorageKey,
  isSurveyAutoOpenDismissed,
} from "@/lib/surveys/dismiss";

describe("survey dismiss storage", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("builds a stable storage key per slug", () => {
    expect(getSurveyDismissStorageKey("2027-reunion-interest")).toBe(
      "family_survey_dismissed_2027-reunion-interest",
    );
  });

  it("tracks whether auto-open has been dismissed", () => {
    expect(isSurveyAutoOpenDismissed("2027-reunion-interest")).toBe(false);
    dismissSurveyAutoOpen("2027-reunion-interest");
    expect(isSurveyAutoOpenDismissed("2027-reunion-interest")).toBe(true);
  });
});
