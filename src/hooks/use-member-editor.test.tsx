import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useMemberEditor } from "@/hooks/use-member-editor";
import type { FamilyMemberRecord } from "@/lib/types";

const BASE_MEMBER: FamilyMemberRecord = {
  id: "member-1",
  firstName: "Ada",
  lastName: "Lovelace",
  gender: "f",
  children: [0],
  firstNameChild0: "Kid",
};

describe("useMemberEditor", () => {
  it("marks draft dirty on field updates", () => {
    const { result } = renderHook(() => useMemberEditor());

    act(() => {
      result.current.openMember(BASE_MEMBER);
      result.current.updateField("address", "123 Main");
    });

    expect(result.current.dirty).toBe(true);
    expect(result.current.selectedUser?.address).toBe("123 Main");
  });

  it("adds and removes child rows", () => {
    const { result } = renderHook(() => useMemberEditor());

    act(() => {
      result.current.openMember(BASE_MEMBER);
      result.current.addChild();
    });
    expect(result.current.childIndexes).toEqual([0, 1]);

    act(() => {
      result.current.updateField("firstNameChild1", "Kid 2");
      result.current.removeChild(1);
    });
    expect(result.current.childIndexes).toEqual([0]);
    expect(result.current.selectedUser?.firstNameChild1).toBeUndefined();
  });

  it("loads route members without resetting active tab", () => {
    const { result } = renderHook(() => useMemberEditor());

    act(() => {
      result.current.openMember(BASE_MEMBER);
      result.current.setActiveTab("spouse");
      result.current.loadMemberFromRoute({
        ...BASE_MEMBER,
        id: "member-2",
        firstName: "Grace",
      });
    });

    expect(result.current.selectedUser?.id).toBe("member-2");
    expect(result.current.activeTab).toBe("spouse");
    expect(result.current.dirty).toBe(false);
  });
});
