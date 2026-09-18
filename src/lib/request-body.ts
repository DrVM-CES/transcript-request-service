export const MAX_REQUEST_BYTES = 512 * 1024;
export const MAX_SIGNATURE_CHARACTERS = 256 * 1024;

export class RequestBodyError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function readBoundedJson(request: Request, limit = MAX_REQUEST_BYTES): Promise<Record<string, unknown>> {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new RequestBodyError(415, 'Content-Type must be application/json');
  }
  const declared = request.headers.get('content-length');
  if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > limit)) {
    throw new RequestBodyError(/^\d+$/.test(declared) ? 413 : 400, 'Request body is invalid or too large');
  }
  if (!request.body) throw new RequestBodyError(400, 'A JSON object is required');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new RequestBodyError(413, 'Request body is too large');
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  let body: unknown;
  try { body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new RequestBodyError(400, 'Invalid JSON'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new RequestBodyError(400, 'A JSON object is required');
  }
  return body as Record<string, unknown>;
}

export function isBoundedPngSignature(value: string): boolean {
  if (!value.startsWith('data:image/png;base64,') || value.length > MAX_SIGNATURE_CHARACTERS) return false;
  try {
    const bytes = Uint8Array.from(atob(value.slice(22)), character => character.charCodeAt(0));
    if (bytes.length < 33 || [137,80,78,71,13,10,26,10].some((byte, index) => bytes[index] !== byte)) return false;
    const view = new DataView(bytes.buffer);
    if (view.getUint32(8) !== 13 || String.fromCharCode(...bytes.slice(12,16)) !== 'IHDR') return false;
    const width = view.getUint32(16), height = view.getUint32(20);
    return width > 0 && height > 0 && width <= 2048 && height <= 2048 && width * height <= 2_000_000;
  } catch { return false; }
}
