import { describe, expect, it } from "vitest";
import type { FamilyMemberRecord } from "@/lib/types";
import { resolveNotifyRecipients } from "./resolve-recipients";

const members: FamilyMemberRecord[] = [
  {
    id: "member-a",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    phone: "555-111-2222",
  },
  {
    id: "member-b",
    firstName: "Bob",
    lastName: "Builder",
    email: "bob@example.com",
  },
  {
    id: "member-c",
    firstName: "Cara",
    lastName: "Phone",
    phone: "555-333-4444",
  },
  {
    id: "member-d",
    firstName: "Dan",
    lastName: "Short",
    email: "a@b",
  },
];

describe("resolveNotifyRecipients", () => {
  it("resolves emails for requested member ids only", () => {
    expect(
      resolveNotifyRecipients({
        channel: "email",
        members,
        memberIds: ["member-a", "member-c", "unknown"],
      }),
    ).toEqual(["ada@example.com"]);
  });

  it("resolves phones for requested member ids only", () => {
    expect(
      resolveNotifyRecipients({
        channel: "sms",
        members,
        memberIds: ["member-a", "member-b", "member-c"],
      }),
    ).toEqual(["555-111-2222", "555-333-4444"]);
  });

  it("skips short emails", () => {
    expect(
      resolveNotifyRecipients({
        channel: "email",
        members,
        memberIds: ["member-d"],
      }),
    ).toEqual([]);
  });
});
