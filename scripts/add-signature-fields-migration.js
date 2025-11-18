/**
 * Migration script to add signature fields to transcript_requests table
 * Run with: node scripts/add-signature-fields-migration.js
 */

const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!dbUrl) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

const client = createClient({
  url: dbUrl,
  authToken: authToken,
});

async function runMigration() {
  console.log('🚀 Starting migration: Add signature fields\n');

  try {
    // Add mfc_liability_agreed column
    console.log('Adding mfc_liability_agreed column...');
    await client.execute(`
      ALTER TABLE transcript_requests 
      ADD COLUMN mfc_liability_agreed INTEGER DEFAULT 0
    `);
    console.log('✅ Added mfc_liability_agreed column');

    // Add student_signature column
    console.log('Adding student_signature column...');
    await client.execute(`
      ALTER TABLE transcript_requests 
      ADD COLUMN student_signature TEXT
    `);
    console.log('✅ Added student_signature column');

    // Add signature_date column
    console.log('Adding signature_date column...');
    await client.execute(`
      ALTER TABLE transcript_requests 
      ADD COLUMN signature_date TEXT
    `);
    console.log('✅ Added signature_date column');

    console.log('\n✨ Migration completed successfully!\n');
    
    // Verify the changes
    console.log('Verifying table structure...');
    const result = await client.execute(`
      PRAGMA table_info(transcript_requests)
    `);
    
    console.log('\nNew columns added:');
    result.rows.forEach(row => {
      const colName = row.name;
      if (colName === 'mfc_liability_agreed' || colName === 'student_signature' || colName === 'signature_date') {
        console.log(`  - ${colName} (${row.type})`);
      }
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
