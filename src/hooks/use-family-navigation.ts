"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TabKey } from "@/lib/family-editor";
import type { FamilyMemberRecord } from "@/lib/types";

type EditorSource = "desktop" | "mobile";
type DesktopMode = "browse" | "edit";

interface UseFamilyNavigationArgs {
  routeMemberId?: string;
  routeTab: TabKey;
  members: FamilyMemberRecord[];
  dirty: boolean;
  desktopDrawer: boolean;
  onLoadRouteMember: (member: FamilyMemberRecord) => void;
  onRouteTabChange: (tab: TabKey) => void;
  onResetDirty: () => void;
}

export interface UseFamilyNavigationResult {
  desktopMode: DesktopMode;
  mobileListOpen: boolean;
  desktopBrowsing: boolean;
  desktopEditing: boolean;
  mobileBrowsing: boolean;
  mobileEditing: boolean;
  showEditor: boolean;
  showDeleteAction: boolean;
  pushMemberRoute: (memberId: string) => void;
  openMemberEditor: (
    member: FamilyMemberRecord,
    source: EditorSource,
    onOpenMember: (member: FamilyMemberRecord) => void,
  ) => void;
  returnToBrowse: () => void;
  showEditorLayout: () => void;
  resetToBrowse: () => void;
  replaceHomeRoute: () => void;
}

export function useFamilyNavigation({
  routeMemberId,
  routeTab,
  members,
  dirty,
  desktopDrawer,
  onLoadRouteMember,
  onRouteTabChange,
  onResetDirty,
}: UseFamilyNavigationArgs): UseFamilyNavigationResult {
  const router = useRouter();
  const [desktopMode, setDesktopMode] = useState<DesktopMode>(
    routeMemberId ? "edit" : "browse",
  );
  const [mobileListOpen, setMobileListOpen] = useState(!routeMemberId);
  const loadedRouteMemberIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (routeMemberId) {
      onRouteTabChange(routeTab);
      const routeMember = members.find((member) => member.id === routeMemberId);
      if (
        routeMember &&
        !dirty &&
        loadedRouteMemberIdRef.current !== routeMemberId
      ) {
        onLoadRouteMember(routeMember);
        onResetDirty();
        loadedRouteMemberIdRef.current = routeMemberId;
      }
      return;
    }

    loadedRouteMemberIdRef.current = null;
  }, [
    dirty,
    members,
    onLoadRouteMember,
    onRouteTabChange,
    onResetDirty,
    routeTab,
    routeMemberId,
  ]);

  useEffect(() => {
    if (desktopDrawer) {
      setDesktopMode(routeMemberId ? "edit" : "browse");
    } else {
      setMobileListOpen(!routeMemberId);
    }
  }, [desktopDrawer, routeMemberId]);

  const pushMemberRoute = useCallback(
    (memberId: string): void => {
      router.push(`/${encodeURIComponent(memberId)}`);
    },
    [router],
  );

  const confirmDiscard = useCallback(
    (message: string): boolean => {
      if (!dirty) {
        return true;
      }
      return window.confirm(message);
    },
    [dirty],
  );

  const openMemberEditor = useCallback(
    (
      member: FamilyMemberRecord,
      source: EditorSource,
      onOpenMember: (member: FamilyMemberRecord) => void,
    ): void => {
      if (!confirmDiscard("Discard unsaved changes?")) {
        return;
      }

      onOpenMember(member);
      pushMemberRoute(member.id);
      if (source === "mobile") {
        setMobileListOpen(false);
        return;
      }

      setDesktopMode("edit");
    },
    [confirmDiscard, pushMemberRoute],
  );

  const returnToBrowse = useCallback((): void => {
    if (!confirmDiscard("Discard unsaved changes?")) {
      return;
    }

    onResetDirty();
    if (desktopDrawer) {
      setDesktopMode("browse");
    } else {
      setMobileListOpen(true);
    }
    router.push("/");
  }, [confirmDiscard, desktopDrawer, onResetDirty, router]);

  const showEditorLayout = useCallback((): void => {
    if (desktopDrawer) {
      setDesktopMode("edit");
    } else {
      setMobileListOpen(false);
    }
  }, [desktopDrawer]);

  const resetToBrowse = useCallback((): void => {
    setDesktopMode("browse");
    setMobileListOpen(true);
  }, []);

  const replaceHomeRoute = useCallback((): void => {
    router.replace("/");
  }, [router]);

  const {
    desktopBrowsing,
    desktopEditing,
    mobileBrowsing,
    mobileEditing,
    showEditor,
    showDeleteAction,
  } = useMemo(() => {
    const nextDesktopBrowsing = desktopDrawer && desktopMode === "browse";
    const nextDesktopEditing = desktopDrawer && desktopMode === "edit";
    const nextMobileBrowsing = !desktopDrawer && mobileListOpen;
    const nextMobileEditing = !desktopDrawer && !mobileListOpen;
    const nextShowEditor = nextDesktopEditing || nextMobileEditing;
    const nextShowDeleteAction = nextDesktopEditing || nextMobileEditing;

    return {
      desktopBrowsing: nextDesktopBrowsing,
      desktopEditing: nextDesktopEditing,
      mobileBrowsing: nextMobileBrowsing,
      mobileEditing: nextMobileEditing,
      showEditor: nextShowEditor,
      showDeleteAction: nextShowDeleteAction,
    };
  }, [desktopDrawer, desktopMode, mobileListOpen]);

  return {
    desktopMode,
    mobileListOpen,
    desktopBrowsing,
    desktopEditing,
    mobileBrowsing,
    mobileEditing,
    showEditor,
    showDeleteAction,
    pushMemberRoute,
    openMemberEditor,
    returnToBrowse,
    showEditorLayout,
    resetToBrowse,
    replaceHomeRoute,
  };
}
