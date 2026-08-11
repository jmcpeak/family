import { defineConfig, devices } from "@playwright/test";

const localBaseUrl = "http://localhost:3000";
const smokeBaseUrl = process.env.SMOKE_BASE_URL;
const isCi = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./playwright",
  // Smoke before hydration so a cold `next dev` (CI wipes .next) warms up first.
  testMatch: ["**/smoke.spec.ts", "**/hydration.spec.ts"],
  timeout: 120_000,
  expect: {
    timeout: 20_000,
  },
  // One browser at a time against the shared next server in CI.
  workers: isCi ? 1 : undefined,
  retries: isCi ? 2 : 0,
  reporter: [["list"]],
  use: {
    baseURL: smokeBaseUrl ?? localBaseUrl,
    trace: "retain-on-failure",
  },
  webServer: smokeBaseUrl
    ? undefined
    : {
        command:
          "FAMILY_USE_IN_MEMORY_DB=true FAMILY_USE_COGNITO_CREDENTIALS=false FAMILY_DDB_TABLE= FAMILY_LOGIN_ANSWER=smoke-answer npm run dev:http",
        url: localBaseUrl,
        reuseExistingServer: !isCi,
        timeout: 180_000,
      },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
