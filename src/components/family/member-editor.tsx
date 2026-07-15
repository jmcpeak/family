"use client";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import {
  EDITOR_SKELETON_FIELD_COUNT,
  EDITOR_SKELETON_FIELD_IDS,
  type SelectOption,
  TABS,
  type TabKey,
} from "@/lib/family-editor";
import type { FamilyMemberRecord } from "@/lib/types";
import { TabGrid } from "./editor-fields";
import { AddressTab } from "./tabs/address-tab";
import { ChildrenTab } from "./tabs/children-tab";
import { DatesTab } from "./tabs/dates-tab";
import { FamilyTab } from "./tabs/family-tab";
import { SpouseTab } from "./tabs/spouse-tab";

export function EditorLoadingSkeleton({
  activeTab,
}: {
  activeTab: TabKey;
}): React.JSX.Element {
  return (
    <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Tabs
        value={activeTab}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {TABS.map((tab) => (
          <Tab key={tab.key} value={tab.key} label={tab.label} disabled />
        ))}
      </Tabs>
      <Divider sx={{ mb: 2 }} />
      <TabGrid>
        {EDITOR_SKELETON_FIELD_IDS.slice(
          0,
          EDITOR_SKELETON_FIELD_COUNT[activeTab],
        ).map((fieldId) => (
          <Box key={fieldId}>
            <Skeleton variant="text" width="38%" height={18} />
            <Skeleton variant="rounded" height={40} />
          </Box>
        ))}
        <Box sx={{ gridColumn: "1 / -1" }}>
          <Skeleton variant="text" width={140} height={18} />
          <Skeleton variant="rounded" height={92} />
        </Box>
      </TabGrid>
    </Paper>
  );
}

interface MemberEditorProps {
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
}

export function MemberEditor({
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
}: MemberEditorProps): React.JSX.Element {
  if (!selectedUser) {
    return (
      <Typography color="text.secondary">
        Select a family member to begin.
      </Typography>
    );
  }

  return (
    <Paper
      sx={{
        p: { xs: 1.5, sm: 2 },
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 14px 36px rgba(11, 79, 45, 0.08)",
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(_, value: TabKey) => onTabChange(value)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {TABS.map((tab) => (
          <Tab key={tab.key} value={tab.key} label={tab.label} />
        ))}
      </Tabs>
      <Divider sx={{ mb: 2 }} />

      {activeTab === "family" ? (
        <FamilyTab
          selectedUser={selectedUser}
          parentsLoaded={parentsLoaded}
          fatherOptions={fatherOptions}
          motherOptions={motherOptions}
          displayNameOptions={displayNameOptions}
          updateField={updateField}
        />
      ) : null}
      {activeTab === "address" ? (
        <AddressTab selectedUser={selectedUser} updateField={updateField} />
      ) : null}
      {activeTab === "spouse" ? (
        <SpouseTab selectedUser={selectedUser} updateField={updateField} />
      ) : null}
      {activeTab === "dates" ? (
        <DatesTab selectedUser={selectedUser} updateField={updateField} />
      ) : null}
      {activeTab === "children" ? (
        <ChildrenTab
          selectedUser={selectedUser}
          childIndexes={childIndexes}
          updateField={updateField}
          removeChild={removeChild}
        />
      ) : null}
    </Paper>
  );
}
