import { z } from "zod";
import { SURVEY_BASE_PATH } from "@/lib/constants";
import type {
  SurveyActivationRecord,
  SurveyDefinition,
  SurveySlug,
  SurveySummary,
  SurveysResponse,
} from "@/lib/surveys/types";
import {
  ATTENDANCE_LIKELIHOOD_VALUES,
  GOLF_FORMAT_VALUES,
  GOLF_INTEREST_VALUES,
  PONTOON_INTEREST_VALUES,
  type ReunionInterestSurveyPayload,
  SURVEY_SLUGS,
} from "@/lib/surveys/types";

const reunionInterestSchema = z.object({
  respondentName: z.string().trim().min(1).max(120),
  attendanceLikelihood: z.enum(ATTENDANCE_LIKELIHOOD_VALUES),
  golfInterest: z.enum(GOLF_INTEREST_VALUES),
  golfFormatPreference: z.enum(GOLF_FORMAT_VALUES),
  luncheonHeadcount: z.number().int().min(0).max(40),
  dinnerHeadcount: z.number().int().min(0).max(40),
  pontoonInterest: z.enum(PONTOON_INTEREST_VALUES),
  lodgingNeeded: z.boolean(),
  lodgingDetails: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  comments: z
    .string()
    .trim()
    .max(1500)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});

export const reunionInterestChoiceLabels = {
  attendanceLikelihood: {
    definitely: "Definitely attending",
    likely: "Likely attending",
    maybe: "Maybe attending",
    unlikely: "Unlikely attending",
    "cannot-attend": "Cannot attend",
  },
  golfInterest: {
    yes: "Yes",
    maybe: "Maybe",
    no: "No",
  },
  golfFormatPreference: {
    "morning-shotgun-luncheon": "Morning shotgun start + luncheon",
    "afternoon-tee-times-dinner": "12:00/1:00 PM tee times + dinner",
    either: "Either golf option works",
    "no-golf": "No golf for me",
  },
  pontoonInterest: {
    yes: "Yes",
    maybe: "Maybe",
    no: "No",
  },
} as const;

const surveyDefinitions = {
  "2027-reunion-interest": {
    slug: "2027-reunion-interest",
    title: "2027 Family Reunion Interest Survey",
    summary:
      "Help us estimate turnout and activities for a golf outing, luncheon/dinner, and Eagle River plans.",
    durationMonths: 3,
    schema: reunionInterestSchema,
  },
} as const satisfies Record<
  SurveySlug,
  SurveyDefinition<"2027-reunion-interest">
>;

const slugSet = new Set<string>(SURVEY_SLUGS);

export function isSurveySlug(value: string): value is SurveySlug {
  return slugSet.has(value);
}

export function getSurveyDefinition(
  slug: SurveySlug,
): SurveyDefinition<"2027-reunion-interest">;
export function getSurveyDefinition(slug: string): SurveyDefinition | null;
export function getSurveyDefinition(slug: string): SurveyDefinition | null {
  if (!isSurveySlug(slug)) {
    return null;
  }
  return surveyDefinitions[slug];
}

export function listSurveyDefinitions(): SurveyDefinition[] {
  return SURVEY_SLUGS.map((slug) => surveyDefinitions[slug]);
}

export function getSurveyPath(slug: SurveySlug): string {
  return `${SURVEY_BASE_PATH}/${encodeURIComponent(slug)}`;
}

export function parseSurveySlugFromPathname(
  pathname: string,
): SurveySlug | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 2 || segments[0] !== "surveys") {
    return null;
  }

  try {
    const decodedSlug = decodeURIComponent(segments[1]);
    return isSurveySlug(decodedSlug) ? decodedSlug : null;
  } catch {
    return null;
  }
}

export function parseSurveyPayload(
  slug: SurveySlug,
  payload: unknown,
): ReunionInterestSurveyPayload | null {
  const definition = getSurveyDefinition(slug);
  if (!definition) {
    return null;
  }
  const parsed = definition.schema.safeParse(payload);
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
}

export function buildSurveySummary(
  activation: SurveyActivationRecord,
  completed: boolean,
  nowMs: number,
): SurveySummary {
  const definition = getSurveyDefinition(activation.slug);
  if (!definition) {
    throw new Error(`Unknown survey slug: ${activation.slug}`);
  }

  return {
    slug: definition.slug,
    title: definition.title,
    summary: definition.summary,
    status: activation.closesAt >= nowMs ? "active" : "past",
    openedAt: activation.openedAt,
    closesAt: activation.closesAt,
    path: getSurveyPath(definition.slug),
    completed,
  };
}

export function splitSurveySummaries(
  surveys: SurveySummary[],
): SurveysResponse {
  const active = surveys
    .filter((survey) => survey.status === "active")
    .sort((a, b) => a.closesAt - b.closesAt);
  const past = surveys
    .filter((survey) => survey.status === "past")
    .sort((a, b) => b.closesAt - a.closesAt);

  return { active, past };
}
