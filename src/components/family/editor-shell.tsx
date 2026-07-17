"use client";

import Box from "@mui/material/Box";
import { memo } from "react";
import {
  EditorLoadingSkeleton,
  MemberEditor,
} from "@/components/family/member-editor";
import type { SelectOption, TabKey } from "@/lib/family-editor";
import type { FamilyMemberRecord } from "@/lib/types";

interface EditorShellProps {
  selectedUser: FamilyMemberRecord | null;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  parentsLoaded: boolean;
  fatherOptions: SelectOption[];
  motherOptions: SelectOption[];
  displayNameOptions: string[];
  updateField: (field: string, value: string) => void;
  childIndexes: number[];
  removeChild: (index: number) => void;
  showEditorLoadingSkeleton: boolean;
  mobileBrowsing: boolean;
}

export const EditorShell = memo(function EditorShell({
  selectedUser,
  activeTab,
  onTabChange,
  parentsLoaded,
  fatherOptions,
  motherOptions,
  displayNameOptions,
  updateField,
  childIndexes,
  removeChild,
  showEditorLoadingSkeleton,
  mobileBrowsing,
}: EditorShellProps): React.JSX.Element {
  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        minWidth: 0,
        height: "100%",
        overflowY: "auto",
        display: {
          xs: mobileBrowsing ? "none" : "flex",
          md: "flex",
        },
        flexDirection: "column",
        backgroundImage:
          "linear-gradient(135deg, rgba(20, 107, 58, 0.025), transparent 42%, rgba(201, 106, 27, 0.025))",
      }}
    >
      <Box
        sx={{
          p: { xs: 1, sm: 2 },
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box>
          {showEditorLoadingSkeleton ? (
            <EditorLoadingSkeleton activeTab={activeTab} />
          ) : null}
          {!selectedUser && !showEditorLoadingSkeleton ? (
            <Box color="text.secondary">Select a family member to begin.</Box>
          ) : null}
          {selectedUser ? (
            <MemberEditor
              selectedUser={selectedUser}
              activeTab={activeTab}
              onTabChange={onTabChange}
              parentsLoaded={parentsLoaded}
              fatherOptions={fatherOptions}
              motherOptions={motherOptions}
              displayNameOptions={displayNameOptions}
              updateField={updateField}
              childIndexes={childIndexes}
              removeChild={removeChild}
            />
          ) : null}
        </Box>
      </Box>
    </Box>
  );
});
