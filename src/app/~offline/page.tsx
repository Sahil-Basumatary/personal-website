import type { Metadata } from 'next';
import { OfflineExperience } from '@/components/desktop/OfflineExperience';

export const metadata: Metadata = {
  title: 'Offline',
};

export default function OfflinePage() {
  return <OfflineExperience />;
}
