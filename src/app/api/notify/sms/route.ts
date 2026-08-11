import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-guard";
import { handleApiError } from "@/lib/api-observability";
import { getFamilyRepository } from "@/lib/data";
import { serverEnv } from "@/lib/env";
import {
  blastSiteLink,
  resolveNotifyRecipients,
  resolveSmsSender,
} from "@/lib/messaging";

const bodySchema = z
  .object({
    dryRun: z.boolean().optional(),
    memberIds: z.array(z.string().min(1)).optional(),
    text: z.string().trim().min(1).max(2000).optional(),
  })
  .optional();

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const unauthorized = await requireSession();
    if (unauthorized) {
      return unauthorized;
    }

    const json = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const memberIds = parsed.data?.memberIds;
    if (memberIds !== undefined && memberIds.length === 0) {
      return NextResponse.json(
        { error: "memberIds must not be empty when provided." },
        { status: 400 },
      );
    }

    const dryRun = Boolean(parsed.data?.dryRun) || serverEnv.messagingDryRun;

    if (!serverEnv.smsEnabled && !dryRun) {
      return NextResponse.json(
        {
          error:
            "SMS sending is disabled. Set FAMILY_SMS_ENABLED=true after AWS SMS setup.",
        },
        { status: 503 },
      );
    }

    let smsSender: ReturnType<typeof resolveSmsSender>;
    try {
      smsSender = resolveSmsSender({
        dryRun,
        sesFromAddress: serverEnv.sesFromAddress,
        smsEnabled: serverEnv.smsEnabled,
      });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "SMS sending is not configured.",
        },
        { status: 503 },
      );
    }

    const repository = getFamilyRepository();
    let phones: string[];
    if (memberIds === undefined) {
      phones = await repository.listPhones();
    } else {
      const members = await repository.listMembers();
      phones = resolveNotifyRecipients({
        channel: "sms",
        members,
        memberIds,
      });
    }

    const result = await blastSiteLink({
      channel: "sms",
      recipients: phones,
      smsSender,
      text: parsed.data?.text,
    });

    return NextResponse.json({
      channel: "sms",
      dryRun,
      recipientCount: phones.length,
      ...result,
    });
  } catch (error) {
    return handleApiError({ route: "/api/notify/sms", method: "POST" }, error);
  }
}
