/**
 * Test script for email delivery
 * 
 * Usage:
 * 1. Install resend: npm install resend
 * 2. Get API key from https://resend.com
 * 3. Run: RESEND_API_KEY=re_your_key node scripts/test-email.js your-email@example.com
 */

const { Resend } = require('resend');

const apiKey = process.env.RESEND_API_KEY;
const testEmail = process.argv[2];

if (!apiKey) {
  console.error('❌ RESEND_API_KEY environment variable not set');
  console.log('\nUsage:');
  console.log('  RESEND_API_KEY=re_your_key node scripts/test-email.js your-email@example.com');
  process.exit(1);
}

if (!testEmail) {
  console.error('❌ No email address provided');
  console.log('\nUsage:');
  console.log('  RESEND_API_KEY=re_your_key node scripts/test-email.js your-email@example.com');
  process.exit(1);
}

const resend = new Resend(apiKey);

async function testEmailDelivery() {
  console.log('🚀 Testing email delivery...\n');
  console.log(`API Key: ${apiKey.substring(0, 10)}...`);
  console.log(`To: ${testEmail}\n`);

  try {
    const result = await resend.emails.send({
      from: 'My Future Capacity <onboarding@resend.dev>',
      to: testEmail,
      subject: 'Test Email - MFC Transcript Service',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; }
            h1 { color: #5B5FF5; margin: 0 0 20px 0; }
            p { color: #333; line-height: 1.6; }
            .success { background: #e8f4fd; border-left: 4px solid #2196F3; padding: 16px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✓ Email Test Successful!</h1>
            <p>This is a test email from the <strong>My Future Capacity Transcript Request Service</strong>.</p>
            
            <div class="success">
              <strong>✅ What this confirms:</strong>
              <ul>
                <li>Resend API key is valid</li>
                <li>Email delivery is working</li>
                <li>HTML formatting is correct</li>
                <li>MFC branding displays properly</li>
              </ul>
            </div>

            <p><strong>Test Details:</strong></p>
            <ul>
              <li>From: onboarding@resend.dev</li>
              <li>To: ${testEmail}</li>
              <li>Time: ${new Date().toLocaleString()}</li>
            </ul>

            <p>If you received this email, your email configuration is working correctly!</p>

            <div class="footer">
              <p>My Future Capacity - Transcript Request Service</p>
              <p>Test Email - ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (result.error) {
      console.error('❌ Email send failed:', result.error);
      process.exit(1);
    }

    console.log('✅ Email sent successfully!\n');
    console.log('Details:');
    console.log(`  Email ID: ${result.data.id}`);
    console.log(`  To: ${testEmail}`);
    console.log('\n📬 Check your inbox (may take a few seconds)');
    console.log('   Don\'t forget to check spam folder if not in inbox!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nPossible issues:');
    console.error('  - Invalid API key');
    console.error('  - Network connection problem');
    console.error('  - Invalid recipient email address');
    console.error('  - Rate limit exceeded\n');
    process.exit(1);
  }
}

testEmailDelivery();
