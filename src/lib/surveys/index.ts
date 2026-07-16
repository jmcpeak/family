export {
  applySurveyCompletionCookie,
  getSurveyCompletionCookieName,
} from "@/lib/surveys/cookies";
export { addCalendarMonths, isSurveyActive } from "@/lib/surveys/lifecycle";
export {
  buildSurveySummary,
  getSurveyDefinition,
  getSurveyPath,
  getSurveyResultsPath,
  isSurveySlug,
  listSurveyDefinitions,
  parseSurveyPayload,
  parseSurveyResultsSlugFromPathname,
  parseSurveySlugFromPathname,
  reunionInterestChoiceLabels,
  splitSurveySummaries,
} from "@/lib/surveys/registry";
export type {
  AttendanceLikelihood,
  GolfFormatPreference,
  GolfInterest,
  PontoonInterest,
  ReunionInterestSurveyPayload,
  SurveyChoiceCount,
  SurveyActivationRecord,
  SurveyDefinition,
  SurveyResultsResponse,
  SurveyResultsTotals,
  SurveyResponseRecord,
  SurveySlug,
  SurveySubmissionPayload,
  SurveySubmissionResponse,
  SurveySummary,
  SurveysResponse,
} from "@/lib/surveys/types";
