import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/build-info", () => ({
  buildInfo: {
    buildId: "4.0.0+f48ba7d",
    createdAtLabel: "July 16, 2026",
  },
}));

import { AboutDialog, EmailsDialog } from "@/components/family/app-dialogs";

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

describe("EmailsDialog", () => {
  const emailRecipients = [
    { id: "m1", label: "Ada Lovelace", contact: "ada@example.com" },
    { id: "m2", label: "Bob Builder", contact: "bob@example.com" },
  ];
  const smsRecipients = [
    { id: "m1", label: "Ada Lovelace", contact: "555-111-2222" },
  ];

  const baseProps = {
    open: true,
    onClose: vi.fn(),
    emailsText: "ada@example.com; bob@example.com",
    emailRecipients,
    smsRecipients,
    selectedEmailMemberIds: ["m1", "m2"] as string[],
    selectedSmsMemberIds: ["m1"] as string[],
    onSelectedEmailMemberIdsChange: vi.fn(),
    onSelectedSmsMemberIdsChange: vi.fn(),
    messageSubject: "McPeak family directory",
    onMessageSubjectChange: vi.fn(),
    messageBody: "Hello family",
    onMessageBodyChange: vi.fn(),
    sendingChannel: null as "email" | "sms" | null,
    blastResult: null as string | null,
    onCopyEmails: vi.fn(),
    onSendEmailBlast: vi.fn(),
    onSendSmsBlast: vi.fn(),
    fullScreen: false,
  };

  it("disables send buttons when no recipients are selected", () => {
    render(
      <EmailsDialog
        {...baseProps}
        selectedEmailMemberIds={[]}
        selectedSmsMemberIds={[]}
        emailsText=""
      />,
    );

    expect(
      screen.getByRole("button", { name: "Send email blast" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Send SMS blast" }),
    ).toBeDisabled();
  });

  it("disables email send when subject is empty", () => {
    render(<EmailsDialog {...baseProps} messageSubject="   " />);

    expect(
      screen.getByRole("button", { name: "Send email blast" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Send SMS blast" }),
    ).not.toBeDisabled();
  });

  it("selects all and clears email recipients", () => {
    const onEmailChange = vi.fn();
    render(
      <EmailsDialog
        {...baseProps}
        selectedEmailMemberIds={["m1"]}
        onSelectedEmailMemberIdsChange={onEmailChange}
      />,
    );

    const selectAllButton = screen.getAllByRole("button", {
      name: "Select all",
    })[0];
    const clearButton = screen.getAllByRole("button", { name: "Clear" })[0];
    expect(selectAllButton).toBeDefined();
    expect(clearButton).toBeDefined();
    if (!selectAllButton || !clearButton) {
      return;
    }

    fireEvent.click(selectAllButton);
    expect(onEmailChange).toHaveBeenCalledWith(["m1", "m2"]);

    fireEvent.click(clearButton);
    expect(onEmailChange).toHaveBeenCalledWith([]);
  });

  it("edits subject and body fields", () => {
    const onSubjectChange = vi.fn();
    const onBodyChange = vi.fn();
    render(
      <EmailsDialog
        {...baseProps}
        onMessageSubjectChange={onSubjectChange}
        onMessageBodyChange={onBodyChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Subject (email)"), {
      target: { value: "Reunion update" },
    });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Please update your info." },
    });

    expect(onSubjectChange).toHaveBeenCalledWith("Reunion update");
    expect(onBodyChange).toHaveBeenCalledWith("Please update your info.");
  });
});
