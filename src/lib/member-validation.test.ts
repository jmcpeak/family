import { describe, expect, it } from "vitest";
import { validateMemberPayload } from "@/lib/member-validation";

describe("validateMemberPayload", () => {
  it("accepts known member fields and dynamic child fields", () => {
    const result = validateMemberPayload(
      {
        id: "member-1",
        firstName: "Ada",
        gender: "f",
        children: [0, 1],
        firstNameChild0: "Kid",
      },
      null,
    );

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe("member-1");
  });

  it("rejects unsupported fields on new members", () => {
    const result = validateMemberPayload(
      {
        id: "member-1",
        admin: true,
      },
      null,
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Unsupported member field");
  });

  it("allows legacy fields that already exist on the member", () => {
    const result = validateMemberPayload(
      {
        id: "member-1",
        legacySource: "seed",
      },
      {
        id: "member-1",
        legacySource: "seed",
      },
    );

    expect(result.success).toBe(true);
  });
});
