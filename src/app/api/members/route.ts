import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-guard";
import { handleApiError } from "@/lib/api-observability";
import { getFamilyRepository } from "@/lib/data";
import { normalizeParentOptions } from "@/lib/parents";

export async function GET(): Promise<NextResponse> {
  try {
    const unauthorized = await requireSession();
    if (unauthorized) {
      return unauthorized;
    }

    const repository = getFamilyRepository();
    const [members, metadata, fatherRecords, motherRecords] = await Promise.all(
      [
        repository.listMembers(),
        repository.getLastUpdateMetadata(),
        repository.listParents("m"),
        repository.listParents("f"),
      ],
    );

    return NextResponse.json({
      members,
      metadata,
      fathers: normalizeParentOptions(fatherRecords, "m"),
      mothers: normalizeParentOptions(motherRecords, "f"),
    });
  } catch (error) {
    return handleApiError({ route: "/api/members", method: "GET" }, error);
  }
}
