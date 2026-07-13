import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ authenticated: false });
  clearSessionCookie(response);
  return response;
}
