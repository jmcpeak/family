import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function FamilyNotFound(): React.JSX.Element {
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
      <Typography variant="h4">Page not found</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 560 }}>
        This family page does not exist. Use the button below to return to the
        directory home.
      </Typography>
      <Button variant="contained" href="/">
        Go to home
      </Button>
    </Stack>
  );
}
