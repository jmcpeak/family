import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-guard";
import { handleApiError } from "@/lib/api-observability";
import { getFamilyRepository } from "@/lib/data";

export async function GET(): Promise<NextResponse> {
  try {
    const unauthorized = await requireSession();
    if (unauthorized) {
      return unauthorized;
    }

    const repository = getFamilyRepository();
    const emails = await repository.listEmails();
    return NextResponse.json({
      emails,
    });
  } catch (error) {
    return handleApiError({ route: "/api/emails", method: "GET" }, error);
  }
}
