import { SerwistProvider } from '@serwist/turbopack/react';
import type { Metadata } from 'next';
import ReactDOM from 'react-dom';
import './globals.css';

export const metadata: Metadata = {
  title: "Sahil's Computer",
  description: 'Mac OS 9 inspired personal portfolio',
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
        <SerwistProvider swUrl="/serwist/sw.js">{children}</SerwistProvider>
      </body>
    </html>
  );
}
