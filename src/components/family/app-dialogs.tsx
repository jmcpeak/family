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
  copiedEmailText: boolean;
  onCopyEmails: () => void | Promise<void>;
  fullScreen: boolean;
}

export function EmailsDialog({
  open,
  onClose,
  emailsText,
  copiedEmailText,
  onCopyEmails,
  fullScreen,
}: EmailsDialogProps): React.JSX.Element {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle>Bulk Email Addresses</DialogTitle>
      <DialogContent>
        <TextField
          label="Email addresses"
          value={emailsText}
          multiline
          rows={8}
          fullWidth
          slotProps={{
            htmlInput: {
              "aria-label": "Bulk email addresses",
            },
          }}
        />
        {copiedEmailText ? (
          <Alert severity="success" sx={{ mt: 1 }}>
            Copied to clipboard.
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => void onCopyEmails()} variant="contained">
          Copy and close
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
