"use client";

import {
  type QueryClient,
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
  fetchSession,
  fetchSurveyResults,
  fetchSurveys,
  isUnauthorizedError,
  login,
  logout,
  type ParentsResponse,
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
import type { FamilyListResponse, FamilyMemberRecord } from "@/lib/types";

interface SessionResponse {
  authenticated: boolean;
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

export function useSessionQuery(
  initialAuthenticated?: boolean,
): UseQueryResult<SessionResponse, ApiError> {
  return useQuery({
    queryKey: familyKeys.session(),
    queryFn: fetchSession,
    ...(initialAuthenticated === undefined
      ? {}
      : {
          initialData: { authenticated: initialAuthenticated },
          staleTime: 0,
        }),
  });
}

async function fetchDirectory(
  queryClient: QueryClient,
): Promise<FamilyListResponse> {
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
}

export function useMembersQuery(
  authenticated: boolean,
): UseQueryResult<Pick<FamilyListResponse, "members" | "metadata">, ApiError> {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: familyKeys.members(),
    queryFn: () => fetchDirectory(queryClient),
    enabled: authenticated,
    select: (data) => ({
      members: data.members,
      metadata: data.metadata,
    }),
    throwOnError: false,
    retry: false,
  });
}

export function useParentsQuery(
  authenticated: boolean,
): UseQueryResult<ParentsResponse, ApiError> {
  const queryClient = useQueryClient();

  return useQuery({
    // Share the members cache so parents do not trigger a second directory fetch.
    queryKey: familyKeys.members(),
    queryFn: () => fetchDirectory(queryClient),
    enabled: authenticated,
    select: (data): ParentsResponse => ({
      fathers: data.fathers,
      mothers: data.mothers,
    }),
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
      await queryClient.invalidateQueries({ queryKey: familyKeys.members() });
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

export function useSaveMemberMutation(): UseMutationResult<
  FamilyMemberRecord,
  ApiError,
  FamilyMemberRecord
> {
  const queryClient = useQueryClient();
  const handleAuthError = useAuthErrorHandler();

  return useMutation<FamilyMemberRecord, ApiError, FamilyMemberRecord>({
    mutationFn: saveMember,
    onSuccess: async () => {
      // Members response includes parents; one invalidation refreshes both views.
      await queryClient.invalidateQueries({ queryKey: familyKeys.members() });
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
      await queryClient.invalidateQueries({ queryKey: familyKeys.members() });
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
