import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GlobalError from "./global-error";

describe("GlobalError", () => {
  it("renders global recovery actions", () => {
    const reset = vi.fn();
    render(<GlobalError error={new Error("fatal")} reset={reset} />);

    expect(
      screen.getByText("Unexpected application error"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
