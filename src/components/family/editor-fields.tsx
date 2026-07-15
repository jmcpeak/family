"use client";

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { SelectOption } from "@/lib/family-editor";

interface FieldInputProps {
  label: string;
  value?: string | number;
  type?: string;
  helperText?: string;
  onChange: (value: string) => void;
}

export function FieldInput({
  label,
  value,
  type = "text",
  helperText,
  onChange,
}: FieldInputProps): React.JSX.Element {
  return (
    <TextField
      label={label}
      type={type}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      helperText={helperText}
      fullWidth
      size="small"
    />
  );
}

interface FieldTextAreaProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

export function FieldTextArea({
  label,
  value,
  onChange,
}: FieldTextAreaProps): React.JSX.Element {
  return (
    <TextField
      label={label}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      multiline
      rows={4}
      fullWidth
      size="small"
      sx={{ gridColumn: "1 / -1" }}
    />
  );
}

interface FieldSelectProps {
  label: string;
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

function optionValueMatches(
  optionValue: string,
  normalizedValue: string,
): boolean {
  return String(optionValue) === normalizedValue;
}

export function FieldSelect({
  label,
  value,
  options,
  onChange,
}: FieldSelectProps): React.JSX.Element {
  const normalizedValue = String(value ?? "");
  const valueInOptions = options.some((option) =>
    optionValueMatches(option.value, normalizedValue),
  );
  const selectOptions =
    valueInOptions || normalizedValue === ""
      ? options
      : [...options, { value: normalizedValue, label: normalizedValue }];

  return (
    <TextField
      select
      label={label}
      value={normalizedValue}
      onChange={(event) => onChange(event.target.value)}
      fullWidth
      size="small"
    >
      {selectOptions.map((option) => (
        <MenuItem key={option.value || "__empty"} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

export function TabGrid({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
        gap: 2,
        mt: 1,
      }}
    >
      {children}
    </Box>
  );
}

export function DurationText({
  children,
}: {
  children: string;
}): React.JSX.Element | null {
  if (!children) {
    return null;
  }

  return (
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ fontStyle: "italic", alignSelf: "end" }}
    >
      {children}
    </Typography>
  );
}
