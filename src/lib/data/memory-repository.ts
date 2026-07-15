import {
  type FamilyRepository,
  InvalidMemberRecordError,
  MemberNotFoundError,
} from "@/lib/data/repository";
import {
  isReservedMemberRecordId,
  LAST_UPDATE_RECORD_ID,
} from "@/lib/member-records";
import { cleanMemberRecord, createGuid } from "@/lib/member-utils";
import type {
  SurveyActivationRecord,
  SurveyResponseRecord,
  SurveySlug,
} from "@/lib/surveys";
import { addCalendarMonths } from "@/lib/surveys";
import type {
  FamilyMemberRecord,
  Gender,
  LastUpdateMetadata,
} from "@/lib/types";

const now = Date.now();

const initialMembers: FamilyMemberRecord[] = [
  {
    id: createGuid(),
    firstName: "Jason",
    lastName: "McPeak",
    gender: "m",
    email: "jason@example.com",
    phone: "555-0123",
    address: "123 Family Ln",
    city: "Nashville",
    theState: "TN",
    country: "USA",
    children: [0],
    firstNameChild0: "Avery",
    lastNameChild0: "McPeak",
    bithdayChild0: "2013-04-15",
    genderChild0: "f",
  },
  {
    id: createGuid(),
    firstName: "Anna",
    lastName: "McPeak",
    firstNameSpouse: "Ryan",
    lastNameSpouse: "McPeak",
    gender: "f",
    genderSpouse: "m",
    email: "anna@example.com",
    city: "Austin",
    theState: "TX",
    children: [0],
    pets: "Golden retriever",
  },
];

const metadata: LastUpdateMetadata = {
  id: LAST_UPDATE_RECORD_ID,
  lastUpdated: now,
  lastUpdatedID: initialMembers[0]?.id,
};

export class MemoryFamilyRepository implements FamilyRepository {
  private readonly memberMap = new Map<string, FamilyMemberRecord>(
    initialMembers.map((member) => [member.id, member]),
  );
  private lastUpdate: LastUpdateMetadata = metadata;
  private readonly surveyActivationMap = new Map<
    SurveySlug,
    SurveyActivationRecord
  >();
  private readonly surveyResponsesMap = new Map<
    SurveySlug,
    SurveyResponseRecord[]
  >();

  async checkReadiness(): Promise<void> {}

  async listMembers(): Promise<FamilyMemberRecord[]> {
    return Array.from(this.memberMap.values()).map((member) => ({ ...member }));
  }

  async getMember(
    id: string,
  ): Promise<FamilyMemberRecord | LastUpdateMetadata | null> {
    if (id === LAST_UPDATE_RECORD_ID) {
      return { ...this.lastUpdate };
    }
    const member = this.memberMap.get(id);
    return member ? { ...member } : null;
  }

  async upsertMember(member: FamilyMemberRecord): Promise<FamilyMemberRecord> {
    const cleaned = cleanMemberRecord(member);
    if (isReservedMemberRecordId(cleaned.id)) {
      throw new InvalidMemberRecordError(
        "Reserved records cannot be edited with the member API.",
      );
    }
    this.memberMap.set(cleaned.id, cleaned);
    this.lastUpdate = {
      id: LAST_UPDATE_RECORD_ID,
      lastUpdated: Date.now(),
      lastUpdatedID: cleaned.id,
    };
    return { ...cleaned };
  }

  async deleteMember(id: string): Promise<void> {
    if (isReservedMemberRecordId(id)) {
      throw new InvalidMemberRecordError(
        "Reserved records cannot be deleted with the member API.",
      );
    }
    if (!this.memberMap.has(id)) {
      throw new MemberNotFoundError(id);
    }

    this.memberMap.delete(id);
    this.lastUpdate = {
      id: LAST_UPDATE_RECORD_ID,
      lastUpdated: Date.now(),
      lastUpdatedID: id,
    };
  }

  async listParents(gender: Gender): Promise<FamilyMemberRecord[]> {
    return Array.from(this.memberMap.values()).filter(
      (entry) => entry.gender === gender || entry.genderSpouse === gender,
    );
  }

  async listEmails(): Promise<string[]> {
    const set = new Set<string>();
    for (const member of this.memberMap.values()) {
      if (member.email && member.email.trim().length > 4) {
        set.add(member.email.trim());
      }
    }
    return Array.from(set);
  }

  async getLastUpdateMetadata(): Promise<LastUpdateMetadata | null> {
    return { ...this.lastUpdate };
  }

  async ensureSurveyActivation(
    slug: SurveySlug,
    durationMonths: number,
    nowMs: number,
  ): Promise<SurveyActivationRecord> {
    const existing = this.surveyActivationMap.get(slug);
    if (existing) {
      return { ...existing };
    }

    const created: SurveyActivationRecord = {
      slug,
      openedAt: nowMs,
      closesAt: addCalendarMonths(nowMs, durationMonths),
    };
    this.surveyActivationMap.set(slug, created);
    return { ...created };
  }

  async listSurveyActivations(): Promise<SurveyActivationRecord[]> {
    return Array.from(this.surveyActivationMap.values()).map((record) => ({
      ...record,
    }));
  }

  async createSurveyResponse(record: SurveyResponseRecord): Promise<void> {
    const existing = this.surveyResponsesMap.get(record.slug) ?? [];
    this.surveyResponsesMap.set(record.slug, [...existing, { ...record }]);
  }

  async listSurveyResponses(slug: SurveySlug): Promise<SurveyResponseRecord[]> {
    return (this.surveyResponsesMap.get(slug) ?? []).map((response) => ({
      ...response,
      payload: { ...response.payload },
    }));
  }
}
