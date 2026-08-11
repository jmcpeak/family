import type { FamilyMemberRecord } from "@/lib/types";
import type { MessagingChannel } from "./types";

function memberEmail(member: FamilyMemberRecord): string | null {
  const email = typeof member.email === "string" ? member.email.trim() : "";
  if (email.length <= 4) {
    return null;
  }
  return email;
}

function memberPhone(member: FamilyMemberRecord): string | null {
  const phone = member.phone;
  const trimmed = typeof phone === "string" ? phone.trim() : "";
  if (!trimmed) {
    return null;
  }
  return trimmed;
}

/**
 * Resolve blast recipients from member records.
 * When `memberIds` is provided, only those members are considered (contacts
 * still come from server-side records — never from the client).
 */
export function resolveNotifyRecipients(options: {
  channel: MessagingChannel;
  members: FamilyMemberRecord[];
  memberIds: string[];
}): string[] {
  const idSet = new Set(options.memberIds);
  const selected = options.members.filter((member) => idSet.has(member.id));

  if (options.channel === "email") {
    return selected
      .map((member) => memberEmail(member))
      .filter((value): value is string => value !== null);
  }

  return selected
    .map((member) => memberPhone(member))
    .filter((value): value is string => value !== null);
}
