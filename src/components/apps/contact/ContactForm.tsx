'use client';

import { useState } from 'react';
import { Button, Input, Dialog } from '@/components/ui';

interface ContactFormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY_FORM: ContactFormState = {
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

export function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialog, setDialog] = useState<DialogState>({ kind: 'closed' });

  function update<K extends keyof ContactFormState>(
    key: K,
    value: ContactFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
  }

  function closeDialog() {
    setDialog({ kind: 'closed' });
  }

  const dialogIsOpen = dialog.kind !== 'closed';

  return (
    <div className="contact-form">
      <header className="contact-form-header">
        <h2 className="contact-form-title">Get in touch</h2>
        <p className="contact-form-subtitle">Drop a note. I read everything.</p>
      </header>
      <form className="contact-form-fields" onSubmit={handleSubmit} noValidate>
        <label className="contact-form-row" htmlFor="contact-name">
          <span className="contact-form-label">Name</span>
          <Input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Your name"
            disabled={isSubmitting}
            maxLength={100}
            required
          />
        </label>
        <label className="contact-form-row" htmlFor="contact-email">
          <span className="contact-form-label">Email</span>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="you@example.com"
            disabled={isSubmitting}
            maxLength={254}
            required
          />
        </label>
        <label className="contact-form-row" htmlFor="contact-subject">
          <span className="contact-form-label">Subject</span>
          <Input
            id="contact-subject"
            name="subject"
            type="text"
            value={form.subject}
            onChange={(e) => update('subject', e.target.value)}
            placeholder="What's this about?"
            disabled={isSubmitting}
            maxLength={160}
            required
          />
        </label>
        <label
          className="contact-form-row contact-form-row-stack"
          htmlFor="contact-message"
        >
          <span className="contact-form-label">Message</span>
          <textarea
            id="contact-message"
            name="message"
            className="contact-form-textarea"
            rows={6}
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            placeholder="Say hi, send me a problem to solve, or just tell me what you're building."
            disabled={isSubmitting}
            maxLength={5000}
            required
          />
        </label>
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
