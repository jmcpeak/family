import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { getDynamoDbCredentials } from "@/lib/aws-credentials";
import {
  type FamilyRepository,
  InvalidMemberRecordError,
  MemberNotFoundError,
} from "@/lib/data/repository";
import { serverEnv } from "@/lib/env";
import {
  isReservedMemberRecordId,
  LAST_UPDATE_RECORD_ID,
} from "@/lib/member-records";
import { cleanMemberRecord } from "@/lib/member-utils";
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

const MIN_MEMBER_ID_LENGTH = 15;
const MEMBER_RECORD_TYPE = "member";
const SURVEY_ACTIVATION_RECORD_TYPE = "surveyActivation";
const SURVEY_RESPONSE_RECORD_TYPE = "surveyResponse";

interface SurveyActivationItem {
  id: string;
  recordType: typeof SURVEY_ACTIVATION_RECORD_TYPE;
  slug: SurveySlug;
  openedAt: number;
  closesAt: number;
}

interface SurveyResponseItem {
  id: string;
  recordType: typeof SURVEY_RESPONSE_RECORD_TYPE;
  slug: SurveySlug;
  createdAt: number;
  payload: SurveyResponseRecord["payload"];
}

function getSurveyActivationId(slug: SurveySlug): string {
  return `survey#${slug}#activation`;
}

function getClient(): DynamoDBDocumentClient {
  const credentials = getDynamoDbCredentials();
  const client = new DynamoDBClient({
    region: serverEnv.awsRegion,
    ...(credentials ? { credentials } : {}),
  });
  return DynamoDBDocumentClient.from(client);
}

type ScanPageParams = {
  FilterExpression?: string;
  ExpressionAttributeValues?: Record<string, unknown>;
  ProjectionExpression?: string;
};

export class DynamoDbFamilyRepository implements FamilyRepository {
  private readonly client = getClient();
  private memberTypeScanInflight: Promise<FamilyMemberRecord[]> | null = null;

  constructor(private readonly tableName: string) {}

  private async scanAllPages(
    params: ScanPageParams,
  ): Promise<Record<string, unknown>[]> {
    const items: Record<string, unknown>[] = [];
    let exclusiveStartKey: Record<string, unknown> | undefined;

    do {
      const response = await this.client.send(
        new ScanCommand({
          TableName: this.tableName,
          ...params,
          ExclusiveStartKey: exclusiveStartKey,
        }),
      );
      if (response.Items) {
        items.push(...(response.Items as Record<string, unknown>[]));
      }
      exclusiveStartKey = response.LastEvaluatedKey as
        | Record<string, unknown>
        | undefined;
    } while (exclusiveStartKey);

    return items;
  }

  private async scanMemberTypeRecords(): Promise<FamilyMemberRecord[]> {
    const items = await this.scanAllPages({
      FilterExpression:
        "attribute_not_exists(recordType) OR recordType = :memberRecordType",
      ExpressionAttributeValues: {
        ":memberRecordType": MEMBER_RECORD_TYPE,
      },
    });

    return items.map((item) => cleanMemberRecord(item as FamilyMemberRecord));
  }

  private loadMemberTypeRecords(): Promise<FamilyMemberRecord[]> {
    if (!this.memberTypeScanInflight) {
      this.memberTypeScanInflight = this.scanMemberTypeRecords().finally(() => {
        this.memberTypeScanInflight = null;
      });
    }
    return this.memberTypeScanInflight;
  }

  async checkReadiness(): Promise<void> {
    await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id: LAST_UPDATE_RECORD_ID },
        ProjectionExpression: "id",
      }),
    );
  }

  async listMembers(): Promise<FamilyMemberRecord[]> {
    const records = await this.loadMemberTypeRecords();
    return records.filter(
      (member) =>
        member.id !== LAST_UPDATE_RECORD_ID &&
        member.id.length > MIN_MEMBER_ID_LENGTH,
    );
  }

  async getMember(
    id: string,
  ): Promise<FamilyMemberRecord | LastUpdateMetadata | null> {
    const response = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );

    if (!response.Item) {
      return null;
    }

    if (id === LAST_UPDATE_RECORD_ID) {
      const raw = response.Item as Partial<LastUpdateMetadata>;
      return {
        id: LAST_UPDATE_RECORD_ID,
        lastUpdated: Number(raw.lastUpdated ?? 0),
        lastUpdatedID: raw.lastUpdatedID,
      };
    }

    const typedItem = response.Item as Partial<FamilyMemberRecord> & {
      recordType?: string;
    };
    if (
      typeof typedItem.recordType === "string" &&
      typedItem.recordType !== MEMBER_RECORD_TYPE
    ) {
      return null;
    }

    return cleanMemberRecord(response.Item as FamilyMemberRecord);
  }

  async upsertMember(member: FamilyMemberRecord): Promise<FamilyMemberRecord> {
    const cleaned = cleanMemberRecord(member);
    if (isReservedMemberRecordId(cleaned.id)) {
      throw new InvalidMemberRecordError(
        "Reserved records cannot be edited with the member API.",
      );
    }

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          ...cleaned,
          recordType: MEMBER_RECORD_TYPE,
        },
        ConditionExpression:
          "attribute_not_exists(id) OR attribute_not_exists(recordType) OR recordType = :memberRecordType",
        ExpressionAttributeValues: {
          ":memberRecordType": MEMBER_RECORD_TYPE,
        },
      }),
    );

    await this.updateLastUpdate(cleaned.id);
    return cleaned;
  }

  async deleteMember(id: string): Promise<void> {
    if (isReservedMemberRecordId(id)) {
      throw new InvalidMemberRecordError(
        "Reserved records cannot be deleted with the member API.",
      );
    }

    try {
      await this.client.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: { id },
          ConditionExpression:
            "attribute_exists(id) AND (attribute_not_exists(recordType) OR recordType = :memberRecordType)",
          ExpressionAttributeValues: {
            ":memberRecordType": MEMBER_RECORD_TYPE,
          },
        }),
      );
    } catch (error) {
      const maybeError = error as { name?: string };
      if (maybeError.name === "ConditionalCheckFailedException") {
        throw new MemberNotFoundError(id);
      }
      throw error;
    }

    await this.updateLastUpdate(id);
  }

  async listParents(gender: Gender): Promise<FamilyMemberRecord[]> {
    const records = await this.loadMemberTypeRecords();
    return records.filter(
      (entry) => entry.gender === gender || entry.genderSpouse === gender,
    );
  }

  async listEmails(): Promise<string[]> {
    const items = await this.scanAllPages({
      ProjectionExpression: "email",
      FilterExpression:
        "attribute_exists(email) AND size(email) > :size AND (attribute_not_exists(recordType) OR recordType = :memberRecordType)",
      ExpressionAttributeValues: {
        ":size": 4,
        ":memberRecordType": MEMBER_RECORD_TYPE,
      },
    });

    return items
      .map((item) => item.email)
      .filter(
        (value): value is string =>
          typeof value === "string" && value.trim().length > 4,
      );
  }

  async getLastUpdateMetadata(): Promise<LastUpdateMetadata | null> {
    const record = await this.getMember(LAST_UPDATE_RECORD_ID);
    if (!record || !("lastUpdated" in record)) {
      return null;
    }
    const lastUpdatedID =
      typeof record.lastUpdatedID === "string"
        ? record.lastUpdatedID
        : undefined;

    return {
      id: LAST_UPDATE_RECORD_ID,
      lastUpdated: Number(record.lastUpdated ?? 0),
      lastUpdatedID,
    };
  }

  private async updateLastUpdate(memberId: string): Promise<void> {
    await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id: LAST_UPDATE_RECORD_ID },
        UpdateExpression:
          "SET lastUpdated = :lastUpdated, lastUpdatedID = :lastUpdatedId",
        ExpressionAttributeValues: {
          ":lastUpdated": Date.now(),
          ":lastUpdatedId": memberId,
        },
      }),
    );
  }

  async ensureSurveyActivation(
    slug: SurveySlug,
    durationMonths: number,
    nowMs: number,
  ): Promise<SurveyActivationRecord> {
    const id = getSurveyActivationId(slug);
    const existing = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );
    if (existing.Item) {
      const activation = existing.Item as Partial<SurveyActivationItem>;
      return {
        slug,
        openedAt: Number(activation.openedAt ?? nowMs),
        closesAt: Number(
          activation.closesAt ?? addCalendarMonths(nowMs, durationMonths),
        ),
      };
    }

    const activation: SurveyActivationItem = {
      id,
      recordType: SURVEY_ACTIVATION_RECORD_TYPE,
      slug,
      openedAt: nowMs,
      closesAt: addCalendarMonths(nowMs, durationMonths),
    };

    try {
      await this.client.send(
        new PutCommand({
          TableName: this.tableName,
          Item: activation,
          ConditionExpression: "attribute_not_exists(id)",
        }),
      );
      return {
        slug: activation.slug,
        openedAt: activation.openedAt,
        closesAt: activation.closesAt,
      };
    } catch (error) {
      const maybeError = error as { name?: string };
      if (maybeError.name !== "ConditionalCheckFailedException") {
        throw error;
      }

      const current = await this.client.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { id },
        }),
      );
      if (!current.Item) {
        throw error;
      }
      const item = current.Item as Partial<SurveyActivationItem>;
      return {
        slug,
        openedAt: Number(item.openedAt ?? nowMs),
        closesAt: Number(
          item.closesAt ?? addCalendarMonths(nowMs, durationMonths),
        ),
      };
    }
  }

  async listSurveyActivations(): Promise<SurveyActivationRecord[]> {
    const items = await this.scanAllPages({
      FilterExpression: "recordType = :recordType",
      ExpressionAttributeValues: {
        ":recordType": SURVEY_ACTIVATION_RECORD_TYPE,
      },
    });

    return items
      .map((item) => item as Partial<SurveyActivationItem>)
      .filter(
        (item): item is SurveyActivationItem =>
          typeof item.slug === "string" &&
          typeof item.openedAt === "number" &&
          typeof item.closesAt === "number",
      )
      .map((item) => ({
        slug: item.slug,
        openedAt: item.openedAt,
        closesAt: item.closesAt,
      }));
  }

  async createSurveyResponse(record: SurveyResponseRecord): Promise<void> {
    const item: SurveyResponseItem = {
      id: record.id,
      recordType: SURVEY_RESPONSE_RECORD_TYPE,
      slug: record.slug,
      createdAt: record.createdAt,
      payload: record.payload,
    };
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item,
      }),
    );
  }

  async listSurveyResponses(slug: SurveySlug): Promise<SurveyResponseRecord[]> {
    const items = await this.scanAllPages({
      FilterExpression: "recordType = :recordType AND slug = :slug",
      ExpressionAttributeValues: {
        ":recordType": SURVEY_RESPONSE_RECORD_TYPE,
        ":slug": slug,
      },
    });

    return items
      .map((item) => item as Partial<SurveyResponseItem>)
      .filter(
        (item): item is SurveyResponseItem =>
          typeof item.id === "string" &&
          typeof item.slug === "string" &&
          typeof item.createdAt === "number" &&
          typeof item.payload === "object" &&
          item.payload !== null,
      )
      .map((item) => ({
        id: item.id,
        slug: item.slug,
        createdAt: item.createdAt,
        payload: item.payload,
      }));
  }
}
