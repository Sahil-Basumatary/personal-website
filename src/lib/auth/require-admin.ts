import 'server-only';

import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';

function getAdminUserIds(): Set<string> {
  return new Set(
    (process.env.ADMIN_USER_IDS ?? '')
      .split(',')
      .map((userId) => userId.trim())
      .filter(Boolean)
  );
}

export async function requireAdmin(): Promise<{ userId: string }> {
  const { userId } = await auth();
  const adminUserIds = getAdminUserIds();

  if (!userId || !adminUserIds.has(userId)) {
    notFound();
  }

  return { userId };
}
