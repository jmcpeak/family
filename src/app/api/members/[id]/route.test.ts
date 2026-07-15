import { NextResponse } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemberNotFoundError } from "@/lib/data/repository";

const requireSessionMock = vi.fn();
const getMemberMock = vi.fn();
const upsertMemberMock = vi.fn();
const deleteMemberMock = vi.fn();
const getFamilyRepositoryMock = vi.fn(() => ({
  getMember: getMemberMock,
  upsertMember: upsertMemberMock,
  deleteMember: deleteMemberMock,
}));

vi.mock("@/lib/api-guard", () => ({
  requireSession: requireSessionMock,
}));

vi.mock("@/lib/data", () => ({
  getFamilyRepository: getFamilyRepositoryMock,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("member id route auth guard", () => {
  it("blocks unauthorized PUT requests", async () => {
    requireSessionMock.mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );
    const { PUT } = await import("./route");
    const response = await PUT(
      new Request("http://localhost/api/members/member-1", {
        method: "PUT",
        body: JSON.stringify({ id: "member-1" }),
        headers: { "content-type": "application/json" },
      }),
      { params: Promise.resolve({ id: "member-1" }) },
    );

    expect(response.status).toBe(401);
    expect(getFamilyRepositoryMock).not.toHaveBeenCalled();
  });

  it("blocks unauthorized DELETE requests", async () => {
    requireSessionMock.mockResolvedValueOnce(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );
    const { DELETE } = await import("./route");
    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id: "member-1" }),
    });

    expect(response.status).toBe(401);
    expect(getFamilyRepositoryMock).not.toHaveBeenCalled();
  });

  it("maps delete miss to 404", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    requireSessionMock.mockResolvedValueOnce(null);
    deleteMemberMock.mockRejectedValueOnce(new MemberNotFoundError("member-1"));
    const { DELETE } = await import("./route");
    const response = await DELETE(new Request("http://localhost"), {
      params: Promise.resolve({ id: "member-1" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Member not found.",
    });
    errorSpy.mockRestore();
  });
});
