"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface RootErrorProps {
  error: Error;
  reset: () => void;
}

export default function RootError({
  error,
  reset,
}: RootErrorProps): React.JSX.Element {
  return (
    <Stack
      spacing={2}
      sx={{
        minHeight: "100dvh",
        px: 2,
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="h4">Something went wrong</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 560 }}>
        We could not complete that request. Try again, or return to the home
        page.
      </Typography>
      <Stack direction="row" spacing={1.5}>
        <Button variant="contained" onClick={reset}>
          Try again
        </Button>
        <Button variant="outlined" href="/">
          Back to home
        </Button>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {error.message}
      </Typography>
    </Stack>
  );
}
