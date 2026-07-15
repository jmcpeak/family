"use client";

import { useCallback, useMemo, useState } from "react";
import {
  addChildRow,
  copyMember,
  createNewMember,
  removeChildRow,
  type TabKey,
} from "@/lib/family-editor";
import {
  getChildrenIndexes,
  sortChildrenIndexesByBirthday,
} from "@/lib/member-utils";
import type { FamilyMemberRecord } from "@/lib/types";

export interface UseMemberEditorResult {
  selectedUser: FamilyMemberRecord | null;
  activeTab: TabKey;
  dirty: boolean;
  childIndexes: number[];
  setActiveTab: (tab: TabKey) => void;
  setDirty: (value: boolean) => void;
  loadMemberFromRoute: (member: FamilyMemberRecord) => void;
  openMember: (member: FamilyMemberRecord) => void;
  startNewMember: () => void;
  clearSelection: () => void;
  replaceSelectedUser: (member: FamilyMemberRecord) => void;
  updateField: (field: string, value: string) => void;
  addChild: () => void;
  removeChild: (index: number) => void;
}

export function useMemberEditor(): UseMemberEditorResult {
  const [selectedUser, setSelectedUser] = useState<FamilyMemberRecord | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<TabKey>("family");
  const [dirty, setDirty] = useState(false);

  const loadMemberFromRoute = useCallback(
    (member: FamilyMemberRecord): void => {
      setSelectedUser(copyMember(member));
      setDirty(false);
    },
    [],
  );

  const openMember = useCallback((member: FamilyMemberRecord): void => {
    setSelectedUser(copyMember(member));
    setActiveTab("family");
    setDirty(false);
  }, []);

  const startNewMember = useCallback((): void => {
    setSelectedUser(createNewMember());
    setActiveTab("family");
    setDirty(false);
  }, []);

  const clearSelection = useCallback((): void => {
    setSelectedUser(null);
    setDirty(false);
  }, []);

  const replaceSelectedUser = useCallback(
    (member: FamilyMemberRecord): void => {
      setSelectedUser(copyMember(member));
      setDirty(false);
    },
    [],
  );

  const updateField = useCallback((field: string, value: string): void => {
    setSelectedUser((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        [field]: value,
      };
    });
    setDirty(true);
  }, []);

  const addChild = useCallback((): void => {
    setSelectedUser((previous) => {
      if (!previous) {
        return previous;
      }
      return addChildRow(previous);
    });
    setDirty(true);
  }, []);

  const removeChild = useCallback((index: number): void => {
    setSelectedUser((previous) => {
      if (!previous) {
        return previous;
      }
      return removeChildRow(previous, index);
    });
    setDirty(true);
  }, []);

  const childIndexes = useMemo(() => {
    if (!selectedUser) {
      return [];
    }
    return sortChildrenIndexesByBirthday(
      selectedUser,
      getChildrenIndexes(selectedUser),
    );
  }, [selectedUser]);

  return {
    selectedUser,
    activeTab,
    dirty,
    childIndexes,
    setActiveTab,
    setDirty,
    loadMemberFromRoute,
    openMember,
    startNewMember,
    clearSelection,
    replaceSelectedUser,
    updateField,
    addChild,
    removeChild,
  };
}
