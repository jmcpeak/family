import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-guard";
import { handleApiError } from "@/lib/api-observability";
import { getFamilyRepository } from "@/lib/data";
import { serverEnv } from "@/lib/env";
import {
  blastSiteLink,
  resolveEmailSender,
  resolveNotifyRecipients,
} from "@/lib/messaging";

const bodySchema = z
  .object({
    dryRun: z.boolean().optional(),
    memberIds: z.array(z.string().min(1)).optional(),
    subject: z.string().trim().min(1).max(200).optional(),
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

    let emailSender: ReturnType<typeof resolveEmailSender>;
    try {
      emailSender = resolveEmailSender({
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
              : "Email sending is not configured.",
        },
        { status: 503 },
      );
    }

    const repository = getFamilyRepository();
    let emails: string[];
    if (memberIds === undefined) {
      emails = await repository.listEmails();
    } else {
      const members = await repository.listMembers();
      emails = resolveNotifyRecipients({
        channel: "email",
        members,
        memberIds,
      });
    }

    const result = await blastSiteLink({
      channel: "email",
      recipients: emails,
      emailSender,
      subject: parsed.data?.subject,
      text: parsed.data?.text,
    });

    return NextResponse.json({
      channel: "email",
      dryRun,
      recipientCount: emails.length,
      ...result,
    });
  } catch (error) {
    return handleApiError(
      { route: "/api/notify/email", method: "POST" },
      error,
    );
  }
}
