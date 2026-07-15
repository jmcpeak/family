"use client";

import { GENDERS } from "@/lib/constants";
import type { FamilyMemberRecord } from "@/lib/types";
import {
  FieldInput,
  FieldSelect,
  FieldTextArea,
  TabGrid,
} from "../editor-fields";

interface SpouseTabProps {
  selectedUser: FamilyMemberRecord;
  updateField: (field: string, value: string) => void;
}

export function SpouseTab({
  selectedUser,
  updateField,
}: SpouseTabProps): React.JSX.Element {
  return (
    <TabGrid>
      <FieldInput
        label="First Name"
        value={String(selectedUser.firstNameSpouse ?? "")}
        onChange={(value) => updateField("firstNameSpouse", value)}
      />
      <FieldInput
        label="Last Name"
        value={String(selectedUser.lastNameSpouse ?? "")}
        onChange={(value) => updateField("lastNameSpouse", value)}
      />
      <FieldSelect
        label="Gender"
        value={String(selectedUser.genderSpouse ?? "")}
        onChange={(value) => updateField("genderSpouse", value)}
        options={GENDERS.map((gender) => ({
          value: gender.key,
          label: gender.name,
        }))}
      />
      <FieldInput
        label="Middle Name"
        value={String(selectedUser.middleNameSpouse ?? "")}
        onChange={(value) => updateField("middleNameSpouse", value)}
      />
      <FieldInput
        label="Maiden Name"
        value={String(selectedUser.maidenNameSpouse ?? "")}
        onChange={(value) => updateField("maidenNameSpouse", value)}
      />
      <FieldInput
        label="Nickname"
        value={String(selectedUser.nickNameSpouse ?? "")}
        onChange={(value) => updateField("nickNameSpouse", value)}
      />
      <FieldInput
        label="Title (Dr.)"
        value={String(selectedUser.titleNameSpouse ?? "")}
        onChange={(value) => updateField("titleNameSpouse", value)}
      />
      <FieldInput
        label="Suffix (Jr.)"
        value={String(selectedUser.suffixNameSpouse ?? "")}
        onChange={(value) => updateField("suffixNameSpouse", value)}
      />
      <FieldTextArea
        label="Occupation and/or Hobbies"
        value={String(selectedUser.hobbiesSpouse ?? "")}
        onChange={(value) => updateField("hobbiesSpouse", value)}
      />
    </TabGrid>
  );
}
