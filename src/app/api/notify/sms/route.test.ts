import { NextResponse } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const requireSessionMock = vi.fn();
const listPhonesMock = vi.fn();
const getFamilyRepositoryMock = vi.fn(() => ({
  listPhones: listPhonesMock,
}));
const blastSiteLinkMock = vi.fn();
const resolveSmsSenderMock = vi.fn();

const serverEnvState = {
  messagingDryRun: false,
  sesFromAddress: "noreply@mcpeakfamily.org",
  smsEnabled: false,
};

vi.mock("@/lib/api-guard", () => ({
  requireSession: requireSessionMock,
}));

vi.mock("@/lib/data", () => ({
  getFamilyRepository: getFamilyRepositoryMock,
}));

vi.mock("@/lib/env", () => ({
  serverEnv: serverEnvState,
}));

vi.mock("@/lib/messaging", () => ({
  blastSiteLink: blastSiteLinkMock,
  resolveSmsSender: resolveSmsSenderMock,
}));

afterEach(() => {
  vi.clearAllMocks();
  serverEnvState.messagingDryRun = false;
  serverEnvState.smsEnabled = false;
});

describe("POST /api/notify/sms", () => {
  it("returns unauthorized when session is missing", async () => {
    requireSessionMock.mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/notify/sms", {
        method: "POST",
        body: "{}",
      }),
    );

    expect(response.status).toBe(401);
  });

  it("returns 503 when SMS is disabled and not dry-run", async () => {
    requireSessionMock.mockResolvedValueOnce(null);
    serverEnvState.smsEnabled = false;

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/notify/sms", {
        method: "POST",
        body: "{}",
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringContaining("SMS sending is disabled"),
    });
  });

  it("blasts SMS when enabled", async () => {
    requireSessionMock.mockResolvedValueOnce(null);
    serverEnvState.smsEnabled = true;
    resolveSmsSenderMock.mockReturnValueOnce({ send: vi.fn() });
    listPhonesMock.mockResolvedValueOnce(["555-012-3456"]);
    blastSiteLinkMock.mockResolvedValueOnce({
      sent: 1,
      failed: 0,
      skipped: 0,
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/notify/sms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      channel: "sms",
      dryRun: false,
      recipientCount: 1,
      sent: 1,
      failed: 0,
      skipped: 0,
    });
  });
});
