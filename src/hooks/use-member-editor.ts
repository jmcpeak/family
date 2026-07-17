"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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

function childSortSignature(member: FamilyMemberRecord | null): string {
  if (!member) {
    return "";
  }
  const indexes = getChildrenIndexes(member);
  return indexes
    .map((index) => `${index}:${String(member[`bithdayChild${index}`] ?? "")}`)
    .join("|");
}

export function useMemberEditor(): UseMemberEditorResult {
  const [selectedUser, setSelectedUser] = useState<FamilyMemberRecord | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<TabKey>("family");
  const [dirty, setDirty] = useState(false);
  const selectedUserRef = useRef(selectedUser);
  selectedUserRef.current = selectedUser;

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

  const childrenSignature = childSortSignature(selectedUser);
  const childIndexes = useMemo(() => {
    if (!childrenSignature) {
      return [];
    }
    const member = selectedUserRef.current;
    if (!member) {
      return [];
    }
    return sortChildrenIndexesByBirthday(member, getChildrenIndexes(member));
  }, [childrenSignature]);

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
