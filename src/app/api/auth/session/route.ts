import { NextResponse } from "next/server";
import { getIsAuthenticated } from "@/lib/auth";

export async function GET(): Promise<NextResponse> {
  const authenticated = await getIsAuthenticated();
  return NextResponse.json({ authenticated });
}
