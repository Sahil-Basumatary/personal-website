import { getAdminDashboardMetrics } from './queries';

export default async function AdminDashboardPage() {
  const metrics = await getAdminDashboardMetrics();
  const readinessItems = [
    {
      label: 'Page views',
      value: metrics.pageViews.toLocaleString('en-GB'),
      description: 'Public homepage visits tracked through /api/analytics.',
    },
    {
      label: 'Daily visitors',
      value: metrics.dailyVisitors.toLocaleString('en-GB'),
      description:
        'Daily SHA-256 visitor hashes. No long-term visitor ID stored.',
    },
    {
      label: 'App launches',
      value: metrics.windowOpens.toLocaleString('en-GB'),
      description:
        'Internal desktop apps opened from the portfolio experience.',
    },
  ];

  return (
    <div className="admin-dashboard">
      <section className="admin-hero">
        <div>
          <p className="admin-kicker">Dashboard</p>
          <h1>Portfolio command center</h1>
          <p className="admin-hero__copy">
            A private view of portfolio activity and content operations. This
            first analytics pass tracks visits and desktop interactions without
            storing raw personal identifiers.
          </p>
        </div>
      </section>

      <section className="admin-card-grid" aria-label="Analytics overview">
        {readinessItems.map((item) => (
          <article className="admin-card" key={item.label}>
            <p className="admin-card__label">{item.label}</p>
            <h2>{item.value}</h2>
            <p>{item.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
