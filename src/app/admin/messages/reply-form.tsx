'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { idleFormState } from '@/app/admin/_lib/form-state';
import { sendReply } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="admin-button" disabled={pending}>
      {pending ? 'Sending...' : 'Send reply'}
    </button>
  );
}

interface ReplyFormProps {
  id: string;
  subject: string;
  name: string;
}

export function ReplyForm({ id, subject, name }: ReplyFormProps) {
  const [state, formAction] = useActionState(sendReply, idleFormState);

  return (
    <form action={formAction} className="admin-form">
      <input type="hidden" name="id" value={id} />
      <div className="admin-field">
        <label className="admin-label" htmlFor="reply-subject">
          Subject
        </label>
        <input
          id="reply-subject"
          name="subject"
          className="admin-input"
          defaultValue={`Re: ${subject}`}
          maxLength={180}
          required
        />
      </div>
      <div className="admin-field">
        <label className="admin-label" htmlFor="reply-message">
          Reply to {name}
        </label>
        <textarea
          id="reply-message"
          name="message"
          className="admin-textarea"
          rows={10}
          placeholder="Write a concise, useful reply..."
          required
        />
      </div>
      <div className="admin-form__footer">
        <SubmitButton />
        {state.status !== 'idle' ? (
          <p
            className={`admin-feedback admin-feedback--${state.status}`}
            role="status"
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
