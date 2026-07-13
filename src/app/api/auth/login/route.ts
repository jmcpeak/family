import { NextResponse } from "next/server";
import { z } from "zod";
import { applySessionCookie, isValidLoginAnswer } from "@/lib/auth";

const loginSchema = z.object({
  answer: z.string().min(1),
});

export async function POST(request: Request): Promise<NextResponse> {
  const payload = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  if (!isValidLoginAnswer(parsed.data.answer)) {
    return NextResponse.json(
      { error: "That is not the right city. Please try again." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ authenticated: true });
  applySessionCookie(response);
  return response;
}
