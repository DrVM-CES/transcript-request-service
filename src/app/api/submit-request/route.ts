import { readBoundedJson, RequestBodyError } from '../../../lib/request-body';
import { getDeliveryPolicy, publicSubmissionsEnabled } from '../../../lib/delivery-policy';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { transcriptRequestSchema } from '../../../lib/validation';
import { generateTranscriptRequestXML } from '../../../lib/pesc-xml-generator';
import { uploadTranscriptXML } from '../../../lib/sftp-client';
import { generateTranscriptRequestPDF } from '../../../lib/pdf-generator-professional';
import { sendTranscriptRequestConfirmation, sendSchoolNotification } from '../../../lib/email-service';
import { db } from '../../../db';
import { transcriptRequests } from '../../../db/schema';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!publicSubmissionsEnabled(process.env)) {
    return NextResponse.json({ error: 'Public transcript requests are not available yet. Please contact your school or MFC administrator.' }, { status: 503 });
  }
  try {
    const body = await readBoundedJson(request);


    // Validate the request data
    const validatedData = transcriptRequestSchema.parse(body);


    // Generate the PESC XML
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

    // Get client IP and user agent for audit trail
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const requestId = uuidv4();
    const now = new Date();


    // Store the request in the database
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
      ferpaDisclosureShown: validatedData.ferpaDisclosureRead,
      mfcLiabilityAgreed: validatedData.mfcLiabilityRead,
      studentSignature: validatedData.studentSignature,
      signatureDate: validatedData.signatureDate,
      requestXml: xml,
      parchmentDocumentId: documentId,
      status: 'submitted',
      createdAt: now,
      updatedAt: now,
      ipAddress: clientIP,
      userAgent: userAgent,
    });

    // Generate PDF for email attachment

    let pdfBuffer: Buffer | null = null;
    try {
      const pdfData = {
        ...validatedData,
        requestTrackingId: requestId
      };
      pdfBuffer = await generateTranscriptRequestPDF(pdfData);

    } catch (pdfError) {
      console.error('PDF_GENERATION_FAILED');
      // Continue without PDF - don't block submission
    }

    // Send confirmation email to student

    if (pdfBuffer) {

      const emailData = {
        studentName: `${validatedData.studentFirstName} ${validatedData.studentLastName}`,
        studentEmail: validatedData.studentEmail,
        requestId: requestId,
        schoolName: validatedData.schoolName,
        destinationSchool: validatedData.destinationSchool,
        documentType: validatedData.documentType,
        submittedDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };


      const emailResult = await sendTranscriptRequestConfirmation(emailData, pdfBuffer);


      if (!emailResult.success) {
        console.error('EMAIL_DELIVERY_FAILED');
        // Continue - don't block submission if email fails
      }

      // Optionally send notification to school registrar
      if (validatedData.schoolEmail) {

        await sendSchoolNotification(validatedData.schoolEmail, emailData);
      }
    } else {
      console.warn('EMAIL_DELIVERY_FAILED');
    }

    // Upload XML to Parchment SFTP
    const uploadResult = await uploadTranscriptXML(xml, fileName);

    if (uploadResult.success) {


      // Update status to processing
      await db.update(transcriptRequests)
        .set({
          status: 'processing',
          statusMessage: `XML uploaded to ${uploadResult.path}`,
          updatedAt: new Date()
        })
        .where(eq(transcriptRequests.id, requestId));
    } else {
      console.error('SFTP_UPLOAD_FAILED');

      // Update status to pending - manual review needed
      // Preserve the saved request for manual processing; delivery has not occurred.
      await db.update(transcriptRequests)
        .set({
          status: 'pending',
          statusMessage: `Awaiting manual processing - SFTP: ${uploadResult.error}`,
          updatedAt: new Date()
        })
        .where(eq(transcriptRequests.id, requestId));

      // Continue with success response - request is saved and can be processed manually
    }

    return NextResponse.json({
      success: true,
      requestId,
      documentId,
      status: uploadResult.success ? 'processing' : 'pending',
      message: uploadResult.success
        ? 'Transcript request submitted for processing.'
        : 'Your request was saved and is awaiting processing. It has not been sent to the transcript provider.'
    });

  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('TRANSCRIPT_PROCESSING_FAILED');

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit transcript request' },
      { status: 500 }
    );
  }
}
