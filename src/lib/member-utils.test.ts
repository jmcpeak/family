import { describe, expect, it } from "vitest";
import {
  buildDisplayNameOptions,
  cleanMemberRecord,
  countFamilyMembers,
  formatDurationYears,
  hashCode,
} from "@/lib/member-utils";
import type { FamilyMemberRecord } from "@/lib/types";

describe("hashCode", () => {
  it("matches deterministic legacy hashing behavior", () => {
    expect(hashCode("abc")).toBe(96354);
    expect(hashCode("family")).toBe(-1281860764);
  });
});

describe("cleanMemberRecord", () => {
  it("drops unsupported fields and ensures children array", () => {
    const input = {
      id: "123",
      firstName: "Ada",
      $$hashKey: "object:1",
      empty: undefined,
      children: [],
    } as unknown as FamilyMemberRecord;

    const cleaned = cleanMemberRecord(input);
    expect(cleaned).toEqual({
      id: "123",
      firstName: "Ada",
      children: [0],
    });
  });

  it("converts DynamoDB number sets for children", () => {
    const input = {
      id: "123",
      firstName: "Ada",
      children: new Set([2, 0, 1]),
      firstNameChild0: "One",
      firstNameChild1: "Two",
      firstNameChild2: "Three",
    } as unknown as FamilyMemberRecord;

    const cleaned = cleanMemberRecord(input);
    expect(cleaned.children).toEqual([0, 1, 2]);
  });
});

describe("buildDisplayNameOptions", () => {
  it("builds display options from member and spouse names", () => {
    const member: FamilyMemberRecord = {
      id: "1",
      firstName: "Jane",
      lastName: "Doe",
      firstNameSpouse: "John",
      lastNameSpouse: "Doe",
    };

    const options = buildDisplayNameOptions(member).map((item) => item.display);
    expect(options).toContain("Jane Doe");
    expect(options).toContain("John Doe");
    expect(options).toContain("Jane & John Doe");
  });
});

describe("countFamilyMembers", () => {
  it("includes spouse and populated children", () => {
    const members: FamilyMemberRecord[] = [
      {
        id: "1",
        firstName: "Parent",
        lastName: "One",
        firstNameSpouse: "Spouse",
        children: [0, 1],
        firstNameChild0: "Kid",
        firstNameChild1: "",
      },
    ];

    expect(countFamilyMembers(members)).toBe(3);
  });

  it("counts children stored as DynamoDB number sets", () => {
    const members = [
      {
        id: "1",
        firstName: "Parent",
        lastName: "One",
        children: new Set([0, 1]),
        firstNameChild0: "Kid 1",
        firstNameChild1: "Kid 2",
      },
    ] as unknown as FamilyMemberRecord[];

    expect(countFamilyMembers(members)).toBe(3);
  });
});

describe("formatDurationYears", () => {
  it("formats year counts in a human readable way", () => {
    expect(formatDurationYears("2020-01-01", "2021-01-01")).toContain("1 year");
    expect(formatDurationYears("2024-01-01", "2024-03-01")).toContain(
      "less than a year",
    );
  });
});
