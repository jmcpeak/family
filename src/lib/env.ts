import { z } from "zod";

const LEGACY_COGNITO_IDENTITY_POOL_ID =
  "us-east-1:0531f9e8-90fb-442c-9488-066f62d9a150";
const DEFAULT_SESSION_SECRET = "family-dev-session-secret";
const MIN_SESSION_SECRET_LENGTH = 32;

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
const isProduction = process.env.NODE_ENV === "production";

const useCognitoCredentials = parsed.FAMILY_USE_COGNITO_CREDENTIALS ?? false;
const useInMemoryDb =
  parsed.FAMILY_USE_IN_MEMORY_DB ?? !parsed.FAMILY_DDB_TABLE;
const sessionSecret = parsed.FAMILY_SESSION_SECRET ?? DEFAULT_SESSION_SECRET;

if (isProduction) {
  if (parsed.FAMILY_USE_IN_MEMORY_DB !== false) {
    throw new Error(
      "FAMILY_USE_IN_MEMORY_DB must be explicitly set to false in production.",
    );
  }

  if (!parsed.FAMILY_DDB_TABLE) {
    throw new Error("FAMILY_DDB_TABLE is required in production.");
  }

  if (useInMemoryDb) {
    throw new Error("In-memory repository is not allowed in production.");
  }

  if (useCognitoCredentials) {
    throw new Error(
      "FAMILY_USE_COGNITO_CREDENTIALS must remain false in production.",
    );
  }

  if (
    !parsed.FAMILY_SESSION_SECRET ||
    sessionSecret === DEFAULT_SESSION_SECRET ||
    sessionSecret.length < MIN_SESSION_SECRET_LENGTH
  ) {
    throw new Error(
      `FAMILY_SESSION_SECRET must be set to a strong secret (${MIN_SESSION_SECRET_LENGTH}+ chars) in production.`,
    );
  }

  if (!parsed.FAMILY_LOGIN_ANSWER?.trim()) {
    throw new Error("FAMILY_LOGIN_ANSWER is required in production.");
  }
}

export const serverEnv = {
  awsRegion: parsed.AWS_REGION,
  cognitoIdentityPoolId:
    parsed.FAMILY_COGNITO_IDENTITY_POOL_ID ?? LEGACY_COGNITO_IDENTITY_POOL_ID,
  cognitoRegion: parsed.FAMILY_COGNITO_REGION,
  tableName: parsed.FAMILY_DDB_TABLE,
  useCognitoCredentials,
  useInMemoryDb,
  loginAnswer: parsed.FAMILY_LOGIN_ANSWER,
  sessionSecret,
};
