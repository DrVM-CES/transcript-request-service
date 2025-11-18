import { NextRequest, NextResponse } from 'next/server';
import { rawClient } from '../../../../../db/client';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Simple test query
    const result = await rawClient.execute({
      sql: 'SELECT COUNT(*) as count FROM schools',
      args: []
    });

    const count = result.rows[0]?.count;

    // Get a few sample schools
    const sample = await rawClient.execute({
      sql: 'SELECT school_name, city, state FROM schools LIMIT 5',
      args: []
    });

    return NextResponse.json({
      success: true,
      totalSchools: count,
      sampleSchools: sample.rows
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
