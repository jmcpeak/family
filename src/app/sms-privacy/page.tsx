import type { Metadata } from "next";
import { SmsLegalPage } from "@/components/sms-legal-page";
import {
  SMS_PRIVACY_PARAGRAPHS,
  SMS_PROGRAM_NAME,
} from "@/lib/messaging/sms-program";

export const metadata: Metadata = {
  title: `SMS privacy · ${SMS_PROGRAM_NAME}`,
};

export default function SmsPrivacyPage(): React.JSX.Element {
  return (
    <SmsLegalPage
      title={`${SMS_PROGRAM_NAME} SMS privacy`}
      paragraphs={SMS_PRIVACY_PARAGRAPHS}
    />
  );
}
