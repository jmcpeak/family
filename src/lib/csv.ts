import { CSV_EXPORT_FIELDS } from "@/lib/constants";
import type { FamilyMemberRecord } from "@/lib/types";

function escapeCsv(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

export function membersToCsv(members: FamilyMemberRecord[]): string {
  const header = CSV_EXPORT_FIELDS.join(",");
  const rows = members.map((member) => {
    return CSV_EXPORT_FIELDS.map((field) => {
      const value = member[field];
      if (value === null || value === undefined) {
        return '""';
      }

      if (Array.isArray(value)) {
        return escapeCsv(value.join(","));
      }

      return escapeCsv(String(value));
    }).join(",");
  });

  return [header, ...rows].join("\r\n");
}
