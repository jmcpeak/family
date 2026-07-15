"use client";

import Box from "@mui/material/Box";

export function FamilyCrest({
  compact = false,
}: {
  compact?: boolean;
}): React.JSX.Element {
  const size = compact ? 34 : 58;

  return (
    <Box
      aria-hidden="true"
      sx={{
        width: size,
        height: size,
        flex: `0 0 ${size}px`,
        display: "grid",
        placeItems: "center",
        borderRadius: "50%",
        color: compact ? "#FFF9EE" : "primary.dark",
        bgcolor: compact
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(20, 107, 58, 0.08)",
        border: "2px solid",
        borderColor: compact ? "rgba(242, 182, 109, 0.8)" : "secondary.main",
        boxShadow: compact
          ? "inset 0 0 0 3px rgba(7, 58, 33, 0.35)"
          : "inset 0 0 0 4px rgba(255, 252, 246, 0.85)",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: compact ? "1rem" : "1.75rem",
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      M
    </Box>
  );
}
