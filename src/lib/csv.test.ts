import { describe, expect, it } from "vitest";
import { membersToCsv } from "@/lib/csv";
import type { FamilyMemberRecord } from "@/lib/types";

describe("membersToCsv", () => {
  it("exports configured fields and escapes values", () => {
    const members: FamilyMemberRecord[] = [
      {
        id: "abc",
        firstName: "Jane",
        lastName: "Doe",
        email: 'jane"doe@example.com',
        city: "Austin",
        theState: "TX",
      },
    ];

    const csv = membersToCsv(members);
    const [header, row] = csv.split("\r\n");

    expect(header).toContain("firstName,lastName,email");
    expect(row).toContain('"Jane"');
    expect(row).toContain('"jane""doe@example.com"');
  });
});
