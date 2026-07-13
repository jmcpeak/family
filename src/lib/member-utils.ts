import {
  GOOGLE_MAPS_BASE,
  STREET_VIEW_BASE,
  STREET_VIEW_SUFFIX,
  USER_ID_HASH_PREFIX,
} from "@/lib/constants";
import type { FamilyMemberRecord } from "@/lib/types";

export function createGuid(): string {
  const segment = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .slice(1);
  return `${segment()}${segment()}-${segment()}-${segment()}-${segment()}-${segment()}${segment()}${segment()}`;
}

export function hashCode(value: string): number {
  let hash = 0;
  if (!value.length) {
    return hash;
  }

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  return hash;
}

export function formatMemberName(member: FamilyMemberRecord): string {
  if (member.displayName && member.displayName.trim().length > 0) {
    return member.displayName;
  }

  const first = member.firstName?.trim() ?? "";
  const last = member.lastName?.trim() ?? "";
  return `${first} ${last}`.trim() || "Unknown family member";
}

export function formatLocation(member: FamilyMemberRecord): string {
  const address = member.address?.trim();
  const city = member.city?.trim();
  const state = member.theState?.trim();
  return [address, city ? `${city}${state ? "," : ""}` : undefined, state]
    .filter(Boolean)
    .join(" ");
}

export function hasValidAddress(member: FamilyMemberRecord): boolean {
  return Boolean(
    member.theState &&
      (member.address?.trim().length ?? 0) > 5 &&
      (member.city?.trim().length ?? 0) > 4,
  );
}

export function getGoogleMapsUrl(member: FamilyMemberRecord): string {
  const address = `${member.address ?? ""},${member.city ?? ""},${member.theState ?? ""}`;
  return `${GOOGLE_MAPS_BASE}${encodeURIComponent(address)}`;
}

export function getStreetViewUrl(member: FamilyMemberRecord): string {
  const address = `${member.address ?? ""},${member.city ?? ""},${member.theState ?? ""}`;
  return `${STREET_VIEW_BASE}${encodeURIComponent(address)}${STREET_VIEW_SUFFIX}`;
}

export function getChildrenIndexes(member: FamilyMemberRecord): number[] {
  const children: unknown = member.children;
  if (children instanceof Set) {
    const indexes = [...children].filter((value): value is number =>
      Number.isFinite(value),
    );
    return indexes.length > 0 ? indexes.sort((a, b) => a - b) : [0];
  }

  if (!Array.isArray(children) || children.length === 0) {
    return [0];
  }
  return children.filter((value): value is number => Number.isFinite(value));
}

export function countFamilyMembers(members: FamilyMemberRecord[]): number {
  let additional = 0;

  for (const entry of members) {
    if (entry.firstNameSpouse && entry.firstNameSpouse.length >= 1) {
      additional += 1;
    }

    for (const child of getChildrenIndexes(entry)) {
      if ((entry[`firstNameChild${child}`] as string | undefined)?.length) {
        additional += 1;
      }
    }
  }

  return members.length + additional;
}

export function buildUserCardId(id: string): string {
  return `${USER_ID_HASH_PREFIX}${id}`;
}

export function parseMaybeDate(value?: string): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

export function formatDurationYears(
  from?: string,
  to?: string,
  prefix?: string,
  suffix?: string,
): string {
  const fromDate = parseMaybeDate(from);
  const toDate = parseMaybeDate(to) ?? new Date();

  if (!fromDate || !toDate || fromDate.getTime() === toDate.getTime()) {
    return "";
  }

  const diffMs = Math.max(toDate.getTime() - fromDate.getTime(), 0);
  const yearsRaw = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
  let yearsText = "";

  if (yearsRaw === 0) {
    yearsText = "less than a year";
  } else if (yearsRaw === 1) {
    yearsText = "1 year";
  } else {
    yearsText = `${yearsRaw} years`;
  }

  return [prefix, yearsText, suffix].filter(Boolean).join(" ");
}

export function sortMembers(
  members: FamilyMemberRecord[],
): FamilyMemberRecord[] {
  return [...members].sort((a, b) => {
    const lastComparison = (a.lastName ?? "").localeCompare(b.lastName ?? "");
    if (lastComparison !== 0) {
      return lastComparison;
    }
    return (a.firstName ?? "").localeCompare(b.firstName ?? "");
  });
}

export function cleanMemberRecord(
  member: FamilyMemberRecord,
): FamilyMemberRecord {
  const cleaned: FamilyMemberRecord = { id: member.id };

  for (const [key, rawValue] of Object.entries(
    member as Record<string, unknown>,
  )) {
    if (key === "$$hashKey") {
      continue;
    }

    if (rawValue === undefined || rawValue === null) {
      continue;
    }

    if (typeof rawValue === "string") {
      cleaned[key] = rawValue;
      continue;
    }

    if (typeof rawValue === "boolean" || typeof rawValue === "number") {
      cleaned[key] = rawValue;
      continue;
    }

    if (Array.isArray(rawValue)) {
      cleaned[key] = rawValue;
      continue;
    }

    if (key === "children" && rawValue instanceof Set) {
      const indexes = [...rawValue].filter((value): value is number =>
        Number.isFinite(value),
      );
      cleaned.children =
        indexes.length > 0 ? indexes.sort((a, b) => a - b) : [0];
    }
  }

  if (!Array.isArray(cleaned.children) || cleaned.children.length === 0) {
    cleaned.children = [0];
  }

  return cleaned;
}

interface NameOption {
  display: string;
}

function possibleFirstNames(
  user: FamilyMemberRecord,
  first: string,
  nick: string,
  title: string,
): NameOption[] {
  const names: NameOption[] = [];
  const firstName = (user[first] as string | undefined)?.trim() ?? "";

  if (!firstName) {
    return names;
  }

  names.push({ display: firstName });

  const nickname = (user[nick] as string | undefined)?.trim();
  if (nickname) {
    names.push({ display: nickname });
    names.push({ display: `${firstName} "${nickname}"` });
  }

  const titleName = (user[title] as string | undefined)?.trim();
  if (titleName) {
    names.push({ display: `${titleName} ${firstName}` });
    if (nickname) {
      names.push({ display: `${titleName} ${firstName} "${nickname}"` });
      names.push({ display: `${titleName} ${nickname}` });
    }
  }

  return names;
}

export function buildDisplayNameOptions(
  user: FamilyMemberRecord,
): NameOption[] {
  const possible: NameOption[] = [];
  if (!user.lastName || !user.firstName) {
    return possible;
  }

  const memberLastName = user.lastName.trim();
  const memberLastNameWithSuffix = `${user.lastName.trim()}${
    user.suffixName ? ` ${String(user.suffixName).trim()}` : ""
  }`.trim();

  const spouseLastName = (user.lastNameSpouse as string | undefined)?.trim();
  const spouseLastNameWithSuffix = spouseLastName
    ? `${spouseLastName}${user.suffixNameSpouse ? ` ${String(user.suffixNameSpouse).trim()}` : ""}`.trim()
    : undefined;

  const memberNames = possibleFirstNames(
    user,
    "firstName",
    "nickName",
    "titleName",
  );
  const spouseNames = possibleFirstNames(
    user,
    "firstNameSpouse",
    "nickNameSpouse",
    "titleNameSpouse",
  );

  for (const name of memberNames) {
    possible.push({ display: `${name.display} ${memberLastName}`.trim() });
    if (memberLastNameWithSuffix !== memberLastName) {
      possible.push({
        display: `${name.display} ${memberLastNameWithSuffix}`.trim(),
      });
    }
  }

  if (spouseLastName) {
    for (const name of spouseNames) {
      possible.push({ display: `${name.display} ${spouseLastName}`.trim() });
      if (
        spouseLastNameWithSuffix &&
        spouseLastNameWithSuffix !== spouseLastName
      ) {
        possible.push({
          display: `${name.display} ${spouseLastNameWithSuffix}`.trim(),
        });
      }
    }
  }

  for (const memberName of memberNames) {
    for (const spouseName of spouseNames) {
      possible.push({
        display:
          `${memberName.display} & ${spouseName.display} ${memberLastName}`.trim(),
      });
      if (memberLastNameWithSuffix !== memberLastName) {
        possible.push({
          display:
            `${memberName.display} & ${spouseName.display} ${memberLastNameWithSuffix}`.trim(),
        });
      }
    }
  }

  if (spouseLastName) {
    for (const spouseName of spouseNames) {
      for (const memberName of memberNames) {
        possible.push({
          display:
            `${spouseName.display} & ${memberName.display} ${spouseLastName}`.trim(),
        });
        if (
          spouseLastNameWithSuffix &&
          spouseLastNameWithSuffix !== spouseLastName
        ) {
          possible.push({
            display:
              `${spouseName.display} & ${memberName.display} ${spouseLastNameWithSuffix}`.trim(),
          });
        }
      }
    }
  }

  return possible.filter((option, index, source) => {
    return (
      option.display.length > 0 &&
      source.findIndex((inner) => inner.display === option.display) === index
    );
  });
}
