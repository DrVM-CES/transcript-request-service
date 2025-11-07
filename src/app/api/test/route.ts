import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'LATEST CODE DEPLOYED - Nov 5 2024 - Import fixes applied', 
    timestamp: new Date().toISOString(),
    version: 'post-import-fixes'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      message: 'POST received successfully',
      received: body,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }
}