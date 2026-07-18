import 'server-only';

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  buildStoryImageStorageKey,
  publicUrlForStorageKey,
  validateStoryImageBytes,
  type StoryImageMimeType,
} from './story-image-limits';

export class StoryImageStorageError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'misconfigured'
      | 'unsupported_type'
      | 'too_large'
      | 'empty'
      | 'upload_failed'
      | 'delete_failed'
  ) {
    super(message);
    this.name = 'StoryImageStorageError';
  }
}

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
}

function readR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET?.trim();
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim();

  if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucket ||
    !publicBaseUrl
  ) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicBaseUrl,
  };
}

function requireR2Config(): R2Config {
  const config = readR2Config();
  if (!config) {
    throw new StoryImageStorageError(
      'R2 storage is not configured',
      'misconfigured'
    );
  }
  return config;
}

let cachedClient: S3Client | null = null;
let cachedEndpoint: string | null = null;

function getR2Client(config: R2Config): S3Client {
  const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`;
  if (cachedClient && cachedEndpoint === endpoint) {
    return cachedClient;
  }
  cachedClient = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  cachedEndpoint = endpoint;
  return cachedClient;
}

export function isStoryImageStorageConfigured(): boolean {
  return readR2Config() !== null;
}

export async function putStoryImage(options: {
  projectId: string;
  bytes: Uint8Array;
  mimeType: string;
  objectId?: string;
}): Promise<{ storageKey: string; url: string; mimeType: StoryImageMimeType }> {
  const validated = validateStoryImageBytes({
    mimeType: options.mimeType,
    byteLength: options.bytes.byteLength,
  });
  if (!validated.ok) {
    throw new StoryImageStorageError(
      `Invalid story image: ${validated.error}`,
      validated.error
    );
  }

  const config = requireR2Config();
  const objectId = options.objectId ?? crypto.randomUUID();
  const storageKey = buildStoryImageStorageKey(
    options.projectId,
    validated.mimeType,
    objectId
  );
  const url = publicUrlForStorageKey(config.publicBaseUrl, storageKey);

  try {
    await getR2Client(config).send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: storageKey,
        Body: options.bytes,
        ContentType: validated.mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );
  } catch (cause) {
    throw new StoryImageStorageError(
      cause instanceof Error ? cause.message : 'Upload failed',
      'upload_failed'
    );
  }

  return { storageKey, url, mimeType: validated.mimeType };
}

export async function deleteStoryImage(storageKey: string): Promise<void> {
  const key = storageKey.trim();
  if (!key || key.includes('..') || key.startsWith('/')) {
    throw new StoryImageStorageError('Invalid storage key', 'delete_failed');
  }

  const config = requireR2Config();
  try {
    await getR2Client(config).send(
      new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: key,
      })
    );
  } catch (cause) {
    throw new StoryImageStorageError(
      cause instanceof Error ? cause.message : 'Delete failed',
      'delete_failed'
    );
  }
}
