/**
 * Load schools to PRODUCTION Turso database
 * 
 * IMPORTANT: This loads to PRODUCTION, not local!
 * 
 * Usage: node scripts/load-schools-to-production.js
 */

const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load production environment variables
dotenv.config({ path: '.env.production' });

// Verify we have production credentials
if (!process.env.DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error('❌ Missing production database credentials!');
  console.error('   Make sure .env.production has DATABASE_URL and TURSO_AUTH_TOKEN');
  process.exit(1);
}

console.log('📡 Connecting to PRODUCTION database...');
console.log(`   URL: ${process.env.DATABASE_URL}`);

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function loadSchools() {
  console.log('\n🚀 Loading schools to PRODUCTION database...\n');
  
  // Check if schools table exists
  try {
    const checkTable = await client.execute('SELECT COUNT(*) as count FROM schools');
    const currentCount = checkTable.rows[0].count;
    console.log(`📊 Current schools in production: ${currentCount}`);
    
    if (currentCount > 0) {
      console.log('\n⚠️  WARNING: Schools table already has data!');
      console.log('   This script will add NEW schools (duplicates possible)');
      console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  } catch (error) {
    console.error('❌ Error checking schools table:', error.message);
    process.exit(1);
  }
  
  // Read CSV file
  const csvPath = path.join(__dirname, '../data/california_schools_complete.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    process.exit(1);
  }
  
  console.log(`📁 Reading schools from: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  
  console.log(`📋 Found ${lines.length - 1} schools to load (excluding header)\n`);
  
  // Skip header line
  const dataLines = lines.slice(1).filter(line => line.trim());
  
  let loaded = 0;
  let skipped = 0;
  let errors = 0;
  
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    if (!line.trim()) continue;
    
    // Parse CSV line (handle quoted fields with commas)
    const fields = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField.trim()); // Add last field
    
    const [schoolName, schoolType, city, state, address, zip, phone, ceebCode] = fields;
    
    // Skip if essential data missing
    if (!schoolName || !city || !state) {
      skipped++;
      continue;
    }
    
    try {
      await client.execute({
        sql: `INSERT INTO schools (
          school_name, school_type, city, state, country,
          address, zip, phone, ceeb_code, search_text, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          schoolName,
          schoolType || 'High School',
          city,
          state,
          'USA',
          address || null,
          zip || null,
          phone || null,
          ceebCode || null,
          schoolName.toLowerCase(),
          Date.now()
        ]
      });
      
      loaded++;
      if (loaded % 50 === 0) {
        console.log(`   Loaded ${loaded}/${dataLines.length} schools...`);
      }
    } catch (error) {
      errors++;
      console.error(`❌ Failed to load ${schoolName}: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ Loading Complete!\n');
  console.log(`✅ Successfully loaded: ${loaded} schools`);
  console.log(`⏭️  Skipped (missing data): ${skipped} schools`);
  console.log(`❌ Errors: ${errors} schools`);
  console.log('='.repeat(60) + '\n');
  
  // Verify final count
  const finalCheck = await client.execute('SELECT COUNT(*) as count FROM schools');
  console.log(`📊 Total schools in production now: ${finalCheck.rows[0].count}\n`);
}

// Run the script
loadSchools()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
