import type { NextResponse } from "next/server";
import { SURVEY_COMPLETION_COOKIE_PREFIX } from "@/lib/constants";
import type { SurveySlug } from "@/lib/surveys/types";

export function getSurveyCompletionCookieName(slug: SurveySlug): string {
  return `${SURVEY_COMPLETION_COOKIE_PREFIX}${slug}`;
}

export function buildSurveyCompletionCookieOptions(
  closesAt: number,
  nowMs: number,
): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge: number;
  expires: Date;
} {
  const maxAgeSeconds = Math.max(1, Math.floor((closesAt - nowMs) / 1000));
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
    expires: new Date(closesAt),
  };
}

export function applySurveyCompletionCookie(
  response: NextResponse,
  slug: SurveySlug,
  closesAt: number,
  nowMs: number,
): void {
  response.cookies.set({
    name: getSurveyCompletionCookieName(slug),
    value: "1",
    ...buildSurveyCompletionCookieOptions(closesAt, nowMs),
  });
}
