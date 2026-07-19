import { describe, expect, it } from "vitest";
import { normalizeParentOptions, toParentOption } from "@/lib/parents";

describe("toParentOption", () => {
  it("uses spouse name when the matching gender is the spouse", () => {
    expect(
      toParentOption(
        {
          id: "member-1",
          firstName: "Pat",
          lastName: "Primary",
          gender: "f",
          firstNameSpouse: "Sam",
          lastNameSpouse: "Spouse",
          genderSpouse: "m",
        },
        "m",
      ),
    ).toEqual({
      id: "member-1",
      firstName: "Sam",
      lastName: "Spouse",
    });
  });

  it("uses primary name when the matching gender is the member", () => {
    expect(
      toParentOption(
        {
          id: "member-2",
          firstName: "Alex",
          lastName: "Parent",
          gender: "m",
        },
        "m",
      ),
    ).toEqual({
      id: "member-2",
      firstName: "Alex",
      lastName: "Parent",
    });
  });
});

describe("normalizeParentOptions", () => {
  it("maps each parent record for the requested gender", () => {
    expect(
      normalizeParentOptions(
        [
          {
            id: "a",
            firstName: "Ada",
            lastName: "Lovelace",
            gender: "f",
          },
        ],
        "f",
      ),
    ).toEqual([{ id: "a", firstName: "Ada", lastName: "Lovelace" }]);
  });
});
