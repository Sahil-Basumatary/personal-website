import Link from 'next/link';
import { deleteContactSubmission, markContactSubmissionRead } from './actions';
import { getContactSubmissions } from './queries';

const formatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default async function AdminMessagesPage() {
  const submissions = await getContactSubmissions();
  const unreadCount = submissions.filter(
    (submission) => !submission.read
  ).length;

  return (
    <div className="admin-dashboard">
      <section className="admin-hero">
        <div>
          <p className="admin-kicker">Inbox</p>
          <h1>Messages</h1>
          <p className="admin-hero__copy">
            Review contact submissions, mark conversations as read, remove spam,
            and reply from the admin workspace.
          </p>
        </div>
        <p className="admin-hero__timestamp">
          {unreadCount} unread / {submissions.length} total
        </p>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-kicker">Queue</p>
            <h2>Contact submissions</h2>
          </div>
          <span className="admin-panel__meta">Newest first</span>
        </div>

        {submissions.length > 0 ? (
          <div className="admin-message-list">
            {submissions.map((submission) => (
              <article
                className="admin-message-row"
                data-unread={!submission.read || undefined}
                key={submission.id}
              >
                <Link
                  className="admin-message-row__main"
                  href={`/admin/messages/${submission.id}`}
                >
                  <span className="admin-message-row__meta">
                    {submission.read ? 'Read' : 'Unread'} /{' '}
                    {formatter.format(submission.createdAt)}
                  </span>
                  <strong>{submission.subject}</strong>
                  <span>
                    {submission.name} &lt;{submission.email}&gt;
                  </span>
                </Link>
                <div className="admin-resource__actions">
                  {!submission.read ? (
                    <form action={markContactSubmissionRead}>
                      <input type="hidden" name="id" value={submission.id} />
                      <button type="submit" className="admin-link-button">
                        Mark read
                      </button>
                    </form>
                  ) : null}
                  <form action={deleteContactSubmission}>
                    <input type="hidden" name="id" value={submission.id} />
                    <button
                      type="submit"
                      className="admin-link-button admin-link-button--danger"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="admin-empty">
            No contact submissions yet. Messages from the public contact app
            will appear here.
          </p>
        )}
      </section>
    </div>
  );
}
