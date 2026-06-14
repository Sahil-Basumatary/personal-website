import { NextResponse } from 'next/server';
import { getRecentPosts } from '@/lib/content/blog-feed';

export const runtime = 'nodejs';
export const revalidate = 1800;

export async function GET() {
  const posts = await getRecentPosts();
  return NextResponse.json(posts);
}
