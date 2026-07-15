import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-observability";
import { getIsAuthenticated } from "@/lib/auth";

export async function GET(): Promise<NextResponse> {
  try {
    const authenticated = await getIsAuthenticated();
    return NextResponse.json({ authenticated });
  } catch (error) {
    return handleApiError({ route: "/api/auth/session", method: "GET" }, error);
  }
}
