import { normalizePhoneToE164 } from "./phone";
import { siteLinkEmailContent, siteLinkSmsContent } from "./templates";
import type {
  BlastResult,
  EmailSender,
  MessagingChannel,
  SmsSender,
} from "./types";

const DEFAULT_CONCURRENCY = 5;

export interface BlastSiteLinkOptions {
  channel: MessagingChannel;
  recipients: string[];
  emailSender?: EmailSender;
  smsSender?: SmsSender;
  siteUrl?: string;
  concurrency?: number;
}

function uniqueEmails(recipients: string[]): {
  emails: string[];
  skipped: number;
} {
  const seen = new Set<string>();
  const emails: string[] = [];
  let skipped = 0;

  for (const raw of recipients) {
    const email = raw.trim();
    if (!email) {
      continue;
    }
    if (email.length <= 4) {
      skipped += 1;
      continue;
    }
    const key = email.toLowerCase();
    if (seen.has(key)) {
      skipped += 1;
      continue;
    }
    seen.add(key);
    emails.push(email);
  }

  return { emails, skipped };
}

function uniquePhones(recipients: string[]): {
  phones: string[];
  skipped: number;
} {
  const seen = new Set<string>();
  const phones: string[] = [];
  let skipped = 0;

  for (const raw of recipients) {
    const trimmed = raw.trim();
    if (!trimmed) {
      continue;
    }
    const normalized = normalizePhoneToE164(trimmed);
    if (!normalized) {
      skipped += 1;
      continue;
    }
    if (seen.has(normalized)) {
      skipped += 1;
      continue;
    }
    seen.add(normalized);
    phones.push(normalized);
  }

  return { phones, skipped };
}

async function mapPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  let nextIndex = 0;

  if (items.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const current = nextIndex;
        nextIndex += 1;
        const item = items[current];
        if (item === undefined) {
          continue;
        }
        try {
          await worker(item);
          sent += 1;
        } catch {
          failed += 1;
        }
      }
    },
  );

  await Promise.all(runners);
  return { sent, failed };
}

export async function blastSiteLink(
  options: BlastSiteLinkOptions,
): Promise<BlastResult> {
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;

  if (options.channel === "email") {
    if (!options.emailSender) {
      throw new Error("emailSender is required for email blasts.");
    }
    const { emails, skipped } = uniqueEmails(options.recipients);
    const content = siteLinkEmailContent(options.siteUrl);
    const emailSender = options.emailSender;
    const { sent, failed } = await mapPool(emails, concurrency, async (to) => {
      await emailSender.send({
        to,
        subject: content.subject,
        text: content.text,
        html: content.html,
      });
    });
    return { sent, failed, skipped };
  }

  if (!options.smsSender) {
    throw new Error("smsSender is required for SMS blasts.");
  }

  const { phones, skipped } = uniquePhones(options.recipients);
  const text = siteLinkSmsContent(options.siteUrl);
  const smsSender = options.smsSender;
  const { sent, failed } = await mapPool(
    phones,
    concurrency,
    async (toE164) => {
      await smsSender.send({ toE164, text });
    },
  );

  return { sent, failed, skipped };
}
