import { SerwistProvider } from '@serwist/turbopack/react';
import type { Metadata } from 'next';
import ReactDOM from 'react-dom';
import {
  buildStructuredData,
  serializeJsonLd,
} from '@/lib/seo/structured-data';
import { SITE, SITE_URL } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE.name,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.author, url: SITE_URL }],
  creator: SITE.author,
  publisher: SITE.author,
  keywords: [
    'Sahil Basumatary',
    'portfolio',
    'software engineer',
    'web developer',
    'computer science',
    'Mac OS 9',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    locale: SITE.locale,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.name,
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
        <SerwistProvider swUrl="/serwist/sw.js">{children}</SerwistProvider>
      </body>
    </html>
  );
}
