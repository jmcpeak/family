import type { Metadata } from "next";
import { SmsPublicInfoPage } from "@/components/sms-public-info-page";
import { SMS_PROGRAM_NAME } from "@/lib/messaging/sms-program";

export const metadata: Metadata = {
  title: `SMS program · ${SMS_PROGRAM_NAME}`,
  description:
    "Public SMS program information for the McPeak Family Directory, including opt-in disclosure, terms, and privacy.",
};

export default function SmsProgramPage(): React.JSX.Element {
  return <SmsPublicInfoPage />;
}
