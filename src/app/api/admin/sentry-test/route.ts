import { requireAdmin } from '@/lib/auth/require-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Temporary C2 verification endpoint.
// Remove after confirming a production event lands in Sentry with
// source-mapped stack frames.
export async function GET() {
  await requireAdmin();

  throw new Error(
    `C2 verification: server error probe at ${new Date().toISOString()}`
  );
}
