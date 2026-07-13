import { describe, expect, it } from "vitest";
import { MemoryFamilyRepository } from "@/lib/data/memory-repository";
import type { FamilyMemberRecord } from "@/lib/types";

describe("MemoryFamilyRepository", () => {
  it("upserts and fetches members", async () => {
    const repository = new MemoryFamilyRepository();
    const member: FamilyMemberRecord = {
      id: "member-1",
      firstName: "Taylor",
      lastName: "Smith",
      gender: "f",
      children: [0],
    };

    await repository.upsertMember(member);
    const saved = await repository.getMember("member-1");

    expect(saved).toMatchObject({
      id: "member-1",
      firstName: "Taylor",
      lastName: "Smith",
    });
  });

  it("updates metadata and removes members", async () => {
    const repository = new MemoryFamilyRepository();
    const member: FamilyMemberRecord = {
      id: "member-2",
      firstName: "Alex",
      lastName: "Stone",
      gender: "m",
    };

    await repository.upsertMember(member);
    await repository.deleteMember(member.id);
    const deleted = await repository.getMember(member.id);
    const metadata = await repository.getLastUpdateMetadata();

    expect(deleted).toBeNull();
    expect(metadata?.lastUpdatedID).toBe(member.id);
  });
});
