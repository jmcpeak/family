import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SmsTermsPage from "./page";

describe("SMS terms page", () => {
  it("is a public SMS program disclosure with STOP language", () => {
    render(<SmsTermsPage />);

    expect(
      screen.getByRole("heading", {
        name: "McPeak Family Directory SMS terms",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Reply STOP to opt out/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to the family directory" }),
    ).toHaveAttribute("href", "/");
  });
});
