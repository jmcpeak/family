export type MessagingChannel = "email" | "sms";

export interface BlastResult {
  sent: number;
  failed: number;
  skipped: number;
}

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface SmsMessage {
  toE164: string;
  text: string;
}

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

export interface SmsSender {
  send(message: SmsMessage): Promise<void>;
}
