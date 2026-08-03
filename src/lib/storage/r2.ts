import 'server-only';

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  buildStoryImageStorageKey,
  mimeTypeFromStoryImageStorageKey,
  publicObjectKeyForStoryImage,
  publicUrlForStorageKey,
  STORY_IMAGE_SIGNED_URL_TTL_SECONDS,
  validateStoryImageBytes,
  type StoryImageMimeType,
} from './story-image-limits';

export { STORY_IMAGE_SIGNED_URL_TTL_SECONDS } from './story-image-limits';

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
      | 'promote_failed'
      | 'sign_failed'
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

function assertSafeStorageKey(storageKey: string): string {
  const key = storageKey.trim();
  if (!key || key.includes('..') || key.startsWith('/')) {
    throw new StoryImageStorageError('Invalid storage key', 'delete_failed');
  }
  return key;
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
}): Promise<{ storageKey: string; mimeType: StoryImageMimeType }> {
  const validated = validateStoryImageBytes({
    bytes: options.bytes,
    declaredMimeType: options.mimeType,
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

  try {
    await getR2Client(config).send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: storageKey,
        Body: options.bytes,
        ContentType: validated.mimeType,
        CacheControl: 'private, no-store',
      })
    );
  } catch (cause) {
    throw new StoryImageStorageError(
      cause instanceof Error ? cause.message : 'Upload failed',
      'upload_failed'
    );
  }

  return { storageKey, mimeType: validated.mimeType };
}

export async function promoteStoryImageToPublic(
  storageKey: string
): Promise<string> {
  const key = assertSafeStorageKey(storageKey);
  const config = requireR2Config();
  const publicKey = publicObjectKeyForStoryImage(key);
  const contentType = mimeTypeFromStoryImageStorageKey(key);

  try {
    await getR2Client(config).send(
      new CopyObjectCommand({
        Bucket: config.bucket,
        CopySource: `${config.bucket}/${key}`,
        Key: publicKey,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
        MetadataDirective: 'REPLACE',
      })
    );
  } catch (cause) {
    throw new StoryImageStorageError(
      cause instanceof Error ? cause.message : 'Promote failed',
      'promote_failed'
    );
  }

  return publicUrlForStorageKey(config.publicBaseUrl, publicKey);
}

export async function demoteStoryImageFromPublic(
  storageKey: string
): Promise<void> {
  await deleteStoryImage(publicObjectKeyForStoryImage(storageKey));
}

export async function getSignedStoryImageUrl(
  storageKey: string,
  expiresInSeconds: number = STORY_IMAGE_SIGNED_URL_TTL_SECONDS
): Promise<string> {
  const key = assertSafeStorageKey(storageKey);
  const config = requireR2Config();

  try {
    return await getSignedUrl(
      getR2Client(config),
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: key,
      }),
      { expiresIn: expiresInSeconds }
    );
  } catch (cause) {
    throw new StoryImageStorageError(
      cause instanceof Error ? cause.message : 'Sign failed',
      'sign_failed'
    );
  }
}

export async function deleteStoryImage(storageKey: string): Promise<void> {
  const key = assertSafeStorageKey(storageKey);
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

export async function deleteStoryImageObjects(
  storageKey: string
): Promise<void> {
  const key = assertSafeStorageKey(storageKey);
  const publicKey = publicObjectKeyForStoryImage(key);
  await deleteStoryImage(key);
  if (publicKey !== key) {
    await deleteStoryImage(publicKey);
  }
}
