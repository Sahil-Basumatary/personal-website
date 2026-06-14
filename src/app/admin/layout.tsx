import { ClerkProvider } from '@clerk/nextjs';
import type { ReactNode } from 'react';
import { requireAdmin } from '@/lib/auth/require-admin';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await requireAdmin();

  return <ClerkProvider>{children}</ClerkProvider>;
}
