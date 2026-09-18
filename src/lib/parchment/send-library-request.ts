import { z } from 'zod';
import { PDFDocument } from 'pdf-lib';

const nonblank = z.string().trim().min(1).max(256);
const email = z.string().trim().email().max(254);
const pdf = z.object({ bytes: z.instanceof(Uint8Array), decorated: z.boolean(), decorationId: z.number().int().positive().optional() }).strict();
const recipient = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('email'), email, name: nonblank }).strict(),
  z.object({ kind: z.literal('network'), code: nonblank }).strict(),
  z.object({ kind: z.literal('amcas'), code: nonblank, aamcId: z.string().regex(/^\d{8}$/), transcriptId: z.string().regex(/^\d{7}$/) }).strict(),
]);
const inputSchema = z.object({
  externalOrderId: nonblank,
  senderCode: nonblank,
  productCode: nonblank,
  documentSubType: z.enum(['INITIAL', 'MIDYEAR', 'FINAL']).optional(),
  student: z.object({ email, studentId: nonblank, dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), phone: nonblank,
    name: z.object({ firstName: nonblank, lastName: nonblank, middleName: nonblank.optional(), prefix: nonblank.optional(), suffix: nonblank.optional() }).strict() }).strict(),
  recipient,
  image: pdf.optional(),
  attachments: z.array(z.object({ bytes: z.instanceof(Uint8Array), fileName: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_. -]{0,119}\.pdf$/i) }).strict()).max(5).optional(),
}).strict();
export type SendLibraryInput = z.input<typeof inputSchema>;
export class ParchmentInputError extends Error { constructor() { super('Parchment request input is invalid.'); this.name = 'ParchmentInputError'; } }

async function pdfPayload(bytes: Uint8Array): Promise<string> {
  // Conservatively interpret the archived 15MB *encoded* limit as decimal MB.
  if (!bytes.length || Math.ceil(bytes.length / 3) * 4 > 15_000_000) throw new ParchmentInputError();
  const snapshot = Uint8Array.from(bytes);
  try { await PDFDocument.load(snapshot, { ignoreEncryption: false, throwOnInvalidObject: true }); } catch { throw new ParchmentInputError(); }
  return Buffer.from(snapshot).toString('base64');
}

/** No names, identifiers, sender/product codes or PDF content are inferred. */
export async function buildSendLibraryRequest(input: SendLibraryInput) {
  let snapshot: SendLibraryInput;
  try { snapshot = structuredClone(input); } catch { throw new ParchmentInputError(); }
  const parsed = inputSchema.safeParse(snapshot);
  if (!parsed.success) throw new ParchmentInputError();
  const value = parsed.data;
  const date = new Date(value.student.dateOfBirth + 'T00:00:00Z');
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value.student.dateOfBirth) throw new ParchmentInputError();
  if (value.image && !value.image.decorated && value.image.decorationId === undefined) throw new ParchmentInputError();
  // These archived AMCAS destinations require their documented extra fields.
  if (value.recipient.kind === 'network' && ['10013', '1188180'].includes(value.recipient.code)) throw new ParchmentInputError();
  const image = value.image ? { payloadContentType: 'PDF' as const, decorated: value.image.decorated,
    ...(value.image.decorationId === undefined ? {} : { decorationId: value.image.decorationId }), payload: await pdfPayload(value.image.bytes) } : undefined;
  const attachments = value.attachments ? await Promise.all(value.attachments.map(async item => ({ payloadContentType: 'PDF' as const, fileName: item.fileName, payload: await pdfPayload(item.bytes) }))) : undefined;
  return {
    externalOrderId: value.externalOrderId,
    sender: { code: value.senderCode, codeType: 'PARCHMENT_ID' as const },
    student: value.student,
    product: { code: value.productCode, codeType: 'MEMBER_PRODUCT_ID' as const, ...(value.documentSubType ? { documentSubType: value.documentSubType } : {}) },
    deliveryMethod: 'electronic' as const,
    recipient: value.recipient.kind === 'email' ? { email: value.recipient.email, name: { compositeName: value.recipient.name } } : { code: value.recipient.code, codeType: 'PARCHMENT_ID' as const },
    ...(image ? { image } : {}), ...(attachments ? { attachments } : {}),
    ...(value.recipient.kind === 'amcas' ? { orderOptions: [{ name: 'amcas_aamc_id', value: value.recipient.aamcId }, { name: 'transcript_id', value: value.recipient.transcriptId }] } : {}),
  };
}
