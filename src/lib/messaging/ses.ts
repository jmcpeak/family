import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { getDynamoDbCredentials } from "@/lib/aws-credentials";
import { serverEnv } from "@/lib/env";
import type { EmailMessage, EmailSender } from "./types";

let client: SESClient | null = null;

function getSesClient(): SESClient {
  if (client) {
    return client;
  }

  const credentials = getDynamoDbCredentials();
  client = new SESClient({
    region: serverEnv.awsRegion,
    ...(credentials ? { credentials } : {}),
  });
  return client;
}

export function createSesEmailSender(fromAddress: string): EmailSender {
  const from = fromAddress.trim();
  if (!from) {
    throw new Error("FAMILY_SES_FROM_ADDRESS is required to send email.");
  }

  return {
    async send(message: EmailMessage): Promise<void> {
      await getSesClient().send(
        new SendEmailCommand({
          Source: from,
          Destination: {
            ToAddresses: [message.to],
          },
          Message: {
            Subject: {
              Data: message.subject,
              Charset: "UTF-8",
            },
            Body: {
              Text: {
                Data: message.text,
                Charset: "UTF-8",
              },
              Html: {
                Data: message.html,
                Charset: "UTF-8",
              },
            },
          },
        }),
      );
    },
  };
}
