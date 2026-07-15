import { describe, expect, it } from "vitest";
import { MAILING_LABEL_FIELDS, membersToMailingLabelsCsv } from "@/lib/csv";
import type { FamilyMemberRecord } from "@/lib/types";

function parseCsvRow(row: string): string[] {
  return [...row.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g)].map((match) =>
    match[1].replaceAll('""', '"'),
  );
}

describe("membersToMailingLabelsCsv", () => {
  it("creates label rows with filtering, review notes, and deterministic sorting", () => {
    const members: FamilyMemberRecord[] = [
      {
        id: "3",
        firstName: "Zoe",
        lastName: "Aaron",
        address: "123 Main St",
        city: "Austin",
        theState: "TX",
        zipcode: "00501",
        country: "US",
      },
      {
        id: "1",
        firstName: "Ada",
        lastName: "Smith",
        displayName: "Ada & Ben Smith",
        address: "123   Main St",
        city: "Austin",
        theState: "TX",
        zipcode: "00501",
        country: "USA",
        death: "2024-11-01",
      },
      {
        id: "2",
        firstName: "Claude",
        lastName: "Dupont",
        address: "5 Rue de Rivoli",
        city: "Paris",
        zipcode: "75001",
        country: "France",
      },
      {
        id: "4",
        firstName: "No",
        lastName: "Zip",
        address: "10 Oak Ave",
        city: "Austin",
        theState: "TX",
      },
      {
        id: "5",
        firstName: "NoState",
        lastName: "Domestic",
        address: "10 Pine St",
        city: "Austin",
        zipcode: "78701",
        country: "US",
      },
    ];

    const csv = membersToMailingLabelsCsv(members);
    const lines = csv.split("\r\n");
    const [header, ...rows] = lines;

    expect(header).toBe(MAILING_LABEL_FIELDS.join(","));
    expect(rows).toHaveLength(3);

    const parsedRows = rows.map((row) => parseCsvRow(row));
    expect(parsedRows[0][0]).toBe("Ada & Ben Smith");
    expect(parsedRows[1][0]).toBe("Claude Dupont");
    expect(parsedRows[2][0]).toBe("Zoe Aaron");

    const notesByAddressee = new Map(
      parsedRows.map((row) => [row[0], row[7]] as const),
    );
    expect(notesByAddressee.get("Ada & Ben Smith")).toBe(
      "Possible deceased record; Possible duplicate address",
    );
    expect(notesByAddressee.get("Zoe Aaron")).toBe(
      "Possible duplicate address",
    );
    expect(notesByAddressee.get("Claude Dupont")).toBe("");

    const zipByAddressee = new Map(
      parsedRows.map((row) => [row[0], row[5]] as const),
    );
    expect(zipByAddressee.get("Ada & Ben Smith")).toBe("00501");
  });
});
