import { NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError, logApiEvent } from "@/lib/api-observability";
import { applySessionCookie, isValidLoginAnswer } from "@/lib/auth";

const loginSchema = z.object({
  answer: z.string().min(1),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const payload = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    if (!isValidLoginAnswer(parsed.data.answer)) {
      logApiEvent(
        { route: "/api/auth/login", method: "POST" },
        401,
        "Invalid login credentials.",
      );
      return NextResponse.json(
        { error: "Invalid login credentials." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ authenticated: true });
    applySessionCookie(response);
    return response;
  } catch (error) {
    return handleApiError({ route: "/api/auth/login", method: "POST" }, error);
  }
}
