import 'server-only';

import { Resend } from 'resend';
import type { ContactSubmission } from '@/db/schema';

interface EmailResult {
  sent: boolean;
  skipped: boolean;
}

interface ReplyEmailInput {
  to: string;
  subject: string;
  message: string;
}

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
}

function getFromAddress(): string {
  return process.env.CONTACT_FROM ?? 'Portfolio Admin <onboarding@resend.dev>';
}

function getNotifyRecipient(): string | null {
  return process.env.CONTACT_NOTIFY_TO ?? null;
}

export async function sendContactNotification(
  submission: ContactSubmission
): Promise<EmailResult> {
  const resend = getResendClient();
  const to = getNotifyRecipient();

  if (!resend || !to) {
    return { sent: false, skipped: true };
  }

  await resend.emails.send({
    from: getFromAddress(),
    to,
    subject: `New portfolio message: ${submission.subject}`,
    replyTo: submission.email,
    text: [
      `Name: ${submission.name}`,
      `Email: ${submission.email}`,
      `Subject: ${submission.subject}`,
      '',
      submission.message,
    ].join('\n'),
  });

  return { sent: true, skipped: false };
}

export async function sendContactReply({
  to,
  subject,
  message,
}: ReplyEmailInput): Promise<EmailResult> {
  const resend = getResendClient();

  if (!resend) {
    return { sent: false, skipped: true };
  }

  await resend.emails.send({
    from: getFromAddress(),
    to,
    subject,
    text: message,
  });

  return { sent: true, skipped: false };
}
