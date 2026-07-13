import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import type { AwsCredentialIdentityProvider } from "@aws-sdk/types";
import { serverEnv } from "@/lib/env";

let cognitoCredentials: AwsCredentialIdentityProvider | null = null;

export function getDynamoDbCredentials():
  | AwsCredentialIdentityProvider
  | undefined {
  if (!serverEnv.useCognitoCredentials || !serverEnv.cognitoIdentityPoolId) {
    return undefined;
  }

  if (!cognitoCredentials) {
    cognitoCredentials = fromCognitoIdentityPool({
      clientConfig: { region: serverEnv.cognitoRegion },
      identityPoolId: serverEnv.cognitoIdentityPoolId,
    });
  }

  return cognitoCredentials;
}
