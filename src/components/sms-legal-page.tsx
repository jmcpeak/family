import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface SmsLegalPageProps {
  title: string;
  paragraphs: readonly string[];
}

export function SmsLegalPage({
  title,
  paragraphs,
}: SmsLegalPageProps): React.JSX.Element {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{ p: { xs: 3, sm: 4 }, width: "min(720px, 100%)" }}
      >
        <Typography variant="h4" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Stack spacing={2}>
          {paragraphs.map((paragraph) => (
            <Typography key={paragraph} color="text.secondary">
              {paragraph}
            </Typography>
          ))}
        </Stack>
        <Typography sx={{ mt: 3 }}>
          <Link href="/">Back to the family directory</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
