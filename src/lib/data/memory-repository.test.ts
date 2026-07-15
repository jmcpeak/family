import { describe, expect, it } from "vitest";
import { MemoryFamilyRepository } from "@/lib/data/memory-repository";
import {
  InvalidMemberRecordError,
  MemberNotFoundError,
} from "@/lib/data/repository";
import { addCalendarMonths } from "@/lib/surveys/lifecycle";
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

  it("rejects writes to reserved record ids", async () => {
    const repository = new MemoryFamilyRepository();
    await expect(
      repository.upsertMember({
        id: "lastUpdateDate",
        firstName: "Blocked",
      } as FamilyMemberRecord),
    ).rejects.toBeInstanceOf(InvalidMemberRecordError);
  });

  it("throws not found when deleting a missing member", async () => {
    const repository = new MemoryFamilyRepository();
    await expect(repository.deleteMember("missing-id")).rejects.toBeInstanceOf(
      MemberNotFoundError,
    );
  });

  it("creates a single activation window per survey", async () => {
    const repository = new MemoryFamilyRepository();
    const nowMs = Date.UTC(2026, 6, 1);
    const first = await repository.ensureSurveyActivation(
      "2027-reunion-interest",
      3,
      nowMs,
    );
    const second = await repository.ensureSurveyActivation(
      "2027-reunion-interest",
      3,
      nowMs + 5000,
    );

    expect(first).toEqual(second);
    expect(first.closesAt).toBe(addCalendarMonths(nowMs, 3));
  });

  it("stores and lists survey responses", async () => {
    const repository = new MemoryFamilyRepository();
    await repository.createSurveyResponse({
      id: "survey#2027-reunion-interest#response#1",
      slug: "2027-reunion-interest",
      createdAt: 123,
      payload: {
        respondentName: "Alex McPeak",
        attendanceLikelihood: "likely",
        golfInterest: "yes",
        golfFormatPreference: "either",
        luncheonHeadcount: 2,
        dinnerHeadcount: 2,
        pontoonInterest: "maybe",
        lodgingNeeded: false,
      },
    });

    const responses = await repository.listSurveyResponses(
      "2027-reunion-interest",
    );
    expect(responses).toHaveLength(1);
    expect(responses[0]?.payload.respondentName).toBe("Alex McPeak");
  });
});
