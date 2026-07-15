import {
  createGuid,
  formatMemberName,
  getChildrenIndexes,
  sortMembers,
} from "@/lib/member-utils";
import type { FamilyMemberRecord, ParentOption } from "@/lib/types";

export type TabKey = "family" | "address" | "spouse" | "dates" | "children";

export interface EditorTabOption {
  key: TabKey;
  label: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export const TABS: EditorTabOption[] = [
  { key: "family", label: "family member" },
  { key: "address", label: "address" },
  { key: "spouse", label: "spouse" },
  { key: "dates", label: "dates & places" },
  { key: "children", label: "children & pets" },
];
const TAB_KEYS = new Set(TABS.map((tab) => tab.key));

export const CHILD_FIELDS = [
  "firstNameChild",
  "middleNameChild",
  "lastNameChild",
  "bithdayChild",
  "genderChild",
] as const;

export const SKELETON_FADE_TIMEOUT_MS = 260;

export const EDITOR_SKELETON_FIELD_COUNT: Record<TabKey, number> = {
  family: 12,
  address: 8,
  spouse: 9,
  dates: 15,
  children: 6,
};

export const EDITOR_SKELETON_FIELD_IDS = Array.from(
  { length: 15 },
  (_, index) => `editor-skeleton-field-${index + 1}`,
);

export function isTabKey(value: string): value is TabKey {
  return TAB_KEYS.has(value as TabKey);
}

export function parseTabKey(value: string | undefined): TabKey {
  if (!value) {
    return "family";
  }

  return isTabKey(value) ? value : "family";
}

export function copyMember(member: FamilyMemberRecord): FamilyMemberRecord {
  return {
    ...member,
    children: member.children ? [...member.children] : [0],
  };
}

export function createNewMember(): FamilyMemberRecord {
  return {
    id: createGuid(),
    children: [0],
    gender: "",
    genderSpouse: "",
  };
}

export function earliestDateValue(a?: string, b?: string): string | undefined {
  if (!a && !b) {
    return undefined;
  }
  if (!a) {
    return b;
  }
  if (!b) {
    return a;
  }

  const dateA = new Date(a);
  const dateB = new Date(b);
  if (Number.isNaN(dateA.getTime())) {
    return b;
  }
  if (Number.isNaN(dateB.getTime())) {
    return a;
  }
  return dateA <= dateB ? a : b;
}

export function filterVisibleMembers(
  members: FamilyMemberRecord[],
  search: string,
): FamilyMemberRecord[] {
  const query = search.trim().toLowerCase();
  const sorted = sortMembers(members);
  if (!query) {
    return sorted;
  }

  return sorted.filter((member) => {
    const haystack = [
      member.displayName,
      member.firstName,
      member.lastName,
      member.email,
      member.address,
      member.city,
      member.theState,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function buildParentSelectOptions(
  parents: ParentOption[],
  selectedParentId: string | number | undefined,
  members: FamilyMemberRecord[],
): SelectOption[] {
  const options = parents.map((parent) => ({
    value: String(parent.id),
    label: `${parent.firstName ?? ""} ${parent.lastName ?? ""}`.trim(),
  }));

  const normalizedParentId = String(selectedParentId ?? "");
  if (
    normalizedParentId &&
    !options.some((option) => option.value === normalizedParentId)
  ) {
    const member = members.find((entry) => entry.id === normalizedParentId);
    if (member) {
      options.push({
        value: normalizedParentId,
        label: formatMemberName(member),
      });
    }
  }

  return options;
}

export function addChildRow(member: FamilyMemberRecord): FamilyMemberRecord {
  const indices = getChildrenIndexes(member);
  const next = [...indices, Math.max(...indices) + 1];
  return {
    ...member,
    children: next,
  };
}

export function removeChildRow(
  member: FamilyMemberRecord,
  index: number,
): FamilyMemberRecord {
  const nextUser: FamilyMemberRecord = {
    ...member,
    children: getChildrenIndexes(member).filter((value) => value !== index),
  };

  if (!nextUser.children || nextUser.children.length === 0) {
    nextUser.children = [0];
  }

  for (const fieldPrefix of CHILD_FIELDS) {
    delete nextUser[`${fieldPrefix}${index}`];
  }

  return nextUser;
}

export function hasRequiredMemberFields(member: FamilyMemberRecord): boolean {
  return Boolean(member.firstName && member.lastName && member.gender);
}
