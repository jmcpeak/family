import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SMS_CONSENT_SUMMARY } from "@/lib/messaging/sms-program";
import SmsProgramPage from "./page";

describe("SMS public info page", () => {
  it("is public program disclosure with opt-in mock and legal links", () => {
    render(<SmsProgramPage />);

    expect(
      screen.getByRole("heading", {
        name: "McPeak Family Directory SMS program",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/No login required/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Phone")).toBeInTheDocument();
    expect(
      screen.getByText(SMS_CONSENT_SUMMARY, { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "SMS terms" })[0]).toHaveAttribute(
      "href",
      "/sms-terms",
    );
    expect(screen.getAllByRole("link", { name: "SMS privacy" })[0]).toHaveAttribute(
      "href",
      "/sms-privacy",
    );
  });
});
