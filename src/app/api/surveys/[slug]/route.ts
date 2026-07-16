import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-guard";
import { handleApiError } from "@/lib/api-observability";
import { getFamilyRepository } from "@/lib/data";
import { isSurveySlug } from "@/lib/surveys";
import {
  applySurveyCompletionCookie,
  getSurveyCompletionCookieName,
} from "@/lib/surveys/cookies";
import {
  buildSurveyResultsResponse,
  type SubmitSurveyResponseResult,
  submitSurveyResponse,
} from "@/lib/surveys/server";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

const SUBMIT_ERROR_BY_REASON: Record<
  Extract<SubmitSurveyResponseResult, { ok: false }>["reason"],
  { status: number; error: string }
> = {
  not_found: { status: 404, error: "Survey not found." },
  closed: { status: 410, error: "This survey has closed." },
  already_completed: {
    status: 409,
    error: "This survey has already been submitted on this browser.",
  },
  invalid_payload: { status: 400, error: "Invalid survey payload." },
  duplicate_respondent: {
    status: 409,
    error: "A response for this respondent has already been submitted.",
  },
};

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const unauthorized = await requireSession();
    if (unauthorized) {
      return unauthorized;
    }

    const { slug } = await context.params;
    if (!isSurveySlug(slug)) {
      return NextResponse.json({ error: "Survey not found." }, { status: 404 });
    }

    const repository = getFamilyRepository();
    const results = await buildSurveyResultsResponse({ repository, slug });
    return NextResponse.json(results);
  } catch (error) {
    return handleApiError(
      { route: "/api/surveys/[slug]", method: "GET" },
      error,
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const unauthorized = await requireSession();
    if (unauthorized) {
      return unauthorized;
    }

    const { slug } = await context.params;
    const cookieStore = await cookies();
    const alreadyCompleted =
      isSurveySlug(slug) &&
      cookieStore.get(getSurveyCompletionCookieName(slug))?.value === "1";
    const body = await request.json().catch(() => null);
    const repository = getFamilyRepository();
    const result = await submitSurveyResponse({
      repository,
      slug,
      body,
      nowMs: Date.now(),
      alreadyCompleted,
    });

    if (!result.ok) {
      const mapped = SUBMIT_ERROR_BY_REASON[result.reason];
      return NextResponse.json(
        { error: mapped.error },
        { status: mapped.status },
      );
    }

    const response = NextResponse.json({
      submitted: result.submitted,
      slug: result.slug,
      submittedAt: result.submittedAt,
      closesAt: result.closesAt,
    });
    applySurveyCompletionCookie(
      response,
      result.slug,
      result.closesAt,
      result.submittedAt,
    );
    return response;
  } catch (error) {
    return handleApiError(
      { route: "/api/surveys/[slug]", method: "POST" },
      error,
    );
  }
}
