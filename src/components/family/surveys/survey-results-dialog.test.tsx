import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SurveyResultsDialog } from "@/components/family/surveys/survey-results-dialog";
import type { SurveyResultsResponse } from "@/lib/surveys";

function createResults(): SurveyResultsResponse {
  return {
    slug: "2027-reunion-interest",
    title: "2027 Family Reunion Interest Survey",
    responseCount: 1,
    totals: {
      attendanceLikelihood: [
        { value: "definitely", label: "Definitely attending", count: 1 },
        { value: "likely", label: "Likely attending", count: 0 },
        { value: "maybe", label: "Maybe attending", count: 0 },
        { value: "unlikely", label: "Unlikely attending", count: 0 },
        { value: "cannot-attend", label: "Cannot attend", count: 0 },
      ],
      golfInterest: [
        { value: "yes", label: "Yes", count: 1 },
        { value: "maybe", label: "Maybe", count: 0 },
        { value: "no", label: "No", count: 0 },
      ],
      golfFormatPreference: [
        {
          value: "morning-shotgun-luncheon",
          label: "Morning shotgun start + luncheon",
          count: 1,
        },
        {
          value: "afternoon-tee-times-dinner",
          label: "12:00/1:00 PM tee times + dinner",
          count: 0,
        },
        { value: "either", label: "Either golf option works", count: 0 },
        { value: "no-golf", label: "No golf for me", count: 0 },
      ],
      pontoonInterest: [
        { value: "yes", label: "Yes", count: 1 },
        { value: "maybe", label: "Maybe", count: 0 },
        { value: "no", label: "No", count: 0 },
      ],
      lodgingNeededCount: 1,
      lodgingNotNeededCount: 0,
      luncheonHeadcountTotal: 2,
      dinnerHeadcountTotal: 3,
    },
    responses: [
      {
        id: "survey#2027-reunion-interest#response#1",
        slug: "2027-reunion-interest",
        createdAt: 123,
        payload: {
          respondentName: "Jordan McPeak",
          attendanceLikelihood: "definitely",
          golfInterest: "yes",
          golfFormatPreference: "morning-shotgun-luncheon",
          luncheonHeadcount: 2,
          dinnerHeadcount: 3,
          pontoonInterest: "yes",
          lodgingNeeded: true,
          lodgingDetails: "Near the lake",
          comments: "See everyone there",
        },
      },
    ],
  };
}

describe("SurveyResultsDialog", () => {
  it("renders aggregate totals and response rows", () => {
    render(
      <SurveyResultsDialog
        open
        loading={false}
        surveySlug="2027-reunion-interest"
        results={createResults()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Responses: 1")).toBeTruthy();
    expect(screen.getByText("Jordan McPeak")).toBeTruthy();
    expect(screen.getByText("Morning shotgun start + luncheon")).toBeTruthy();
    expect(screen.getByText("Near the lake")).toBeTruthy();
  });
});
