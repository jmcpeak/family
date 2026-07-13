import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-guard";
import { getFamilyRepository } from "@/lib/data";
import { cleanMemberRecord } from "@/lib/member-utils";

const memberValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.string()),
  z.array(z.number()),
  z.array(z.boolean()),
]);

const memberSchema = z
  .object({ id: z.string().min(1) })
  .catchall(memberValueSchema);

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const unauthorized = await requireSession();
  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const repository = getFamilyRepository();
  const item = await repository.getMember(id);
  if (!item) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PUT(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const unauthorized = await requireSession();
  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const payload = await request.json().catch(() => null);
  const parsed = memberSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid member payload." },
      { status: 400 },
    );
  }

  if (parsed.data.id !== id) {
    return NextResponse.json(
      { error: "Path id and payload id must match." },
      { status: 400 },
    );
  }

  const repository = getFamilyRepository();
  const updated = await repository.upsertMember(cleanMemberRecord(parsed.data));
  return NextResponse.json(updated);
}

export async function DELETE(
  _: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const unauthorized = await requireSession();
  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const repository = getFamilyRepository();
  await repository.deleteMember(id);
  return NextResponse.json({ deleted: true });
}
