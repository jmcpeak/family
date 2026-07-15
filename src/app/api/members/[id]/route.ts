import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-guard";
import { handleApiError } from "@/lib/api-observability";
import { getFamilyRepository } from "@/lib/data";
import {
  isReservedMemberRecordId,
  LAST_UPDATE_RECORD_ID,
} from "@/lib/member-records";
import { cleanMemberRecord } from "@/lib/member-utils";
import { validateMemberPayload } from "@/lib/member-validation";
import type { FamilyMemberRecord, LastUpdateMetadata } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function toExistingMember(
  record: FamilyMemberRecord | LastUpdateMetadata | null,
): FamilyMemberRecord | null {
  if (!record || "lastUpdated" in record) {
    return null;
  }
  return record;
}

export async function PUT(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const unauthorized = await requireSession();
    if (unauthorized) {
      return unauthorized;
    }

    const { id } = await context.params;
    if (isReservedMemberRecordId(id)) {
      return NextResponse.json(
        { error: "Reserved records cannot be edited with the member API." },
        { status: 400 },
      );
    }

    const repository = getFamilyRepository();
    const currentRecord = await repository.getMember(id);
    const existingMember =
      currentRecord?.id === LAST_UPDATE_RECORD_ID
        ? null
        : toExistingMember(currentRecord);

    const payload = await request.json().catch(() => null);
    const parsed = validateMemberPayload(payload, existingMember);
    if (!parsed.success || !parsed.data) {
      return NextResponse.json(
        { error: parsed.error ?? "Invalid member payload." },
        { status: 400 },
      );
    }

    if (parsed.data.id !== id) {
      return NextResponse.json(
        { error: "Path id and payload id must match." },
        { status: 400 },
      );
    }

    const updated = await repository.upsertMember(
      cleanMemberRecord(parsed.data),
    );
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError({ route: "/api/members/[id]", method: "PUT" }, error);
  }
}

export async function DELETE(
  _: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const unauthorized = await requireSession();
    if (unauthorized) {
      return unauthorized;
    }

    const { id } = await context.params;
    if (isReservedMemberRecordId(id)) {
      return NextResponse.json(
        { error: "Reserved records cannot be deleted with the member API." },
        { status: 400 },
      );
    }

    const repository = getFamilyRepository();
    await repository.deleteMember(id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return handleApiError(
      { route: "/api/members/[id]", method: "DELETE" },
      error,
    );
  }
}
