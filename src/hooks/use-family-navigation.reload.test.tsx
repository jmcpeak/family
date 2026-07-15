import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FamilyMemberRecord } from "@/lib/types";
import { useFamilyNavigation } from "./use-family-navigation";

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

const MEMBER: FamilyMemberRecord = {
  id: "1",
  firstName: "Ada",
  lastName: "Lovelace",
};

describe("useFamilyNavigation route reload", () => {
  it("does not reload the same route member when members array identity changes", () => {
    const onLoadRouteMember = vi.fn();
    const onRouteTabChange = vi.fn();
    const onResetDirty = vi.fn();

    const { rerender } = renderHook(
      ({ members }) =>
        useFamilyNavigation({
          routeMemberId: "1",
          routeTab: "family",
          members,
          dirty: false,
          desktopDrawer: true,
          onLoadRouteMember,
          onRouteTabChange,
          onResetDirty,
        }),
      {
        initialProps: {
          members: [MEMBER],
        },
      },
    );

    expect(onLoadRouteMember).toHaveBeenCalledTimes(1);

    act(() => {
      rerender({ members: [{ ...MEMBER }] });
      rerender({ members: [{ ...MEMBER }] });
      rerender({ members: [{ ...MEMBER }] });
    });

    expect(onLoadRouteMember).toHaveBeenCalledTimes(1);
  });
});
