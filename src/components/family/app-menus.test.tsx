import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppMenus } from "@/components/family/app-menus";
import { MuiThemeProvider } from "@/components/mui-theme-provider";
import type { SurveySummary } from "@/lib/surveys";

function createSurveySummary(overrides: Partial<SurveySummary>): SurveySummary {
  return {
    slug: "2027-reunion-interest",
    title: "2027 Family Reunion Interest Survey",
    summary: "summary",
    status: "active",
    openedAt: 1000,
    closesAt: 2000,
    path: "/surveys/2027-reunion-interest",
    completed: false,
    ...overrides,
  };
}

function createAnchor(): HTMLButtonElement {
  const anchor = document.createElement("button");
  document.body.append(anchor);
  return anchor;
}

function renderMenus({
  activeSurveys,
  pastSurveys,
  surveysMenuAnchor,
  pastSurveysMenuAnchor,
}: {
  activeSurveys: SurveySummary[];
  pastSurveys: SurveySummary[];
  surveysMenuAnchor: HTMLElement | null;
  pastSurveysMenuAnchor: HTMLElement | null;
}): void {
  const moreAnchor = createAnchor();
  render(
    <MuiThemeProvider>
      <AppMenus
        showDeleteAction={false}
        selectedUser={false}
        deleting={false}
        moreMenuAnchor={moreAnchor}
        themeMenuAnchor={null}
        surveysMenuAnchor={surveysMenuAnchor}
        pastSurveysMenuAnchor={pastSurveysMenuAnchor}
        activeSurveys={activeSurveys}
        pastSurveys={pastSurveys}
        closeMoreMenu={vi.fn()}
        setThemeMenuAnchor={vi.fn()}
        setSurveysMenuAnchor={vi.fn()}
        setPastSurveysMenuAnchor={vi.fn()}
        onDeleteSelected={vi.fn()}
        onOpenEmailsDialog={vi.fn()}
        onExportMailingLabels={vi.fn()}
        onOpenSurvey={vi.fn()}
        onOpenAboutDialog={vi.fn()}
        onLogout={vi.fn()}
      />
    </MuiThemeProvider>,
  );
}

describe("AppMenus survey flyout", () => {
  it("hides past surveys submenu when there are no past surveys", () => {
    const surveysAnchor = createAnchor();
    renderMenus({
      activeSurveys: [createSurveySummary({ title: "Active survey" })],
      pastSurveys: [],
      surveysMenuAnchor: surveysAnchor,
      pastSurveysMenuAnchor: null,
    });

    expect(screen.getByText("Active survey")).toBeTruthy();
    expect(screen.queryByText("Past surveys")).toBeNull();
  });

  it("shows past surveys submenu when at least one past survey exists", () => {
    const surveysAnchor = createAnchor();
    const pastAnchor = createAnchor();
    renderMenus({
      activeSurveys: [createSurveySummary({ title: "Active survey" })],
      pastSurveys: [
        createSurveySummary({
          title: "Past survey",
          status: "past",
          closesAt: 900,
        }),
      ],
      surveysMenuAnchor: surveysAnchor,
      pastSurveysMenuAnchor: pastAnchor,
    });

    expect(screen.getByText("Past surveys")).toBeTruthy();
    expect(screen.getByText("Past survey")).toBeTruthy();
  });
});
