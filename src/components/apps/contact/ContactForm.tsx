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

export function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  function update<K extends keyof ContactFormState>(
    key: K,
    value: ContactFormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    // wip: api wiring lands in the next commit; for now, surface a friendly
    // placeholder so the form is exercisable end-to-end visually.
    console.log('[contact] submission (not yet sent):', form);
    setIsSubmitting(false);
    setDialogOpen(true);
  }

  function handleReset() {
    setForm(EMPTY_FORM);
  }

  return (
    <div className="contact-form">
      <header className="contact-form-header">
        <h2 className="contact-form-title">Get in touch</h2>
        <p className="contact-form-subtitle">Drop a note. I read everything.</p>
      </header>
      <form className="contact-form-fields" onSubmit={handleSubmit}>
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Icon variant="info" />
            <Dialog.Body>
              <Dialog.Title>Almost there</Dialog.Title>
              <Dialog.Description>
                The form works, but the send pipeline is being wired in the next
                commit. In the meantime, reach me directly at
                sahil@sahilbasumatary.dev.
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
