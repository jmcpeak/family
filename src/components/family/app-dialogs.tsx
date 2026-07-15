"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AboutDialog({
  open,
  onClose,
}: AboutDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>McPeak Family</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>Version 4.0</Typography>
        <Link href="mailto:jason.mcpeak@gmail.com">jason.mcpeak@gmail.com</Link>
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

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  confirmColor?: "error" | "primary";
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  confirmColor = "primary",
}: ConfirmDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{description}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => void onConfirm()}
          variant="contained"
          color={confirmColor}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
