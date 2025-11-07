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
    const requestData = await db
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

    if (requestData.length === 0) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    const requestRecord = requestData[0];

    return NextResponse.json({
      requestId: requestRecord.id,
      status: requestRecord.status,
      statusMessage: requestRecord.statusMessage,
      student: {
        firstName: requestRecord.studentFirstName,
        lastName: requestRecord.studentLastName,
        email: requestRecord.studentEmail,
      },
      destination: {
        school: requestRecord.destinationSchool,
        ceeb: requestRecord.destinationCeeb,
      },
      document: {
        type: requestRecord.documentType,
        parchmentId: requestRecord.parchmentDocumentId,
      },
      tracking: {
        mfcRequestId: requestRecord.requestTrackingId,
        createdAt: requestRecord.createdAt,
        updatedAt: requestRecord.updatedAt,
      },
      statusHistory: [
        {
          status: 'submitted',
          timestamp: requestRecord.createdAt,
          message: 'Request received and validated'
        },
        {
          status: requestRecord.status,
          timestamp: requestRecord.updatedAt,
          message: requestRecord.statusMessage || `Request is ${requestRecord.status}`
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