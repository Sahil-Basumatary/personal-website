import type { Metadata } from 'next';
import { FinderNotFound } from '@/components/system/FinderNotFound';

export const metadata: Metadata = {
  title: 'Not Found',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return <FinderNotFound />;
}
