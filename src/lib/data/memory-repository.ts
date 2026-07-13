import type { FamilyRepository } from "@/lib/data/repository";
import { cleanMemberRecord, createGuid } from "@/lib/member-utils";
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
  id: "lastUpdateDate",
  lastUpdated: now,
  lastUpdatedID: initialMembers[0]?.id,
};

export class MemoryFamilyRepository implements FamilyRepository {
  private readonly memberMap = new Map<string, FamilyMemberRecord>(
    initialMembers.map((member) => [member.id, member]),
  );
  private lastUpdate: LastUpdateMetadata = metadata;

  async listMembers(): Promise<FamilyMemberRecord[]> {
    return Array.from(this.memberMap.values()).map((member) => ({ ...member }));
  }

  async getMember(
    id: string,
  ): Promise<FamilyMemberRecord | LastUpdateMetadata | null> {
    if (id === "lastUpdateDate") {
      return { ...this.lastUpdate };
    }
    const member = this.memberMap.get(id);
    return member ? { ...member } : null;
  }

  async upsertMember(member: FamilyMemberRecord): Promise<FamilyMemberRecord> {
    const cleaned = cleanMemberRecord(member);
    this.memberMap.set(cleaned.id, cleaned);
    this.lastUpdate = {
      id: "lastUpdateDate",
      lastUpdated: Date.now(),
      lastUpdatedID: cleaned.id,
    };
    return { ...cleaned };
  }

  async deleteMember(id: string): Promise<void> {
    this.memberMap.delete(id);
    this.lastUpdate = {
      id: "lastUpdateDate",
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
}
