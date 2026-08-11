"use client";

import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
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

export interface NotifyRecipientOption {
  id: string;
  label: string;
  contact: string;
}

interface NotifyRecipientPickerProps {
  label: string;
  options: NotifyRecipientOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled: boolean;
}

function NotifyRecipientPicker({
  label,
  options,
  selectedIds,
  onChange,
  disabled,
}: NotifyRecipientPickerProps): React.JSX.Element {
  const selected = options.filter((option) => selectedIds.includes(option.id));
  const allSelected =
    options.length > 0 && selectedIds.length === options.length;

  return (
    <Box sx={{ mb: 2 }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 0.5 }}
      >
        <Typography variant="subtitle2">{label}</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            onClick={() => onChange(options.map((option) => option.id))}
            disabled={disabled || options.length === 0 || allSelected}
          >
            Select all
          </Button>
          <Button
            size="small"
            onClick={() => onChange([])}
            disabled={disabled || selectedIds.length === 0}
          >
            Clear
          </Button>
        </Stack>
      </Stack>
      <Autocomplete
        multiple
        disableCloseOnSelect
        options={options}
        value={selected}
        onChange={(_event, next) => {
          onChange(next.map((option) => option.id));
        }}
        getOptionLabel={(option) => `${option.label} (${option.contact})`}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        disabled={disabled || options.length === 0}
        renderOption={(props, option, { selected: optionSelected }) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              <Checkbox
                size="small"
                checked={optionSelected}
                sx={{ mr: 1 }}
                tabIndex={-1}
                disableRipple
              />
              <Box>
                <Typography variant="body2">{option.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.contact}
                </Typography>
              </Box>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={`${selectedIds.length} of ${options.length} selected`}
            placeholder={options.length === 0 ? "None on file" : "Search…"}
          />
        )}
      />
    </Box>
  );
}

interface EmailsDialogProps {
  open: boolean;
  onClose: () => void;
  emailsText: string;
  emailRecipients: NotifyRecipientOption[];
  smsRecipients: NotifyRecipientOption[];
  selectedEmailMemberIds: string[];
  selectedSmsMemberIds: string[];
  onSelectedEmailMemberIdsChange: (ids: string[]) => void;
  onSelectedSmsMemberIdsChange: (ids: string[]) => void;
  messageSubject: string;
  onMessageSubjectChange: (value: string) => void;
  messageBody: string;
  onMessageBodyChange: (value: string) => void;
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
  emailRecipients,
  smsRecipients,
  selectedEmailMemberIds,
  selectedSmsMemberIds,
  onSelectedEmailMemberIdsChange,
  onSelectedSmsMemberIdsChange,
  messageSubject,
  onMessageSubjectChange,
  messageBody,
  onMessageBodyChange,
  sendingChannel,
  blastResult,
  onCopyEmails,
  onSendEmailBlast,
  onSendSmsBlast,
  fullScreen,
}: EmailsDialogProps): React.JSX.Element {
  const busy = sendingChannel !== null;
  const hasSubject = messageSubject.trim().length > 0;
  const hasBody = messageBody.trim().length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle>Email or text family</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Edit the message, choose recipients (defaults to everyone eligible),
          then send. Subject applies to email only; the message body is used for
          both email and text.
        </Typography>
        <TextField
          label="Subject (email)"
          value={messageSubject}
          onChange={(event) => onMessageSubjectChange(event.target.value)}
          fullWidth
          disabled={busy}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Message"
          value={messageBody}
          onChange={(event) => onMessageBodyChange(event.target.value)}
          multiline
          minRows={4}
          fullWidth
          disabled={busy}
          sx={{ mb: 2 }}
          helperText={`${messageBody.length} characters — keep texts under ~160 if possible`}
        />
        <NotifyRecipientPicker
          label="Email recipients"
          options={emailRecipients}
          selectedIds={selectedEmailMemberIds}
          onChange={onSelectedEmailMemberIdsChange}
          disabled={busy}
        />
        <NotifyRecipientPicker
          label="Text recipients"
          options={smsRecipients}
          selectedIds={selectedSmsMemberIds}
          onChange={onSelectedSmsMemberIdsChange}
          disabled={busy}
        />
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
          disabled={
            busy ||
            selectedEmailMemberIds.length === 0 ||
            !hasSubject ||
            !hasBody
          }
        >
          {sendingChannel === "email" ? "Sending email…" : "Send email"}
        </Button>
        <Button
          onClick={() => void onSendSmsBlast()}
          variant="contained"
          color="secondary"
          disabled={busy || selectedSmsMemberIds.length === 0 || !hasBody}
        >
          {sendingChannel === "sms" ? "Sending text…" : "Send text"}
        </Button>
        <Button
          onClick={() => void onCopyEmails()}
          variant="outlined"
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
