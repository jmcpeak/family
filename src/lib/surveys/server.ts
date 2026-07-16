import crypto from "node:crypto";
import type { FamilyRepository } from "@/lib/data/repository";
import { isSurveyActive } from "@/lib/surveys/lifecycle";
import {
  buildSurveySummary,
  getSurveyDefinition,
  isSurveySlug,
  listSurveyDefinitions,
  parseSurveyPayload,
  reunionInterestChoiceLabels,
  splitSurveySummaries,
} from "@/lib/surveys/registry";
import type {
  SurveyChoiceCount,
  SurveyResultsResponse,
  SurveySlug,
  SurveySubmissionPayload,
  SurveySubmissionResponse,
  SurveysResponse,
} from "@/lib/surveys/types";
import {
  ATTENDANCE_LIKELIHOOD_VALUES,
  GOLF_FORMAT_VALUES,
  GOLF_INTEREST_VALUES,
  PONTOON_INTEREST_VALUES,
} from "@/lib/surveys/types";

interface BuildSurveyResponseArgs {
  repository: FamilyRepository;
  nowMs: number;
  isCompleted: (slug: SurveySlug) => boolean;
}

interface SurveyDuplicateCheckArgs {
  repository: FamilyRepository;
  slug: SurveySlug;
  respondentName: string;
}

interface BuildSurveyResultsResponseArgs {
  repository: FamilyRepository;
  slug: SurveySlug;
}

export interface SubmitSurveyResponseArgs {
  repository: FamilyRepository;
  slug: string;
  body: unknown;
  nowMs: number;
  alreadyCompleted: boolean;
}

export type SubmitSurveyResponseResult =
  | ({ ok: true } & SurveySubmissionResponse)
  | {
      ok: false;
      reason:
        | "not_found"
        | "closed"
        | "already_completed"
        | "invalid_payload"
        | "duplicate_respondent";
    };

function normalizeRespondentName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function buildChoiceCounts<TValue extends string>(
  responses: Array<{ payload: SurveySubmissionPayload }>,
  values: readonly TValue[],
  labels: Record<TValue, string>,
  selectValue: (payload: SurveySubmissionPayload) => TValue,
): SurveyChoiceCount<TValue>[] {
  const counts = new Map<TValue, number>(values.map((value) => [value, 0]));

  for (const response of responses) {
    const value = selectValue(response.payload);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return values.map((value) => ({
    value,
    label: labels[value],
    count: counts.get(value) ?? 0,
  }));
}

export async function buildSurveysResponse({
  repository,
  nowMs,
  isCompleted,
}: BuildSurveyResponseArgs): Promise<SurveysResponse> {
  const definitions = listSurveyDefinitions();
  const activations = await Promise.all(
    definitions.map((definition) =>
      repository.ensureSurveyActivation(
        definition.slug,
        definition.durationMonths,
        nowMs,
      ),
    ),
  );
  const summaries = activations.map((activation) =>
    buildSurveySummary(activation, isCompleted(activation.slug), nowMs),
  );
  return splitSurveySummaries(summaries);
}

async function hasDuplicateSurveyRespondent({
  repository,
  slug,
  respondentName,
}: SurveyDuplicateCheckArgs): Promise<boolean> {
  const normalized = normalizeRespondentName(respondentName);
  if (!normalized) {
    return false;
  }

  const responses = await repository.listSurveyResponses(slug);
  return responses.some((response) => {
    const existing = response.payload.respondentName;
    return normalizeRespondentName(existing) === normalized;
  });
}

export async function submitSurveyResponse({
  repository,
  slug,
  body,
  nowMs,
  alreadyCompleted,
}: SubmitSurveyResponseArgs): Promise<SubmitSurveyResponseResult> {
  if (!isSurveySlug(slug)) {
    return { ok: false, reason: "not_found" };
  }

  const definition = getSurveyDefinition(slug);
  if (!definition) {
    return { ok: false, reason: "not_found" };
  }

  const activation = await repository.ensureSurveyActivation(
    slug,
    definition.durationMonths,
    nowMs,
  );

  if (!isSurveyActive(activation, nowMs)) {
    return { ok: false, reason: "closed" };
  }

  if (alreadyCompleted) {
    return { ok: false, reason: "already_completed" };
  }

  const parsed = parseSurveyPayload(slug, body);
  if (!parsed) {
    return { ok: false, reason: "invalid_payload" };
  }

  const duplicateRespondent = await hasDuplicateSurveyRespondent({
    repository,
    slug,
    respondentName: parsed.respondentName,
  });
  if (duplicateRespondent) {
    return { ok: false, reason: "duplicate_respondent" };
  }

  await repository.createSurveyResponse({
    id: `survey#${slug}#response#${crypto.randomUUID()}`,
    slug,
    createdAt: nowMs,
    payload: parsed,
  });

  return {
    ok: true,
    submitted: true,
    slug,
    submittedAt: nowMs,
    closesAt: activation.closesAt,
  };
}

export async function buildSurveyResultsResponse({
  repository,
  slug,
}: BuildSurveyResultsResponseArgs): Promise<SurveyResultsResponse> {
  const definition = getSurveyDefinition(slug);
  if (!definition) {
    throw new Error(`Unknown survey slug: ${slug}`);
  }

  const responses = await repository.listSurveyResponses(slug);
  const sortedResponses = [...responses].sort(
    (a, b) => b.createdAt - a.createdAt,
  );

  const totals = {
    attendanceLikelihood: buildChoiceCounts(
      sortedResponses,
      ATTENDANCE_LIKELIHOOD_VALUES,
      reunionInterestChoiceLabels.attendanceLikelihood,
      (payload) => payload.attendanceLikelihood,
    ),
    golfInterest: buildChoiceCounts(
      sortedResponses,
      GOLF_INTEREST_VALUES,
      reunionInterestChoiceLabels.golfInterest,
      (payload) => payload.golfInterest,
    ),
    golfFormatPreference: buildChoiceCounts(
      sortedResponses,
      GOLF_FORMAT_VALUES,
      reunionInterestChoiceLabels.golfFormatPreference,
      (payload) => payload.golfFormatPreference,
    ),
    pontoonInterest: buildChoiceCounts(
      sortedResponses,
      PONTOON_INTEREST_VALUES,
      reunionInterestChoiceLabels.pontoonInterest,
      (payload) => payload.pontoonInterest,
    ),
    lodgingNeededCount: sortedResponses.filter(
      (response) => response.payload.lodgingNeeded,
    ).length,
    lodgingNotNeededCount: sortedResponses.filter(
      (response) => !response.payload.lodgingNeeded,
    ).length,
    luncheonHeadcountTotal: sortedResponses.reduce(
      (total, response) => total + response.payload.luncheonHeadcount,
      0,
    ),
    dinnerHeadcountTotal: sortedResponses.reduce(
      (total, response) => total + response.payload.dinnerHeadcount,
      0,
    ),
  };

  return {
    slug,
    title: definition.title,
    responseCount: sortedResponses.length,
    totals,
    responses: sortedResponses,
  };
}
