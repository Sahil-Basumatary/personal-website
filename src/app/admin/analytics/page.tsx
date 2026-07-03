import { AnalyticsChartsLazy } from './analytics-charts-lazy';
import { getAnalyticsOverview, type CountBreakdown } from './queries';

function formatNumber(value: number): string {
  return value.toLocaleString('en-GB');
}

function BreakdownList({
  title,
  eyebrow,
  items,
  empty,
}: {
  title: string;
  eyebrow: string;
  items: CountBreakdown[];
  empty: string;
}) {
  return (
    <section className="admin-breakdown">
      <div className="admin-chart-card__header">
        <p className="admin-kicker">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {items.length > 0 ? (
        <ol className="admin-ranked-list">
          {items.map((item) => (
            <li key={item.label}>
              <span>{item.label}</span>
              <strong>{formatNumber(item.count)}</strong>
            </li>
          ))}
        </ol>
      ) : (
        <p className="admin-empty">{empty}</p>
      )}
    </section>
  );
}

export default async function AdminAnalyticsPage() {
  const analytics = await getAnalyticsOverview();
  const summaryItems = [
    {
      label: 'Visits',
      value: formatNumber(analytics.summary.visits30d),
      description: `${formatNumber(analytics.summary.visits7d)} in the last 7 days.`,
    },
    {
      label: 'Daily visitors',
      value: formatNumber(analytics.summary.dailyVisitors30d),
      description: `${formatNumber(
        analytics.summary.dailyVisitors7d
      )} daily unique visitors in the last 7 days.`,
    },
    {
      label: 'App launches',
      value: formatNumber(analytics.summary.appLaunches30d),
      description: `${formatNumber(
        analytics.summary.appLaunches7d
      )} internal app launches in the last 7 days.`,
    },
  ];

  return (
    <div className="admin-dashboard">
      <section className="admin-hero">
        <div>
          <p className="admin-kicker">Analytics</p>
          <h1>Portfolio intelligence</h1>
          <p className="admin-hero__copy">
            Understand how visitors explore the portfolio without collecting raw
            IP addresses, raw user agents, or long-term visitor identifiers.
          </p>
        </div>
        <p className="admin-hero__timestamp">Last 30 days</p>
      </section>

      <section className="admin-card-grid" aria-label="Analytics summary">
        {summaryItems.map((item) => (
          <article className="admin-card" key={item.label}>
            <p className="admin-card__label">{item.label}</p>
            <h2>{item.value}</h2>
            <p>{item.description}</p>
          </article>
        ))}
      </section>

      <AnalyticsChartsLazy
        traffic={analytics.traffic}
        popularApps={analytics.popularApps}
        devices={analytics.devices}
      />

      <div className="admin-breakdown-grid">
        <BreakdownList
          eyebrow="Geography"
          title="Countries"
          items={analytics.countries}
          empty="No country data yet. Vercel adds this header in deployed environments."
        />
        <BreakdownList
          eyebrow="Acquisition"
          title="Referrers"
          items={analytics.referrers}
          empty="No referrer data yet."
        />
      </div>
    </div>
  );
}
