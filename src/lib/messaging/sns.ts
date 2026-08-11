import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { getDynamoDbCredentials } from "@/lib/aws-credentials";
import { serverEnv } from "@/lib/env";
import type { SmsMessage, SmsSender } from "./types";

let client: SNSClient | null = null;

function getSnsClient(): SNSClient {
  if (client) {
    return client;
  }

  const credentials = getDynamoDbCredentials();
  client = new SNSClient({
    region: serverEnv.awsRegion,
    ...(credentials ? { credentials } : {}),
  });
  return client;
}

export function createSnsSmsSender(): SmsSender {
  return {
    async send(message: SmsMessage): Promise<void> {
      await getSnsClient().send(
        new PublishCommand({
          PhoneNumber: message.toE164,
          Message: message.text,
        }),
      );
    },
  };
}
