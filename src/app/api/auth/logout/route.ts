import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-observability";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(): Promise<NextResponse> {
  try {
    const response = NextResponse.json({ authenticated: false });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    return handleApiError({ route: "/api/auth/logout", method: "POST" }, error);
  }
}
