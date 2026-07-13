import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-guard";
import { getFamilyRepository } from "@/lib/data";

export async function GET(): Promise<NextResponse> {
  const unauthorized = await requireSession();
  if (unauthorized) {
    return unauthorized;
  }

  const repository = getFamilyRepository();
  const emails = await repository.listEmails();
  return NextResponse.json({
    emails,
  });
}
