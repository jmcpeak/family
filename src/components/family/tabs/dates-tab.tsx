"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { STATE_OPTIONS } from "@/lib/constants";
import { earliestDateValue } from "@/lib/family-editor";
import { formatDurationYears } from "@/lib/member-utils";
import type { FamilyMemberRecord } from "@/lib/types";
import { FieldInput, FieldSelect } from "../editor-fields";

interface DatesTabProps {
  selectedUser: FamilyMemberRecord;
  updateField: (field: string, value: string) => void;
}

interface DatePlaceRowConfig {
  eventLabel: string;
  dateLabel: string;
  dateField: string;
  dateValue: string;
  dateHelperText?: string;
  cityField: string;
  cityValue: string;
  stateField: string;
  stateValue: string;
}

interface DatePlaceSectionProps {
  title: string;
  rows: DatePlaceRowConfig[];
  updateField: (field: string, value: string) => void;
}

function DatePlaceSection({
  title,
  rows,
  updateField,
}: DatePlaceSectionProps): React.JSX.Element {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "6.5rem 1fr 1fr minmax(7.5rem, 0.85fr)",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Box sx={{ display: { xs: "none", sm: "block" } }} />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: "none", sm: "block" }, fontWeight: 600 }}
        >
          Date
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: "none", sm: "block" }, fontWeight: 600 }}
        >
          City
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: "none", sm: "block" }, fontWeight: 600 }}
        >
          State
        </Typography>

        {rows.map((row) => (
          <Box
            key={row.dateField}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "subgrid",
              },
              gridColumn: { xs: "1", sm: "1 / -1" },
              gap: 2,
              alignItems: "start",
              pb: { xs: 1.5, sm: 0 },
              borderBottom: { xs: "1px solid", sm: "none" },
              borderColor: "divider",
              "&:last-child": {
                borderBottom: "none",
                pb: 0,
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "text.secondary",
                pt: { sm: 1.25 },
              }}
            >
              {row.eventLabel}
            </Typography>
            <FieldInput
              label={row.dateLabel}
              value={row.dateValue}
              helperText={row.dateHelperText}
              onChange={(value) => updateField(row.dateField, value)}
            />
            <FieldInput
              label="City"
              value={row.cityValue}
              onChange={(value) => updateField(row.cityField, value)}
            />
            <FieldSelect
              label="State"
              value={row.stateValue}
              onChange={(value) => updateField(row.stateField, value)}
              options={STATE_OPTIONS}
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

export function DatesTab({
  selectedUser,
  updateField,
}: DatesTabProps): React.JSX.Element {
  const memberRows: DatePlaceRowConfig[] = [
    {
      eventLabel: "Birth",
      dateLabel: "Birthday",
      dateField: "birthday",
      dateValue: String(selectedUser.birthday ?? ""),
      dateHelperText: formatDurationYears(
        String(selectedUser.birthday ?? ""),
        String(selectedUser.death ?? ""),
        undefined,
        "old",
      ),
      cityField: "cityBirth",
      cityValue: String(selectedUser.cityBirth ?? ""),
      stateField: "stateBirth",
      stateValue: String(selectedUser.stateBirth ?? ""),
    },
    {
      eventLabel: "Wedding",
      dateLabel: "Wedding",
      dateField: "wedding",
      dateValue: String(selectedUser.wedding ?? ""),
      dateHelperText: formatDurationYears(
        String(selectedUser.wedding ?? ""),
        earliestDateValue(
          String(selectedUser.death ?? ""),
          String(selectedUser.deathSpouse ?? ""),
        ),
        "Married for",
      ),
      cityField: "cityWedding",
      cityValue: String(selectedUser.cityWedding ?? ""),
      stateField: "stateWedding",
      stateValue: String(selectedUser.stateWedding ?? ""),
    },
    {
      eventLabel: "Death",
      dateLabel: "Death",
      dateField: "death",
      dateValue: String(selectedUser.death ?? ""),
      dateHelperText: formatDurationYears(
        String(selectedUser.death ?? ""),
        undefined,
        "Passed away",
        "ago",
      ),
      cityField: "cityDeath",
      cityValue: String(selectedUser.cityDeath ?? ""),
      stateField: "stateDeath",
      stateValue: String(selectedUser.stateDeath ?? ""),
    },
  ];

  const spouseRows: DatePlaceRowConfig[] = [
    {
      eventLabel: "Birth",
      dateLabel: "Birthday",
      dateField: "bithdaySpouse",
      dateValue: String(selectedUser.bithdaySpouse ?? ""),
      dateHelperText: formatDurationYears(
        String(selectedUser.bithdaySpouse ?? ""),
        String(selectedUser.deathSpouse ?? ""),
        undefined,
        "old",
      ),
      cityField: "cityBirthSpouse",
      cityValue: String(selectedUser.cityBirthSpouse ?? ""),
      stateField: "stateBirthSpouse",
      stateValue: String(selectedUser.stateBirthSpouse ?? ""),
    },
    {
      eventLabel: "Death",
      dateLabel: "Death",
      dateField: "deathSpouse",
      dateValue: String(selectedUser.deathSpouse ?? ""),
      dateHelperText: formatDurationYears(
        String(selectedUser.deathSpouse ?? ""),
        undefined,
        "Passed away",
        "ago",
      ),
      cityField: "cityDeathSpouse",
      cityValue: String(selectedUser.cityDeathSpouse ?? ""),
      stateField: "stateDeathSpouse",
      stateValue: String(selectedUser.stateDeathSpouse ?? ""),
    },
  ];

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <DatePlaceSection
        title="Member"
        rows={memberRows}
        updateField={updateField}
      />
      <DatePlaceSection
        title="Spouse"
        rows={spouseRows}
        updateField={updateField}
      />
    </Stack>
  );
}
