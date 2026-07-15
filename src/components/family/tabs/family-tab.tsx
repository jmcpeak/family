"use client";

import { GENDERS } from "@/lib/constants";
import type { SelectOption } from "@/lib/family-editor";
import type { FamilyMemberRecord } from "@/lib/types";
import {
  FieldInput,
  FieldSelect,
  FieldTextArea,
  TabGrid,
} from "../editor-fields";

interface FamilyTabProps {
  selectedUser: FamilyMemberRecord;
  parentsLoaded: boolean;
  fatherOptions: SelectOption[];
  motherOptions: SelectOption[];
  displayNameOptions: string[];
  updateField: (field: string, value: string) => void;
}

export function FamilyTab({
  selectedUser,
  parentsLoaded,
  fatherOptions,
  motherOptions,
  displayNameOptions,
  updateField,
}: FamilyTabProps): React.JSX.Element {
  return (
    <TabGrid>
      <FieldInput
        label="First Name"
        value={String(selectedUser.firstName ?? "")}
        onChange={(value) => updateField("firstName", value)}
      />
      <FieldInput
        label="Middle Name"
        value={String(selectedUser.middleName ?? "")}
        onChange={(value) => updateField("middleName", value)}
      />
      <FieldInput
        label="Last Name"
        value={String(selectedUser.lastName ?? "")}
        onChange={(value) => updateField("lastName", value)}
      />
      <FieldInput
        label="Title (Dr.)"
        value={String(selectedUser.titleName ?? "")}
        onChange={(value) => updateField("titleName", value)}
      />
      <FieldInput
        label="Suffix (Jr.)"
        value={String(selectedUser.suffixName ?? "")}
        onChange={(value) => updateField("suffixName", value)}
      />
      <FieldSelect
        label="Gender"
        value={String(selectedUser.gender ?? "")}
        onChange={(value) => updateField("gender", value)}
        options={GENDERS.map((gender) => ({
          value: gender.key,
          label: gender.name,
        }))}
      />
      <FieldInput
        label="Maiden Name"
        value={String(selectedUser.maidenName ?? "")}
        onChange={(value) => updateField("maidenName", value)}
      />
      <FieldInput
        label="Nickname"
        value={String(selectedUser.nickName ?? "")}
        onChange={(value) => updateField("nickName", value)}
      />
      <FieldSelect
        label="How should the name appear?"
        value={String(selectedUser.displayName ?? "")}
        onChange={(value) => updateField("displayName", value)}
        options={[
          { value: "", label: "" },
          ...displayNameOptions.map((option) => ({
            value: option,
            label: option,
          })),
        ]}
      />
      <FieldSelect
        label="Father"
        value={parentsLoaded ? String(selectedUser.father ?? "") : ""}
        onChange={(value) => updateField("father", value)}
        options={fatherOptions}
      />
      <FieldSelect
        label="Mother"
        value={parentsLoaded ? String(selectedUser.mother ?? "") : ""}
        onChange={(value) => updateField("mother", value)}
        options={motherOptions}
      />
      <FieldTextArea
        label="Occupation and/or Hobbies"
        value={String(selectedUser.hobbies ?? "")}
        onChange={(value) => updateField("hobbies", value)}
      />
    </TabGrid>
  );
}
