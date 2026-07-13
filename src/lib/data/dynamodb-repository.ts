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
import type { FamilyRepository } from "@/lib/data/repository";
import { serverEnv } from "@/lib/env";
import { cleanMemberRecord } from "@/lib/member-utils";
import type {
  FamilyMemberRecord,
  Gender,
  LastUpdateMetadata,
} from "@/lib/types";

const LAST_UPDATE_ID = "lastUpdateDate";
const MIN_MEMBER_ID_LENGTH = 15;

function getClient(): DynamoDBDocumentClient {
  const credentials = getDynamoDbCredentials();
  const client = new DynamoDBClient({
    region: serverEnv.awsRegion,
    ...(credentials ? { credentials } : {}),
  });
  return DynamoDBDocumentClient.from(client);
}

export class DynamoDbFamilyRepository implements FamilyRepository {
  private readonly client = getClient();

  constructor(private readonly tableName: string) {}

  async listMembers(): Promise<FamilyMemberRecord[]> {
    const response = await this.client.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "id <> :lastUpdateId AND size(id) > :minLength",
        ExpressionAttributeValues: {
          ":lastUpdateId": LAST_UPDATE_ID,
          ":minLength": MIN_MEMBER_ID_LENGTH,
        },
      }),
    );

    return ((response.Items ?? []) as FamilyMemberRecord[]).map((member) =>
      cleanMemberRecord(member),
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

    if (id === LAST_UPDATE_ID) {
      const raw = response.Item as Partial<LastUpdateMetadata>;
      return {
        id: LAST_UPDATE_ID,
        lastUpdated: Number(raw.lastUpdated ?? 0),
        lastUpdatedID: raw.lastUpdatedID,
      };
    }

    return cleanMemberRecord(response.Item as FamilyMemberRecord);
  }

  async upsertMember(member: FamilyMemberRecord): Promise<FamilyMemberRecord> {
    const cleaned = cleanMemberRecord(member);
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: cleaned,
      }),
    );

    await this.updateLastUpdate(cleaned.id);
    return cleaned;
  }

  async deleteMember(id: string): Promise<void> {
    await this.client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );

    await this.updateLastUpdate(id);
  }

  async listParents(gender: Gender): Promise<FamilyMemberRecord[]> {
    const response = await this.client.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "gender = :gender OR genderSpouse = :gender",
        ExpressionAttributeValues: {
          ":gender": gender,
        },
      }),
    );

    return ((response.Items ?? []) as FamilyMemberRecord[]).map((member) =>
      cleanMemberRecord(member),
    );
  }

  async listEmails(): Promise<string[]> {
    const response = await this.client.send(
      new ScanCommand({
        TableName: this.tableName,
        ProjectionExpression: "email",
        FilterExpression: "attribute_exists(email) AND size(email) > :size",
        ExpressionAttributeValues: {
          ":size": 4,
        },
      }),
    );

    return (response.Items ?? [])
      .map((item) => item.email)
      .filter(
        (value): value is string =>
          typeof value === "string" && value.trim().length > 4,
      );
  }

  async getLastUpdateMetadata(): Promise<LastUpdateMetadata | null> {
    const record = await this.getMember(LAST_UPDATE_ID);
    if (!record || !("lastUpdated" in record)) {
      return null;
    }
    const lastUpdatedID =
      typeof record.lastUpdatedID === "string"
        ? record.lastUpdatedID
        : undefined;

    return {
      id: LAST_UPDATE_ID,
      lastUpdated: Number(record.lastUpdated ?? 0),
      lastUpdatedID,
    };
  }

  private async updateLastUpdate(memberId: string): Promise<void> {
    await this.client.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id: LAST_UPDATE_ID },
        UpdateExpression:
          "SET lastUpdated = :lastUpdated, lastUpdatedID = :lastUpdatedId",
        ExpressionAttributeValues: {
          ":lastUpdated": Date.now(),
          ":lastUpdatedId": memberId,
        },
      }),
    );
  }
}
