import { NextResponse } from "next/server";
import { logApiEvent } from "@/lib/api-observability";
import { getFamilyRepository } from "@/lib/data";

export async function GET(): Promise<NextResponse> {
  const repository = getFamilyRepository();
  try {
    await repository.checkReadiness();
    return NextResponse.json(
      {
        ready: true,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Readiness failed";
    logApiEvent(
      { route: "/api/health/ready", method: "GET" },
      503,
      message,
      "error",
    );
    return NextResponse.json(
      {
        ready: false,
        error: "Service unavailable.",
      },
      { status: 503 },
    );
  }
}
