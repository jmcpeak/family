import { z } from "zod";

const LEGACY_COGNITO_IDENTITY_POOL_ID =
  "us-east-1:0531f9e8-90fb-442c-9488-066f62d9a150";

const serverEnvSchema = z.object({
  AWS_REGION: z.string().default("us-west-2"),
  FAMILY_COGNITO_IDENTITY_POOL_ID: z.string().optional(),
  FAMILY_COGNITO_REGION: z.string().default("us-east-1"),
  FAMILY_DDB_TABLE: z.string().optional(),
  FAMILY_USE_COGNITO_CREDENTIALS: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  FAMILY_USE_IN_MEMORY_DB: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  FAMILY_LOGIN_ANSWER: z.string().optional(),
  FAMILY_SESSION_SECRET: z.string().optional(),
});

const parsed = serverEnvSchema.parse(process.env);

export const serverEnv = {
  awsRegion: parsed.AWS_REGION,
  cognitoIdentityPoolId:
    parsed.FAMILY_COGNITO_IDENTITY_POOL_ID ?? LEGACY_COGNITO_IDENTITY_POOL_ID,
  cognitoRegion: parsed.FAMILY_COGNITO_REGION,
  tableName: parsed.FAMILY_DDB_TABLE,
  useCognitoCredentials: parsed.FAMILY_USE_COGNITO_CREDENTIALS ?? false,
  useInMemoryDb: parsed.FAMILY_USE_IN_MEMORY_DB ?? !parsed.FAMILY_DDB_TABLE,
  loginAnswer: parsed.FAMILY_LOGIN_ANSWER,
  sessionSecret: parsed.FAMILY_SESSION_SECRET ?? "family-dev-session-secret",
};
