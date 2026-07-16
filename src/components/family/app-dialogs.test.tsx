import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/build-info", () => ({
  buildInfo: {
    buildId: "4.0.0+f48ba7d",
    createdAtLabel: "July 16, 2026",
  },
}));

import { AboutDialog } from "@/components/family/app-dialogs";

describe("AboutDialog", () => {
  it("shows build details and support links", () => {
    render(<AboutDialog open onClose={vi.fn()} />);

    expect(screen.getByText("McPeak Family")).toBeTruthy();
    expect(screen.getByText("Cead Mile Failte")).toBeTruthy();
    expect(screen.getByText("4.0.0+f48ba7d")).toBeTruthy();
    expect(screen.getByText("July 16, 2026")).toBeTruthy();

    expect(
      screen.getByRole("link", { name: "jason.mcpeak@gmail.com" }),
    ).toHaveAttribute("href", "mailto:jason.mcpeak@gmail.com");
    expect(screen.getByRole("link", { name: "Report Issue" })).toHaveAttribute(
      "href",
      "https://github.com/jmcpeak/family/issues",
    );
  });
});
