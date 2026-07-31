import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy',
  description: `How ${SITE.name} handles analytics, contact messages, and error monitoring.`,
  alternates: {
    canonical: '/privacy',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <article className="privacy-sheet">
        <p className="privacy-kicker">{SITE.name}</p>
        <h1>Privacy</h1>
        <p className="privacy-lede">
          This page describes what this portfolio site collects and why. It is a
          factual product notice for {SITE_URL.replace(/^https?:\/\//, '')}, not
          legal advice.
        </p>

        <section>
          <h2>Analytics</h2>
          <p>
            The public homepage can send page-view and desktop-app launch events
            to this site&apos;s own Postgres database. Visitor counting uses a
            daily salted hash derived from network and browser signals. Raw IP
            addresses and raw user-agent strings are not stored as analytics
            fields. Referrers are reduced to an origin such as{' '}
            <code>https://www.google.com</code> before storage. Country may be
            inferred from the hosting platform&apos;s edge country header when
            present. Raw analytics events are retained for 90 days and then
            deleted automatically.
          </p>
          <p>
            Vercel Speed Insights may also collect aggregated performance
            metrics for the site.
          </p>
        </section>

        <section>
          <h2>Contact messages</h2>
          <p>
            If you use the contact form, your name, email address, subject, and
            message are stored in Postgres so they can be reviewed in the
            private admin inbox. The same content may be emailed through Resend
            to the site operator so replies can be sent. Contact messages are
            retained for 12 months and then deleted automatically, and can also
            be deleted earlier from admin. Copies already delivered to email
            inboxes or Resend follow those providers&apos; own retention rules.
          </p>
        </section>

        <section>
          <h2>Errors and diagnostics</h2>
          <p>
            Sentry receives application errors and may record an error-triggered
            session replay to diagnose failures. Default PII collection is
            disabled, and replay input masking is enabled. Admin routes and the
            contact form are treated as sensitive surfaces for replay blocking
            where selectors apply.
          </p>
        </section>

        <section>
          <h2>What is not collected here</h2>
          <p>
            There is no public account sign-up. Advertising cookies are not used
            for this portfolio analytics path. Offline copies of public
            portfolio content may remain on a visitor&apos;s device through the
            progressive web app cache until that cache is cleared or expires.
          </p>
        </section>

        <section>
          <h2>Requests</h2>
          <p>
            To ask about a contact submission or analytics retention for this
            site, email{' '}
            <a href="mailto:sahil@sahilbasumatary.dev">
              sahil@sahilbasumatary.dev
            </a>
            .
          </p>
        </section>

        <p className="privacy-back">
          <Link href="/">Back to Sahil&apos;s Computer</Link>
        </p>
      </article>
    </main>
  );
}
