import { deleteProject, reorderProject } from './actions';
import { ProjectForm } from './project-form';
import { getProjects } from './queries';

export default async function AdminProjectsPage() {
  const projectList = await getProjects();

  return (
    <div className="admin-dashboard">
      <section className="admin-hero">
        <div>
          <p className="admin-kicker">Content</p>
          <h1>Projects</h1>
          <p className="admin-hero__copy">
            Manage portfolio projects, publishing status, links, tech stacks,
            and display order from one editorial workspace.
          </p>
        </div>
        <p className="admin-hero__timestamp">{projectList.length} projects</p>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-kicker">Create</p>
            <h2>New project</h2>
          </div>
        </div>
        <ProjectForm />
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-kicker">Library</p>
            <h2>Existing projects</h2>
          </div>
          <span className="admin-panel__meta">Ordered top to bottom</span>
        </div>

        {projectList.length > 0 ? (
          <div className="admin-resource-list">
            {projectList.map((project, index) => (
              <article className="admin-resource" key={project.id}>
                <div className="admin-resource__summary">
                  <div>
                    <p className="admin-resource__eyebrow">
                      {project.status} / {project.slug}
                    </p>
                    <h3>{project.title}</h3>
                    <p>{project.summary}</p>
                  </div>
                  <div className="admin-resource__actions">
                    <form action={reorderProject}>
                      <input type="hidden" name="id" value={project.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button
                        type="submit"
                        className="admin-link-button"
                        disabled={index === 0}
                      >
                        Up
                      </button>
                    </form>
                    <form action={reorderProject}>
                      <input type="hidden" name="id" value={project.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button
                        type="submit"
                        className="admin-link-button"
                        disabled={index === projectList.length - 1}
                      >
                        Down
                      </button>
                    </form>
                    <form action={deleteProject}>
                      <input type="hidden" name="id" value={project.id} />
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
                  <summary>Edit project</summary>
                  <ProjectForm project={project} />
                </details>
              </article>
            ))}
          </div>
        ) : (
          <p className="admin-empty">
            No projects yet. Create the first one above.
          </p>
        )}
      </section>
    </div>
  );
}
