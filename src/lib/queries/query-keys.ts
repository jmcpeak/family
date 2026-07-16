import type { SurveySlug } from "@/lib/surveys";

export const familyKeys = {
  all: ["family"] as const,
  session: () => [...familyKeys.all, "session"] as const,
  members: () => [...familyKeys.all, "members"] as const,
  parents: () => [...familyKeys.all, "parents"] as const,
  surveys: () => [...familyKeys.all, "surveys"] as const,
  surveyResults: (slug: SurveySlug | null) =>
    [...familyKeys.surveys(), "results", slug] as const,
};
