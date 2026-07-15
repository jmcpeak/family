import { formatMemberName } from "@/lib/member-utils";
import type { FamilyMemberRecord } from "@/lib/types";

export const MAILING_LABEL_FIELDS = [
  "Addressee",
  "Address1",
  "Address2",
  "City",
  "State",
  "PostalCode",
  "Country",
  "ReviewNotes",
] as const;

const DOMESTIC_COUNTRY_CODES = new Set([
  "",
  "US",
  "USA",
  "UNITEDSTATES",
  "UNITEDSTATESOFAMERICA",
]);

function escapeCsv(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function toCsv(headers: readonly string[], rows: string[][]): string {
  const header = headers.join(",");
  const csvRows = rows.map((row) => row.map(escapeCsv).join(","));
  return [header, ...csvRows].join("\r\n");
}

function csvValueToString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join(",");
  }

  return String(value);
}

function normalizeWhitespace(value: string): string {
  return value.trim().replaceAll(/\s+/g, " ");
}

function normalizeAddressField(value: unknown): string {
  return normalizeWhitespace(csvValueToString(value));
}

function normalizeCountryCode(country: string): string {
  return country.toUpperCase().replaceAll(/[^A-Z]/g, "");
}

function isDomesticCountry(country: string): boolean {
  return DOMESTIC_COUNTRY_CODES.has(normalizeCountryCode(country));
}

function createAddressKey(row: MailingLabelRow): string {
  const normalizedCountry = isDomesticCountry(row.Country)
    ? "US"
    : row.Country.toUpperCase();
  return [
    row.Address1.toUpperCase(),
    row.Address2.toUpperCase(),
    row.City.toUpperCase(),
    row.State.toUpperCase(),
    row.PostalCode.toUpperCase(),
    normalizedCountry,
  ].join("|");
}

function hasCompleteAddress(
  row: Omit<MailingLabelRow, "ReviewNotes">,
): boolean {
  if (!row.Address1 || !row.City || !row.PostalCode) {
    return false;
  }
  if (isDomesticCountry(row.Country) && !row.State) {
    return false;
  }
  return true;
}

function buildReviewNotes(
  member: FamilyMemberRecord,
  hasDuplicateAddress: boolean,
): string {
  const notes: string[] = [];
  const hasDeathDate = normalizeAddressField(member.death).length > 0;
  const hasSpouseDeathDate =
    normalizeAddressField(member.deathSpouse).length > 0;

  if (hasDeathDate || hasSpouseDeathDate) {
    notes.push("Possible deceased record");
  }
  if (hasDuplicateAddress) {
    notes.push("Possible duplicate address");
  }

  return notes.join("; ");
}

interface MailingLabelRow {
  Addressee: string;
  Address1: string;
  Address2: string;
  City: string;
  State: string;
  PostalCode: string;
  Country: string;
  ReviewNotes: string;
}

export function membersToMailingLabelsCsv(
  members: FamilyMemberRecord[],
): string {
  const labelRows = members
    .map((member) => {
      const displayName = normalizeAddressField(member.displayName);
      const addressee = displayName || formatMemberName(member).trim();

      return {
        memberId: member.id,
        member,
        row: {
          Addressee: addressee,
          Address1: normalizeAddressField(member.address),
          Address2: normalizeAddressField(member.address2),
          City: normalizeAddressField(member.city),
          State: normalizeAddressField(member.theState),
          PostalCode: normalizeAddressField(member.zipcode),
          Country: normalizeAddressField(member.country),
        },
      };
    })
    .filter((entry) => hasCompleteAddress(entry.row));

  const addressCounts = new Map<string, number>();
  for (const entry of labelRows) {
    const key = createAddressKey({ ...entry.row, ReviewNotes: "" });
    const previous = addressCounts.get(key) ?? 0;
    addressCounts.set(key, previous + 1);
  }

  const rows = labelRows
    .map((entry) => {
      const addressKey = createAddressKey({ ...entry.row, ReviewNotes: "" });
      const duplicateCount = addressCounts.get(addressKey) ?? 0;
      return {
        ...entry.row,
        ReviewNotes: buildReviewNotes(entry.member, duplicateCount > 1),
        memberId: entry.memberId,
      };
    })
    .sort((left, right) => {
      const comparisons = [
        left.Addressee.localeCompare(right.Addressee),
        left.Address1.localeCompare(right.Address1),
        left.Address2.localeCompare(right.Address2),
        left.City.localeCompare(right.City),
        left.State.localeCompare(right.State),
        left.PostalCode.localeCompare(right.PostalCode),
        left.Country.localeCompare(right.Country),
        left.memberId.localeCompare(right.memberId),
      ];

      const firstDifference = comparisons.find((value) => value !== 0);
      return firstDifference ?? 0;
    })
    .map(({ memberId: _memberId, ...row }) => row);

  return toCsv(
    MAILING_LABEL_FIELDS,
    rows.map((row) => MAILING_LABEL_FIELDS.map((field) => row[field])),
  );
}
