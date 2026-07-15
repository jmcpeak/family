import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-guard";
import { handleApiError } from "@/lib/api-observability";
import { getFamilyRepository } from "@/lib/data";
import {
  getSurveyDefinition,
  isSurveyActive,
  isSurveySlug,
  parseSurveyPayload,
} from "@/lib/surveys";
import {
  applySurveyCompletionCookie,
  getSurveyCompletionCookieName,
} from "@/lib/surveys/cookies";
import { hasDuplicateSurveyRespondent } from "@/lib/surveys/server";

interface RouteContext {
  params: Promise<{ slug: string }>;
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
    if (!isSurveySlug(slug)) {
      return NextResponse.json({ error: "Survey not found." }, { status: 404 });
    }

    const definition = getSurveyDefinition(slug);
    if (!definition) {
      return NextResponse.json({ error: "Survey not found." }, { status: 404 });
    }

    const nowMs = Date.now();
    const repository = getFamilyRepository();
    const activation = await repository.ensureSurveyActivation(
      slug,
      definition.durationMonths,
      nowMs,
    );

    if (!isSurveyActive(activation, nowMs)) {
      return NextResponse.json(
        { error: "This survey has closed." },
        { status: 410 },
      );
    }

    const cookieStore = await cookies();
    if (cookieStore.get(getSurveyCompletionCookieName(slug))?.value === "1") {
      return NextResponse.json(
        { error: "This survey has already been submitted on this browser." },
        { status: 409 },
      );
    }

    const payload = await request.json().catch(() => null);
    const parsed = parseSurveyPayload(slug, payload);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid survey payload." },
        { status: 400 },
      );
    }

    const duplicateRespondent = await hasDuplicateSurveyRespondent({
      repository,
      slug,
      respondentName: parsed.respondentName,
    });
    if (duplicateRespondent) {
      return NextResponse.json(
        { error: "A response for this respondent has already been submitted." },
        { status: 409 },
      );
    }

    await repository.createSurveyResponse({
      id: `survey#${slug}#response#${crypto.randomUUID()}`,
      slug,
      createdAt: nowMs,
      payload: parsed,
    });

    const response = NextResponse.json({
      submitted: true,
      slug,
      submittedAt: nowMs,
      closesAt: activation.closesAt,
    });
    applySurveyCompletionCookie(response, slug, activation.closesAt, nowMs);
    return response;
  } catch (error) {
    return handleApiError(
      { route: "/api/surveys/[slug]", method: "POST" },
      error,
    );
  }
}
