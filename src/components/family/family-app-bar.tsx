"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import type { FamilyMemberRecord, LastUpdateMetadata } from "@/lib/types";
import { AppActions } from "./app-actions";
import { useBrowseSearch } from "./browse-search-context";
import { DirectoryStatus } from "./directory-status";
import { FamilyCrest } from "./family-crest";
import { MemberSearch } from "./member-search";

interface FamilyAppBarProps {
  showEditor: boolean;
  desktopBrowsing: boolean;
  desktopEditing: boolean;
  mobileBrowsing: boolean;
  mobileEditing: boolean;
  showMemberTitleSkeleton: boolean;
  selectedMemberTitle: string;
  metadata: LastUpdateMetadata | null;
  members: FamilyMemberRecord[];
  coldMembersLoading: boolean;
  onBack: () => void;
  showAdd: boolean;
  showAddChild: boolean;
  showSave: boolean;
  saving: boolean;
  saveEnabled: boolean;
  saveAttentionActive: boolean;
  onAdd: () => void;
  onAddChild: () => void;
  onSave: () => void;
  onOpenMoreMenu: (anchor: HTMLElement) => void;
  moreMenuOpen: boolean;
}

export function FamilyAppBar({
  showEditor,
  desktopBrowsing,
  desktopEditing,
  mobileBrowsing,
  mobileEditing,
  showMemberTitleSkeleton,
  selectedMemberTitle,
  metadata,
  members,
  coldMembersLoading,
  onBack,
  showAdd,
  showAddChild,
  showSave,
  saving,
  saveEnabled,
  saveAttentionActive,
  onAdd,
  onAddChild,
  onSave,
  onOpenMoreMenu,
  moreMenuOpen,
}: FamilyAppBarProps): React.JSX.Element {
  const { search, setSearch } = useBrowseSearch();

  return (
    <AppBar position="static" elevation={1} sx={{ flexShrink: 0 }}>
      <Toolbar sx={{ gap: 0.5 }}>
        {showEditor ? (
          <IconButton
            color="inherit"
            onClick={onBack}
            aria-label="Back to family member list"
            edge="start"
          >
            <ArrowBackIcon />
          </IconButton>
        ) : null}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flex: 1,
            minWidth: 0,
          }}
        >
          {!showEditor ? <FamilyCrest compact /> : null}
          <Typography
            variant="h6"
            noWrap
            sx={{
              mr: 1,
              minWidth: 0,
              flex: showEditor
                ? "1 1 auto"
                : { xs: "1 1 auto", md: "0 0 auto" },
            }}
          >
            {showMemberTitleSkeleton ? (
              <Skeleton
                component="span"
                variant="text"
                width={180}
                sx={{
                  display: "inline-block",
                  verticalAlign: "middle",
                  bgcolor: "rgba(255, 255, 255, 0.25)",
                }}
              />
            ) : (desktopEditing || mobileEditing) && selectedMemberTitle ? (
              selectedMemberTitle
            ) : (
              "McPeak Family"
            )}
          </Typography>

          {desktopBrowsing ? (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <MemberSearch search={search} setSearch={setSearch} />
            </Box>
          ) : null}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
          <AppActions
            showAdd={showAdd}
            showAddChild={showAddChild}
            showSave={showSave}
            saving={saving}
            saveEnabled={saveEnabled}
            saveAttentionActive={saveAttentionActive}
            onAdd={onAdd}
            onAddChild={onAddChild}
            onSave={onSave}
            onOpenMoreMenu={onOpenMoreMenu}
            moreMenuOpen={moreMenuOpen}
          />
        </Box>
      </Toolbar>

      {desktopBrowsing ? (
        <DirectoryStatus
          mobileLayout
          metadata={metadata}
          members={members}
          coldMembersLoading={coldMembersLoading}
        />
      ) : null}

      {mobileBrowsing ? (
        <>
          <DirectoryStatus
            mobileLayout
            metadata={metadata}
            members={members}
            coldMembersLoading={coldMembersLoading}
          />
          <Box sx={{ px: 2, pb: 1 }}>
            <MemberSearch search={search} setSearch={setSearch} mobileLayout />
          </Box>
        </>
      ) : null}
    </AppBar>
  );
}
