"use client";

import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import { SKELETON_FADE_TIMEOUT_MS } from "@/lib/family-editor";

interface InlineStatusSwapProps {
  loading: boolean;
  skeleton: React.ReactNode;
  value: React.ReactNode;
  minWidth: number;
}

export function InlineStatusSwap({
  loading,
  skeleton,
  value,
  minWidth,
}: InlineStatusSwapProps): React.JSX.Element {
  return (
    <Box
      component="span"
      sx={{ display: "inline-grid", minWidth, verticalAlign: "baseline" }}
    >
      <Fade
        in={loading}
        timeout={SKELETON_FADE_TIMEOUT_MS}
        mountOnEnter
        unmountOnExit
      >
        <Box
          component="span"
          sx={{ gridArea: "1 / 1", display: "inline-block" }}
        >
          {skeleton}
        </Box>
      </Fade>
      <Fade
        in={!loading}
        timeout={SKELETON_FADE_TIMEOUT_MS}
        mountOnEnter
        unmountOnExit
      >
        <Box
          component="span"
          sx={{ gridArea: "1 / 1", display: "inline-block" }}
        >
          {value}
        </Box>
      </Fade>
    </Box>
  );
}
