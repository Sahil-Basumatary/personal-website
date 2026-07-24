'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  type AdminFormState,
  idleFormState,
} from '@/app/admin/_lib/form-state';
import type { Skill } from '@/db/schema';
import {
  DEFAULT_LANGUAGE_SKILL_PROFICIENCY,
  isLanguageSkillCategory,
  SKILL_CATEGORIES,
  SKILL_CATEGORY_LABELS,
  SKILL_PROFICIENCIES,
  SKILL_PROFICIENCY_LABELS,
  type SkillCategory,
} from '@/lib/content/skill-taxonomy';
import { createSkill, updateSkill } from './actions';

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

interface SkillFormProps {
  skill?: Skill;
}

export function SkillForm({ skill }: SkillFormProps) {
  const isEditing = Boolean(skill);
  const action = isEditing ? updateSkill : createSkill;
  const [state, formAction] = useActionState(action, idleFormState);
  const initialCategory = (
    skill && SKILL_CATEGORIES.includes(skill.category as SkillCategory)
      ? skill.category
      : 'languages'
  ) as SkillCategory;
  const [category, setCategory] = useState<SkillCategory>(initialCategory);
  const showProficiency = isLanguageSkillCategory(category);

  return (
    <form action={formAction} className="admin-form">
      {skill ? <input type="hidden" name="id" value={skill.id} /> : null}

      <div className="admin-form-grid admin-form-grid--three">
        <div className="admin-field">
          <label className="admin-label" htmlFor={`${skill?.id ?? 'new'}-name`}>
            Name
          </label>
          <input
            id={`${skill?.id ?? 'new'}-name`}
            name="name"
            className="admin-input"
            defaultValue={skill?.name}
            maxLength={120}
            required
          />
        </div>

        <div className="admin-field">
          <label
            className="admin-label"
            htmlFor={`${skill?.id ?? 'new'}-category`}
          >
            Category
          </label>
          <select
            id={`${skill?.id ?? 'new'}-category`}
            name="category"
            className="admin-input"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as SkillCategory)
            }
            required
          >
            {SKILL_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {SKILL_CATEGORY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        {showProficiency ? (
          <div className="admin-field">
            <label
              className="admin-label"
              htmlFor={`${skill?.id ?? 'new'}-proficiency`}
            >
              Proficiency
            </label>
            <select
              id={`${skill?.id ?? 'new'}-proficiency`}
              name="proficiency"
              className="admin-input"
              defaultValue={
                skill?.proficiency ?? DEFAULT_LANGUAGE_SKILL_PROFICIENCY
              }
              required
            >
              {SKILL_PROFICIENCIES.map((value) => (
                <option key={value} value={value}>
                  {SKILL_PROFICIENCY_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <div className="admin-form__footer">
        <SubmitButton label={isEditing ? 'Update skill' : 'Create skill'} />
        <Feedback state={state} />
      </div>
    </form>
  );
}
