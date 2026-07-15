import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-guard";
import { handleApiError } from "@/lib/api-observability";
import { getFamilyRepository } from "@/lib/data";
import { getSurveyCompletionCookieName } from "@/lib/surveys/cookies";
import { buildSurveysResponse } from "@/lib/surveys/server";

export async function GET(): Promise<NextResponse> {
  try {
    const unauthorized = await requireSession();
    if (unauthorized) {
      return unauthorized;
    }

    const nowMs = Date.now();
    const cookieStore = await cookies();
    const repository = getFamilyRepository();
    const response = await buildSurveysResponse({
      repository,
      nowMs,
      isCompleted: (slug) =>
        cookieStore.get(getSurveyCompletionCookieName(slug))?.value === "1",
    });

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError({ route: "/api/surveys", method: "GET" }, error);
  }
}
