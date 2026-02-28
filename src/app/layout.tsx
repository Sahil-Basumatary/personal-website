import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Sahil's Computer",
  description: 'Mac OS 9 inspired personal portfolio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
