'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  type AdminFormState,
  idleFormState,
} from '@/app/admin/_lib/form-state';
import type { Project } from '@/db/schema';
import { createProject, updateProject } from './actions';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="admin-button" disabled={pending}>
      {pending ? 'Saving...' : label}
    </button>
  );
}

function Feedback({ state }: { state: AdminFormState }) {
  if (state.status === 'idle') {
    return null;
  }

  return (
    <p
      className={`admin-feedback admin-feedback--${state.status}`}
      role="status"
    >
      {state.message}
    </p>
  );
}

interface ProjectFormProps {
  project?: Project;
}

export function ProjectForm({ project }: ProjectFormProps) {
  const isEditing = Boolean(project);
  const action = isEditing ? updateProject : createProject;
  const [state, formAction] = useActionState(action, idleFormState);

  return (
    <form action={formAction} className="admin-form">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}

      <div className="admin-form-grid">
        <div className="admin-field">
          <label
            className="admin-label"
            htmlFor={`${project?.id ?? 'new'}-title`}
          >
            Title
          </label>
          <input
            id={`${project?.id ?? 'new'}-title`}
            name="title"
            className="admin-input"
            defaultValue={project?.title}
            maxLength={160}
            required
          />
        </div>

        <div className="admin-field">
          <label
            className="admin-label"
            htmlFor={`${project?.id ?? 'new'}-slug`}
          >
            Slug
          </label>
          <input
            id={`${project?.id ?? 'new'}-slug`}
            name="slug"
            className="admin-input"
            defaultValue={project?.slug}
            maxLength={120}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="my-project"
            required
          />
        </div>
      </div>

      <div className="admin-field">
        <label
          className="admin-label"
          htmlFor={`${project?.id ?? 'new'}-summary`}
        >
          Summary
        </label>
        <textarea
          id={`${project?.id ?? 'new'}-summary`}
          name="summary"
          className="admin-textarea admin-textarea--short"
          defaultValue={project?.summary}
          rows={4}
          required
        />
      </div>

      <div className="admin-field">
        <label
          className="admin-label"
          htmlFor={`${project?.id ?? 'new'}-readme`}
        >
          README
        </label>
        <textarea
          id={`${project?.id ?? 'new'}-readme`}
          name="readme"
          className="admin-textarea"
          defaultValue={project?.readme}
          rows={10}
          required
        />
      </div>

      <div className="admin-form-grid">
        <div className="admin-field">
          <label
            className="admin-label"
            htmlFor={`${project?.id ?? 'new'}-tech-stack`}
          >
            Tech stack
          </label>
          <input
            id={`${project?.id ?? 'new'}-tech-stack`}
            name="techStack"
            className="admin-input"
            defaultValue={project?.techStack.join(', ')}
            placeholder="Next.js, TypeScript, Drizzle"
          />
        </div>

        <div className="admin-field">
          <label
            className="admin-label"
            htmlFor={`${project?.id ?? 'new'}-status`}
          >
            Status
          </label>
          <select
            id={`${project?.id ?? 'new'}-status`}
            name="status"
            className="admin-select"
            defaultValue={project?.status ?? 'draft'}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="admin-form-grid">
        <div className="admin-field">
          <label
            className="admin-label"
            htmlFor={`${project?.id ?? 'new'}-live-url`}
          >
            Live URL
          </label>
          <input
            id={`${project?.id ?? 'new'}-live-url`}
            name="liveUrl"
            className="admin-input"
            defaultValue={project?.liveUrl ?? ''}
            placeholder="https://example.com"
            type="url"
          />
        </div>

        <div className="admin-field">
          <label
            className="admin-label"
            htmlFor={`${project?.id ?? 'new'}-github-url`}
          >
            GitHub URL
          </label>
          <input
            id={`${project?.id ?? 'new'}-github-url`}
            name="githubUrl"
            className="admin-input"
            defaultValue={project?.githubUrl ?? ''}
            placeholder="https://github.com/..."
            type="url"
          />
        </div>
      </div>

      <div className="admin-form__footer">
        <SubmitButton label={isEditing ? 'Update project' : 'Create project'} />
        <Feedback state={state} />
      </div>
    </form>
  );
}
