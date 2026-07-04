import 'server-only';

import { Resend } from 'resend';
import type { ContactSubmission } from '@/db/schema';
import { SITE_URL } from '@/lib/site';

interface EmailResult {
  sent: boolean;
  skipped: boolean;
}

interface ReplyEmailInput {
  to: string;
  subject: string;
  message: string;
  recipientName?: string;
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

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function textToHtml(value: string): string {
  return escapeHtml(value)
    .split(/\n{2,}/)
    .map((block) => block.replaceAll('\n', '<br />'))
    .map(
      (block) =>
        `<p style="margin:0 0 12px;color:#000000;font-size:13px;line-height:1.6;">${block}</p>`
    )
    .join('');
}

function renderEmailShell({
  eyebrow,
  title,
  preview,
  children,
}: {
  eyebrow: string;
  title: string;
  preview: string;
  children: string;
}): string {
  const siteUrl = SITE_URL;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>${escapeHtml(title)}</title>
    <style>
      @media (max-width: 620px) {
        .email-shell { padding: 18px 10px !important; }
        .email-window { width: 100% !important; }
        .email-body { padding: 18px !important; }
      }
    </style>
  </head>
  <body style="margin:0;background:#336699;font-family:Geneva,Verdana,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preview)}</div>
    <main class="email-shell" style="padding:36px 14px;">
      <section class="email-window" style="width:640px;max-width:100%;margin:0 auto;background:#cccccc;border-width:2px;border-style:solid;border-top-color:#ffffff;border-left-color:#ffffff;border-right-color:#333333;border-bottom-color:#333333;box-shadow:2px 2px 0 #000000;">
        <header style="padding:2px;background:#cccccc;border-bottom:1px solid #666666;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td width="44" style="vertical-align:middle;">
                <span style="display:inline-block;width:10px;height:10px;margin-left:4px;background:#eeeeee;border-width:1px;border-style:solid;border-top-color:#ffffff;border-left-color:#ffffff;border-right-color:#666666;border-bottom-color:#666666;"></span>
                <span style="display:inline-block;width:10px;height:10px;background:#eeeeee;border-width:1px;border-style:solid;border-top-color:#ffffff;border-left-color:#ffffff;border-right-color:#666666;border-bottom-color:#666666;"></span>
              </td>
              <td style="text-align:center;color:#000000;font-size:13px;font-weight:700;line-height:22px;">${escapeHtml(eyebrow)}</td>
              <td width="44" style="text-align:right;vertical-align:middle;">
                <span style="display:inline-block;width:12px;height:12px;margin-right:5px;background:#eeeeee;border-width:1px;border-style:solid;border-top-color:#ffffff;border-left-color:#ffffff;border-right-color:#666666;border-bottom-color:#666666;"></span>
              </td>
            </tr>
          </table>
        </header>
        <div class="email-body" style="padding:24px;background:#eeeeee;color:#000000;">
          <h1 style="margin:0 0 16px;color:#000000;font-family:Geneva,Verdana,Arial,sans-serif;font-size:20px;line-height:1.3;font-weight:700;">${escapeHtml(title)}</h1>
          ${children}
          <div style="height:1px;background:#999999;border-bottom:1px solid #ffffff;margin:24px 0 14px;"></div>
          <footer style="color:#333333;font-size:12px;line-height:1.6;">
            <span>Sent from Sahil's Computer.</span><br />
            <a href="${escapeHtml(siteUrl)}" style="color:#000000;font-weight:700;text-decoration:underline;">${escapeHtml(siteUrl.replace(/^https?:\/\//, ''))}</a>
          </footer>
        </div>
      </section>
    </main>
  </body>
</html>`;
}

function renderMetaRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:#000000;font-size:12px;font-weight:700;vertical-align:top;width:82px;">${escapeHtml(label)}</td>
    <td style="padding:6px 0;color:#000000;font-size:13px;line-height:1.5;">${escapeHtml(value)}</td>
  </tr>`;
}

function renderNotificationHtml(submission: ContactSubmission): string {
  return renderEmailShell({
    eyebrow: 'New message',
    title: submission.subject,
    preview: `${submission.name} sent a new portfolio message.`,
    children: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 18px;">
        ${renderMetaRow('Name', submission.name)}
        ${renderMetaRow('Email', submission.email)}
        ${renderMetaRow('Subject', submission.subject)}
      </table>
      <div style="padding:14px;background:#ffffff;border-width:2px;border-style:solid;border-top-color:#666666;border-left-color:#666666;border-right-color:#ffffff;border-bottom-color:#ffffff;">
        <div style="margin:0 0 10px;color:#000000;font-size:12px;font-weight:700;">Message</div>
        ${textToHtml(submission.message)}
      </div>
      <a href="mailto:${escapeHtml(submission.email)}?subject=${encodeURIComponent(`Re: ${submission.subject}`)}" style="display:inline-block;margin-top:18px;padding:7px 12px;background:#cccccc;color:#000000;font-size:13px;font-weight:700;text-decoration:none;border-width:2px;border-style:solid;border-top-color:#ffffff;border-left-color:#ffffff;border-right-color:#333333;border-bottom-color:#333333;">Reply from your inbox</a>
    `,
  });
}

function renderReplyHtml({ message, recipientName }: ReplyEmailInput): string {
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi,';

  return renderEmailShell({
    eyebrow: 'Portfolio reply',
    title: 'Thanks for reaching out',
    preview: 'Sahil replied to your portfolio message.',
    children: `
      <p style="margin:0 0 14px;color:#000000;font-size:13px;line-height:1.6;">${escapeHtml(greeting)}</p>
      <div style="padding:16px;background:#ffffff;border-width:2px;border-style:solid;border-top-color:#666666;border-left-color:#666666;border-right-color:#ffffff;border-bottom-color:#ffffff;">
        <div style="margin:0 0 10px;color:#000000;font-size:12px;font-weight:700;">Reply</div>
        ${textToHtml(message)}
      </div>
      <p style="margin:18px 0 0;color:#333333;font-size:12px;line-height:1.6;">You are receiving this because you sent a message through my portfolio contact form.</p>
    `,
  });
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
    html: renderNotificationHtml(submission),
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
  recipientName,
}: ReplyEmailInput): Promise<EmailResult> {
  const resend = getResendClient();

  if (!resend) {
    return { sent: false, skipped: true };
  }

  await resend.emails.send({
    from: getFromAddress(),
    to,
    subject,
    html: renderReplyHtml({ to, subject, message, recipientName }),
    text: message,
  });

  return { sent: true, skipped: false };
}
