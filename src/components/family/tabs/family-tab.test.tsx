import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FamilyMemberRecord } from "@/lib/types";
import { FamilyTab } from "./family-tab";

const MEMBER: FamilyMemberRecord = {
  id: "1",
  firstName: "Ada",
  lastName: "Lovelace",
  gender: "f",
};

describe("FamilyTab", () => {
  it("wires first-name changes to updateField", () => {
    const updateField = vi.fn();
    render(
      <FamilyTab
        selectedUser={MEMBER}
        parentsLoaded
        fatherOptions={[{ value: "", label: "" }]}
        motherOptions={[{ value: "", label: "" }]}
        displayNameOptions={["Ada Lovelace"]}
        updateField={updateField}
      />,
    );

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Grace" },
    });
    expect(updateField).toHaveBeenCalledWith("firstName", "Grace");
  });

  it("renders generated display-name options", () => {
    const updateField = vi.fn();
    render(
      <FamilyTab
        selectedUser={MEMBER}
        parentsLoaded
        fatherOptions={[{ value: "", label: "" }]}
        motherOptions={[{ value: "", label: "" }]}
        displayNameOptions={["Ada Lovelace"]}
        updateField={updateField}
      />,
    );

    expect(
      screen.getByRole("combobox", { name: "How should the name appear?" }),
    ).toBeTruthy();
  });
});
