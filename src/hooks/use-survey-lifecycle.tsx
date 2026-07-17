"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SurveyCloseOptions } from "@/components/family/surveys/survey-dialog";
import {
  useSubmitSurveyMutation,
  useSurveyResultsQuery,
  useSurveysQuery,
} from "@/hooks/use-family-data";
import {
  dismissSurveyAutoOpen,
  getSurveyPath,
  isSurveyAutoOpenDismissed,
  parseSurveyResultsSlugFromPathname,
  parseSurveySlugFromPathname,
  type SurveySlug,
  type SurveySubmissionPayload,
  type SurveySummary,
} from "@/lib/surveys";

const EMPTY_SURVEYS: SurveySummary[] = [];

const SurveyLifecycleDialogs = dynamic(
  () =>
    import("@/components/family/surveys/survey-lifecycle-dialogs").then(
      (module) => ({
        default: module.SurveyLifecycleDialogs,
      }),
    ),
  { ssr: false },
);

export interface UseSurveyLifecycleOptions {
  authenticated: boolean;
  onError: (message: string) => void;
  onClearError: () => void;
}

export interface UseSurveyLifecycleResult {
  openSurvey: (slug: SurveySlug) => void;
  activeSurveys: SurveySummary[];
  pastSurveys: SurveySummary[];
  dialogs: React.ReactNode;
}

export function useSurveyLifecycle({
  authenticated,
  onError,
  onClearError,
}: UseSurveyLifecycleOptions): UseSurveyLifecycleResult {
  const router = useRouter();
  const pathname = usePathname();
  const routeSurveySlug = useMemo(
    () => parseSurveySlugFromPathname(pathname),
    [pathname],
  );
  const routeSurveyResultsSlug = useMemo(
    () => parseSurveyResultsSlugFromPathname(pathname),
    [pathname],
  );

  const [surveySubmitError, setSurveySubmitError] = useState<string | null>(
    null,
  );
  const [surveyDialogOpen, setSurveyDialogOpen] = useState(false);
  const [surveyResultsDialogOpen, setSurveyResultsDialogOpen] = useState(false);
  const autoOpenedSurveySlugRef = useRef<SurveySlug | null>(null);

  const surveysQuery = useSurveysQuery(authenticated);
  const surveyResultsQuery = useSurveyResultsQuery(
    authenticated,
    routeSurveyResultsSlug,
  );
  const submitSurveyMutation = useSubmitSurveyMutation();

  const activeSurveys = surveysQuery.data?.active ?? EMPTY_SURVEYS;
  const pastSurveys = surveysQuery.data?.past ?? EMPTY_SURVEYS;
  const selectedSurvey = useMemo(
    () =>
      routeSurveySlug
        ? ([...activeSurveys, ...pastSurveys].find(
            (survey) => survey.slug === routeSurveySlug,
          ) ?? null)
        : null,
    [activeSurveys, pastSurveys, routeSurveySlug],
  );

  const openSurvey = useCallback(
    (slug: SurveySlug): void => {
      setSurveySubmitError(null);
      router.push(getSurveyPath(slug));
    },
    [router],
  );

  const closeSurvey = useCallback(
    (options?: SurveyCloseOptions): void => {
      setSurveySubmitError(null);
      if (routeSurveySlug) {
        autoOpenedSurveySlugRef.current = routeSurveySlug;
        if (options?.dontAskAgain) {
          dismissSurveyAutoOpen(routeSurveySlug);
        }
        setSurveyDialogOpen(false);
        router.replace("/");
        return;
      }
      setSurveyDialogOpen(false);
    },
    [routeSurveySlug, router],
  );

  const closeSurveyResults = useCallback((): void => {
    setSurveyResultsDialogOpen(false);
    if (routeSurveyResultsSlug) {
      router.replace("/");
    }
  }, [routeSurveyResultsSlug, router]);

  const submitSelectedSurvey = useCallback(
    async (
      slug: SurveySlug,
      payload: SurveySubmissionPayload,
    ): Promise<void> => {
      onClearError();
      setSurveySubmitError(null);
      try {
        await submitSurveyMutation.mutateAsync({ slug, payload });
        router.replace("/");
      } catch (caughtError) {
        const message =
          caughtError instanceof Error ? caughtError.message : "Unknown error";
        setSurveySubmitError(message);
        onError(message);
      }
    },
    [onClearError, onError, router, submitSurveyMutation],
  );

  useEffect(() => {
    if (!authenticated) {
      autoOpenedSurveySlugRef.current = null;
      return;
    }

    if (
      routeSurveySlug ||
      routeSurveyResultsSlug ||
      surveysQuery.isPending ||
      activeSurveys.length === 0
    ) {
      return;
    }

    const nextSurvey = activeSurveys.find((survey) => !survey.completed);
    if (!nextSurvey) {
      return;
    }

    if (isSurveyAutoOpenDismissed(nextSurvey.slug)) {
      autoOpenedSurveySlugRef.current = nextSurvey.slug;
      return;
    }

    if (autoOpenedSurveySlugRef.current === nextSurvey.slug) {
      return;
    }

    autoOpenedSurveySlugRef.current = nextSurvey.slug;
    openSurvey(nextSurvey.slug);
  }, [
    activeSurveys,
    authenticated,
    openSurvey,
    routeSurveyResultsSlug,
    routeSurveySlug,
    surveysQuery.isPending,
  ]);

  useEffect(() => {
    setSurveyDialogOpen(Boolean(routeSurveySlug));
  }, [routeSurveySlug]);

  useEffect(() => {
    setSurveyResultsDialogOpen(Boolean(routeSurveyResultsSlug));
  }, [routeSurveyResultsSlug]);

  useEffect(() => {
    if (routeSurveySlug) {
      autoOpenedSurveySlugRef.current = routeSurveySlug;
    }
  }, [routeSurveySlug]);

  useEffect(() => {
    const queryError = surveysQuery.error ?? surveyResultsQuery.error;
    if (queryError) {
      onError(queryError.message);
    }
  }, [onError, surveyResultsQuery.error, surveysQuery.error]);

  const dialogs = (
    <SurveyLifecycleDialogs
      surveyDialogOpen={surveyDialogOpen}
      surveyResultsDialogOpen={surveyResultsDialogOpen}
      surveyLoading={Boolean(routeSurveySlug) && surveysQuery.isPending}
      surveyResultsLoading={
        Boolean(routeSurveyResultsSlug) && surveyResultsQuery.isPending
      }
      selectedSurvey={selectedSurvey}
      surveyResultsSlug={routeSurveyResultsSlug}
      surveyResults={surveyResultsQuery.data ?? null}
      submitting={submitSurveyMutation.isPending}
      submitError={surveySubmitError}
      onSubmit={submitSelectedSurvey}
      onCloseSurvey={closeSurvey}
      onCloseSurveyResults={closeSurveyResults}
    />
  );

  return {
    openSurvey,
    activeSurveys,
    pastSurveys,
    dialogs,
  };
}
