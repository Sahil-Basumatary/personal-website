import Link from 'next/link';
import { AdminConfirmForm } from '@/app/admin/_components/AdminConfirmForm';
import { deleteContactSubmission } from '../actions';
import { getContactSubmission } from '../queries';
import { ReplyForm } from '../reply-form';

const formatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'full',
  timeStyle: 'short',
});

interface AdminMessageDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminMessageDetailPage({
  params,
}: AdminMessageDetailPageProps) {
  const { id } = await params;
  const submission = await getContactSubmission(id);

  return (
    <div className="admin-dashboard">
      <section className="admin-hero">
        <div>
          <p className="admin-kicker">Message</p>
          <h1>{submission.subject}</h1>
          <p className="admin-hero__copy">
            From {submission.name} {'<'}
            {submission.email}
            {'>'}
          </p>
        </div>
        <p className="admin-hero__timestamp">
          {formatter.format(submission.createdAt)}
        </p>
      </section>

      <section className="admin-panel">
        <div className="admin-message-detail">
          <p>{submission.message}</p>
        </div>
        <div className="admin-resource__actions">
          <Link className="admin-sidebar__site-link" href="/admin/messages">
            Back to inbox
          </Link>
          <AdminConfirmForm
            action={deleteContactSubmission}
            itemName={submission.subject}
            label="Delete message"
            className="admin-link-button admin-link-button--danger"
            redirectTo="/admin/messages"
          >
            <input type="hidden" name="id" value={submission.id} />
          </AdminConfirmForm>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-kicker">Reply</p>
            <h2>Respond by email</h2>
          </div>
          <span className="admin-panel__meta">
            {process.env.RESEND_API_KEY ? 'Resend enabled' : 'Email no-op'}
          </span>
        </div>
        <ReplyForm
          id={submission.id}
          subject={submission.subject}
          name={submission.name}
        />
      </section>
    </div>
  );
}
