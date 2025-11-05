import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { generateTranscriptRequestXML } from '@/lib/pesc-xml-generator';
import { uploadTranscriptXML } from '@/lib/sftp-client';
import { db } from '@/db';
import { transcriptRequests } from '@/db/schema';

export const runtime = 'nodejs';

// API schema for external applications (My Future Capacity)
const externalSubmissionSchema = z.object({
  // Authentication
  apiKey: z.string().min(1, 'API key required'),
  
  // Student Information (pre-populated from MFC)
  studentFirstName: z.string().min(1, 'First name required'),
  studentLastName: z.string().min(1, 'Last name required'),
  studentMiddleName: z.string().optional(),
  studentEmail: z.string().email('Valid email required'),
  studentDob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  studentPartialSsn: z.string().optional(),
  
  // Source School Information (pre-populated from MFC)
  schoolName: z.string().min(1, 'School name required'),
  schoolCeeb: z.string().optional(),
  schoolAddress: z.string().optional(),
  schoolCity: z.string().optional(),
  schoolState: z.string().optional(),
  schoolZip: z.string().optional(),
  schoolPhone: z.string().optional(),
  schoolEmail: z.string().optional(),
  
  // Student Attendance (pre-populated from MFC)
  enrollDate: z.string().optional(),
  exitDate: z.string().optional(),
  currentEnrollment: z.boolean().default(false),
  graduationDate: z.string().optional(),
  
  // Destination Information (user selected in MFC)
  destinationSchool: z.string().min(1, 'Destination school required'),
  destinationCeeb: z.string().min(1, 'Destination CEEB code required'),
  destinationAddress: z.string().optional(),
  destinationCity: z.string().optional(),
  destinationState: z.string().optional(),
  destinationZip: z.string().optional(),
  
  // Request Settings
  documentType: z.string().default('Transcript - Final'),
  
  // Consent (handled in MFC interface)
  consentGiven: z.boolean().refine(val => val === true, 'Consent required'),
  ferpaDisclosureShown: z.boolean().refine(val => val === true, 'FERPA disclosure required'),
  
  // Callback for status updates
  callbackUrl: z.string().url().optional(),
  
  // Reference data
  mfcUserId: z.string().optional(),
  mfcRequestId: z.string().optional(),
});

/**
 * External API endpoint for My Future Capacity application
 * Allows MFC to submit transcript requests programmatically
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate API key
    const expectedApiKey = process.env.MFC_API_KEY;
    if (!expectedApiKey || body.apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    // Validate request data
    const validatedData = externalSubmissionSchema.parse(body);
    
    // Generate PESC XML
    const { xml, documentId, fileName } = generateTranscriptRequestXML({
      studentFirstName: validatedData.studentFirstName,
      studentLastName: validatedData.studentLastName,
      studentMiddleName: validatedData.studentMiddleName,
      studentEmail: validatedData.studentEmail,
      studentDob: validatedData.studentDob,
      studentPartialSsn: validatedData.studentPartialSsn,
      schoolName: validatedData.schoolName,
      schoolCeeb: validatedData.schoolCeeb,
      schoolAddress: validatedData.schoolAddress,
      schoolCity: validatedData.schoolCity,
      schoolState: validatedData.schoolState,
      schoolZip: validatedData.schoolZip,
      schoolPhone: validatedData.schoolPhone,
      schoolEmail: validatedData.schoolEmail,
      enrollDate: validatedData.enrollDate,
      exitDate: validatedData.exitDate,
      currentEnrollment: validatedData.currentEnrollment,
      graduationDate: validatedData.graduationDate,
      destinationSchool: validatedData.destinationSchool,
      destinationCeeb: validatedData.destinationCeeb,
      destinationAddress: validatedData.destinationAddress,
      destinationCity: validatedData.destinationCity,
      destinationState: validatedData.destinationState,
      destinationZip: validatedData.destinationZip,
      documentType: validatedData.documentType,
    });

    const requestId = uuidv4();
    const now = new Date();
    
    // Get client information
    const clientIP = request.headers.get('x-forwarded-for') || 'api-request';
    const userAgent = request.headers.get('user-agent') || 'external-api';

    // Store request in database
    await db.insert(transcriptRequests).values({
      id: requestId,
      studentFirstName: validatedData.studentFirstName,
      studentLastName: validatedData.studentLastName,
      studentMiddleName: validatedData.studentMiddleName,
      studentEmail: validatedData.studentEmail,
      studentDob: validatedData.studentDob,
      studentPartialSsn: validatedData.studentPartialSsn,
      schoolName: validatedData.schoolName,
      schoolCeeb: validatedData.schoolCeeb,
      schoolAddress: validatedData.schoolAddress,
      schoolCity: validatedData.schoolCity,
      schoolState: validatedData.schoolState,
      schoolZip: validatedData.schoolZip,
      schoolPhone: validatedData.schoolPhone,
      schoolEmail: validatedData.schoolEmail,
      enrollDate: validatedData.enrollDate,
      exitDate: validatedData.exitDate,
      currentEnrollment: validatedData.currentEnrollment,
      graduationDate: validatedData.graduationDate,
      destinationSchool: validatedData.destinationSchool,
      destinationCeeb: validatedData.destinationCeeb,
      destinationAddress: validatedData.destinationAddress,
      destinationCity: validatedData.destinationCity,
      destinationState: validatedData.destinationState,
      destinationZip: validatedData.destinationZip,
      documentType: validatedData.documentType,
      consentGiven: validatedData.consentGiven,
      consentTimestamp: now,
      ferpaDisclosureShown: validatedData.ferpaDisclosureShown,
      requestXml: xml,
      parchmentDocumentId: documentId,
      status: 'submitted',
      createdAt: now,
      updatedAt: now,
      ipAddress: clientIP,
      userAgent: userAgent,
      requestTrackingId: validatedData.mfcRequestId,
    });

    // Upload to Parchment SFTP
    const uploadResult = await uploadTranscriptXML(xml, fileName);
    
    let finalStatus = 'processing';
    let statusMessage = `XML uploaded to ${uploadResult.path}`;
    
    if (!uploadResult.success) {
      finalStatus = 'failed';
      statusMessage = `SFTP upload failed: ${uploadResult.error}`;
    }
    
    // Update status
    await db.update(transcriptRequests)
      .set({ 
        status: finalStatus,
        statusMessage: statusMessage,
        updatedAt: new Date()
      })
      .where({ id: requestId });

    // If callback URL provided, notify MFC (implement webhook later)
    if (validatedData.callbackUrl && uploadResult.success) {
      // TODO: Implement webhook notification to MFC
      console.log(`Would notify MFC at: ${validatedData.callbackUrl}`);
    }

    if (!uploadResult.success) {
      return NextResponse.json(
        { 
          error: 'Failed to process transcript request',
          requestId,
          details: uploadResult.error 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requestId,
      documentId,
      status: finalStatus,
      message: 'Transcript request submitted successfully',
      trackingInfo: {
        parchmentDocumentId: documentId,
        fileName: fileName,
        uploadPath: uploadResult.path
      }
    });

  } catch (error) {
    console.error('External API submission error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}