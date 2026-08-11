import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-guard";
import { handleApiError } from "@/lib/api-observability";
import { getFamilyRepository } from "@/lib/data";
import { serverEnv } from "@/lib/env";
import { blastSiteLink, resolveEmailSender } from "@/lib/messaging";

const bodySchema = z
  .object({
    dryRun: z.boolean().optional(),
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
    const emails = await repository.listEmails();
    const result = await blastSiteLink({
      channel: "email",
      recipients: emails,
      emailSender,
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
