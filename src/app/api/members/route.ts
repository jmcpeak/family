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
    const [members, metadata] = await Promise.all([
      repository.listMembers(),
      repository.getLastUpdateMetadata(),
    ]);

    return NextResponse.json({
      members,
      metadata,
    });
  } catch (error) {
    return handleApiError({ route: "/api/members", method: "GET" }, error);
  }
}
