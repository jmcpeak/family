"use client";

import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useHoverReveal } from "@/hooks/use-hover-reveal";
import { formatLocation, formatMemberName } from "@/lib/member-utils";
import type { FamilyMemberRecord } from "@/lib/types";

interface MemberBrowserProps {
  members: FamilyMemberRecord[];
  lastUpdatedMemberId?: string;
  loading?: boolean;
  onEditMember: (member: FamilyMemberRecord) => void;
}

const MEMBER_ROW_SKELETON_IDS = [
  "member-row-skeleton-1",
  "member-row-skeleton-2",
  "member-row-skeleton-3",
] as const;
const MEMBER_ROW_MIN_HEIGHT = 112;
const SKELETON_FADE_TIMEOUT_MS = 260;

export function MemberBrowser({
  members,
  lastUpdatedMemberId,
  loading = false,
  onEditMember,
}: MemberBrowserProps): React.JSX.Element {
  const editReveal = useHoverReveal();
  const content =
    members.length === 0 ? (
      <Typography color="text.secondary">
        No family members match the current search.
      </Typography>
    ) : (
      <Paper
        elevation={0}
        sx={{ p: 1, border: "none", bgcolor: "transparent" }}
      >
        <Stack spacing={1}>
          {members.map((member) => {
            const name = formatMemberName(member);
            const location = formatLocation(member);
            const revealed = editReveal.isRevealed(member.id);

            return (
              <Box
                key={member.id}
                data-testid={`member-row-${member.id}`}
                role="button"
                tabIndex={0}
                {...editReveal.getRevealProps(member.id)}
                onClick={() => onEditMember(member)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onEditMember(member);
                  }
                }}
                sx={{
                  position: "relative",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  p: 2,
                  minHeight: MEMBER_ROW_MIN_HEIGHT,
                  cursor: "pointer",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: "0 auto 0 0",
                    width: 4,
                    bgcolor: revealed ? "secondary.main" : "primary.main",
                    transition: (theme) =>
                      theme.transitions.create(["width", "background-color"], {
                        duration: theme.transitions.duration.shortest,
                      }),
                  },
                  transition: (theme) =>
                    theme.transitions.create(
                      ["transform", "box-shadow", "border-color"],
                      {
                        duration: theme.transitions.duration.shortest,
                      },
                    ),
                  transform: revealed ? "translateY(-4px)" : "translateY(0)",
                  boxShadow: revealed
                    ? "0 12px 28px rgba(11, 79, 45, 0.14)"
                    : "0 3px 12px rgba(11, 79, 45, 0.05)",
                  "&:hover, &:focus-within": {
                    transform: "translateY(-4px)",
                    borderColor: "primary.light",
                    boxShadow: "0 12px 28px rgba(11, 79, 45, 0.14)",
                  },
                }}
              >
                <Fade in={revealed} timeout={SKELETON_FADE_TIMEOUT_MS}>
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      right: 16,
                      transform: "translateY(-50%)",
                      zIndex: 1,
                      pointerEvents: revealed ? "auto" : "none",
                    }}
                  >
                    <Button
                      startIcon={<EditIcon />}
                      onClick={(event) => {
                        event.stopPropagation();
                        onEditMember(member);
                      }}
                      variant="contained"
                      size="small"
                      aria-label={`Edit ${name}`}
                    >
                      Edit
                    </Button>
                  </Box>
                </Fade>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    pr: 13,
                  }}
                >
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    <Typography sx={{ fontWeight: 600 }}>{name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {location}
                    </Typography>
                    {member.email ? (
                      <Typography variant="body2" color="primary">
                        {member.email}
                      </Typography>
                    ) : null}
                  </Box>
                  {lastUpdatedMemberId === member.id ? (
                    <Chip label="Last Updated" size="small" color="secondary" />
                  ) : null}
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Paper>
    );

  return (
    <Box sx={{ display: "grid" }}>
      <Fade
        in={loading}
        timeout={SKELETON_FADE_TIMEOUT_MS}
        mountOnEnter
        unmountOnExit
      >
        <Paper
          elevation={0}
          sx={{
            gridArea: "1 / 1",
            p: 1,
            border: "none",
            bgcolor: "transparent",
          }}
        >
          <Stack spacing={1}>
            {MEMBER_ROW_SKELETON_IDS.map((skeletonId) => (
              <Box
                key={skeletonId}
                data-testid={skeletonId}
                sx={{
                  position: "relative",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  p: 2,
                  minHeight: MEMBER_ROW_MIN_HEIGHT,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    right: 16,
                    transform: "translateY(-50%)",
                  }}
                >
                  <Skeleton variant="rounded" width={86} height={30} />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                    pr: 11,
                  }}
                >
                  <Skeleton variant="text" width="45%" height={28} />
                  <Skeleton variant="text" width="68%" height={24} />
                  <Skeleton variant="text" width="52%" height={24} />
                </Box>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Fade>
      <Fade
        in={!loading}
        timeout={SKELETON_FADE_TIMEOUT_MS}
        mountOnEnter
        unmountOnExit
      >
        <Box sx={{ gridArea: "1 / 1" }}>{content}</Box>
      </Fade>
    </Box>
  );
}
