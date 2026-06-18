import { getAdminDashboardMetrics } from './queries';

const upcomingSections = [
  {
    title: 'About content',
    milestone: 'Milestone 4',
    description:
      'Edit the narrative shown in the portfolio without redeploying.',
  },
  {
    title: 'Projects and skills',
    milestone: 'Milestone 5',
    description:
      'Manage portfolio entries, tech stacks, ordering, and visibility.',
  },
  {
    title: 'Analytics and messages',
    milestone: 'Milestones 6-9',
    description:
      'Track privacy-friendly usage and reply to contact submissions.',
  },
];

export default async function AdminDashboardPage() {
  const metrics = await getAdminDashboardMetrics();
  const readinessItems = [
    {
      label: 'Page views',
      value: metrics.pageViews.toLocaleString('en-GB'),
      description: 'Public homepage visits tracked through /api/analytics.',
    },
    {
      label: 'Unique visitors',
      value: metrics.uniqueVisitors.toLocaleString('en-GB'),
      description:
        'Daily SHA-256 visitor hashes. No raw IP or user agent stored.',
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
        <div className="admin-hero__badge">Phase 7</div>
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

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <p className="admin-kicker">Build path</p>
            <h2>Next admin capabilities</h2>
          </div>
          <span className="admin-panel__meta">One milestone per commit</span>
        </div>
        <div className="admin-roadmap">
          {upcomingSections.map((section) => (
            <article className="admin-roadmap__item" key={section.title}>
              <span>{section.milestone}</span>
              <h3>{section.title}</h3>
              <p>{section.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
