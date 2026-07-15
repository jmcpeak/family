import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-guard";
import { handleApiError } from "@/lib/api-observability";
import { membersToMailingLabelsCsv } from "@/lib/csv";
import { getFamilyRepository } from "@/lib/data";

export async function GET(): Promise<NextResponse> {
  try {
    const unauthorized = await requireSession();
    if (unauthorized) {
      return unauthorized;
    }

    const repository = getFamilyRepository();
    const members = await repository.listMembers();
    const csv = membersToMailingLabelsCsv(members);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition":
          'attachment; filename="McPeak Family Mailing Labels.csv"',
      },
    });
  } catch (error) {
    return handleApiError(
      { route: "/api/export/mailing", method: "GET" },
      error,
    );
  }
}
