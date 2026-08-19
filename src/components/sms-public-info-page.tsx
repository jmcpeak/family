import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  SMS_CONSENT_SUMMARY,
  SMS_PRIVACY_PATH,
  SMS_PROGRAM_NAME,
  SMS_PUBLIC_INFO_PARAGRAPHS,
  SMS_TERMS_PATH,
} from "@/lib/messaging/sms-program";

export function SmsPublicInfoPage(): React.JSX.Element {
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
        <Typography variant="h4" sx={{ mb: 1 }}>
          {SMS_PROGRAM_NAME} SMS program
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Public program information for McPeak family directory text messages.
          No login required.
        </Typography>
        <Stack spacing={2} sx={{ mb: 3 }}>
          {SMS_PUBLIC_INFO_PARAGRAPHS.map((paragraph) => (
            <Typography key={paragraph} color="text.secondary">
              {paragraph}
            </Typography>
          ))}
        </Stack>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Opt-in disclosure (member profile)
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          After signing in to the private directory, members enter a phone
          number on their profile. The Phone field shows this consent language
          before the number is saved:
        </Typography>
        <TextField
          label="Phone"
          type="tel"
          value="(555) 555-0123"
          fullWidth
          size="small"
          slotProps={{ input: { readOnly: true } }}
          helperText={
            <>
              {SMS_CONSENT_SUMMARY}{" "}
              <Link href={SMS_TERMS_PATH}>
                SMS terms
              </Link>
              {" · "}
              <Link href={SMS_PRIVACY_PATH}>
                SMS privacy
              </Link>
            </>
          }
          sx={{ mb: 2 }}
        />
        <Typography>
          <Link href={SMS_TERMS_PATH}>
            SMS terms
          </Link>
          {" · "}
          <Link href={SMS_PRIVACY_PATH}>
            SMS privacy
          </Link>
          {" · "}
          <Link href="/">
            Family directory home
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
