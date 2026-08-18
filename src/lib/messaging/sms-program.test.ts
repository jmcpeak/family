import { describe, expect, it } from "vitest";
import {
  SMS_CONSENT_SUMMARY,
  SMS_OPT_OUT_INSTRUCTIONS,
  SMS_PRIVACY_PARAGRAPHS,
  SMS_PRIVACY_PATH,
  SMS_PROGRAM_NAME,
  SMS_TERMS_PARAGRAPHS,
  SMS_TERMS_PATH,
} from "./sms-program";

describe("SMS program copy", () => {
  it("names the program and includes carrier-required consent language", () => {
    expect(SMS_PROGRAM_NAME).toBe("McPeak Family Directory");
    expect(SMS_CONSENT_SUMMARY).toContain(SMS_PROGRAM_NAME);
    expect(SMS_CONSENT_SUMMARY).toContain("a few messages per year");
    expect(SMS_CONSENT_SUMMARY).toContain("Msg & data rates may apply");
    expect(SMS_CONSENT_SUMMARY).toContain(SMS_OPT_OUT_INSTRUCTIONS);
  });

  it("exposes public terms and privacy paths", () => {
    expect(SMS_TERMS_PATH).toBe("/sms-terms");
    expect(SMS_PRIVACY_PATH).toBe("/sms-privacy");
    expect(SMS_TERMS_PARAGRAPHS.join(" ")).toContain("STOP");
    expect(SMS_PRIVACY_PARAGRAPHS.join(" ")).toContain("STOP");
  });
});
