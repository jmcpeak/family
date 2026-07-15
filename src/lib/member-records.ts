export const LAST_UPDATE_RECORD_ID = "lastUpdateDate";
export const SURVEY_RECORD_ID_PREFIX = "survey#";

export function isReservedMemberRecordId(id: string): boolean {
  return id === LAST_UPDATE_RECORD_ID || id.startsWith(SURVEY_RECORD_ID_PREFIX);
}
