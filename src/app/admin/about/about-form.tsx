'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { type AboutFormState, updateAboutContent } from './actions';

const initialState: AboutFormState = { status: 'idle', message: '' };

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="admin-button" disabled={pending}>
      {pending ? 'Saving…' : 'Save changes'}
    </button>
  );
}

interface AboutFormProps {
  initialContent: string;
}

export function AboutForm({ initialContent }: AboutFormProps) {
  const [state, formAction] = useActionState(updateAboutContent, initialState);

  return (
    <form action={formAction} className="admin-form">
      <div className="admin-field">
        <label className="admin-label" htmlFor="about-content">
          Narrative
        </label>
        <textarea
          id="about-content"
          name="content"
          className="admin-textarea"
          defaultValue={initialContent}
          rows={16}
          placeholder="Write the about section shown on your portfolio…"
        />
      </div>
      <div className="admin-form__footer">
        <SaveButton />
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
