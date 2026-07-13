import type {
  FamilyMemberRecord,
  Gender,
  LastUpdateMetadata,
} from "@/lib/types";

export interface FamilyRepository {
  listMembers(): Promise<FamilyMemberRecord[]>;
  getMember(
    id: string,
  ): Promise<FamilyMemberRecord | LastUpdateMetadata | null>;
  upsertMember(member: FamilyMemberRecord): Promise<FamilyMemberRecord>;
  deleteMember(id: string): Promise<void>;
  listParents(gender: Gender): Promise<FamilyMemberRecord[]>;
  listEmails(): Promise<string[]>;
  getLastUpdateMetadata(): Promise<LastUpdateMetadata | null>;
}
