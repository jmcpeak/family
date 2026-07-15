"use client";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { STATE_OPTIONS } from "@/lib/constants";
import { getGoogleMapsUrl, hasValidAddress } from "@/lib/member-utils";
import type { FamilyMemberRecord } from "@/lib/types";
import { FieldInput, FieldSelect, TabGrid } from "../editor-fields";

interface AddressTabProps {
  selectedUser: FamilyMemberRecord;
  updateField: (field: string, value: string) => void;
}

export function AddressTab({
  selectedUser,
  updateField,
}: AddressTabProps): React.JSX.Element {
  return (
    <TabGrid>
      <FieldInput
        label="E-mail"
        type="email"
        value={String(selectedUser.email ?? "")}
        onChange={(value) => updateField("email", value)}
      />
      <FieldInput
        label="Phone"
        type="tel"
        value={String(selectedUser.phone ?? "")}
        onChange={(value) => updateField("phone", value)}
      />
      <FieldInput
        label="Address"
        value={String(selectedUser.address ?? "")}
        onChange={(value) => updateField("address", value)}
      />
      <FieldInput
        label="Address Line 2"
        value={String(selectedUser.address2 ?? "")}
        onChange={(value) => updateField("address2", value)}
      />
      <FieldInput
        label="City"
        value={String(selectedUser.city ?? "")}
        onChange={(value) => updateField("city", value)}
      />
      <FieldSelect
        label="State"
        value={String(selectedUser.theState ?? "")}
        onChange={(value) => updateField("theState", value)}
        options={STATE_OPTIONS}
      />
      <FieldInput
        label="Zipcode"
        value={String(selectedUser.zipcode ?? "")}
        onChange={(value) => updateField("zipcode", value)}
      />
      <FieldInput
        label="Country"
        value={String(selectedUser.country ?? "")}
        onChange={(value) => updateField("country", value)}
      />
      {hasValidAddress(selectedUser) ? (
        <Box sx={{ gridColumn: "1 / -1" }}>
          <Link
            href={getGoogleMapsUrl(selectedUser)}
            target="_blank"
            rel="noreferrer"
          >
            View on Google Maps
          </Link>
        </Box>
      ) : null}
    </TabGrid>
  );
}
