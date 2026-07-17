"use client";

import Box from "@mui/material/Box";
import { memo, useMemo } from "react";
import { useBrowseSearch } from "@/components/family/browse-search-context";
import { MemberBrowser } from "@/components/member-browser";
import { filterVisibleMembers } from "@/lib/family-editor";
import type { FamilyMemberRecord } from "@/lib/types";

interface BrowseShellProps {
  members: FamilyMemberRecord[];
  lastUpdatedMemberId?: string;
  loading: boolean;
  mobileBrowsing: boolean;
  desktopBrowsing: boolean;
  onEditMemberMobile: (member: FamilyMemberRecord) => void;
  onEditMemberDesktop: (member: FamilyMemberRecord) => void;
}

export const BrowseShell = memo(function BrowseShell({
  members,
  lastUpdatedMemberId,
  loading,
  mobileBrowsing,
  desktopBrowsing,
  onEditMemberMobile,
  onEditMemberDesktop,
}: BrowseShellProps): React.JSX.Element {
  const { search } = useBrowseSearch();
  const visibleMembers = useMemo(
    () => filterVisibleMembers(members, search),
    [members, search],
  );

  return (
    <>
      <Box
        component="aside"
        aria-label="Family member list"
        sx={{
          display: {
            xs: mobileBrowsing ? "flex" : "none",
            md: "none",
          },
          flex: 1,
          minWidth: 0,
          flexDirection: "column",
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            px: 1.5,
            pt: 1.5,
            pb: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <MemberBrowser
            members={visibleMembers}
            lastUpdatedMemberId={lastUpdatedMemberId}
            loading={loading}
            onEditMember={onEditMemberMobile}
          />
        </Box>
      </Box>

      {desktopBrowsing ? (
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            overflowY: "auto",
            display: "flex",
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
            <MemberBrowser
              members={visibleMembers}
              lastUpdatedMemberId={lastUpdatedMemberId}
              loading={loading}
              onEditMember={onEditMemberDesktop}
            />
          </Box>
        </Box>
      ) : null}
    </>
  );
});
