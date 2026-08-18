import Link from "@mui/material/Link";
import NextLink from "next/link";
import {
  SMS_CONSENT_SUMMARY,
  SMS_PRIVACY_PATH,
  SMS_TERMS_PATH,
} from "@/lib/messaging/sms-program";

export function SmsConsentNotice(): React.JSX.Element {
  return (
    <>
      {SMS_CONSENT_SUMMARY}{" "}
      <Link component={NextLink} href={SMS_TERMS_PATH}>
        SMS terms
      </Link>
      {" · "}
      <Link component={NextLink} href={SMS_PRIVACY_PATH}>
        SMS privacy
      </Link>
    </>
  );
}
