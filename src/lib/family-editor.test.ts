import { describe, expect, it } from "vitest";
import {
  addChildRow,
  buildParentSelectOptions,
  copyMember,
  createNewMember,
  earliestDateValue,
  filterVisibleMembers,
  hasRequiredMemberFields,
  isTabKey,
  parseTabKey,
  removeChildRow,
} from "@/lib/family-editor";
import type { FamilyMemberRecord } from "@/lib/types";

describe("family-editor", () => {
  it("creates a new member with required defaults", () => {
    const created = createNewMember();
    expect(created.id).toBeTruthy();
    expect(created.children).toEqual([0]);
    expect(created.gender).toBe("");
    expect(created.genderSpouse).toBe("");
  });

  it("copies members with a cloned children array", () => {
    const original: FamilyMemberRecord = {
      id: "member-1",
      children: [0, 1],
      firstName: "Ada",
    };
    const copied = copyMember(original);
    copied.children?.push(2);
    expect(original.children).toEqual([0, 1]);
    expect(copied.children).toEqual([0, 1, 2]);
  });

  it("selects the earliest valid date", () => {
    expect(earliestDateValue("2022-01-01", "2020-01-01")).toBe("2020-01-01");
    expect(earliestDateValue("invalid", "2020-01-01")).toBe("2020-01-01");
    expect(earliestDateValue("2020-01-01", "invalid")).toBe("2020-01-01");
    expect(earliestDateValue(undefined, undefined)).toBeUndefined();
  });

  it("falls back to an existing member for missing parent options", () => {
    const options = buildParentSelectOptions(
      [{ id: "p-1", firstName: "Known", lastName: "Parent" }],
      "m-1",
      [{ id: "m-1", firstName: "Legacy", lastName: "Member" }],
    );
    expect(options).toEqual([
      { value: "p-1", label: "Known Parent" },
      { value: "m-1", label: "Legacy Member" },
    ]);
  });

  it("adds and removes child rows with legacy dynamic keys", () => {
    const original: FamilyMemberRecord = {
      id: "1",
      children: [0],
      firstNameChild0: "Kid",
      bithdayChild0: "2010-01-01",
    };
    const withExtra = addChildRow(original);
    expect(withExtra.children).toEqual([0, 1]);

    const removed = removeChildRow(
      {
        ...withExtra,
        firstNameChild1: "Kid 2",
        bithdayChild1: "2011-01-01",
      },
      1,
    );
    expect(removed.children).toEqual([0]);
    expect(removed.firstNameChild1).toBeUndefined();
    expect(removed.bithdayChild1).toBeUndefined();
  });

  it("filters members by search while preserving input order", () => {
    const visible = filterVisibleMembers(
      [
        { id: "1", firstName: "A", lastName: "One", city: "Nashville" },
        { id: "2", firstName: "B", lastName: "Two", city: "Knoxville" },
        { id: "3", firstName: "C", lastName: "Three", city: "Nashville" },
      ],
      "nash",
    );
    expect(visible.map((member) => member.id)).toEqual(["1", "3"]);
  });

  it("checks required fields for save validation", () => {
    expect(
      hasRequiredMemberFields({
        id: "1",
        firstName: "Ada",
        lastName: "Lovelace",
        gender: "f",
      }),
    ).toBe(true);
    expect(hasRequiredMemberFields({ id: "1", firstName: "Ada" })).toBe(false);
  });

  it("validates and parses tab keys", () => {
    expect(isTabKey("spouse")).toBe(true);
    expect(isTabKey("notes")).toBe(false);
    expect(parseTabKey("children")).toBe("children");
    expect(parseTabKey(undefined)).toBe("family");
    expect(parseTabKey("notes")).toBe("family");
  });
});
