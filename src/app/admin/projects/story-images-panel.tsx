'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  type AdminFormState,
  idleFormState,
} from '@/app/admin/_lib/form-state';
import { AdminConfirmForm } from '@/app/admin/_components/AdminConfirmForm';
import { AdminPendingForm } from '@/app/admin/_components/AdminPendingForm';
import type { ProjectStoryImage } from '@/db/schema';
import {
  STORY_IMAGE_MAX_BYTES,
  STORY_IMAGE_MAX_PER_PROJECT,
} from '@/lib/storage/story-image-limits';
import {
  deleteStoryImageRecord,
  reorderStoryImage,
  updateStoryImageMeta,
  uploadStoryImage,
} from './story-image-actions';

type AdminStoryImage = ProjectStoryImage & { previewUrl: string };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="admin-button" disabled={pending}>
      {pending ? 'Working…' : label}
    </button>
  );
}

function Feedback({ state }: { state: AdminFormState }) {
  if (state.status === 'idle') return null;
  return (
    <p
      className={`admin-feedback admin-feedback--${state.status}`}
      role="status"
    >
      {state.message}
    </p>
  );
}

function UploadForm({
  projectId,
  disabled,
}: {
  projectId: string;
  disabled: boolean;
}) {
  const [state, formAction] = useActionState(uploadStoryImage, idleFormState);

  return (
    <form action={formAction} className="admin-story-upload">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="admin-form-grid">
        <div className="admin-field">
          <label className="admin-label" htmlFor={`${projectId}-story-file`}>
            Image file
          </label>
          <input
            id={`${projectId}-story-file`}
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="admin-input"
            required
            disabled={disabled}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor={`${projectId}-story-alt`}>
            Alt text
          </label>
          <input
            id={`${projectId}-story-alt`}
            name="alt"
            className="admin-input"
            maxLength={240}
            required
            disabled={disabled}
            placeholder="Describe the image"
          />
        </div>
      </div>
      <div className="admin-field">
        <label className="admin-label" htmlFor={`${projectId}-story-caption`}>
          Caption (optional)
        </label>
        <input
          id={`${projectId}-story-caption`}
          name="caption"
          className="admin-input"
          maxLength={500}
          disabled={disabled}
        />
      </div>
      <div className="admin-form__footer">
        <SubmitButton label="Upload image" />
        <Feedback state={state} />
      </div>
      <p className="admin-story-hint">
        JPEG, PNG, or WebP · max{' '}
        {Math.round(STORY_IMAGE_MAX_BYTES / (1024 * 1024))}
        MB · up to {STORY_IMAGE_MAX_PER_PROJECT} per project
      </p>
    </form>
  );
}

function ImageMetaForm({ image }: { image: AdminStoryImage }) {
  const [state, formAction] = useActionState(
    updateStoryImageMeta,
    idleFormState
  );

  return (
    <form action={formAction} className="admin-story-meta">
      <input type="hidden" name="id" value={image.id} />
      <div className="admin-field">
        <label className="admin-label" htmlFor={`${image.id}-alt`}>
          Alt text
        </label>
        <input
          id={`${image.id}-alt`}
          name="alt"
          className="admin-input"
          defaultValue={image.alt}
          maxLength={240}
          required
        />
      </div>
      <div className="admin-field">
        <label className="admin-label" htmlFor={`${image.id}-caption`}>
          Caption
        </label>
        <input
          id={`${image.id}-caption`}
          name="caption"
          className="admin-input"
          defaultValue={image.caption ?? ''}
          maxLength={500}
        />
      </div>
      <div className="admin-form__footer">
        <SubmitButton label="Save details" />
        <Feedback state={state} />
      </div>
    </form>
  );
}

interface StoryImagesPanelProps {
  projectId: string;
  images: AdminStoryImage[];
}

export function StoryImagesPanel({ projectId, images }: StoryImagesPanelProps) {
  const atLimit = images.length >= STORY_IMAGE_MAX_PER_PROJECT;

  return (
    <section className="admin-story-panel" aria-label="Project story images">
      <div className="admin-panel__header">
        <div>
          <p className="admin-kicker">Story media</p>
          <h3>Images</h3>
        </div>
        <span className="admin-panel__meta">
          {images.length}/{STORY_IMAGE_MAX_PER_PROJECT}
        </span>
      </div>

      <UploadForm projectId={projectId} disabled={atLimit} />

      {images.length > 0 ? (
        <ul className="admin-story-list">
          {images.map((image, index) => (
            <li key={image.id} className="admin-story-item">
              <div className="admin-story-item__preview">
                {/* Signed/CDN hosts vary by deploy; next/image needs a static allowlist. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.previewUrl} alt={image.alt} />
              </div>
              <div className="admin-story-item__body">
                <ImageMetaForm image={image} />
                <div className="admin-resource__actions">
                  <AdminPendingForm
                    action={reorderStoryImage}
                    label="Up"
                    pendingLabel="…"
                    className="admin-link-button"
                    disabled={index === 0}
                  >
                    <input type="hidden" name="id" value={image.id} />
                    <input type="hidden" name="direction" value="up" />
                  </AdminPendingForm>
                  <AdminPendingForm
                    action={reorderStoryImage}
                    label="Down"
                    pendingLabel="…"
                    className="admin-link-button"
                    disabled={index === images.length - 1}
                  >
                    <input type="hidden" name="id" value={image.id} />
                    <input type="hidden" name="direction" value="down" />
                  </AdminPendingForm>
                  <AdminConfirmForm
                    action={deleteStoryImageRecord}
                    itemName={image.alt}
                    label="Delete"
                    className="admin-link-button admin-link-button--danger"
                  >
                    <input type="hidden" name="id" value={image.id} />
                  </AdminConfirmForm>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="admin-empty">No story images yet.</p>
      )}
    </section>
  );
}
