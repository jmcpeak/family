export type FieldValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | string[]
  | number[]
  | boolean[];

export type Gender = "" | "m" | "f";

export interface FamilyMemberRecord {
  id: string;
  children?: number[];
  displayName?: string;
  firstName?: string;
  lastName?: string;
  father?: string | number;
  mother?: string | number;
  firstNameSpouse?: string;
  lastNameSpouse?: string;
  gender?: Gender;
  genderSpouse?: Gender;
  email?: string;
  address?: string;
  city?: string;
  theState?: string;
  [key: string]: FieldValue;
}

export interface LastUpdateMetadata {
  id: "lastUpdateDate";
  lastUpdated: number;
  lastUpdatedID?: string;
}

export interface ParentOption {
  id: string;
  firstName?: string;
  lastName?: string;
}

export interface FamilyListResponse {
  members: FamilyMemberRecord[];
  metadata?: LastUpdateMetadata | null;
  fathers: ParentOption[];
  mothers: ParentOption[];
}
