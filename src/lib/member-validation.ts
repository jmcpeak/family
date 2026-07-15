import { z } from "zod";
import type { FamilyMemberRecord } from "@/lib/types";

const MAX_MEMBER_FIELDS = 140;
const MAX_FIELD_NAME_LENGTH = 40;
const MAX_MEMBER_STRING_LENGTH = 500;
const MAX_MEMBER_ARRAY_LENGTH = 50;
const MAX_CHILD_INDEX = 50;

const CHILD_FIELD_PATTERN =
  /^(firstNameChild|middleNameChild|lastNameChild|bithdayChild|genderChild)\d+$/;

const BASE_MEMBER_FIELDS = new Set([
  "children",
  "displayName",
  "firstName",
  "middleName",
  "lastName",
  "titleName",
  "suffixName",
  "gender",
  "maidenName",
  "nickName",
  "father",
  "mother",
  "hobbies",
  "email",
  "phone",
  "address",
  "address2",
  "city",
  "theState",
  "zipcode",
  "country",
  "firstNameSpouse",
  "middleNameSpouse",
  "lastNameSpouse",
  "genderSpouse",
  "maidenNameSpouse",
  "nickNameSpouse",
  "titleNameSpouse",
  "suffixNameSpouse",
  "hobbiesSpouse",
  "birthday",
  "cityBirth",
  "stateBirth",
  "wedding",
  "cityWedding",
  "stateWedding",
  "death",
  "cityDeath",
  "stateDeath",
  "bithdaySpouse",
  "cityBirthSpouse",
  "stateBirthSpouse",
  "deathSpouse",
  "cityDeathSpouse",
  "stateDeathSpouse",
  "pets",
]);

const memberValueSchema = z.union([
  z.string().max(MAX_MEMBER_STRING_LENGTH),
  z.number().finite(),
  z.boolean(),
  z.null(),
  z
    .array(z.string().max(MAX_MEMBER_STRING_LENGTH))
    .max(MAX_MEMBER_ARRAY_LENGTH),
  z.array(z.number().finite()).max(MAX_MEMBER_ARRAY_LENGTH),
  z.array(z.boolean()).max(MAX_MEMBER_ARRAY_LENGTH),
]);

const memberPayloadSchema = z
  .object({
    id: z.string().trim().min(1).max(128),
    children: z
      .array(z.number().int().min(0).max(MAX_CHILD_INDEX))
      .max(MAX_CHILD_INDEX + 1)
      .optional(),
    gender: z.enum(["", "m", "f"]).optional(),
    genderSpouse: z.enum(["", "m", "f"]).optional(),
    father: z.union([z.string().max(128), z.number().int()]).optional(),
    mother: z.union([z.string().max(128), z.number().int()]).optional(),
  })
  .catchall(memberValueSchema);

function isSupportedMemberField(field: string): boolean {
  return BASE_MEMBER_FIELDS.has(field) || CHILD_FIELD_PATTERN.test(field);
}

function isInvalidFieldName(field: string): boolean {
  return (
    field.length > MAX_FIELD_NAME_LENGTH ||
    field === "recordType" ||
    field.startsWith("$") ||
    field.includes("__")
  );
}

export interface MemberPayloadValidationResult {
  success: boolean;
  data?: FamilyMemberRecord;
  error?: string;
}

export function validateMemberPayload(
  payload: unknown,
  existingMember: FamilyMemberRecord | null,
): MemberPayloadValidationResult {
  const parsed = memberPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: "Invalid member payload." };
  }

  const member = parsed.data;
  const keys = Object.keys(member);
  if (keys.length > MAX_MEMBER_FIELDS) {
    return {
      success: false,
      error: "Member payload includes too many fields.",
    };
  }

  const allowedLegacyFields = new Set(Object.keys(existingMember ?? {}));
  for (const field of keys) {
    if (field === "id") {
      continue;
    }

    if (isInvalidFieldName(field)) {
      return {
        success: false,
        error: `Unsupported member field: ${field}.`,
      };
    }

    if (!isSupportedMemberField(field) && !allowedLegacyFields.has(field)) {
      return {
        success: false,
        error: `Unsupported member field: ${field}.`,
      };
    }
  }

  return { success: true, data: member as FamilyMemberRecord };
}
