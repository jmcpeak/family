import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  SMS_CONSENT_SUMMARY,
  SMS_PRIVACY_PATH,
  SMS_TERMS_PATH,
} from "@/lib/messaging/sms-program";
import type { FamilyMemberRecord } from "@/lib/types";
import { AddressTab } from "./address-tab";

const MEMBER: FamilyMemberRecord = {
  id: "1",
  firstName: "Ada",
  lastName: "Lovelace",
  phone: "555-0123",
};

describe("AddressTab", () => {
  it("wires phone changes to updateField", () => {
    const updateField = vi.fn();
    render(<AddressTab selectedUser={MEMBER} updateField={updateField} />);

    fireEvent.change(screen.getByLabelText("Phone"), {
      target: { value: "555-9999" },
    });
    expect(updateField).toHaveBeenCalledWith("phone", "555-9999");
  });

  it("shows SMS consent, STOP language, and public terms links as Phone helper text", () => {
    render(<AddressTab selectedUser={MEMBER} updateField={vi.fn()} />);

    expect(screen.getByLabelText("Phone")).toHaveAccessibleDescription(
      expect.stringContaining(SMS_CONSENT_SUMMARY),
    );
    expect(screen.getByRole("link", { name: "SMS terms" })).toHaveAttribute(
      "href",
      SMS_TERMS_PATH,
    );
    expect(screen.getByRole("link", { name: "SMS privacy" })).toHaveAttribute(
      "href",
      SMS_PRIVACY_PATH,
    );
  });
});
