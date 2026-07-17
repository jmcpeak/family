"use client";

import {
  type UseMutationResult,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ApiError,
  deleteMember,
  fetchMembers,
  fetchParents,
  fetchSession,
  fetchSurveyResults,
  fetchSurveys,
  isUnauthorizedError,
  login,
  logout,
  saveMember,
  submitSurvey,
} from "@/lib/queries/family-api";
import { familyKeys } from "@/lib/queries/query-keys";
import type {
  SurveyResultsResponse,
  SurveySlug,
  SurveySubmissionPayload,
  SurveySubmissionResponse,
  SurveysResponse,
} from "@/lib/surveys";
import type {
  FamilyListResponse,
  FamilyMemberRecord,
  ParentOption,
} from "@/lib/types";

interface SessionResponse {
  authenticated: boolean;
}

interface ParentsResponse {
  fathers: ParentOption[];
  mothers: ParentOption[];
}

function useAuthErrorHandler(): (error: unknown) => void {
  const queryClient = useQueryClient();

  return (error: unknown): void => {
    if (isUnauthorizedError(error)) {
      queryClient.setQueryData<SessionResponse>(familyKeys.session(), {
        authenticated: false,
      });
    }
  };
}

export function useSessionQuery(): UseQueryResult<SessionResponse, ApiError> {
  return useQuery({
    queryKey: familyKeys.session(),
    queryFn: fetchSession,
  });
}

export function useMembersQuery(
  authenticated: boolean,
): UseQueryResult<FamilyListResponse, ApiError> {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: familyKeys.members(),
    queryFn: async () => {
      try {
        return await fetchMembers();
      } catch (error) {
        if (isUnauthorizedError(error)) {
          queryClient.setQueryData<SessionResponse>(familyKeys.session(), {
            authenticated: false,
          });
        }
        throw error;
      }
    },
    enabled: authenticated,
    throwOnError: false,
    retry: false,
  });
}

export function useParentsQuery(
  authenticated: boolean,
): UseQueryResult<ParentsResponse, ApiError> {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: familyKeys.parents(),
    queryFn: async () => {
      try {
        return await fetchParents();
      } catch (error) {
        if (isUnauthorizedError(error)) {
          queryClient.setQueryData<SessionResponse>(familyKeys.session(), {
            authenticated: false,
          });
        }
        throw error;
      }
    },
    enabled: authenticated,
    throwOnError: false,
    retry: false,
  });
}

export function useLoginMutation(): UseMutationResult<
  SessionResponse,
  ApiError,
  string
> {
  const queryClient = useQueryClient();

  return useMutation<SessionResponse, ApiError, string>({
    mutationFn: login,
    onSuccess: async (session) => {
      queryClient.setQueryData<SessionResponse>(familyKeys.session(), session);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: familyKeys.members() }),
        queryClient.invalidateQueries({ queryKey: familyKeys.parents() }),
      ]);
    },
  });
}

export function useLogoutMutation(): UseMutationResult<
  SessionResponse,
  ApiError,
  void
> {
  const queryClient = useQueryClient();

  return useMutation<SessionResponse, ApiError, void>({
    mutationFn: logout,
    onSuccess: (session) => {
      queryClient.clear();
      queryClient.setQueryData<SessionResponse>(familyKeys.session(), session);
    },
  });
}

function parentsListNeedsRefresh(
  previous: FamilyMemberRecord | undefined,
  saved: FamilyMemberRecord,
): boolean {
  if (!previous) {
    return saved.gender === "m" || saved.gender === "f";
  }

  return (
    previous.gender !== saved.gender ||
    previous.firstName !== saved.firstName ||
    previous.lastName !== saved.lastName
  );
}

export function useSaveMemberMutation(): UseMutationResult<
  FamilyMemberRecord,
  ApiError,
  FamilyMemberRecord
> {
  const queryClient = useQueryClient();
  const handleAuthError = useAuthErrorHandler();

  return useMutation<FamilyMemberRecord, ApiError, FamilyMemberRecord>({
    mutationFn: saveMember,
    onSuccess: async (saved) => {
      const membersCache = queryClient.getQueryData<FamilyListResponse>(
        familyKeys.members(),
      );
      const previous = membersCache?.members.find(
        (member) => member.id === saved.id,
      );
      const refreshParents = parentsListNeedsRefresh(previous, saved);

      await queryClient.invalidateQueries({ queryKey: familyKeys.members() });
      if (refreshParents) {
        await queryClient.invalidateQueries({ queryKey: familyKeys.parents() });
      }
    },
    onError: handleAuthError,
  });
}

export function useDeleteMemberMutation(): UseMutationResult<
  { deleted: boolean },
  ApiError,
  string
> {
  const queryClient = useQueryClient();
  const handleAuthError = useAuthErrorHandler();

  return useMutation<{ deleted: boolean }, ApiError, string>({
    mutationFn: deleteMember,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: familyKeys.members() }),
        queryClient.invalidateQueries({ queryKey: familyKeys.parents() }),
      ]);
    },
    onError: handleAuthError,
  });
}

export function useSurveysQuery(
  authenticated: boolean,
): UseQueryResult<SurveysResponse, ApiError> {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: familyKeys.surveys(),
    queryFn: async () => {
      try {
        return await fetchSurveys();
      } catch (error) {
        if (isUnauthorizedError(error)) {
          queryClient.setQueryData<SessionResponse>(familyKeys.session(), {
            authenticated: false,
          });
        }
        throw error;
      }
    },
    enabled: authenticated,
    throwOnError: false,
    retry: false,
  });
}

export function useSubmitSurveyMutation(): UseMutationResult<
  SurveySubmissionResponse,
  ApiError,
  { slug: SurveySlug; payload: SurveySubmissionPayload }
> {
  const queryClient = useQueryClient();
  const handleAuthError = useAuthErrorHandler();

  return useMutation<
    SurveySubmissionResponse,
    ApiError,
    { slug: SurveySlug; payload: SurveySubmissionPayload }
  >({
    mutationFn: ({ slug, payload }) => submitSurvey(slug, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: familyKeys.surveys() });
    },
    onError: handleAuthError,
  });
}

export function useSurveyResultsQuery(
  authenticated: boolean,
  slug: SurveySlug | null,
): UseQueryResult<SurveyResultsResponse, ApiError> {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: familyKeys.surveyResults(slug),
    queryFn: async () => {
      if (!slug) {
        throw new ApiError("Survey not found.", 404);
      }

      try {
        return await fetchSurveyResults(slug);
      } catch (error) {
        if (isUnauthorizedError(error)) {
          queryClient.setQueryData<SessionResponse>(familyKeys.session(), {
            authenticated: false,
          });
        }
        throw error;
      }
    },
    enabled: authenticated && Boolean(slug),
    throwOnError: false,
    retry: false,
  });
}
