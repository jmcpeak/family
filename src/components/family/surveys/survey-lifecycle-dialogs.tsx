"use client";

import {
  type SurveyCloseOptions,
  SurveyDialog,
} from "@/components/family/surveys/survey-dialog";
import { SurveyResultsDialog } from "@/components/family/surveys/survey-results-dialog";
import type {
  SurveyResultsResponse,
  SurveySlug,
  SurveySubmissionPayload,
  SurveySummary,
} from "@/lib/surveys";

interface SurveyLifecycleDialogsProps {
  surveyDialogOpen: boolean;
  surveyResultsDialogOpen: boolean;
  surveyLoading: boolean;
  surveyResultsLoading: boolean;
  selectedSurvey: SurveySummary | null;
  surveyResultsSlug: SurveySlug | null;
  surveyResults: SurveyResultsResponse | null;
  submitting: boolean;
  submitError: string | null;
  onSubmit: (
    slug: SurveySlug,
    payload: SurveySubmissionPayload,
  ) => Promise<void>;
  onCloseSurvey: (options?: SurveyCloseOptions) => void;
  onCloseSurveyResults: () => void;
}

export function SurveyLifecycleDialogs({
  surveyDialogOpen,
  surveyResultsDialogOpen,
  surveyLoading,
  surveyResultsLoading,
  selectedSurvey,
  surveyResultsSlug,
  surveyResults,
  submitting,
  submitError,
  onSubmit,
  onCloseSurvey,
  onCloseSurveyResults,
}: SurveyLifecycleDialogsProps): React.JSX.Element | null {
  if (!surveyDialogOpen && !surveyResultsDialogOpen) {
    return null;
  }

  return (
    <>
      {surveyDialogOpen ? (
        <SurveyDialog
          open={surveyDialogOpen}
          loading={surveyLoading}
          survey={selectedSurvey}
          submitting={submitting}
          submitError={submitError}
          onSubmit={onSubmit}
          onClose={onCloseSurvey}
        />
      ) : null}
      {surveyResultsDialogOpen ? (
        <SurveyResultsDialog
          open={surveyResultsDialogOpen}
          loading={surveyResultsLoading}
          surveySlug={surveyResultsSlug}
          results={surveyResults}
          onClose={onCloseSurveyResults}
        />
      ) : null}
    </>
  );
}
