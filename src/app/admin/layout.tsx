import { ClerkProvider, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { AdminNav } from './admin-nav';
import './admin.css';
import { requireAdmin } from '@/lib/auth/require-admin';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await requireAdmin();

  return (
    <ClerkProvider>
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-sidebar__brand">
            <span className="admin-sidebar__eyebrow">Portfolio OS</span>
            <span className="admin-sidebar__title">Admin</span>
          </div>
          <AdminNav />
          <Link className="admin-sidebar__site-link" href="/">
            View public site
          </Link>
        </aside>
        <div className="admin-main">
          <header className="admin-topbar">
            <div>
              <p className="admin-topbar__eyebrow">Private control room</p>
              <p className="admin-topbar__status">Signed in with Clerk</p>
            </div>
            <UserButton />
          </header>
          <main className="admin-content">{children}</main>
        </div>
      </div>
    </ClerkProvider>
  );
}
