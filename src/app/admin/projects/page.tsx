import { AdminConfirmForm } from '@/app/admin/_components/AdminConfirmForm';
import { AdminPendingForm } from '@/app/admin/_components/AdminPendingForm';
import { deleteProject, reorderProject } from './actions';
import { ProjectForm } from './project-form';
import { StoryImagesPanel } from './story-images-panel';
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
            story images, and display order from one editorial workspace.
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
                      {project.storyImages.length > 0
                        ? ` / ${project.storyImages.length} images`
                        : ''}
                    </p>
                    <h3>{project.title}</h3>
                    <p>{project.summary}</p>
                  </div>
                  <div className="admin-resource__actions">
                    <AdminPendingForm
                      action={reorderProject}
                      label="Up"
                      pendingLabel="…"
                      className="admin-link-button"
                      disabled={index === 0}
                    >
                      <input type="hidden" name="id" value={project.id} />
                      <input type="hidden" name="direction" value="up" />
                    </AdminPendingForm>
                    <AdminPendingForm
                      action={reorderProject}
                      label="Down"
                      pendingLabel="…"
                      className="admin-link-button"
                      disabled={index === projectList.length - 1}
                    >
                      <input type="hidden" name="id" value={project.id} />
                      <input type="hidden" name="direction" value="down" />
                    </AdminPendingForm>
                    <AdminConfirmForm
                      action={deleteProject}
                      itemName={project.title}
                      label="Delete"
                      className="admin-link-button admin-link-button--danger"
                    >
                      <input type="hidden" name="id" value={project.id} />
                    </AdminConfirmForm>
                  </div>
                </div>
                <details className="admin-resource__details">
                  <summary>Edit project</summary>
                  <ProjectForm project={project} />
                  <StoryImagesPanel
                    projectId={project.id}
                    images={project.storyImages}
                  />
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
