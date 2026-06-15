import { AboutForm } from './about-form';
import { getAboutContent } from './queries';

const timestampFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default async function AdminAboutPage() {
  const about = await getAboutContent();

  return (
    <div className="admin-dashboard">
      <section className="admin-hero">
        <div>
          <p className="admin-kicker">Content</p>
          <h1>About section</h1>
          <p className="admin-hero__copy">
            Edit the narrative shown on your portfolio. Changes are saved to the
            database and take effect immediately.
          </p>
        </div>
        {about.updatedAt ? (
          <p className="admin-hero__timestamp">
            Updated {timestampFormatter.format(about.updatedAt)}
          </p>
        ) : null}
      </section>

      <section className="admin-panel">
        <AboutForm initialContent={about.content} />
      </section>
    </div>
  );
}
