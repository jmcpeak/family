import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SmsPrivacyPage from "./page";

describe("SMS privacy page", () => {
  it("explains how phone numbers are used and how to opt out", () => {
    render(<SmsPrivacyPage />);

    expect(
      screen.getByRole("heading", {
        name: "McPeak Family Directory SMS privacy",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/do not sell phone numbers/i)).toBeInTheDocument();
    expect(screen.getByText(/replying STOP/i)).toBeInTheDocument();
  });
});
