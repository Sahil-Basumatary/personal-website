'use client';

import { useEffect, useState } from 'react';
import type { BlogPost } from '@/types/blog';
import type { AliasNode, FileNode, FSNode } from '@/types/file-system';
import { FALLBACK_POSTS } from '@/lib/content/fallback-posts';
import { useFileSystemStore } from '@/stores/file-system-store';

let cachedPosts: BlogPost[] | null = null;
let inflight: Promise<BlogPost[]> | null = null;

function file(name: string, content: string): FileNode {
  return { name, kind: 'file', content };
}

function alias(name: string, target: string): AliasNode {
  return { name, kind: 'alias', target };
}

function toFsNodes(posts: BlogPost[]): FSNode[] {
  return posts.map((post) => alias(post.title, post.url));
}

export async function fetchRecentPosts(): Promise<BlogPost[]> {
  if (cachedPosts) return cachedPosts;
  if (inflight) return inflight;
  inflight = fetch('/api/blog/recent')
    .then(async (response) => {
      if (!response.ok) throw new Error('Failed to fetch recent posts');
      const parsed = (await response.json()) as BlogPost[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Invalid recent posts payload');
      }
      cachedPosts = parsed;
      return parsed;
    })
    .catch(() => {
      cachedPosts = FALLBACK_POSTS;
      return FALLBACK_POSTS;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useRecentPosts(enabled: boolean = true) {
  const [posts, setPosts] = useState<BlogPost[]>(cachedPosts ?? []);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!enabled) return;
    if (cachedPosts) return;
    fetchRecentPosts()
      .then((nextPosts) => {
        if (cancelled) return;
        setPosts(nextPosts);
        setHasError(nextPosts === FALLBACK_POSTS);
      })
      .catch(() => {
        if (cancelled) return;
        setPosts(FALLBACK_POSTS);
        setHasError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const resolvedPosts = cachedPosts ?? posts;
  return {
    posts: resolvedPosts,
    isLoading: enabled && cachedPosts === null && resolvedPosts.length === 0,
    hasError: hasError || resolvedPosts === FALLBACK_POSTS,
  };
}

export function useBlogPostsFolderBootstrap() {
  const setFolderChildren = useFileSystemStore((s) => s.setFolderChildren);

  useEffect(() => {
    let cancelled = false;
    fetchRecentPosts()
      .then((posts) => {
        if (cancelled) return;
        setFolderChildren('/Documents/Blog Posts', toFsNodes(posts));
      })
      .catch(() => {
        if (cancelled) return;
        setFolderChildren('/Documents/Blog Posts', [
          file('Unavailable', 'Could not load recent posts right now.'),
        ]);
      });
    return () => {
      cancelled = true;
    };
  }, [setFolderChildren]);
}
