"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import {
  parseSurveyPayload,
  reunionInterestChoiceLabels,
  type SurveySlug,
  type SurveySubmissionPayload,
  type SurveySummary,
} from "@/lib/surveys";

export interface SurveyCloseOptions {
  dontAskAgain?: boolean;
}

interface SurveyDialogProps {
  open: boolean;
  loading: boolean;
  survey: SurveySummary | null;
  submitting: boolean;
  submitError: string | null;
  onSubmit: (
    slug: SurveySlug,
    payload: SurveySubmissionPayload,
  ) => Promise<void>;
  onClose: (options?: SurveyCloseOptions) => void;
}

interface ReunionInterestFormState {
  respondentName: string;
  attendanceLikelihood: string;
  golfInterest: string;
  golfFormatPreference: string;
  luncheonHeadcount: string;
  dinnerHeadcount: string;
  pontoonInterest: string;
  lodgingNeeded: boolean;
  lodgingDetails: string;
  comments: string;
}

const DEFAULT_FORM_STATE: ReunionInterestFormState = {
  respondentName: "",
  attendanceLikelihood: "likely",
  golfInterest: "yes",
  golfFormatPreference: "either",
  luncheonHeadcount: "0",
  dinnerHeadcount: "0",
  pontoonInterest: "maybe",
  lodgingNeeded: false,
  lodgingDetails: "",
  comments: "",
};

function parseHeadcount(value: string): number {
  if (!value.trim()) {
    return Number.NaN;
  }
  return Number(value);
}

export function SurveyDialog({
  open,
  loading,
  survey,
  submitting,
  submitError,
  onSubmit,
  onClose,
}: SurveyDialogProps): React.JSX.Element {
  const [formState, setFormState] =
    useState<ReunionInterestFormState>(DEFAULT_FORM_STATE);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [displaySurvey, setDisplaySurvey] = useState<SurveySummary | null>(
    survey,
  );
  const currentSurvey = survey ?? displaySurvey;

  useEffect(() => {
    if (!survey) {
      return;
    }
    setDisplaySurvey(survey);
  }, [survey]);

  useEffect(() => {
    if (!open || !currentSurvey) {
      return;
    }
    setFormState(DEFAULT_FORM_STATE);
    setLocalError(null);
    setDontAskAgain(false);
  }, [currentSurvey, open]);

  const dialogError = localError ?? submitError;

  const handleClose = (): void => {
    onClose(dontAskAgain ? { dontAskAgain: true } : undefined);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    if (!currentSurvey) {
      return;
    }

    const payloadCandidate = {
      respondentName: formState.respondentName,
      attendanceLikelihood: formState.attendanceLikelihood,
      golfInterest: formState.golfInterest,
      golfFormatPreference: formState.golfFormatPreference,
      luncheonHeadcount: parseHeadcount(formState.luncheonHeadcount),
      dinnerHeadcount: parseHeadcount(formState.dinnerHeadcount),
      pontoonInterest: formState.pontoonInterest,
      lodgingNeeded: formState.lodgingNeeded,
      lodgingDetails: formState.lodgingDetails,
      comments: formState.comments,
    };
    const payload = parseSurveyPayload(currentSurvey.slug, payloadCandidate);
    if (!payload) {
      setLocalError(
        "Please complete the required fields and check headcount values.",
      );
      return;
    }

    setLocalError(null);
    await onSubmit(currentSurvey.slug, payload);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={false}
      slotProps={{
        transition: {
          onExited: () => setDisplaySurvey(null),
        },
      }}
    >
      <DialogTitle>{currentSurvey?.title ?? "Survey"}</DialogTitle>
      <DialogContent>
        {loading && !currentSurvey ? (
          <Typography color="text.secondary">Loading survey…</Typography>
        ) : null}

        {!loading && !currentSurvey ? (
          <Alert severity="warning">
            This survey could not be found. It may no longer be available.
          </Alert>
        ) : null}

        {currentSurvey ? (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {currentSurvey.summary}
          </Typography>
        ) : null}

        {currentSurvey?.status === "past" ? (
          <Alert severity="info">
            This survey has closed. Thanks to everyone who submitted responses.
          </Alert>
        ) : null}

        {currentSurvey?.status === "active" && currentSurvey.completed ? (
          <Alert severity="success">
            This survey was already submitted from this browser. Thanks for
            participating.
          </Alert>
        ) : null}

        {dialogError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {dialogError}
          </Alert>
        ) : null}

        {currentSurvey?.status === "active" && !currentSurvey.completed ? (
          <Box
            component="form"
            onSubmit={(event) => void handleSubmit(event)}
            sx={{
              display: "grid",
              gap: 2,
              mt: 2,
            }}
          >
            <TextField
              label="Your name"
              value={formState.respondentName}
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  respondentName: event.target.value,
                }))
              }
              required
              fullWidth
            />

            <TextField
              select
              label="How likely are you to attend?"
              value={formState.attendanceLikelihood}
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  attendanceLikelihood: event.target.value,
                }))
              }
              fullWidth
            >
              {Object.entries(
                reunionInterestChoiceLabels.attendanceLikelihood,
              ).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Interested in golf?"
              value={formState.golfInterest}
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  golfInterest: event.target.value,
                }))
              }
              fullWidth
            >
              {Object.entries(reunionInterestChoiceLabels.golfInterest).map(
                ([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ),
              )}
            </TextField>

            <TextField
              select
              label="Preferred golf option"
              value={formState.golfFormatPreference}
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  golfFormatPreference: event.target.value,
                }))
              }
              fullWidth
            >
              {Object.entries(
                reunionInterestChoiceLabels.golfFormatPreference,
              ).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>

            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              }}
            >
              <TextField
                label="Luncheon headcount"
                type="number"
                value={formState.luncheonHeadcount}
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    luncheonHeadcount: event.target.value,
                  }))
                }
                slotProps={{ htmlInput: { min: 0, max: 40, step: 1 } }}
                fullWidth
              />
              <TextField
                label="Dinner headcount"
                type="number"
                value={formState.dinnerHeadcount}
                onChange={(event) =>
                  setFormState((previous) => ({
                    ...previous,
                    dinnerHeadcount: event.target.value,
                  }))
                }
                slotProps={{ htmlInput: { min: 0, max: 40, step: 1 } }}
                fullWidth
              />
            </Box>

            <TextField
              select
              label="Interested in pontoon boats on the chain?"
              value={formState.pontoonInterest}
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  pontoonInterest: event.target.value,
                }))
              }
              fullWidth
            >
              {Object.entries(reunionInterestChoiceLabels.pontoonInterest).map(
                ([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ),
              )}
            </TextField>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formState.lodgingNeeded}
                  onChange={(event) =>
                    setFormState((previous) => ({
                      ...previous,
                      lodgingNeeded: event.target.checked,
                    }))
                  }
                />
              }
              label="I would like lodging suggestions."
            />

            <TextField
              label="Lodging, restaurant, or activity preferences"
              value={formState.lodgingDetails}
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  lodgingDetails: event.target.value,
                }))
              }
              multiline
              rows={3}
              fullWidth
            />

            <TextField
              label="Anything else we should know?"
              value={formState.comments}
              onChange={(event) =>
                setFormState((previous) => ({
                  ...previous,
                  comments: event.target.value,
                }))
              }
              multiline
              rows={4}
              fullWidth
            />

            <DialogActions sx={{ px: 0 }}>
              <FormControlLabel
                sx={{ mr: "auto", ml: 0 }}
                control={
                  <Checkbox
                    checked={dontAskAgain}
                    onChange={(event) => setDontAskAgain(event.target.checked)}
                    disabled={submitting}
                  />
                }
                label="Don't ask again"
              />
              <Button onClick={handleClose} disabled={submitting}>
                Close
              </Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit survey"}
              </Button>
            </DialogActions>
          </Box>
        ) : null}
      </DialogContent>
      {currentSurvey?.status !== "active" || currentSurvey?.completed ? (
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      ) : null}
    </Dialog>
  );
}
