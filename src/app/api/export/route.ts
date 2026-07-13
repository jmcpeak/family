import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-guard";
import { membersToCsv } from "@/lib/csv";
import { getFamilyRepository } from "@/lib/data";

export async function GET(): Promise<NextResponse> {
  const unauthorized = await requireSession();
  if (unauthorized) {
    return unauthorized;
  }

  const repository = getFamilyRepository();
  const members = await repository.listMembers();
  const csv = membersToCsv(members);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="McPeak Family.csv"',
    },
  });
}
