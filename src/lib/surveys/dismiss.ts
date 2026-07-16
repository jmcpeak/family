import { SURVEY_DISMISS_STORAGE_PREFIX } from "@/lib/constants";
import type { SurveySlug } from "@/lib/surveys/types";

export function getSurveyDismissStorageKey(slug: SurveySlug): string {
  return `${SURVEY_DISMISS_STORAGE_PREFIX}${slug}`;
}

export function isSurveyAutoOpenDismissed(slug: SurveySlug): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return (
      window.localStorage.getItem(getSurveyDismissStorageKey(slug)) === "1"
    );
  } catch {
    return false;
  }
}

export function dismissSurveyAutoOpen(slug: SurveySlug): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(getSurveyDismissStorageKey(slug), "1");
  } catch {
    // Ignore storage failures (private mode / quota); close still works.
  }
}
