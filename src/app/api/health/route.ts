import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { parchmentSFTP } from '../../../lib/sftp-client';
import { db } from '../../../db';
import { transcriptRequests } from '../../../db/schema';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const checks: any = {
    database: 'not_tested',
    sftp: 'not_tested',
    environment: process.env.NODE_ENV || 'development',
    errors: []
  };

  // Test database connection
  try {
    await db.select().from(transcriptRequests).limit(1);
    checks.database = 'ok';
  } catch (error: any) {
    checks.database = 'failed';
    checks.errors.push(`Database: ${error.message}`);
  }

  // Test SFTP - skip for now
  checks.sftp = 'skipped';

  // Always return 200 so we can see the actual status
  return NextResponse.json({
    status: 'responding',
    timestamp: new Date().toISOString(),
    checks,
    env: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
    }
  }, { status: 200 });
}