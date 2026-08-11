import { createDryRunEmailSender, createDryRunSmsSender } from "./dry-run";
import { createSesEmailSender } from "./ses";
import { createSnsSmsSender } from "./sns";
import type { EmailSender, SmsSender } from "./types";

export type { BlastSiteLinkOptions } from "./blast";
export { blastSiteLink } from "./blast";
export { normalizePhoneToE164 } from "./phone";
export { resolveNotifyRecipients } from "./resolve-recipients";
export {
  plainTextToSimpleHtml,
  resolveSiteUrl,
  siteLinkEmailContent,
  siteLinkSmsContent,
} from "./templates";
export type {
  BlastResult,
  EmailMessage,
  EmailSender,
  MessagingChannel,
  SmsMessage,
  SmsSender,
} from "./types";

export interface ResolveSendersOptions {
  dryRun: boolean;
  sesFromAddress: string | undefined;
  smsEnabled: boolean;
}

export function resolveEmailSender(
  options: ResolveSendersOptions,
): EmailSender {
  if (options.dryRun) {
    return createDryRunEmailSender();
  }
  if (!options.sesFromAddress?.trim()) {
    throw new Error(
      "Email sending is not configured. Set FAMILY_SES_FROM_ADDRESS.",
    );
  }
  return createSesEmailSender(options.sesFromAddress);
}

export function resolveSmsSender(options: ResolveSendersOptions): SmsSender {
  if (!options.smsEnabled && !options.dryRun) {
    throw new Error("SMS sending is disabled. Set FAMILY_SMS_ENABLED=true.");
  }
  if (options.dryRun) {
    return createDryRunSmsSender();
  }
  return createSnsSmsSender();
}
