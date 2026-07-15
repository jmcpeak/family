import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-observability";

export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(
      {
        ok: true,
        service: "family",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
      },
      {
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  } catch (error) {
    return handleApiError({ route: "/api/health/live", method: "GET" }, error);
  }
}
