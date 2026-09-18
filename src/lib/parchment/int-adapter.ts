import { buildSendLibraryRequest, type SendLibraryInput } from './send-library-request';

export const PARCHMENT_INT_DELIVERY_URL = 'https://api.int.parchment.com/send-library-api/v1/requestCredentialDelivery';
export type IntDeliveryResult = { status: 'disabled' | 'invalid_request' | 'configuration_error' | 'unknown_outcome' } | { status: 'accepted'; externalOrderId: string; deliveryVerified: false };
export interface IntAdapterOptions {
  enabled?: boolean;
  senderCode: string;
  productCode: string;
  /** Operator-owned INT notification/destination allowlists; never request body values. */
  allowedEmails: readonly string[];
  allowedRecipientCodes: readonly string[];
  /** OAuth construction is intentionally external until Parchment resolves its wording. */
  accessToken: () => Promise<string>;
  fetch?: typeof fetch;
}

async function boundedJson(response: Response): Promise<unknown> {
  if (Number(response.headers.get('content-length') || 0) > 64_000) throw new Error('Response limit');
  const reader = response.body?.getReader(); if (!reader) throw new Error('Missing response');
  const chunks: Uint8Array[] = []; let size = 0;
  try { while (true) { const next = await reader.read(); if (next.done) break; size += next.value.length; if (size > 64_000) throw new Error('Response limit'); chunks.push(next.value); } }
  finally { await reader.cancel().catch(() => undefined); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

/** Groundwork only: no existing route calls this adapter, and it is disabled by default. */
export function createParchmentIntAdapter(configuration: IntAdapterOptions) {
  const options = { ...configuration, allowedEmails: [...configuration.allowedEmails], allowedRecipientCodes: [...configuration.allowedRecipientCodes] };
  return async function requestDelivery(input: SendLibraryInput): Promise<IntDeliveryResult> {
    if (options.enabled !== true) return { status: 'disabled' };
    let request: Awaited<ReturnType<typeof buildSendLibraryRequest>>;
    try { request = await buildSendLibraryRequest(input); } catch { return { status: 'invalid_request' }; }
    if (!options.senderCode.trim() || !options.productCode.trim() || request.sender.code !== options.senderCode || request.product.code !== options.productCode) return { status: 'configuration_error' };
    const emails = new Set(options.allowedEmails.map(email => email.trim().toLowerCase()));
    if (!emails.has(request.student.email.toLowerCase()) || ('email' in request.recipient
      ? !emails.has(request.recipient.email!.toLowerCase())
      : !options.allowedRecipientCodes.includes(request.recipient.code!))) return { status: 'configuration_error' };
    // The known production AMCAS ID must never be dispatched by this INT adapter.
    if ('code' in request.recipient && request.recipient.code === '10013') return { status: 'configuration_error' };
    const controller = new AbortController(); let timer: ReturnType<typeof setTimeout> | undefined;
    let dispatched = false;
    try {
      const deadline = new Promise<never>((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('Deadline')); }, 10_000); });
      const operation = (async (): Promise<IntDeliveryResult> => {
        const token = await options.accessToken(); if (!token.trim() || /[\r\n]/.test(token)) return { status: 'configuration_error' };
        if (controller.signal.aborted) return { status: 'configuration_error' };
        dispatched = true;
        const response = await (options.fetch ?? fetch)(PARCHMENT_INT_DELIVERY_URL, { method: 'POST', redirect: 'error', signal: controller.signal,
          headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(request) });
        if (!response.ok) return { status: 'unknown_outcome' };
        const body = await boundedJson(response) as { AcknowledgmentData?: { AcknowledgmentCode?: unknown } } | null;
        if (body?.AcknowledgmentData?.AcknowledgmentCode !== 'Accepted') return { status: 'unknown_outcome' };
        return { status: 'accepted', externalOrderId: request.externalOrderId, deliveryVerified: false };
      })();
      return await Promise.race([operation, deadline]);
    } catch { return { status: dispatched ? 'unknown_outcome' : 'configuration_error' }; }
    finally { if (timer) clearTimeout(timer); controller.abort(); }
  };
}
