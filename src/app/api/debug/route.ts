import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Debug endpoint working',
    env: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
      hasApiKey: !!process.env.MFC_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) || 'missing',
    },
    timestamp: new Date().toISOString(),
  });
}
