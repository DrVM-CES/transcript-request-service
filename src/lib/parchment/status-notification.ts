import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

const notification = z.object({
  event: z.literal('order.status.updated'),
  eventTime: z.string().datetime({ offset: true }),
  orderLineItem: z.object({ documentId: z.string().min(1).max(256), externalDocumentId: z.string().min(1).max(256),
    status: z.enum(['PENDING', 'APPROVED', 'ERROR', 'AVAILABLE', 'DELIVERED', 'COMPLETE', 'CANCELLED']),
    sender: z.object({ parchmentId: z.string().min(1).max(256) }),
  }),
});
const statuses = { PENDING: 'pending', APPROVED: 'processing', ERROR: 'failed', AVAILABLE: 'available', DELIVERED: 'delivered', COMPLETE: 'delivered', CANCELLED: 'cancelled' } as const;
export interface NotificationVerification {
  rawPayload: Uint8Array;
  signature: string;
  secret: string;
  /** No default: archived documentation does not specify encoding or prefix. */
  signatureEncoding: 'hex' | 'base64';
  expectedExternalOrderId: string;
  expectedSenderCode: string;
  expectedDocumentId?: string;
}

/** Pure verification only. No webhook registration, HTTP acknowledgment or DB mutation. */
export function verifyParchmentStatusNotification(input: NotificationVerification) {
  const body = authenticateParchmentNotification(input);
  if (!body) return null;
  const item = body.orderLineItem;
  if (!input.expectedExternalOrderId || !input.expectedSenderCode || item.externalDocumentId !== input.expectedExternalOrderId || item.sender.parchmentId !== input.expectedSenderCode || (input.expectedDocumentId !== undefined && item.documentId !== input.expectedDocumentId)) return null;
  return Object.freeze({ externalOrderId: item.externalDocumentId, documentId: item.documentId, eventTime: body.eventTime,
    providerStatus: item.status, status: statuses[item.status], providerReportedDelivery: item.status === 'DELIVERED' || item.status === 'COMPLETE',
    deliveryVerified: false as const, reconciliationRequired: true as const });
}

/** Authenticate raw bytes BEFORE parsing a correlation key or querying orders. */
export function authenticateParchmentNotification(input: Pick<NotificationVerification,'rawPayload'|'signature'|'secret'|'signatureEncoding'>) {
  try {
    if (!input.rawPayload.length || input.rawPayload.length > 128_000 || !input.secret) return null;
    if (input.signatureEncoding !== 'hex' && input.signatureEncoding !== 'base64') return null;
    if (input.signatureEncoding === 'hex' ? !/^[0-9a-fA-F]{64}$/.test(input.signature) : !/^[A-Za-z0-9+/]{43}=$/.test(input.signature)) return null;
    const supplied = Buffer.from(input.signature, input.signatureEncoding);
    const expected = createHmac('sha256', input.secret).update(input.rawPayload).digest();
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
    const body = notification.safeParse(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(input.rawPayload)));
    if (!body.success) return null;
    return body.data;
  } catch { return null; }
}
