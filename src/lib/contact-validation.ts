export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type ValidationResult =
  | { ok: true; data: ContactSubmission }
  | { ok: false; error: string };

export const FIELD_LIMITS = {
  name: 100,
  email: 254,
  subject: 160,
  message: 5000,
} as const;

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

export function validateContact(input: unknown): ValidationResult {
  if (input === null || typeof input !== 'object') {
    return { ok: false, error: 'Invalid request body.' };
  }

  const raw = input as Record<string, unknown>;
  const name = normalizeText(readString(raw.name));
  const email = normalizeEmail(readString(raw.email));
  const subject = normalizeText(readString(raw.subject));
  const message = normalizeText(readString(raw.message));

  if (!name) return { ok: false, error: 'Please add your name.' };
  if (name.length > FIELD_LIMITS.name) {
    return {
      ok: false,
      error: `Name must be ${FIELD_LIMITS.name} characters or fewer.`,
    };
  }

  if (!email) return { ok: false, error: 'Please add your email.' };
  if (email.length > FIELD_LIMITS.email) {
    return {
      ok: false,
      error: `Email must be ${FIELD_LIMITS.email} characters or fewer.`,
    };
  }
  if (/\s/u.test(email)) {
    return { ok: false, error: 'That email looks invalid.' };
  }
  const [localPart = '', domainPart = '', ...extraParts] = email.split('@');
  if (extraParts.length > 0 || !localPart || !domainPart) {
    return { ok: false, error: 'That email looks invalid.' };
  }
  if (
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    domainPart.startsWith('.') ||
    domainPart.endsWith('.')
  ) {
    return { ok: false, error: 'That email looks invalid.' };
  }
  if (localPart.includes('..') || domainPart.includes('..')) {
    return { ok: false, error: 'That email looks invalid.' };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: 'That email looks invalid.' };
  }

  if (!subject) return { ok: false, error: 'Please add a subject.' };
  if (subject.length > FIELD_LIMITS.subject) {
    return {
      ok: false,
      error: `Subject must be ${FIELD_LIMITS.subject} characters or fewer.`,
    };
  }

  if (!message) return { ok: false, error: 'Please write a message.' };
  if (message.length > FIELD_LIMITS.message) {
    return {
      ok: false,
      error: `Message must be ${FIELD_LIMITS.message} characters or fewer.`,
    };
  }

  return { ok: true, data: { name, email, subject, message } };
}
