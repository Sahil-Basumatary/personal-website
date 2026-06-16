import { deleteSkill, reorderSkill } from './actions';
import { getSkills } from './queries';
import { SkillForm } from './skill-form';

export default async function AdminSkillsPage() {
  const skillList = await getSkills();

  return (
    <div className="admin-dashboard">
      <section className="admin-hero">
        <div>
          <p className="admin-kicker">Content</p>
          <h1>Skills</h1>
          <p className="admin-hero__copy">
            Curate the skills shown in the portfolio. Keep categories consistent
            and use proficiency as a display signal, not a hiring promise.
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
                      {skill.category} / {skill.proficiency}%
                    </p>
                    <h3>{skill.name}</h3>
                    <div className="admin-meter" aria-hidden="true">
                      <span style={{ width: `${skill.proficiency}%` }} />
                    </div>
                  </div>
                  <div className="admin-resource__actions">
                    <form action={reorderSkill}>
                      <input type="hidden" name="id" value={skill.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button
                        type="submit"
                        className="admin-link-button"
                        disabled={index === 0}
                      >
                        Up
                      </button>
                    </form>
                    <form action={reorderSkill}>
                      <input type="hidden" name="id" value={skill.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button
                        type="submit"
                        className="admin-link-button"
                        disabled={index === skillList.length - 1}
                      >
                        Down
                      </button>
                    </form>
                    <form action={deleteSkill}>
                      <input type="hidden" name="id" value={skill.id} />
                      <button
                        type="submit"
                        className="admin-link-button admin-link-button--danger"
                      >
                        Delete
                      </button>
                    </form>
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
