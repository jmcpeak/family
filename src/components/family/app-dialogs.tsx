"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { FamilyCrest } from "@/components/family/family-crest";
import { buildInfo } from "@/lib/build-info";

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AboutDialog({
  open,
  onClose,
}: AboutDialogProps): React.JSX.Element {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: "0 0 auto",
              height: 5,
              background:
                "linear-gradient(90deg, #146B3A 0 33%, #F8F5ED 33% 66%, #C96A1B 66%)",
            },
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <FamilyCrest />
          <Box>
            <Typography variant="h5">McPeak Family</Typography>
            <Typography
              variant="overline"
              color="primary"
              sx={{ letterSpacing: "0.12em", fontWeight: 700 }}
            >
              Cead Mile Failte
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Cead mile failte. This directory keeps McPeak family roots, stories,
          and contact details close at hand.
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Version</Typography>
          <Typography sx={{ fontFamily: "monospace" }}>
            {buildInfo.buildId}
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Created
          </Typography>
          <Typography>{buildInfo.createdAtLabel}</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Share this version when reporting issues so fixes can be tracked
          quickly.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Link href="mailto:jason.mcpeak@gmail.com">
            jason.mcpeak@gmail.com
          </Link>
        </Box>
        <Box sx={{ mt: 1 }}>
          <Link
            href="https://github.com/jmcpeak/family/issues"
            target="_blank"
            rel="noreferrer"
          >
            Report Issue
          </Link>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

interface EmailsDialogProps {
  open: boolean;
  onClose: () => void;
  emailsText: string;
  emailCount: number;
  phoneCount: number;
  messagePreview: string;
  copiedEmailText: boolean;
  sendingChannel: "email" | "sms" | null;
  blastResult: string | null;
  onCopyEmails: () => void | Promise<void>;
  onSendEmailBlast: () => void | Promise<void>;
  onSendSmsBlast: () => void | Promise<void>;
  fullScreen: boolean;
}

export function EmailsDialog({
  open,
  onClose,
  emailsText,
  emailCount,
  phoneCount,
  messagePreview,
  copiedEmailText,
  sendingChannel,
  blastResult,
  onCopyEmails,
  onSendEmailBlast,
  onSendSmsBlast,
  fullScreen,
}: EmailsDialogProps): React.JSX.Element {
  const busy = sendingChannel !== null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle>Notify family</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Send the site link to members on file, or copy email addresses for a
          manual message. The login answer is not included — recipients already
          know it.
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          On file: {emailCount} email{emailCount === 1 ? "" : "s"}, {phoneCount}{" "}
          phone{phoneCount === 1 ? "" : "s"}
        </Typography>
        <Typography
          variant="body2"
          component="pre"
          sx={{
            mb: 2,
            p: 1.5,
            bgcolor: "action.hover",
            borderRadius: 1,
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
          }}
        >
          {messagePreview}
        </Typography>
        <TextField
          label="Email addresses"
          value={emailsText}
          multiline
          rows={6}
          fullWidth
          slotProps={{
            htmlInput: {
              "aria-label": "Bulk email addresses",
              readOnly: true,
            },
          }}
        />
        {copiedEmailText ? (
          <Alert severity="success" sx={{ mt: 1 }}>
            Copied to clipboard.
          </Alert>
        ) : null}
        {blastResult ? (
          <Alert severity="info" sx={{ mt: 1 }}>
            {blastResult}
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ flexWrap: "wrap", gap: 1 }}>
        <Button
          onClick={() => void onSendEmailBlast()}
          variant="contained"
          disabled={busy || emailCount === 0}
        >
          {sendingChannel === "email" ? "Sending email…" : "Send email blast"}
        </Button>
        <Button
          onClick={() => void onSendSmsBlast()}
          variant="contained"
          color="secondary"
          disabled={busy || phoneCount === 0}
        >
          {sendingChannel === "sms" ? "Sending SMS…" : "Send SMS blast"}
        </Button>
        <Button
          onClick={() => void onCopyEmails()}
          disabled={busy || !emailsText}
        >
          Copy emails
        </Button>
        <Button onClick={onClose} disabled={busy}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
