import type { EmailMessage, EmailSender, SmsMessage, SmsSender } from "./types";

export function createDryRunEmailSender(
  log: (message: string) => void = console.info,
): EmailSender {
  return {
    async send(message: EmailMessage): Promise<void> {
      log(
        `[messaging dry-run] email to=${message.to} subject=${message.subject}`,
      );
    },
  };
}

export function createDryRunSmsSender(
  log: (message: string) => void = console.info,
): SmsSender {
  return {
    async send(message: SmsMessage): Promise<void> {
      log(`[messaging dry-run] sms to=${message.toE164}`);
    },
  };
}
