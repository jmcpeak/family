import type { FamilyMemberRecord, Gender, ParentOption } from "@/lib/types";

export function toParentOption(
  entry: FamilyMemberRecord,
  gender: Gender,
): ParentOption {
  if (entry.genderSpouse === gender && entry.firstNameSpouse) {
    return {
      id: entry.id,
      firstName: entry.firstNameSpouse,
      lastName: entry.lastNameSpouse,
    };
  }

  return {
    id: entry.id,
    firstName: entry.firstName,
    lastName: entry.lastName,
  };
}

export function normalizeParentOptions(
  parents: FamilyMemberRecord[],
  gender: Gender,
): ParentOption[] {
  return parents.map((entry) => toParentOption(entry, gender));
}
