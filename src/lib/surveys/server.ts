import type { FamilyRepository } from "@/lib/data/repository";
import {
  buildSurveySummary,
  listSurveyDefinitions,
  splitSurveySummaries,
} from "@/lib/surveys/registry";
import type { SurveySlug, SurveysResponse } from "@/lib/surveys/types";

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

function normalizeRespondentName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
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

export async function hasDuplicateSurveyRespondent({
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
