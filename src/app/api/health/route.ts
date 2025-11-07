import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { parchmentSFTP } from '../../../lib/sftp-client';
import { db } from '../../../db';
import { transcriptRequests } from '../../../db/schema';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const checks = {
    database: false,
    sftp: false,
    environment: process.env.NODE_ENV || 'development'
  };

  let overallHealth = true;

  try {
    // Test database connection with a simple count query
    await db.select().from(transcriptRequests).limit(1);
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
    checks.database = false;
    overallHealth = false;
  }

  // Test SFTP connection only if we have credentials
  if (parchmentSFTP.isProductionMode()) {
    try {
      const sftpResult = await parchmentSFTP.testConnection();
      checks.sftp = sftpResult.success;
      if (!sftpResult.success) {
        overallHealth = false;
      }
    } catch (error) {
      console.error('SFTP health check failed:', error);
      checks.sftp = false;
      overallHealth = false;
    }
  } else {
    // In development mode, SFTP is considered "healthy" since we simulate it
    checks.sftp = true;
  }

  const status = overallHealth ? 200 : 503;
  
  return NextResponse.json({
    status: overallHealth ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: checks.database ? 'ok' : 'failed',
      sftp: checks.sftp ? 'ok' : 'failed',
      mode: parchmentSFTP.isProductionMode() ? 'production' : 'development'
    },
    environment: checks.environment
  }, { status });
}