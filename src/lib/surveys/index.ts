export {
  applySurveyCompletionCookie,
  getSurveyCompletionCookieName,
} from "@/lib/surveys/cookies";
export { addCalendarMonths, isSurveyActive } from "@/lib/surveys/lifecycle";
export {
  buildSurveySummary,
  getSurveyDefinition,
  getSurveyPath,
  isSurveySlug,
  listSurveyDefinitions,
  parseSurveyPayload,
  parseSurveySlugFromPathname,
  reunionInterestChoiceLabels,
  splitSurveySummaries,
} from "@/lib/surveys/registry";
export type {
  ReunionInterestSurveyPayload,
  SurveyActivationRecord,
  SurveyDefinition,
  SurveyResponseRecord,
  SurveySlug,
  SurveySubmissionPayload,
  SurveySubmissionResponse,
  SurveySummary,
  SurveysResponse,
} from "@/lib/surveys/types";
