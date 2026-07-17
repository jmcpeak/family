"use client";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import { countFamilyMembers } from "@/lib/member-utils";
import type { FamilyMemberRecord, LastUpdateMetadata } from "@/lib/types";
import { InlineStatusSwap } from "./inline-status-swap";

interface DirectoryStatusProps {
  mobileLayout: boolean;
  metadata: LastUpdateMetadata | null;
  members: FamilyMemberRecord[];
  coldMembersLoading: boolean;
}

export function DirectoryStatus({
  mobileLayout,
  metadata,
  members,
  coldMembersLoading,
}: DirectoryStatusProps): React.JSX.Element {
  const familyMemberCount = useMemo(
    () => countFamilyMembers(members),
    [members],
  );

  return (
    <Box
      sx={{
        color: "inherit",
        px: mobileLayout ? 2 : 0,
        pb: mobileLayout ? 1 : 0,
        minWidth: mobileLayout ? 0 : 190,
        display: mobileLayout ? "flex" : "block",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      <Typography variant="caption" component="div" noWrap>
        Last Update:{" "}
        <InlineStatusSwap
          loading={!metadata?.lastUpdated}
          minWidth={mobileLayout ? 120 : 210}
          skeleton={
            <Skeleton
              component="span"
              variant="text"
              width={mobileLayout ? 120 : 210}
              sx={{ display: "inline-block", verticalAlign: "middle" }}
            />
          }
          value={
            metadata?.lastUpdated
              ? new Date(metadata.lastUpdated).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : null
          }
        />
      </Typography>
      <Typography variant="caption" component="div" noWrap>
        <InlineStatusSwap
          loading={coldMembersLoading}
          minWidth={mobileLayout ? 28 : 36}
          skeleton={
            <Skeleton
              component="span"
              variant="text"
              width={mobileLayout ? 28 : 36}
              sx={{ display: "inline-block", verticalAlign: "middle" }}
            />
          }
          value={familyMemberCount}
        />{" "}
        Family Members
      </Typography>
    </Box>
  );
}
