import type { Metadata } from "next";
import { SmsLegalPage } from "@/components/sms-legal-page";
import {
  SMS_PROGRAM_NAME,
  SMS_TERMS_PARAGRAPHS,
} from "@/lib/messaging/sms-program";

export const metadata: Metadata = {
  title: `SMS terms · ${SMS_PROGRAM_NAME}`,
};

export default function SmsTermsPage(): React.JSX.Element {
  return (
    <SmsLegalPage
      title={`${SMS_PROGRAM_NAME} SMS terms`}
      paragraphs={SMS_TERMS_PARAGRAPHS}
    />
  );
}
