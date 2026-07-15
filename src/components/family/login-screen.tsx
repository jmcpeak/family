"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { FamilyCrest } from "./family-crest";

interface LoginScreenProps {
  loginAnswer: string;
  setLoginAnswer: (value: string) => void;
  loginBusy: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
}

export function LoginScreen({
  loginAnswer,
  setLoginAnswer,
  loginBusy,
  onSubmit,
}: LoginScreenProps): React.JSX.Element {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        p: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          top: -230,
          right: -160,
          border: "70px solid",
          borderColor: "rgba(20, 107, 58, 0.06)",
        },
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: { xs: 3, sm: 4 },
          width: "min(500px, 100%)",
          position: "relative",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: "0 0 auto",
            height: 5,
            background:
              "linear-gradient(90deg, #146B3A 0 33%, #F8F5ED 33% 66%, #C96A1B 66%)",
          },
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ mb: 2.5, alignItems: "center" }}
        >
          <FamilyCrest />
          <Box>
            <Typography variant="h4">McPeak Family</Typography>
            <Typography
              variant="overline"
              color="primary"
              sx={{ letterSpacing: "0.14em", fontWeight: 700 }}
            >
              Roots · Stories · Family
            </Typography>
          </Box>
        </Stack>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          What city has historically hosted the Family Reunion?
        </Typography>
        <Box component="form" onSubmit={onSubmit}>
          <TextField
            label="Reunion city answer"
            value={loginAnswer}
            onChange={(event) => setLoginAnswer(event.target.value)}
            disabled={loginBusy}
            autoFocus
            fullWidth
            sx={{ mb: 2 }}
            slotProps={{
              htmlInput: {
                "aria-label": "Reunion city answer",
              },
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loginBusy}
              sx={{ minWidth: 200, px: 4 }}
            >
              {loginBusy ? "Checking..." : "Login"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
