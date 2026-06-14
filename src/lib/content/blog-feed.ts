import { FALLBACK_POSTS } from './fallback-posts';
import type { BlogPost } from '@/types/blog';

const JSON_FEED_URL = 'https://blog.sahilbzy.com/feed.json';
const RSS_FEED_URL = 'https://blog.sahilbzy.com/rss.xml';
const REVALIDATE_SECONDS = 1800;
const MAX_POSTS = 5;

interface JsonFeedItem {
  title?: unknown;
  url?: unknown;
  external_url?: unknown;
  date_published?: unknown;
  date_modified?: unknown;
}

interface JsonFeed {
  items?: unknown;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const next = value.trim();
  return next.length > 0 ? next : null;
}

function toIsoDate(value: unknown): string | null {
  const raw = asNonEmptyString(value);
  if (!raw) return null;
  const time = Date.parse(raw);
  if (Number.isNaN(time)) return null;
  return new Date(time).toISOString();
}

function normalizePost(post: BlogPost): BlogPost | null {
  const title = asNonEmptyString(post.title);
  const url = asNonEmptyString(post.url);
  const publishedAt = toIsoDate(post.publishedAt);
  if (!title || !url || !publishedAt) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  return { title, url, publishedAt };
}

function sortAndCap(posts: BlogPost[]): BlogPost[] {
  return posts
    .slice()
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, MAX_POSTS);
}

function parseJsonFeed(text: string): BlogPost[] {
  const parsed = JSON.parse(text) as JsonFeed;
  if (!Array.isArray(parsed.items)) return [];
  const posts: BlogPost[] = [];
  for (const rawItem of parsed.items) {
    const item = rawItem as JsonFeedItem;
    const normalized = normalizePost({
      title: asNonEmptyString(item.title) ?? '',
      url:
        asNonEmptyString(item.url) ?? asNonEmptyString(item.external_url) ?? '',
      publishedAt:
        asNonEmptyString(item.date_published) ??
        asNonEmptyString(item.date_modified) ??
        '',
    });
    if (normalized) posts.push(normalized);
  }
  return sortAndCap(posts);
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function readTag(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  if (!match?.[1]) return null;
  return decodeXmlEntities(
    match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  );
}

function parseRssFeed(xml: string): BlogPost[] {
  const itemBlocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
  const posts: BlogPost[] = [];
  for (const item of itemBlocks) {
    const normalized = normalizePost({
      title: readTag(item, 'title') ?? '',
      url: readTag(item, 'link') ?? '',
      publishedAt: readTag(item, 'pubDate') ?? '',
    });
    if (normalized) posts.push(normalized);
  }
  return sortAndCap(posts);
}

async function fetchFeedText(url: string): Promise<string> {
  const response = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

export async function getRecentPosts(): Promise<BlogPost[]> {
  try {
    const json = await fetchFeedText(JSON_FEED_URL);
    const jsonPosts = parseJsonFeed(json);
    if (jsonPosts.length > 0) return jsonPosts;
  } catch {}

  try {
    const rss = await fetchFeedText(RSS_FEED_URL);
    const rssPosts = parseRssFeed(rss);
    if (rssPosts.length > 0) return rssPosts;
  } catch {}

  return FALLBACK_POSTS;
}
