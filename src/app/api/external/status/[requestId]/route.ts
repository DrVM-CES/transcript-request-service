import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { transcriptRequests } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

/**
 * Get status of a transcript request by ID
 * For My Future Capacity to check request status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    // Authenticate API request
    const providedApiKey = request.headers.get('x-api-key');
    const expectedApiKey = process.env.MFC_API_KEY;
    
    if (!expectedApiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Service configuration error',
          code: 'CONFIG_ERROR'
        },
        { status: 500 }
      );
    }

    if (!providedApiKey || providedApiKey !== expectedApiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid API key',
          code: 'INVALID_API_KEY'
        },
        { status: 401 }
      );
    }

    const { requestId } = params;

    if (!requestId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request ID is required',
          code: 'MISSING_REQUEST_ID'
        },
        { status: 400 }
      );
    }

    // Fetch request from database
    const request_data = await db
      .select({
        id: transcriptRequests.id,
        status: transcriptRequests.status,
        statusMessage: transcriptRequests.statusMessage,
        studentFirstName: transcriptRequests.studentFirstName,
        studentLastName: transcriptRequests.studentLastName,
        destinationSchool: transcriptRequests.destinationSchool,
        documentType: transcriptRequests.documentType,
        createdAt: transcriptRequests.createdAt,
        updatedAt: transcriptRequests.updatedAt,
        requestTrackingId: transcriptRequests.requestTrackingId,
        parchmentDocumentId: transcriptRequests.parchmentDocumentId,
      })
      .from(transcriptRequests)
      .where(eq(transcriptRequests.id, requestId))
      .limit(1);

    if (request_data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Transcript request not found',
          code: 'REQUEST_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const record = request_data[0];

    return NextResponse.json({
      success: true,
      request: {
        id: record.id,
        trackingId: record.requestTrackingId,
        status: record.status,
        statusMessage: record.statusMessage || null,
        student: {
          firstName: record.studentFirstName,
          lastName: record.studentLastName,
        },
        destinationSchool: record.destinationSchool,
        documentType: record.documentType,
        submittedAt: new Date(record.createdAt * 1000).toISOString(),
        lastUpdated: new Date(record.updatedAt * 1000).toISOString(),
        parchmentDocumentId: record.parchmentDocumentId || null,
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
