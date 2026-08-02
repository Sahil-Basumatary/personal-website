import { SerwistProvider } from '@serwist/turbopack/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import ReactDOM from 'react-dom';
import {
  buildStructuredData,
  serializeJsonLd,
} from '@/lib/seo/structured-data';
import { SITE, SITE_URL } from '@/lib/site';
import { ServiceWorkerCleanup } from './service-worker-cleanup';
import { ServiceWorkerUpdatePrompt } from './service-worker-update-prompt';
import './globals.css';

const isProduction = process.env.NODE_ENV === 'production';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE.title,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.author, url: SITE_URL }],
  creator: SITE.author,
  publisher: SITE.author,
  keywords: [
    'Sahil Bzy',
    'sahilbzy',
    'sahilbzy.com',
    'Sahil Basumatary',
    'portfolio',
    'software engineer',
    'web developer',
    'computer science',
    "King's College London",
    'Mac OS 9',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    locale: SITE.locale,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.title,
    description: SITE.description,
    creator: SITE.twitter,
    site: SITE.twitter,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

function preloadFonts() {
  ReactDOM.preload('/fonts/Charcoal.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  });
  ReactDOM.preload('/fonts/ChicagoFLF.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  });
  ReactDOM.preload('/fonts/Caveat-Regular.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  });
  ReactDOM.preload('/fonts/Caveat-Bold.woff2', {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: 'anonymous',
  });
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  preloadFonts();

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(buildStructuredData()),
          }}
        />
        {isProduction ? (
          <SerwistProvider
            swUrl="/serwist/sw.js"
            // Bundled SW is classic JS (createSerwistRoute + esbuild), not ESM.
            // SerwistProvider defaults to type:"module", which rejects registration.
            options={{ type: 'classic' }}
          >
            <ServiceWorkerUpdatePrompt />
            {children}
          </SerwistProvider>
        ) : (
          <>
            <ServiceWorkerCleanup />
            {children}
          </>
        )}
        {/* Injects its script client-side, so strict-dynamic nonce propagation
            covers it without threading a per-request nonce. */}
        <SpeedInsights />
      </body>
    </html>
  );
}
