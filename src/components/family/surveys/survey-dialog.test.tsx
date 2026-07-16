import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SurveyDialog } from "@/components/family/surveys/survey-dialog";
import type { SurveySummary } from "@/lib/surveys";

function createSurveySummary(overrides: Partial<SurveySummary>): SurveySummary {
  return {
    slug: "2027-reunion-interest",
    title: "2027 Family Reunion Interest Survey",
    summary: "Help us plan reunion activities.",
    status: "active",
    openedAt: 1000,
    closesAt: 2000,
    path: "/surveys/2027-reunion-interest",
    completed: false,
    ...overrides,
  };
}

describe("SurveyDialog", () => {
  it("submits active survey payloads", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <SurveyDialog
        open
        loading={false}
        survey={createSurveySummary({})}
        submitting={false}
        submitError={null}
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: /your name/i }), {
      target: { value: "Jordan McPeak" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit survey" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      "2027-reunion-interest",
      expect.objectContaining({
        respondentName: "Jordan McPeak",
        luncheonHeadcount: 0,
        dinnerHeadcount: 0,
      }),
    );
  });

  it("closes with dontAskAgain when the checkbox is checked", () => {
    const onClose = vi.fn();
    render(
      <SurveyDialog
        open
        loading={false}
        survey={createSurveySummary({})}
        submitting={false}
        submitError={null}
        onSubmit={vi.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: /don't ask again/i }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledWith({ dontAskAgain: true });
  });

  it("shows closed-state messaging for past surveys", () => {
    render(
      <SurveyDialog
        open
        loading={false}
        survey={createSurveySummary({
          status: "past",
          completed: true,
        })}
        submitting={false}
        submitError={null}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText(/This survey has closed/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Submit survey" })).toBeNull();
  });
});
