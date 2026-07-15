import { NextResponse } from "next/server";
import {
  InvalidMemberRecordError,
  MemberNotFoundError,
} from "@/lib/data/repository";

interface RouteContext {
  route: string;
  method: string;
}

interface ErrorOutcome {
  status: number;
  message: string;
}

function classifyError(error: unknown): ErrorOutcome {
  if (error instanceof InvalidMemberRecordError) {
    return { status: 400, message: error.message };
  }

  if (error instanceof MemberNotFoundError) {
    return { status: 404, message: "Member not found." };
  }

  const maybeError = error as { name?: string };
  if (maybeError?.name === "ConditionalCheckFailedException") {
    return { status: 409, message: "Operation could not be completed." };
  }

  return { status: 500, message: "Unexpected server error." };
}

export function logApiEvent(
  context: RouteContext,
  status: number,
  message: string,
  level: "warn" | "error" = "warn",
): void {
  const payload = JSON.stringify({
    event: "api_response",
    route: context.route,
    method: context.method,
    status,
    message,
    timestamp: new Date().toISOString(),
  });

  if (level === "error") {
    console.error(payload);
    return;
  }

  console.warn(payload);
}

export function handleApiError(
  context: RouteContext,
  error: unknown,
): NextResponse {
  const outcome = classifyError(error);
  const message =
    error instanceof Error ? error.message : "unknown error object";

  console.error(
    JSON.stringify({
      event: "api_error",
      route: context.route,
      method: context.method,
      status: outcome.status,
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: message,
      timestamp: new Date().toISOString(),
    }),
  );

  return NextResponse.json(
    { error: outcome.message },
    { status: outcome.status },
  );
}
