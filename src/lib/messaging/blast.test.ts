import { describe, expect, it, vi } from "vitest";
import { blastSiteLink } from "./blast";
import { normalizePhoneToE164 } from "./phone";
import { siteLinkEmailContent, siteLinkSmsContent } from "./templates";
import type { EmailSender, SmsSender } from "./types";

describe("normalizePhoneToE164", () => {
  it("normalizes US 10-digit numbers", () => {
    expect(normalizePhoneToE164("(555) 012-3456")).toBe("+15550123456");
  });

  it("keeps valid E.164 numbers", () => {
    expect(normalizePhoneToE164("+44 7911 123456")).toBe("+447911123456");
  });

  it("rejects unusable values", () => {
    expect(normalizePhoneToE164("123")).toBeNull();
    expect(normalizePhoneToE164("")).toBeNull();
  });
});

describe("site link templates", () => {
  it("builds email content with the site URL", () => {
    const content = siteLinkEmailContent("https://mcpeakfamily.org");
    expect(content.subject).toBe("McPeak family directory");
    expect(content.text).toContain("https://mcpeakfamily.org");
    expect(content.html).toContain('href="https://mcpeakfamily.org"');
    expect(content.text).not.toMatch(/city|answer|login password/i);
  });

  it("builds a short SMS body", () => {
    const text = siteLinkSmsContent("https://mcpeakfamily.org/");
    expect(text).toContain("https://mcpeakfamily.org");
    expect(text.length).toBeLessThanOrEqual(160);
  });
});

describe("blastSiteLink", () => {
  it("sends unique emails and reports failures", async () => {
    const send = vi.fn(async (message: { to: string }) => {
      if (message.to === "bad@example.com") {
        throw new Error("ses failed");
      }
    });
    const emailSender: EmailSender = { send };

    const result = await blastSiteLink({
      channel: "email",
      recipients: [
        "ada@example.com",
        "ADA@example.com",
        "bad@example.com",
        "x",
        "",
      ],
      emailSender,
      concurrency: 2,
    });

    expect(result).toEqual({ sent: 1, failed: 1, skipped: 2 });
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("sends unique normalized phones", async () => {
    const send = vi.fn(async () => undefined);
    const smsSender: SmsSender = { send };

    const result = await blastSiteLink({
      channel: "sms",
      recipients: ["555-012-3456", "+15550123456", "not-a-phone", ""],
      smsSender,
      concurrency: 1,
    });

    expect(result).toEqual({ sent: 1, failed: 0, skipped: 2 });
    expect(send).toHaveBeenCalledWith({
      toE164: "+15550123456",
      text: expect.stringContaining("mcpeakfamily.org"),
    });
  });

  it("uses custom subject and body for email", async () => {
    const send = vi.fn(async () => undefined);
    const emailSender: EmailSender = { send };

    await blastSiteLink({
      channel: "email",
      recipients: ["ada@example.com"],
      emailSender,
      subject: "Custom subject",
      text: "Line one\nhttps://mcpeakfamily.org\nLine three",
    });

    expect(send).toHaveBeenCalledWith({
      to: "ada@example.com",
      subject: "Custom subject",
      text: "Line one\nhttps://mcpeakfamily.org\nLine three",
      html: expect.stringContaining("https://mcpeakfamily.org"),
    });
  });

  it("uses custom body for SMS", async () => {
    const send = vi.fn(async () => undefined);
    const smsSender: SmsSender = { send };

    await blastSiteLink({
      channel: "sms",
      recipients: ["555-012-3456"],
      smsSender,
      text: "Custom SMS body",
    });

    expect(send).toHaveBeenCalledWith({
      toE164: "+15550123456",
      text: "Custom SMS body",
    });
  });
});
