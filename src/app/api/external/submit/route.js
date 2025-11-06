import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { generateTranscriptRequestXML } from '../../../../lib/pesc-xml-generator';
import { uploadTranscriptXML } from '../../../../lib/sftp-client';
import { db } from '../../../../db';
import { transcriptRequests } from '../../../../db/schema';

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
  studentDob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  studentPartialSsn: z.string().optional(),

  // School Information (pre-populated from MFC)
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
  currentEnrollment: z.boolean().default(true),
  graduationDate: z.string().optional(),

  // Destination Institution
  destinationSchool: z.string().min(1, 'Destination school required'),
  destinationCeeb: z.string().min(1, 'Destination CEEB code required'),
  destinationAddress: z.string().optional(),
  destinationCity: z.string().optional(),
  destinationState: z.string().optional(),
  destinationZip: z.string().optional(),

  // Document type
  documentType: z.string().default('Transcript - Final'),

  // Consent and authorization
  consentGiven: z.boolean().refine(val => val === true, 'Consent must be given'),
  ferpaDisclosureShown: z.boolean().refine(val => val === true, 'FERPA disclosure must be acknowledged'),
});

/**
 * Submit transcript request from external application (My Future Capacity)
 */
export async function POST(request) {
  try {
    // Get client info for audit trail
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Parse and validate request body
    const body = await request.json();
    
    // Authenticate API request
    const providedApiKey = body.apiKey || request.headers.get('x-api-key');
    const expectedApiKey = process.env.MFC_API_KEY;
    
    if (!expectedApiKey) {
      console.error('MFC_API_KEY not configured');
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
      console.warn(`Invalid API key attempt from ${clientIp}`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid API key',
          code: 'INVALID_API_KEY'
        },
        { status: 401 }
      );
    }

    // Validate request data
    const validationResult = externalSubmissionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const requestId = uuidv4();
    const timestamp = new Date();

    // Generate PESC-compliant XML
    const xmlContent = generateTranscriptRequestXML({
      requestId,
      student: {
        firstName: data.studentFirstName,
        lastName: data.studentLastName,
        middleName: data.studentMiddleName,
        email: data.studentEmail,
        dateOfBirth: data.studentDob,
        partialSSN: data.studentPartialSsn,
      },
      sourceInstitution: {
        name: data.schoolName,
        ceebCode: data.schoolCeeb,
        address: data.schoolAddress,
        city: data.schoolCity,
        state: data.schoolState,
        zip: data.schoolZip,
        phone: data.schoolPhone,
        email: data.schoolEmail,
      },
      destinationInstitution: {
        name: data.destinationSchool,
        ceebCode: data.destinationCeeb,
        address: data.destinationAddress,
        city: data.destinationCity,
        state: data.destinationState,
        zip: data.destinationZip,
      },
      studentAttendance: {
        enrollDate: data.enrollDate,
        exitDate: data.exitDate,
        currentEnrollment: data.currentEnrollment,
        graduationDate: data.graduationDate,
      },
      documentType: data.documentType,
      requestDate: timestamp.toISOString(),
    });

    // Store request in database
    const dbRecord = {
      id: requestId,
      studentFirstName: data.studentFirstName,
      studentLastName: data.studentLastName,
      studentMiddleName: data.studentMiddleName,
      studentEmail: data.studentEmail,
      studentDob: data.studentDob,
      studentPartialSsn: data.studentPartialSsn,
      
      schoolName: data.schoolName,
      schoolCeeb: data.schoolCeeb,
      schoolAddress: data.schoolAddress,
      schoolCity: data.schoolCity,
      schoolState: data.schoolState,
      schoolZip: data.schoolZip,
      schoolPhone: data.schoolPhone,
      schoolEmail: data.schoolEmail,
      
      enrollDate: data.enrollDate,
      exitDate: data.exitDate,
      currentEnrollment: data.currentEnrollment,
      graduationDate: data.graduationDate,
      
      destinationSchool: data.destinationSchool,
      destinationCeeb: data.destinationCeeb,
      destinationAddress: data.destinationAddress,
      destinationCity: data.destinationCity,
      destinationState: data.destinationState,
      destinationZip: data.destinationZip,
      
      documentType: data.documentType,
      requestTrackingId: requestId,
      
      consentGiven: data.consentGiven,
      consentTimestamp: Math.floor(timestamp.getTime() / 1000),
      ferpaDisclosureShown: data.ferpaDisclosureShown,
      releaseAuthorizedMethod: 'ElectronicSignature',
      
      requestXml: xmlContent,
      status: 'submitted',
      
      createdAt: Math.floor(timestamp.getTime() / 1000),
      updatedAt: Math.floor(timestamp.getTime() / 1000),
      ipAddress: clientIp,
      userAgent: userAgent,
    };

    await db.insert(transcriptRequests).values(dbRecord);

    // Upload to Parchment SFTP
    const filename = `PESC${timestamp.toISOString().replace(/[-:T]/g, '').substring(0, 8)}_${timestamp.toISOString().replace(/[-:T.]/g, '').substring(8, 14)}_${data.studentFirstName}_${data.studentLastName}`;
    
    const uploadResult = await uploadTranscriptXML(xmlContent, filename);
    
    if (!uploadResult.success) {
      // Update status to failed
      await db.update(transcriptRequests)
        .set({ 
          status: 'failed',
          statusMessage: `Upload failed: ${uploadResult.error}`,
          updatedAt: Math.floor(Date.now() / 1000)
        })
        .where({ id: requestId });

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to submit transcript request',
          code: 'UPLOAD_FAILED',
          requestId,
          details: uploadResult.error
        },
        { status: 500 }
      );
    }

    // Update status to processing
    await db.update(transcriptRequests)
      .set({ 
        status: 'processing',
        parchmentDocumentId: uploadResult.path,
        updatedAt: Math.floor(Date.now() / 1000)
      })
      .where({ id: requestId });

    // Success response
    return NextResponse.json({
      success: true,
      requestId,
      status: 'processing',
      message: 'Transcript request submitted successfully',
      submittedAt: timestamp.toISOString(),
      trackingId: requestId
    });

  } catch (error) {
    console.error('External transcript request error:', error);
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
