import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FamilyNotFound from "./not-found";

describe("FamilyNotFound", () => {
  it("renders a home navigation action", () => {
    render(<FamilyNotFound />);

    expect(screen.getByText("Page not found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
