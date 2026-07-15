import { defineConfig, devices } from "@playwright/test";

const localBaseUrl = "http://localhost:3000";
const smokeBaseUrl = process.env.SMOKE_BASE_URL;

export default defineConfig({
  testDir: "./playwright",
  timeout: 90_000,
  expect: {
    timeout: 15_000,
  },
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
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
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
