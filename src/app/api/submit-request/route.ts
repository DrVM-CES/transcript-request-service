import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { eq } from 'drizzle-orm';
import { transcriptRequestSchema } from '../../../lib/validation';
import { generateTranscriptRequestXML } from '../../../lib/pesc-xml-generator';
import { uploadTranscriptXML } from '../../../lib/sftp-client';
import { generateTranscriptRequestPDF } from '../../../lib/pdf-generator-compact';
import { sendTranscriptRequestConfirmation, sendSchoolNotification } from '../../../lib/email-service';
import { db } from '../../../db';
import { transcriptRequests } from '../../../db/schema';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  console.log('🚀 API ROUTE CALLED: /api/submit-request');
  try {
    const body = await request.json();
    console.log('📥 Request body received');
    
    // Validate the request data
    const validatedData = transcriptRequestSchema.parse(body);
    console.log('✅ Validation passed');
    
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
    console.log('💾 About to store in database, requestId:', requestId);

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
    console.log('Starting PDF generation...');
    let pdfBuffer: Buffer | null = null;
    try {
      const pdfData = {
        ...validatedData,
        requestTrackingId: requestId
      };
      pdfBuffer = await generateTranscriptRequestPDF(pdfData);
      console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');
    } catch (pdfError) {
      console.error('❌ PDF generation failed:', pdfError);
      // Continue without PDF - don't block submission
    }

    // Send confirmation email to student
    console.log('Checking if we have PDF buffer:', pdfBuffer ? 'YES' : 'NO');
    if (pdfBuffer) {
      console.log('Starting email sending process...');
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

      console.log('Calling sendTranscriptRequestConfirmation with data:', {
        studentEmail: emailData.studentEmail,
        requestId: emailData.requestId,
        pdfSize: pdfBuffer.length
      });
      const emailResult = await sendTranscriptRequestConfirmation(emailData, pdfBuffer);
      
      console.log('Email result:', emailResult);
      if (emailResult.success) {
        console.log('✅ Confirmation email sent to:', validatedData.studentEmail);
      } else {
        console.error('❌ Email send failed:', emailResult.error);
        // Continue - don't block submission if email fails
      }

      // Optionally send notification to school registrar
      if (validatedData.schoolEmail) {
        console.log('Sending notification to school:', validatedData.schoolEmail);
        await sendSchoolNotification(validatedData.schoolEmail, emailData);
      }
    } else {
      console.warn('⚠️ No PDF buffer - skipping email sending');
    }

    // Upload XML to Parchment SFTP
    const uploadResult = await uploadTranscriptXML(xml, fileName);
    
    if (uploadResult.success) {
      console.log('Successfully uploaded XML to SFTP:', uploadResult.path);
      
      // Update status to processing
      await db.update(transcriptRequests)
        .set({ 
          status: 'processing',
          statusMessage: `XML uploaded to ${uploadResult.path}`,
          updatedAt: new Date()
        })
        .where(eq(transcriptRequests.id, requestId));
    } else {
      console.error('SFTP upload failed:', uploadResult.error);
      
      // Update status to failed
      await db.update(transcriptRequests)
        .set({ 
          status: 'failed',
          statusMessage: `SFTP upload failed: ${uploadResult.error}`,
          updatedAt: new Date()
        })
        .where(eq(transcriptRequests.id, requestId));
        
      return NextResponse.json(
        { error: 'Failed to upload transcript request to processing system' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requestId,
      documentId,
      message: 'Transcript request submitted successfully. Check your email for confirmation.'
    });

  } catch (error) {
    console.error('Submit request error:', error);
    
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
