"use client";

import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { GENDERS } from "@/lib/constants";
import { formatDurationYears } from "@/lib/member-utils";
import type { FamilyMemberRecord } from "@/lib/types";
import {
  FieldInput,
  FieldSelect,
  FieldTextArea,
  TabGrid,
} from "../editor-fields";

interface ChildrenTabProps {
  selectedUser: FamilyMemberRecord;
  childIndexes: number[];
  updateField: (field: string, value: string) => void;
  removeChild: (index: number) => void;
}

export function ChildrenTab({
  selectedUser,
  childIndexes,
  updateField,
  removeChild,
}: ChildrenTabProps): React.JSX.Element {
  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontStyle: "italic" }}
      >
        This is for children still living at home. If they have an address, they
        should have their own entry.
      </Typography>

      {childIndexes.map((childIndex, position) => (
        <Paper
          key={childIndex}
          variant="outlined"
          sx={{ p: { xs: 1.5, sm: 2 } }}
        >
          <Typography variant="subtitle1" gutterBottom>
            Child {position + 1}
          </Typography>
          <TabGrid>
            <FieldInput
              label="First Name"
              value={String(selectedUser[`firstNameChild${childIndex}`] ?? "")}
              onChange={(value) =>
                updateField(`firstNameChild${childIndex}`, value)
              }
            />
            <FieldInput
              label="Middle Name"
              value={String(selectedUser[`middleNameChild${childIndex}`] ?? "")}
              onChange={(value) =>
                updateField(`middleNameChild${childIndex}`, value)
              }
            />
            <FieldInput
              label="Last Name"
              value={String(selectedUser[`lastNameChild${childIndex}`] ?? "")}
              onChange={(value) =>
                updateField(`lastNameChild${childIndex}`, value)
              }
            />
            <FieldInput
              label="Birthday"
              value={String(selectedUser[`bithdayChild${childIndex}`] ?? "")}
              helperText={formatDurationYears(
                String(selectedUser[`bithdayChild${childIndex}`] ?? ""),
                undefined,
                undefined,
                "old",
              )}
              onChange={(value) =>
                updateField(`bithdayChild${childIndex}`, value)
              }
            />
            <FieldSelect
              label="Gender"
              value={String(selectedUser[`genderChild${childIndex}`] ?? "")}
              onChange={(value) =>
                updateField(`genderChild${childIndex}`, value)
              }
              options={GENDERS.map((gender) => ({
                value: gender.key,
                label: gender.name,
              }))}
            />
          </TabGrid>
          <Button
            startIcon={<RemoveCircleIcon />}
            onClick={() => removeChild(childIndex)}
            disabled={childIndexes.length === 1 && childIndex === 0}
            color="error"
            size="small"
            sx={{ mt: 1 }}
          >
            Remove child row
          </Button>
        </Paper>
      ))}

      <FieldTextArea
        label="Pets"
        value={String(selectedUser.pets ?? "")}
        onChange={(value) => updateField("pets", value)}
      />
    </Stack>
  );
}
