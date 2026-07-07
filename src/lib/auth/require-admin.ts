import 'server-only';

import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { isAdminUserId } from './admin-allowlist';

export async function requireAdmin(): Promise<{ userId: string }> {
  const { userId } = await auth();

  if (!isAdminUserId(userId)) {
    notFound();
  }

  return { userId: userId as string };
}
