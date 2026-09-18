import { emailRecipient, escapeHtml, getDeliveryPolicy } from './delivery-policy';
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
  const recipient = emailRecipient(process.env, data.studentEmail);
  if (!recipient) return { success: false, error: 'EMAIL_DELIVERY_DISABLED' };


  try {
    // Check if Resend is configured
    if (!resend) {
      console.warn('EMAIL_DELIVERY_UNAVAILABLE');
      return { success: false, error: 'Email service not configured' };
    }



    const html = generateConfirmationEmailHTML(data);


    // Use verified domain for production, sandbox for testing
    const useSandbox = getDeliveryPolicy(process.env).mode === 'staging';
    const fromEmail = useSandbox
      ? 'onboarding@resend.dev'
      : 'My Future Capacity <transcripts@myfuturecapacity.com>';



    const result = await resend.emails.send({
      from: fromEmail,
      to: recipient,
      subject: `Transcript Request Confirmation - ${data.requestId}`,
      html: html,
      attachments: [
        {
          filename: `transcript-request-${data.requestId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });



    if (result.error) {
      console.error('EMAIL_DELIVERY_FAILED');
      return { success: false, error: 'EMAIL_DELIVERY_FAILED' };
    }


    return { success: true };
  } catch (error: any) {
    console.error('EMAIL_DELIVERY_FAILED');
    return { success: false, error: 'EMAIL_DELIVERY_FAILED' };
  }
}

/**
 * Send notification to school registrar (optional)
 */
export async function sendSchoolNotification(
  schoolEmail: string,
  data: TranscriptRequestEmailData
): Promise<{ success: boolean; error?: string }> {
  const recipient = emailRecipient(process.env, schoolEmail);
  if (!recipient) return { success: false, error: 'EMAIL_DELIVERY_DISABLED' };
  try {
    // Check if Resend is configured
    if (!resend) {
      console.warn('EMAIL_DELIVERY_UNAVAILABLE');
      return { success: false, error: 'Email service not configured' };
    }

    const html = generateSchoolNotificationHTML(data);

    // Use Resend sandbox for testing until domain is verified
    const useSandbox = getDeliveryPolicy(process.env).mode === 'staging';
    const fromEmail = useSandbox
      ? 'onboarding@resend.dev'
      : 'My Future Capacity <transcripts@myfuturecapacity.com>';

    const result = await resend.emails.send({
      from: fromEmail,
      to: recipient,
      subject: `New Transcript Request - ${data.studentName.replace(/[\r\n]/g, " ")}`,
      html: html,
    });

    if (result.error) {
      console.error('EMAIL_DELIVERY_FAILED');
      return { success: false, error: 'EMAIL_DELIVERY_FAILED' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('EMAIL_DELIVERY_FAILED');
    return { success: false, error: 'EMAIL_DELIVERY_FAILED' };
  }
}

/**
 * Generate HTML for student confirmation email
 */
function generateConfirmationEmailHTML(rawData: TranscriptRequestEmailData): string {
  const data = escapeEmailData(rawData);
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
            <td style="background: linear-gradient(135deg, #5B5FF5 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 16px 16px 0 0;">
              <!-- Logo -->
              <div style="margin-bottom: 20px;">
                <img src="https://frolicking-horse-f44773.netlify.app/mfc-logo.png" alt="My Future Capacity" style="width: 200px; height: auto; margin: 0 auto 20px auto; display: block;">
                <h1 style="margin: 0; color: white; font-size: 32px; font-weight: bold; letter-spacing: -0.5px;">
                  MY FUTURE CAPACITY
                </h1>
                <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.95); font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                  Pathways to Success
                </p>
              </div>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid rgba(255,255,255,0.3);">
                <h2 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">
                  ✓ Transcript Request Received
                </h2>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                Hi <strong>${data.studentName}</strong>,
              </p>

              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
                Your transcript request has been saved and is awaiting processing. This receipt does not confirm submission to a transcript provider or transcript delivery. Below are the details of your request:
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
                  <li><strong>Processing:</strong> Your request is awaiting processing; manual follow-up may be needed</li>
                  <li><strong>Delivery:</strong> The delivery method and timing must be confirmed separately</li>
                  <li><strong>Confirmation:</strong> Contact the receiving institution to confirm receipt</li>
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
                  <li>Processing time has not been confirmed</li>
                  <li>This email confirms request receipt only, not transcript delivery</li>
                  <li>Contact your school's registrar if you need to follow up</li>
                  <li>Keep this email and the attached PDF for your records</li>
                </ul>
              </div>

              <!-- Support -->
              <p style="margin: 30px 0 0 0; font-size: 14px; color: #666; line-height: 1.6; text-align: center; padding-top: 30px; border-top: 1px solid #eee;">
                Questions? Contact your school's guidance office or visit
                <a href="https://myfuturecapacity.com" style="color: #5B5FF5; text-decoration: none; font-weight: 600;">My Future Capacity</a>
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
function generateSchoolNotificationHTML(rawData: TranscriptRequestEmailData): string {
  const data = escapeEmailData(rawData);
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
                This notification records a request only. Please verify authorization and processing requirements before taking action. It does not confirm transmission to a provider or transcript delivery.
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
    console.error('EMAIL_DELIVERY_UNAVAILABLE');
    return false;
  }

  try {
    // Resend automatically validates the API key on first use

    return true;
  } catch (error) {
    console.error('EMAIL_DELIVERY_FAILED');
    return false;
  }
}

function escapeEmailData(data: TranscriptRequestEmailData): TranscriptRequestEmailData {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, escapeHtml(value)])) as unknown as TranscriptRequestEmailData;
}
