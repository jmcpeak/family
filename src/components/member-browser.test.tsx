import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemberBrowser } from "@/components/member-browser";
import type { FamilyMemberRecord } from "@/lib/types";

const MEMBERS: FamilyMemberRecord[] = [
  {
    id: "1",
    firstName: "Ada",
    lastName: "Lovelace",
    city: "London",
    theState: "UK",
    email: "ada@example.com",
  },
  {
    id: "2",
    firstName: "Grace",
    lastName: "Hopper",
    city: "Arlington",
    theState: "VA",
  },
];

describe("MemberBrowser", () => {
  it("renders member rows", () => {
    render(
      <MemberBrowser
        members={MEMBERS}
        lastUpdatedMemberId="1"
        onEditMember={vi.fn()}
      />,
    );

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    fireEvent.pointerMove(screen.getByTestId("member-row-1"));
    expect(
      screen.getByRole("button", { name: "Edit Ada Lovelace" }),
    ).toBeVisible();
    expect(screen.getByTestId("member-row-1")).toHaveStyle({
      transform: "translateY(-4px)",
    });
    expect(screen.getByText("Last Updated")).toBeInTheDocument();
  });

  it("renders member rows when selected", () => {
    render(<MemberBrowser members={MEMBERS} onEditMember={vi.fn()} />);

    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
  });

  it("renders three loading skeleton rows while fetching", () => {
    render(<MemberBrowser members={[]} loading onEditMember={vi.fn()} />);

    expect(screen.getAllByTestId(/member-row-skeleton-/)).toHaveLength(3);
  });

  it("opens a member from either the row or edit button", () => {
    const onEditMember = vi.fn();

    render(<MemberBrowser members={MEMBERS} onEditMember={onEditMember} />);

    fireEvent.click(screen.getByText("Ada Lovelace"));
    expect(onEditMember).toHaveBeenCalledWith(MEMBERS[0]);

    onEditMember.mockClear();
    fireEvent.pointerMove(screen.getByTestId("member-row-1"));
    fireEvent.click(screen.getByRole("button", { name: "Edit Ada Lovelace" }));
    expect(onEditMember).toHaveBeenCalledTimes(1);
    expect(onEditMember).toHaveBeenCalledWith(MEMBERS[0]);
  });
});
