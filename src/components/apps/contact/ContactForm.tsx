'use client';

import { useRef, useState } from 'react';
import { Button, Input, Dialog } from '@/components/ui';
import {
  CONTACT_FIELD_ORDER,
  FIELD_LIMITS,
  validateContactFields,
  type ContactField,
  type ContactSubmission,
} from '@/lib/contact-validation';

const EMPTY_FORM: ContactSubmission = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

type DialogState =
  | { kind: 'closed' }
  | { kind: 'success' }
  | { kind: 'error'; message: string };

interface ContactApiResponse {
  ok: boolean;
  error?: string;
}

const GENERIC_ERROR =
  'Something went wrong sending your message. Try again in a moment.';

const NETWORK_ERROR =
  "Couldn't reach the server. Check your connection and try again.";

const FIELD_LABELS: Record<ContactField, string> = {
  name: 'Name',
  email: 'Email',
  subject: 'Subject',
  message: 'Message',
};

export function ContactForm() {
  const [form, setForm] = useState<ContactSubmission>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ContactField, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialog, setDialog] = useState<DialogState>({ kind: 'closed' });
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const fieldRefs: Record<
    ContactField,
    React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
  > = {
    name: nameRef,
    email: emailRef,
    subject: subjectRef,
    message: messageRef,
  };

  function update<K extends ContactField>(key: K, value: ContactSubmission[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function focusFirstInvalid(
    fields: Partial<Record<ContactField, string>>
  ): void {
    const first = CONTACT_FIELD_ORDER.find((field) => fields[field]);
    if (!first) return;
    fieldRefs[first].current?.focus();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    const validation = validateContactFields(form);
    if (!validation.ok) {
      setFieldErrors(validation.fields);
      focusFirstInvalid(validation.fields);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.data),
      });

      let data: ContactApiResponse | null = null;
      try {
        data = (await res.json()) as ContactApiResponse;
      } catch {
        data = null;
      }

      if (res.ok && data?.ok) {
        setDialog({ kind: 'success' });
        setForm(EMPTY_FORM);
      } else {
        setDialog({
          kind: 'error',
          message: data?.error ?? GENERIC_ERROR,
        });
      }
    } catch {
      setDialog({ kind: 'error', message: NETWORK_ERROR });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setFieldErrors({});
  }

  function closeDialog() {
    setDialog({ kind: 'closed' });
  }

  const dialogIsOpen = dialog.kind !== 'closed';
  const issues = CONTACT_FIELD_ORDER.flatMap((field) => {
    const message = fieldErrors[field];
    return message ? [{ field, message }] : [];
  });

  return (
    <div className="contact-form">
      <header className="contact-form-header">
        <h2 className="contact-form-title">Get in touch</h2>
        <p className="contact-form-subtitle">Drop a note. I read everything.</p>
      </header>
      <form className="contact-form-fields" onSubmit={handleSubmit} noValidate>
        {issues.length > 0 ? (
          <div
            className="contact-form-summary"
            role="alert"
            aria-live="assertive"
          >
            <p className="contact-form-summary__title">
              The message could not be sent because of the following problems:
            </p>
            <ul className="contact-form-summary__list">
              {issues.map(({ field, message }) => (
                <li key={field}>
                  <a
                    href={`#contact-${field}`}
                    className="contact-form-summary__link"
                    onClick={(event) => {
                      event.preventDefault();
                      fieldRefs[field].current?.focus();
                    }}
                  >
                    {FIELD_LABELS[field]}: {message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="contact-form-row">
          <label className="contact-form-label" htmlFor="contact-name">
            Name
          </label>
          <div className="contact-form-control">
            <Input
              ref={nameRef}
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Your name"
              disabled={isSubmitting}
              maxLength={FIELD_LIMITS.name}
              required
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={
                fieldErrors.name ? 'contact-name-error' : undefined
              }
            />
            {fieldErrors.name ? (
              <p id="contact-name-error" className="contact-form-error">
                {fieldErrors.name}
              </p>
            ) : null}
          </div>
        </div>
        <div className="contact-form-row">
          <label className="contact-form-label" htmlFor="contact-email">
            Email
          </label>
          <div className="contact-form-control">
            <Input
              ref={emailRef}
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="you@example.com"
              disabled={isSubmitting}
              maxLength={FIELD_LIMITS.email}
              required
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={
                fieldErrors.email ? 'contact-email-error' : undefined
              }
            />
            {fieldErrors.email ? (
              <p id="contact-email-error" className="contact-form-error">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>
        </div>
        <div className="contact-form-row">
          <label className="contact-form-label" htmlFor="contact-subject">
            Subject
          </label>
          <div className="contact-form-control">
            <Input
              ref={subjectRef}
              id="contact-subject"
              name="subject"
              type="text"
              value={form.subject}
              onChange={(e) => update('subject', e.target.value)}
              placeholder="What's this about?"
              disabled={isSubmitting}
              maxLength={FIELD_LIMITS.subject}
              required
              aria-invalid={Boolean(fieldErrors.subject)}
              aria-describedby={
                fieldErrors.subject ? 'contact-subject-error' : undefined
              }
            />
            {fieldErrors.subject ? (
              <p id="contact-subject-error" className="contact-form-error">
                {fieldErrors.subject}
              </p>
            ) : null}
          </div>
        </div>
        <div className="contact-form-row contact-form-row-stack">
          <label className="contact-form-label" htmlFor="contact-message">
            Message
          </label>
          <div className="contact-form-control">
            <textarea
              ref={messageRef}
              id="contact-message"
              name="message"
              className="contact-form-textarea"
              rows={6}
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              placeholder="Say hi, send me a problem to solve, or just tell me what you're building."
              disabled={isSubmitting}
              maxLength={FIELD_LIMITS.message}
              required
              aria-invalid={Boolean(fieldErrors.message)}
              aria-describedby={
                fieldErrors.message ? 'contact-message-error' : undefined
              }
            />
            {fieldErrors.message ? (
              <p id="contact-message-error" className="contact-form-error">
                {fieldErrors.message}
              </p>
            ) : null}
          </div>
        </div>
        <div className="contact-form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Clear
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send'}
          </Button>
        </div>
      </form>
      <Dialog
        open={dialogIsOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Icon variant={dialog.kind === 'error' ? 'error' : 'info'} />
            <Dialog.Body>
              <Dialog.Title>
                {dialog.kind === 'error' ? "Couldn't send" : 'Message sent'}
              </Dialog.Title>
              <Dialog.Description>
                {dialog.kind === 'error'
                  ? dialog.message
                  : "Thanks — I'll get back to you."}
              </Dialog.Description>
            </Dialog.Body>
          </Dialog.Header>
          <Dialog.Actions>
            <Dialog.Close>
              <Button variant="primary">OK</Button>
            </Dialog.Close>
          </Dialog.Actions>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}
