import { NextResponse } from 'next/server';
import { parchmentSFTP } from '../../../lib/sftp-client';
import { checkServiceReadiness } from '../../../lib/delivery-readiness';
import { db } from '../../../db';
import { transcriptRequests } from '../../../db/schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await checkServiceReadiness(
    () => db.select().from(transcriptRequests).limit(0),
    parchmentSFTP.isProductionMode(),
  );
  return NextResponse.json(result.body, {
    status: result.statusCode,
    headers: { 'Cache-Control': 'no-store' },
  });
}
