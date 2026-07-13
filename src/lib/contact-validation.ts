export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type ContactField = keyof ContactSubmission;

export type ValidationResult =
  | { ok: true; data: ContactSubmission }
  | { ok: false; error: string };

export type FieldValidationResult =
  | { ok: true; data: ContactSubmission }
  | {
      ok: false;
      fields: Partial<Record<ContactField, string>>;
      issues: Array<{ field: ContactField; message: string }>;
    };

export const FIELD_LIMITS = {
  name: 100,
  email: 254,
  subject: 160,
  message: 5000,
} as const;

export const CONTACT_FIELD_ORDER: ContactField[] = [
  'name',
  'email',
  'subject',
  'message',
];

const EMAIL_RE =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;
const UNICODE_SPACES_RE = /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g;

function readString(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function normalizeText(value: string): string {
  return value.normalize('NFKC').replace(UNICODE_SPACES_RE, ' ').trim();
}

function normalizeEmail(value: string): string {
  return normalizeText(value).toLowerCase();
}

function emailError(email: string): string | null {
  if (!email) return 'Please add your email.';
  if (email.length > FIELD_LIMITS.email) {
    return `Email must be ${FIELD_LIMITS.email} characters or fewer.`;
  }
  if (/\s/u.test(email)) return 'That email looks invalid.';
  const [localPart = '', domainPart = '', ...extraParts] = email.split('@');
  if (extraParts.length > 0 || !localPart || !domainPart) {
    return 'That email looks invalid.';
  }
  if (
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    domainPart.startsWith('.') ||
    domainPart.endsWith('.')
  ) {
    return 'That email looks invalid.';
  }
  if (localPart.includes('..') || domainPart.includes('..')) {
    return 'That email looks invalid.';
  }
  if (!EMAIL_RE.test(email)) return 'That email looks invalid.';
  return null;
}

export function validateContactFields(input: unknown): FieldValidationResult {
  if (input === null || typeof input !== 'object') {
    return {
      ok: false,
      fields: { name: 'Invalid request body.' },
      issues: [{ field: 'name', message: 'Invalid request body.' }],
    };
  }

  const raw = input as Record<string, unknown>;
  const name = normalizeText(readString(raw.name));
  const email = normalizeEmail(readString(raw.email));
  const subject = normalizeText(readString(raw.subject));
  const message = normalizeText(readString(raw.message));

  const fields: Partial<Record<ContactField, string>> = {};

  if (!name) fields.name = 'Please add your name.';
  else if (name.length > FIELD_LIMITS.name) {
    fields.name = `Name must be ${FIELD_LIMITS.name} characters or fewer.`;
  }

  const emailIssue = emailError(email);
  if (emailIssue) fields.email = emailIssue;

  if (!subject) fields.subject = 'Please add a subject.';
  else if (subject.length > FIELD_LIMITS.subject) {
    fields.subject = `Subject must be ${FIELD_LIMITS.subject} characters or fewer.`;
  }

  if (!message) fields.message = 'Please write a message.';
  else if (message.length > FIELD_LIMITS.message) {
    fields.message = `Message must be ${FIELD_LIMITS.message} characters or fewer.`;
  }

  const issues = CONTACT_FIELD_ORDER.flatMap((field) => {
    const messageForField = fields[field];
    return messageForField ? [{ field, message: messageForField }] : [];
  });

  if (issues.length > 0) {
    return { ok: false, fields, issues };
  }

  return { ok: true, data: { name, email, subject, message } };
}

export function validateContact(input: unknown): ValidationResult {
  const result = validateContactFields(input);
  if (result.ok) return result;
  return {
    ok: false,
    error: result.issues[0]?.message ?? 'Invalid request body.',
  };
}
