import { Resend } from 'resend';

// Initialize Resend only if API key is available (prevents build errors)
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface TranscriptRequestEmailData {
  studentName: string;
  studentEmail: string;
  requestId: string;
  schoolName: string;
  destinationSchool: string;
  documentType: string;
  submittedDate: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
}

/**
 * Send confirmation email to student with PDF attachment
 */
export async function sendTranscriptRequestConfirmation(
  data: TranscriptRequestEmailData,
  pdfBuffer: Buffer
): Promise<{ success: boolean; error?: string }> {
  console.log('📧 Email service called with:', {
    studentEmail: data.studentEmail,
    requestId: data.requestId,
    pdfSize: pdfBuffer?.length,
    resendConfigured: !!resend,
    apiKeyPresent: !!process.env.RESEND_API_KEY
  });

  try {
    // Check if Resend is configured
    if (!resend) {
      console.warn('❌ RESEND_API_KEY not configured - skipping email');
      return { success: false, error: 'Email service not configured' };
    }

    console.log('✅ Resend client initialized');

    const html = generateConfirmationEmailHTML(data);
    console.log('✅ Email HTML generated');

    // Use Resend sandbox for testing until domain is verified
    // Set USE_SANDBOX_EMAIL=false in production env vars once domain is verified
    const useSandbox = process.env.USE_SANDBOX_EMAIL !== 'false';
    const fromEmail = useSandbox
      ? 'onboarding@resend.dev'
      : 'My Future Capacity <transcripts@myfuturecapacity.com>';

    console.log('📤 Sending email via Resend:', {
      from: fromEmail,
      to: data.studentEmail,
      subject: `Transcript Request Confirmation - ${data.requestId}`,
      useSandbox,
      attachmentSize: pdfBuffer.length
    });

    const result = await resend.emails.send({
      from: fromEmail,
      to: data.studentEmail,
      subject: `Transcript Request Confirmation - ${data.requestId}`,
      html: html,
      attachments: [
        {
          filename: `transcript-request-${data.requestId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    console.log('📬 Resend API response:', result);

    if (result.error) {
      console.error('❌ Resend API error:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log('✅ Email sent successfully! ID:', result.data?.id);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Email service error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send notification to school registrar (optional)
 */
export async function sendSchoolNotification(
  schoolEmail: string,
  data: TranscriptRequestEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if Resend is configured
    if (!resend) {
      console.warn('RESEND_API_KEY not configured - skipping school notification');
      return { success: false, error: 'Email service not configured' };
    }

    const html = generateSchoolNotificationHTML(data);

    // Use Resend sandbox for testing until domain is verified
    const useSandbox = process.env.USE_SANDBOX_EMAIL !== 'false';
    const fromEmail = useSandbox
      ? 'onboarding@resend.dev'
      : 'My Future Capacity <transcripts@myfuturecapacity.com>';

    const result = await resend.emails.send({
      from: fromEmail,
      to: schoolEmail,
      subject: `New Transcript Request - ${data.studentName}`,
      html: html,
    });

    if (result.error) {
      console.error('Resend API error:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('School notification error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate HTML for student confirmation email
 */
function generateConfirmationEmailHTML(data: TranscriptRequestEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transcript Request Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh;">
    <tr>
      <td style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">
                ✓ Request Confirmed
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                My Future Capacity
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                Hi <strong>${data.studentName}</strong>,
              </p>

              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                Your transcript request has been successfully submitted and is being processed. Below are the details of your request:
              </p>

              <!-- Request Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f9ff; border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #5B5FF5; font-weight: bold;">
                      Request Details
                    </h2>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666;">Request ID:</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333; font-weight: 600; text-align: right;">${data.requestId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666;">From:</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333; font-weight: 600; text-align: right;">${data.schoolName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666;">To:</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333; font-weight: 600; text-align: right;">${data.destinationSchool}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666;">Document Type:</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333; font-weight: 600; text-align: right;">${data.documentType}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; font-size: 14px; color: #666;">Submitted:</td>
                        <td style="padding: 8px 0; font-size: 14px; color: #333; font-weight: 600; text-align: right;">${data.submittedDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What's Next Section -->
              <div style="background: #fff9e6; border-left: 4px solid #ffc107; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #333; font-weight: bold;">
                  📋 What Happens Next?
                </h3>
                <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #666; line-height: 1.8;">
                  <li><strong>Processing:</strong> Your request is being verified (1-3 business days)</li>
                  <li><strong>Delivery:</strong> Transcript sent electronically via Parchment network</li>
                  <li><strong>Confirmation:</strong> Receiving institution will be notified</li>
                </ol>
              </div>

              <!-- PDF Attachment Notice -->
              <div style="background: #e8f4fd; border-left: 4px solid #2196F3; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333; font-weight: bold;">
                  📄 Your Request Summary
                </h3>
                <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">
                  A PDF copy of your request is attached to this email for your records. Keep this for reference.
                </p>
              </div>

              <!-- Important Notes -->
              <div style="margin: 30px 0;">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #333; font-weight: bold;">
                  ⚠️ Important Information
                </h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #666; line-height: 1.8;">
                  <li>Processing typically takes 1-3 business days</li>
                  <li>The receiving institution will be notified when your transcript arrives</li>
                  <li>Contact your school's registrar if you need to follow up</li>
                  <li>Keep this email and the attached PDF for your records</li>
                </ul>
              </div>

              <!-- Support -->
              <p style="margin: 30px 0 0 0; font-size: 14px; color: #666; line-height: 1.6; text-align: center; padding-top: 30px; border-top: 1px solid #eee;">
                Questions? Contact your school's guidance office or visit 
                <a href="https://myfuturecapacity.org" style="color: #5B5FF5; text-decoration: none; font-weight: 600;">My Future Capacity</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 16px 16px; border-top: 1px solid #eee;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
                <strong>My Future Capacity</strong>
              </p>
              <p style="margin: 0; font-size: 12px; color: #999;">
                Empowering students to achieve their educational goals
              </p>
              <p style="margin: 16px 0 0 0; font-size: 12px; color: #999;">
                © ${new Date().getFullYear()} My Future Capacity. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML for school notification email
 */
function generateSchoolNotificationHTML(data: TranscriptRequestEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Transcript Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: #5B5FF5; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: white; font-size: 24px; font-weight: bold;">
                New Transcript Request
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                My Future Capacity
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #333;">
                A new transcript request has been submitted through My Future Capacity:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f9fa; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #666;">Request ID:</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #333; font-weight: 600; text-align: right;">${data.requestId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #666;">Student:</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #333; font-weight: 600; text-align: right;">${data.studentName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #666;">Destination:</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #333; font-weight: 600; text-align: right;">${data.destinationSchool}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #666;">Document Type:</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #333; font-weight: 600; text-align: right;">${data.documentType}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #666;">Submitted:</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #333; font-weight: 600; text-align: right;">${data.submittedDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; font-size: 13px; color: #666;">
                This request will be processed and transmitted electronically through the Parchment network.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                My Future Capacity - Transcript Request Service
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return false;
  }

  try {
    // Resend automatically validates the API key on first use
    console.log('Resend API key configured');
    return true;
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return false;
  }
}
