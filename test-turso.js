const { createClient } = require('@libsql/client');

async function testTurso() {
  console.log('Testing Turso database connection...\n');
  
  // Hardcode credentials for test
  const client = createClient({
    url: 'libsql://transcript-requests-prod-jamie32872.aws-us-west-2.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjI1NTM5OTQsImlkIjoiOTlmOWZiOGUtMWU4MC00OWEyLWIyN2QtNzRmODlmODJkYTk1IiwicmlkIjoiMWQ3YzBhZjctMTA5ZC00YTRhLTllOWUtNDk0MDdjNjkwNTcwIn0.UF705n8vc46rWPc0Igdcq7TFpZBwHXAmJtvYfNCGME-CQz5XF9KA-CFhI0gMkLpMXgou_98Tv3JQwgsx9RE3CA',
  });

  try {
    // Test basic connection
    console.log('1. Testing connection...');
    const result = await client.execute('SELECT 1 as test');
    console.log('✓ Connection successful');
    
    // Check if table exists
    console.log('\n2. Checking for transcript_requests table...');
    const tables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='transcript_requests'
    `);
    
    if (tables.rows.length > 0) {
      console.log('✓ Table transcript_requests exists');
      
      // Count records
      const count = await client.execute('SELECT COUNT(*) as count FROM transcript_requests');
      console.log(`✓ Table has ${count.rows[0].count} records`);
    } else {
      console.log('✗ Table transcript_requests does NOT exist');
      console.log('\nCreating table...');
      
      // Create the table
      await client.execute(`
        CREATE TABLE transcript_requests (
          id TEXT PRIMARY KEY,
          student_first_name TEXT NOT NULL,
          student_last_name TEXT NOT NULL,
          student_middle_name TEXT,
          student_email TEXT NOT NULL,
          student_dob TEXT NOT NULL,
          student_partial_ssn TEXT,
          school_name TEXT NOT NULL,
          school_ceeb TEXT,
          school_address TEXT,
          school_city TEXT,
          school_state TEXT,
          school_zip TEXT,
          school_phone TEXT,
          school_email TEXT,
          enroll_date TEXT,
          exit_date TEXT,
          current_enrollment INTEGER DEFAULT 1,
          graduation_date TEXT,
          destination_school TEXT NOT NULL,
          destination_ceeb TEXT NOT NULL,
          destination_address TEXT,
          destination_city TEXT,
          destination_state TEXT,
          destination_zip TEXT,
          document_type TEXT NOT NULL DEFAULT 'Transcript - Final',
          request_tracking_id TEXT,
          parchment_document_id TEXT,
          consent_given INTEGER NOT NULL,
          consent_timestamp INTEGER NOT NULL,
          ferpa_disclosure_shown INTEGER NOT NULL,
          release_authorized_method TEXT NOT NULL DEFAULT 'ElectronicSignature',
          request_xml TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'submitted',
          status_message TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          ip_address TEXT,
          user_agent TEXT
        )
      `);
      
      console.log('✓ Table created successfully');
    }
    
    console.log('\n✅ Database is ready!');
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

testTurso();
