import { NextResponse } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const requireSessionMock = vi.fn();
const listEmailsMock = vi.fn();
const getFamilyRepositoryMock = vi.fn(() => ({
  listEmails: listEmailsMock,
}));
const blastSiteLinkMock = vi.fn();
const resolveEmailSenderMock = vi.fn();

vi.mock("@/lib/api-guard", () => ({
  requireSession: requireSessionMock,
}));

vi.mock("@/lib/data", () => ({
  getFamilyRepository: getFamilyRepositoryMock,
}));

vi.mock("@/lib/env", () => ({
  serverEnv: {
    messagingDryRun: false,
    sesFromAddress: "noreply@mcpeakfamily.org",
    smsEnabled: false,
  },
}));

vi.mock("@/lib/messaging", () => ({
  blastSiteLink: blastSiteLinkMock,
  resolveEmailSender: resolveEmailSenderMock,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/notify/email", () => {
  it("returns unauthorized when session is missing", async () => {
    requireSessionMock.mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/notify/email", {
        method: "POST",
        body: "{}",
      }),
    );

    expect(response.status).toBe(401);
    expect(blastSiteLinkMock).not.toHaveBeenCalled();
  });

  it("returns 503 when email is not configured", async () => {
    requireSessionMock.mockResolvedValueOnce(null);
    resolveEmailSenderMock.mockImplementationOnce(() => {
      throw new Error(
        "Email sending is not configured. Set FAMILY_SES_FROM_ADDRESS.",
      );
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/notify/email", {
        method: "POST",
        body: "{}",
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Email sending is not configured. Set FAMILY_SES_FROM_ADDRESS.",
    });
  });

  it("blasts emails when authorized", async () => {
    requireSessionMock.mockResolvedValueOnce(null);
    resolveEmailSenderMock.mockReturnValueOnce({ send: vi.fn() });
    listEmailsMock.mockResolvedValueOnce(["ada@example.com"]);
    blastSiteLinkMock.mockResolvedValueOnce({
      sent: 1,
      failed: 0,
      skipped: 0,
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/notify/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dryRun: true }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      channel: "email",
      dryRun: true,
      recipientCount: 1,
      sent: 1,
      failed: 0,
      skipped: 0,
    });
    expect(blastSiteLinkMock).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "email",
        recipients: ["ada@example.com"],
      }),
    );
  });
});
