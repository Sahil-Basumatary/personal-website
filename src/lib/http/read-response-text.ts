export class ResponseTooLargeError extends Error {
  constructor() {
    super('response-too-large');
    this.name = 'ResponseTooLargeError';
  }
}

export async function readResponseText(
  response: Response,
  maxBytes: number
): Promise<string> {
  const declaredLength = Number(response.headers.get('content-length') ?? NaN);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new ResponseTooLargeError();
  }

  const reader = response.body?.getReader();
  if (!reader) {
    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > maxBytes) {
      throw new ResponseTooLargeError();
    }
    return text;
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
      throw new ResponseTooLargeError();
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder('utf-8').decode(bytes);
}
