import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transcriptRequests } from '@/db/schema';
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
    // Validate API key
    const apiKey = request.headers.get('x-api-key');
    const expectedApiKey = process.env.MFC_API_KEY;
    
    if (!expectedApiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    const requestId = params.requestId;
    
    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID required' },
        { status: 400 }
      );
    }

    // Get request from database
    const request_data = await db
      .select({
        id: transcriptRequests.id,
        status: transcriptRequests.status,
        statusMessage: transcriptRequests.statusMessage,
        parchmentDocumentId: transcriptRequests.parchmentDocumentId,
        requestTrackingId: transcriptRequests.requestTrackingId,
        studentFirstName: transcriptRequests.studentFirstName,
        studentLastName: transcriptRequests.studentLastName,
        studentEmail: transcriptRequests.studentEmail,
        destinationSchool: transcriptRequests.destinationSchool,
        destinationCeeb: transcriptRequests.destinationCeeb,
        documentType: transcriptRequests.documentType,
        createdAt: transcriptRequests.createdAt,
        updatedAt: transcriptRequests.updatedAt,
      })
      .from(transcriptRequests)
      .where(eq(transcriptRequests.id, requestId))
      .limit(1);

    if (request_data.length === 0) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    const request = request_data[0];

    return NextResponse.json({
      requestId: request.id,
      status: request.status,
      statusMessage: request.statusMessage,
      student: {
        firstName: request.studentFirstName,
        lastName: request.studentLastName,
        email: request.studentEmail,
      },
      destination: {
        school: request.destinationSchool,
        ceeb: request.destinationCeeb,
      },
      document: {
        type: request.documentType,
        parchmentId: request.parchmentDocumentId,
      },
      tracking: {
        mfcRequestId: request.requestTrackingId,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      },
      statusHistory: [
        {
          status: 'submitted',
          timestamp: request.createdAt,
          message: 'Request received and validated'
        },
        {
          status: request.status,
          timestamp: request.updatedAt,
          message: request.statusMessage || `Request is ${request.status}`
        }
      ]
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}