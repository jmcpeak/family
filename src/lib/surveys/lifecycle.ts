import type { SurveyActivationRecord } from "@/lib/surveys/types";

export function addCalendarMonths(timestampMs: number, months: number): number {
  const date = new Date(timestampMs);
  date.setMonth(date.getMonth() + months);
  return date.getTime();
}

export function isSurveyActive(
  activation: SurveyActivationRecord,
  nowMs: number,
): boolean {
  return activation.closesAt >= nowMs;
}
