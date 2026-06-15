const readinessItems = [
  {
    label: 'Authentication',
    value: 'Clerk gated',
    description: 'Only signed-in users in ADMIN_USER_IDS can reach this area.',
  },
  {
    label: 'Database',
    value: 'Schema ready',
    description:
      'Projects, skills, about, analytics, and messages tables exist.',
  },
  {
    label: 'Public bundle',
    value: 'Unaffected',
    description:
      'Clerk stays scoped to the admin layout for public-site speed.',
  },
];

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

export default function AdminDashboardPage() {
  return (
    <div className="admin-dashboard">
      <section className="admin-hero">
        <div>
          <p className="admin-kicker">Dashboard</p>
          <h1>Admin panel foundation</h1>
          <p className="admin-hero__copy">
            This is the secure workspace for managing portfolio content,
            analytics, and contact messages as the next milestones come online.
          </p>
        </div>
        <div className="admin-hero__badge">Phase 7</div>
      </section>

      <section className="admin-card-grid" aria-label="Readiness status">
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
