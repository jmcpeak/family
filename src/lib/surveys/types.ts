import type { z } from "zod";

export const SURVEY_SLUGS = ["2027-reunion-interest"] as const;

export type SurveySlug = (typeof SURVEY_SLUGS)[number];

export const ATTENDANCE_LIKELIHOOD_VALUES = [
  "definitely",
  "likely",
  "maybe",
  "unlikely",
  "cannot-attend",
] as const;
export type AttendanceLikelihood =
  (typeof ATTENDANCE_LIKELIHOOD_VALUES)[number];

export const GOLF_INTEREST_VALUES = ["yes", "maybe", "no"] as const;
export type GolfInterest = (typeof GOLF_INTEREST_VALUES)[number];

export const GOLF_FORMAT_VALUES = [
  "morning-shotgun-luncheon",
  "afternoon-tee-times-dinner",
  "either",
  "no-golf",
] as const;
export type GolfFormatPreference = (typeof GOLF_FORMAT_VALUES)[number];

export const PONTOON_INTEREST_VALUES = ["yes", "maybe", "no"] as const;
export type PontoonInterest = (typeof PONTOON_INTEREST_VALUES)[number];

export interface ReunionInterestSurveyPayload {
  respondentName: string;
  attendanceLikelihood: AttendanceLikelihood;
  golfInterest: GolfInterest;
  golfFormatPreference: GolfFormatPreference;
  luncheonHeadcount: number;
  dinnerHeadcount: number;
  pontoonInterest: PontoonInterest;
  lodgingNeeded: boolean;
  lodgingDetails?: string;
  comments?: string;
}

export type SurveyPayloadBySlug = {
  "2027-reunion-interest": ReunionInterestSurveyPayload;
};

export type SurveySubmissionPayload = SurveyPayloadBySlug[SurveySlug];

export interface SurveyDefinition<TSlug extends SurveySlug = SurveySlug> {
  slug: TSlug;
  title: string;
  summary: string;
  durationMonths: number;
  schema: z.ZodType<SurveyPayloadBySlug[TSlug]>;
}

export interface SurveyActivationRecord {
  slug: SurveySlug;
  openedAt: number;
  closesAt: number;
}

export interface SurveyResponseRecord {
  id: string;
  slug: SurveySlug;
  createdAt: number;
  payload: SurveySubmissionPayload;
}

export type SurveyStatus = "active" | "past";

export interface SurveySummary {
  slug: SurveySlug;
  title: string;
  summary: string;
  status: SurveyStatus;
  openedAt: number;
  closesAt: number;
  path: string;
  completed: boolean;
}

export interface SurveysResponse {
  active: SurveySummary[];
  past: SurveySummary[];
}

export interface SurveySubmissionResponse {
  submitted: true;
  slug: SurveySlug;
  submittedAt: number;
  closesAt: number;
}
