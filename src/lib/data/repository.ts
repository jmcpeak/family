import type {
  SurveyActivationRecord,
  SurveyResponseRecord,
  SurveySlug,
} from "@/lib/surveys";
import type {
  FamilyMemberRecord,
  Gender,
  LastUpdateMetadata,
} from "@/lib/types";

export class InvalidMemberRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidMemberRecordError";
  }
}

export class MemberNotFoundError extends Error {
  constructor(id: string) {
    super(`Member not found: ${id}`);
    this.name = "MemberNotFoundError";
  }
}

export interface FamilyRepository {
  checkReadiness(): Promise<void>;
  listMembers(): Promise<FamilyMemberRecord[]>;
  getMember(
    id: string,
  ): Promise<FamilyMemberRecord | LastUpdateMetadata | null>;
  upsertMember(member: FamilyMemberRecord): Promise<FamilyMemberRecord>;
  deleteMember(id: string): Promise<void>;
  listParents(gender: Gender): Promise<FamilyMemberRecord[]>;
  listEmails(): Promise<string[]>;
  getLastUpdateMetadata(): Promise<LastUpdateMetadata | null>;
  ensureSurveyActivation(
    slug: SurveySlug,
    durationMonths: number,
    nowMs: number,
  ): Promise<SurveyActivationRecord>;
  listSurveyActivations(): Promise<SurveyActivationRecord[]>;
  createSurveyResponse(record: SurveyResponseRecord): Promise<void>;
  listSurveyResponses(slug: SurveySlug): Promise<SurveyResponseRecord[]>;
}
