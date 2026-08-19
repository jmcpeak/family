import { resolveSiteUrl } from "./templates";

export const SMS_PROGRAM_NAME = "McPeak Family Directory";
export const SMS_TERMS_PATH = "/sms-terms";
export const SMS_PRIVACY_PATH = "/sms-privacy";
export const SMS_PUBLIC_INFO_PATH = "/sms";
export const SMS_OPT_OUT_INSTRUCTIONS = "Reply STOP to opt out, HELP for help.";
export const SMS_FREQUENCY_DISCLOSURE = "a few messages per year";
export const SMS_CONSENT_SUMMARY = `By adding a phone number, you agree that the ${SMS_PROGRAM_NAME} may send occasional informational texts (${SMS_FREQUENCY_DISCLOSURE}) about the family site and reunion. Msg & data rates may apply. ${SMS_OPT_OUT_INSTRUCTIONS}`;

export function smsPublicInfoUrl(siteUrl?: string): string {
  return `${resolveSiteUrl(siteUrl)}${SMS_PUBLIC_INFO_PATH}`;
}

export function smsTermsUrl(siteUrl?: string): string {
  return `${resolveSiteUrl(siteUrl)}${SMS_TERMS_PATH}`;
}

export function smsPrivacyUrl(siteUrl?: string): string {
  return `${resolveSiteUrl(siteUrl)}${SMS_PRIVACY_PATH}`;
}

export const SMS_PUBLIC_INFO_PARAGRAPHS = [
  `${SMS_PROGRAM_NAME} sends infrequent informational text messages to U.S. phone numbers that family members add to their own directory profiles.`,
  "Messages include a link to the private family directory and a short reminder to update contact information or complete a reunion survey. We do not send advertising or marketing texts.",
  `Message frequency is ${SMS_FREQUENCY_DISCLOSURE}, usually around reunion planning. Message and data rates may apply. ${SMS_OPT_OUT_INSTRUCTIONS}`,
  "The member directory itself requires family login to protect personal data. This page, plus the SMS terms and privacy links below, are public and do not require a password.",
] as const;

export const SMS_TERMS_PARAGRAPHS = [
  `${SMS_PROGRAM_NAME} sends infrequent informational text messages to phone numbers that family members add to their own directory profiles in the private family directory.`,
  `Messages typically include a link to the family site and a short reminder to update contact information or complete a reunion survey. We do not send advertising or marketing texts.`,
  `Message frequency is ${SMS_FREQUENCY_DISCLOSURE}, usually around reunion planning. Message and data rates may apply.`,
  `By adding or keeping a phone number on a member profile, you consent to receive these texts. ${SMS_OPT_OUT_INSTRUCTIONS} After you opt out we will not text that number unless a family member adds it again.`,
  `For help, reply HELP to a program text or contact Jason McPeak at jason.mcpeak@gmail.com.`,
] as const;

export const SMS_PRIVACY_PARAGRAPHS = [
  `${SMS_PROGRAM_NAME} stores phone numbers on member profiles so signed-in family members can send the informational texts described in the SMS terms.`,
  "Phone numbers are used only to deliver those texts through our SMS provider. We do not sell phone numbers or use them for public marketing lists.",
  "You can remove a number by editing or clearing the Phone field on the member profile, or by replying STOP to a program text.",
  `See the SMS terms for consent, frequency, and opt-out details.`,
] as const;
