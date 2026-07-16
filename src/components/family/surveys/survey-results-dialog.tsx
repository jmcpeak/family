"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useTheme } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  reunionInterestChoiceLabels,
  type SurveyChoiceCount,
  type SurveyResultsResponse,
  type SurveySlug,
} from "@/lib/surveys";

interface SurveyResultsDialogProps {
  open: boolean;
  loading: boolean;
  surveySlug: SurveySlug | null;
  results: SurveyResultsResponse | null;
  onClose: () => void;
}

function formatTimestamp(value: number): string {
  return new Date(value).toLocaleString();
}

function renderChoiceCounts<TValue extends string>(
  choices: SurveyChoiceCount<TValue>[],
): React.JSX.Element {
  return (
    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
      {choices.map((choice) => (
        <Box component="li" key={choice.value}>
          <Typography variant="body2">
            {choice.label}: {choice.count}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export function SurveyResultsDialog({
  open,
  loading,
  surveySlug,
  results,
  onClose,
}: SurveyResultsDialogProps): React.JSX.Element {
  const theme = useTheme();
  const fullScreen = !useMediaQuery(theme.breakpoints.up("md"), {
    noSsr: true,
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle>{results?.title ?? "Survey results"}</DialogTitle>
      <DialogContent dividers>
        {loading && !results ? (
          <Typography color="text.secondary">
            Loading survey results…
          </Typography>
        ) : null}

        {!loading && !surveySlug ? (
          <Alert severity="warning">No survey was selected for results.</Alert>
        ) : null}

        {!loading && surveySlug && !results ? (
          <Alert severity="warning">
            Survey results could not be loaded. The survey may not exist.
          </Alert>
        ) : null}

        {results ? (
          <Box sx={{ display: "grid", gap: 3 }}>
            <Box sx={{ display: "grid", gap: 0.5 }}>
              <Typography variant="subtitle1">
                Responses: {results.responseCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Luncheon total: {results.totals.luncheonHeadcountTotal}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dinner total: {results.totals.dinnerHeadcountTotal}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lodging requested: {results.totals.lodgingNeededCount} yes,{" "}
                {results.totals.lodgingNotNeededCount} no
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Attendance likelihood
                </Typography>
                {renderChoiceCounts(results.totals.attendanceLikelihood)}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Golf interest
                </Typography>
                {renderChoiceCounts(results.totals.golfInterest)}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Golf format preference
                </Typography>
                {renderChoiceCounts(results.totals.golfFormatPreference)}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Pontoon interest
                </Typography>
                {renderChoiceCounts(results.totals.pontoonInterest)}
              </Box>
            </Box>

            <TableContainer
              sx={{ border: `1px solid ${theme.palette.divider}` }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Attendance</TableCell>
                    <TableCell>Golf</TableCell>
                    <TableCell>Golf format</TableCell>
                    <TableCell align="right">Lunch</TableCell>
                    <TableCell align="right">Dinner</TableCell>
                    <TableCell>Pontoon</TableCell>
                    <TableCell>Lodging</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Comments</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.responses.map((response) => (
                    <TableRow key={response.id} hover>
                      <TableCell>
                        {formatTimestamp(response.createdAt)}
                      </TableCell>
                      <TableCell>{response.payload.respondentName}</TableCell>
                      <TableCell>
                        {
                          reunionInterestChoiceLabels.attendanceLikelihood[
                            response.payload.attendanceLikelihood
                          ]
                        }
                      </TableCell>
                      <TableCell>
                        {
                          reunionInterestChoiceLabels.golfInterest[
                            response.payload.golfInterest
                          ]
                        }
                      </TableCell>
                      <TableCell>
                        {
                          reunionInterestChoiceLabels.golfFormatPreference[
                            response.payload.golfFormatPreference
                          ]
                        }
                      </TableCell>
                      <TableCell align="right">
                        {response.payload.luncheonHeadcount}
                      </TableCell>
                      <TableCell align="right">
                        {response.payload.dinnerHeadcount}
                      </TableCell>
                      <TableCell>
                        {
                          reunionInterestChoiceLabels.pontoonInterest[
                            response.payload.pontoonInterest
                          ]
                        }
                      </TableCell>
                      <TableCell>
                        {response.payload.lodgingNeeded ? "Yes" : "No"}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 240 }}>
                        {response.payload.lodgingDetails ?? "—"}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>
                        {response.payload.comments ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
