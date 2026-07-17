import { cleanMemberRecord, sortMembers } from "@/lib/member-utils";
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

export interface ParentsResponse {
  fathers: ParentOption[];
  mothers: ParentOption[];
}

interface ErrorResponse {
  error?: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function requestJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    const payload = (await response
      .json()
      .catch(() => null)) as ErrorResponse | null;
    throw new ApiError(
      payload?.error ?? `Request failed with status ${response.status}.`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export async function fetchSession(): Promise<SessionResponse> {
  return requestJson<SessionResponse>("/api/auth/session");
}

export async function fetchMembers(): Promise<FamilyListResponse> {
  const response = await requestJson<FamilyListResponse>("/api/members");
  return {
    ...response,
    members: sortMembers(response.members),
  };
}

export async function fetchParents(): Promise<ParentsResponse> {
  const [fathers, mothers] = await Promise.all([
    requestJson<ParentOption[]>("/api/parents?gender=m"),
    requestJson<ParentOption[]>("/api/parents?gender=f"),
  ]);

  return {
    fathers: [{ id: "", firstName: "", lastName: "" }, ...fathers],
    mothers: [{ id: "", firstName: "", lastName: "" }, ...mothers],
  };
}

export async function login(answer: string): Promise<SessionResponse> {
  return requestJson<SessionResponse>("/api/auth/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ answer }),
  });
}

export async function logout(): Promise<SessionResponse> {
  return requestJson<SessionResponse>("/api/auth/logout", {
    method: "POST",
  });
}

export async function saveMember(
  member: FamilyMemberRecord,
): Promise<FamilyMemberRecord> {
  return requestJson<FamilyMemberRecord>(`/api/members/${member.id}`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(cleanMemberRecord(member)),
  });
}

export async function deleteMember(id: string): Promise<{ deleted: boolean }> {
  return requestJson<{ deleted: boolean }>(`/api/members/${id}`, {
    method: "DELETE",
  });
}

export async function fetchEmails(): Promise<{ emails: string[] }> {
  return requestJson<{ emails: string[] }>("/api/emails");
}

export async function fetchSurveys(): Promise<SurveysResponse> {
  return requestJson<SurveysResponse>("/api/surveys");
}

export async function submitSurvey(
  slug: SurveySlug,
  payload: SurveySubmissionPayload,
): Promise<SurveySubmissionResponse> {
  return requestJson<SurveySubmissionResponse>(
    `/api/surveys/${encodeURIComponent(slug)}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function fetchSurveyResults(
  slug: SurveySlug,
): Promise<SurveyResultsResponse> {
  return requestJson<SurveyResultsResponse>(
    `/api/surveys/${encodeURIComponent(slug)}`,
  );
}
