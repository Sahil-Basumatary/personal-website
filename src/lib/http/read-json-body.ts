export class BodyTooLargeError extends Error {
  constructor() {
    super('body-too-large');
    this.name = 'BodyTooLargeError';
  }
}

export class InvalidJsonBodyError extends Error {
  constructor() {
    super('invalid-json-body');
    this.name = 'InvalidJsonBodyError';
  }
}

export class UnsupportedMediaTypeError extends Error {
  constructor() {
    super('unsupported-media-type');
    this.name = 'UnsupportedMediaTypeError';
  }
}

function isJsonContentType(value: string | null): boolean {
  if (!value) {
    return false;
  }
  const mediaType = value.split(';', 1)[0]?.trim().toLowerCase();
  return mediaType === 'application/json';
}

export async function readJsonBody(
  request: Request,
  maxBytes: number
): Promise<unknown> {
  if (!isJsonContentType(request.headers.get('content-type'))) {
    throw new UnsupportedMediaTypeError();
  }

  const declaredLength = Number(request.headers.get('content-length') ?? NaN);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new BodyTooLargeError();
  }

  const reader = request.body?.getReader();
  if (!reader) {
    throw new InvalidJsonBodyError();
  }

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (!value || value.byteLength === 0) {
      continue;
    }

    total += value.byteLength;
    if (total > maxBytes) {
      try {
        await reader.cancel();
      } catch {
        // Reader may already be closed after cancel race.
      }
      throw new BodyTooLargeError();
    }
    chunks.push(value);
  }

  if (total === 0) {
    throw new InvalidJsonBodyError();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder('utf-8').decode(bytes)) as unknown;
  } catch {
    throw new InvalidJsonBodyError();
  }
}
