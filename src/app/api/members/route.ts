import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-guard";
import { getFamilyRepository } from "@/lib/data";

export async function GET(): Promise<NextResponse> {
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
}
