"use client";

import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SaveIcon from "@mui/icons-material/Save";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";

interface AppActionsProps {
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

export function AppActions({
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
}: AppActionsProps): React.JSX.Element {
  return (
    <>
      {showAdd ? (
        <Tooltip title="Add family member">
          <IconButton color="inherit" onClick={onAdd} aria-label="Add member">
            <PersonAddIcon />
          </IconButton>
        </Tooltip>
      ) : null}

      {showAddChild || showSave ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          {showAddChild ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddChild}
              sx={{
                whiteSpace: "nowrap",
                bgcolor: "primary.light",
                color: "primary.dark",
                "&:hover": {
                  bgcolor: "primary.main",
                  color: "common.white",
                },
              }}
              aria-label="Add child"
            >
              Add child
            </Button>
          ) : null}

          {showSave ? (
            <Button
              variant="contained"
              color="secondary"
              startIcon={
                saving ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              onClick={onSave}
              disabled={!saveEnabled}
              sx={{
                transformOrigin: "center",
                transition: (muiTheme) =>
                  muiTheme.transitions.create("transform", {
                    duration: muiTheme.transitions.duration.shorter,
                    easing: muiTheme.transitions.easing.easeInOut,
                  }),
                ...(saveAttentionActive
                  ? {
                      "@keyframes save-attention-jiggle": {
                        "0%": {
                          transform: "scale(1) translateX(0) rotate(0deg)",
                        },
                        "20%": {
                          transform:
                            "scale(1.25) translateX(-1px) rotate(-1deg)",
                        },
                        "35%": {
                          transform: "scale(1.25) translateX(1px) rotate(1deg)",
                        },
                        "55%": {
                          transform:
                            "scale(1.22) translateX(-1px) rotate(-0.6deg)",
                        },
                        "75%": {
                          transform:
                            "scale(1.25) translateX(1px) rotate(0.6deg)",
                        },
                        "100%": {
                          transform: "scale(1) translateX(0) rotate(0deg)",
                        },
                      },
                      "@media (prefers-reduced-motion: no-preference)": {
                        animation: "save-attention-jiggle 900ms ease-in-out",
                      },
                    }
                  : {
                      transform: "scale(1)",
                    }),
              }}
              aria-label="Save member"
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          ) : null}
        </Stack>
      ) : null}

      <Tooltip title="More actions">
        <IconButton
          color="inherit"
          onClick={(event) => onOpenMoreMenu(event.currentTarget)}
          aria-label="More actions"
          aria-controls={moreMenuOpen ? "app-actions-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={moreMenuOpen ? "true" : undefined}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}
