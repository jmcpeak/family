import { NextResponse } from "next/server";
import { getIsAuthenticated } from "@/lib/auth";

export async function requireSession(): Promise<NextResponse | null> {
  const authenticated = await getIsAuthenticated();
  if (authenticated) {
    return null;
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
