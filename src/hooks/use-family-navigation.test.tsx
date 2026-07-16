import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TabKey } from "@/lib/family-editor";
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

const MEMBERS: FamilyMemberRecord[] = [
  { id: "1", firstName: "Ada", lastName: "Lovelace" },
  { id: "2", firstName: "Grace", lastName: "Hopper" },
];

describe("useFamilyNavigation", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    vi.restoreAllMocks();
  });

  it("loads route member when available and not dirty", () => {
    const onLoadRouteMember = vi.fn();
    const onRouteTabChange = vi.fn();
    const onResetDirty = vi.fn();

    renderHook(() =>
      useFamilyNavigation({
        routeMemberId: "2",
        routeTab: "spouse",
        members: MEMBERS,
        dirty: false,
        desktopDrawer: true,
        onLoadRouteMember,
        onRouteTabChange,
        onResetDirty,
      }),
    );

    expect(onLoadRouteMember).toHaveBeenCalledWith(MEMBERS[1]);
    expect(onRouteTabChange).toHaveBeenCalledWith("spouse");
    expect(onResetDirty).toHaveBeenCalled();
  });

  it("blocks opening member editor if discard is canceled", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const onLoadRouteMember = vi.fn();
    const onRouteTabChange = vi.fn();
    const onResetDirty = vi.fn();
    const onOpenMember = vi.fn();

    const { result } = renderHook(() =>
      useFamilyNavigation({
        routeMemberId: undefined,
        routeTab: "family",
        members: MEMBERS,
        dirty: true,
        desktopDrawer: true,
        onLoadRouteMember,
        onRouteTabChange,
        onResetDirty,
      }),
    );

    act(() => {
      result.current.openMemberEditor(MEMBERS[0], "desktop", onOpenMember);
    });

    expect(onOpenMember).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("returns to browse and navigates home", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const onLoadRouteMember = vi.fn();
    const onRouteTabChange = vi.fn();
    const onResetDirty = vi.fn();

    const { result } = renderHook(() =>
      useFamilyNavigation({
        routeMemberId: "1",
        routeTab: "family",
        members: MEMBERS,
        dirty: true,
        desktopDrawer: false,
        onLoadRouteMember,
        onRouteTabChange,
        onResetDirty,
      }),
    );

    act(() => {
      result.current.returnToBrowse();
    });

    expect(onResetDirty).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("opens members on canonical member route", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const onLoadRouteMember = vi.fn();
    const onRouteTabChange = vi.fn();
    const onResetDirty = vi.fn();
    const onOpenMember = vi.fn();

    const { result } = renderHook(() =>
      useFamilyNavigation({
        routeMemberId: undefined,
        routeTab: "family",
        members: MEMBERS,
        dirty: false,
        desktopDrawer: true,
        onLoadRouteMember,
        onRouteTabChange,
        onResetDirty,
      }),
    );

    act(() => {
      result.current.openMemberEditor(MEMBERS[0], "desktop", onOpenMember);
    });

    expect(onOpenMember).toHaveBeenCalledWith(MEMBERS[0]);
    expect(mockPush).toHaveBeenCalledWith("/1");
  });

  it("keeps the editor open while the member route is pending", () => {
    const onOpenMember = vi.fn();
    const { result } = renderHook(() =>
      useFamilyNavigation({
        routeMemberId: undefined,
        routeTab: "family",
        members: MEMBERS,
        dirty: false,
        desktopDrawer: true,
        onLoadRouteMember: () => {},
        onRouteTabChange: () => {},
        onResetDirty: () => {},
      }),
    );

    act(() => {
      result.current.openMemberEditor(MEMBERS[0], "desktop", onOpenMember);
    });

    expect(result.current.desktopEditing).toBe(true);
  });

  it("pushes member routes without embedding the tab", () => {
    const onLoadRouteMember = vi.fn();
    const onRouteTabChange = vi.fn();
    const onResetDirty = vi.fn();

    const { result } = renderHook(() =>
      useFamilyNavigation({
        routeMemberId: "1",
        routeTab: "family",
        members: MEMBERS,
        dirty: false,
        desktopDrawer: true,
        onLoadRouteMember,
        onRouteTabChange,
        onResetDirty,
      }),
    );

    act(() => {
      result.current.pushMemberRoute("1");
    });

    expect(mockPush).toHaveBeenCalledWith("/1");
  });

  it("syncs tab changes from route updates", () => {
    const onLoadRouteMember = vi.fn();
    const onRouteTabChange = vi.fn();
    const onResetDirty = vi.fn();

    const { rerender } = renderHook(
      ({ routeTab }: { routeTab: TabKey }) =>
        useFamilyNavigation({
          routeMemberId: "1",
          routeTab,
          members: MEMBERS,
          dirty: false,
          desktopDrawer: true,
          onLoadRouteMember,
          onRouteTabChange,
          onResetDirty,
        }),
      {
        initialProps: {
          routeTab: "family" as TabKey,
        },
      },
    );

    expect(onRouteTabChange).toHaveBeenCalledWith("family");

    act(() => {
      rerender({ routeTab: "address" });
    });
    expect(onRouteTabChange).toHaveBeenLastCalledWith("address");

    act(() => {
      rerender({ routeTab: "children" });
    });
    expect(onRouteTabChange).toHaveBeenLastCalledWith("children");
  });
});
