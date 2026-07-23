import { AdminConfirmForm } from '@/app/admin/_components/AdminConfirmForm';
import { AdminPendingForm } from '@/app/admin/_components/AdminPendingForm';
import {
  isLanguageSkillCategory,
  SKILL_CATEGORY_LABELS,
  SKILL_LEVEL_LABELS,
  type SkillCategory,
  type SkillLevel,
} from '@/lib/content/skill-taxonomy';
import { deleteSkill, reorderSkill } from './actions';
import { getSkills } from './queries';
import { SkillForm } from './skill-form';

function skillEyebrow(category: string, level: string | null): string {
  const categoryLabel =
    SKILL_CATEGORY_LABELS[category as SkillCategory] ?? category;
  if (isLanguageSkillCategory(category) && level) {
    return `${categoryLabel} / ${SKILL_LEVEL_LABELS[level as SkillLevel] ?? level}`;
  }
  return categoryLabel;
}

export default async function AdminSkillsPage() {
  const skillList = await getSkills();

  return (
    <div className="admin-dashboard">
      <section className="admin-hero">
        <div>
          <p className="admin-kicker">Content</p>
          <h1>Skills</h1>
          <p className="admin-hero__copy">
            Use the fixed categories so Skills.json stays clean. Levels are only
            for languages — Beginner, Intermediate, or Advanced.
          </p>
        </div>
        <p className="admin-hero__timestamp">{skillList.length} skills</p>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-kicker">Create</p>
            <h2>New skill</h2>
          </div>
        </div>
        <SkillForm />
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-kicker">Library</p>
            <h2>Existing skills</h2>
          </div>
          <span className="admin-panel__meta">Ordered top to bottom</span>
        </div>

        {skillList.length > 0 ? (
          <div className="admin-resource-list">
            {skillList.map((skill, index) => (
              <article className="admin-resource" key={skill.id}>
                <div className="admin-resource__summary">
                  <div>
                    <p className="admin-resource__eyebrow">
                      {skillEyebrow(skill.category, skill.level)}
                    </p>
                    <h3>{skill.name}</h3>
                  </div>
                  <div className="admin-resource__actions">
                    <AdminPendingForm
                      action={reorderSkill}
                      label="Up"
                      pendingLabel="…"
                      className="admin-link-button"
                      disabled={index === 0}
                    >
                      <input type="hidden" name="id" value={skill.id} />
                      <input type="hidden" name="direction" value="up" />
                    </AdminPendingForm>
                    <AdminPendingForm
                      action={reorderSkill}
                      label="Down"
                      pendingLabel="…"
                      className="admin-link-button"
                      disabled={index === skillList.length - 1}
                    >
                      <input type="hidden" name="id" value={skill.id} />
                      <input type="hidden" name="direction" value="down" />
                    </AdminPendingForm>
                    <AdminConfirmForm
                      action={deleteSkill}
                      itemName={skill.name}
                      label="Delete"
                      className="admin-link-button admin-link-button--danger"
                    >
                      <input type="hidden" name="id" value={skill.id} />
                    </AdminConfirmForm>
                  </div>
                </div>
                <details className="admin-resource__details">
                  <summary>Edit skill</summary>
                  <SkillForm skill={skill} />
                </details>
              </article>
            ))}
          </div>
        ) : (
          <p className="admin-empty">
            No skills yet. Create the first one above.
          </p>
        )}
      </section>
    </div>
  );
}
