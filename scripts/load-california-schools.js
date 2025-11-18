/**
 * Load California schools from CSV into Turso database (with address, zip, phone)
 * Run with: node scripts/load-california-schools.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

console.log('Using DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 40) + '...');

async function loadSchools() {
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    console.log('\n1. Updating schools table schema...');
    
    // Add new columns if they don't exist
    try {
      await client.execute(`ALTER TABLE schools ADD COLUMN address TEXT`);
      console.log('  Added address column');
    } catch (e) {
      console.log('  Address column already exists');
    }
    
    try {
      await client.execute(`ALTER TABLE schools ADD COLUMN zip TEXT`);
      console.log('  Added zip column');
    } catch (e) {
      console.log('  ZIP column already exists');
    }
    
    try {
      await client.execute(`ALTER TABLE schools ADD COLUMN phone TEXT`);
      console.log('  Added phone column');
    } catch (e) {
      console.log('  Phone column already exists');
    }

    console.log('\n2. Clearing existing California schools...');
    await client.execute(`DELETE FROM schools WHERE state = 'CA'`);

    // Read and parse CSV
    const csvPath = path.join(__dirname, '..', 'data', 'california_schools_complete.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').slice(1); // Skip header

    console.log(`\n3. Preparing ${lines.length} California schools for loading...\n`);

    const timestamp = Date.now();
    const schools = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      // Parse CSV line (handle commas in quotes)
      const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
      if (!matches || matches.length < 8) continue;

      const [
        schoolName,
        schoolType,
        city,
        state,
        country,
        address,
        zip,
        phone,
        ceebCode,
        federalSchoolCode,
        website,
        notes
      ] = matches.map(field => field.replace(/^"|"$/g, '').trim());

      // Create search text (lowercase for case-insensitive searching)
      const searchText = [
        schoolName,
        city,
        state,
        ceebCode,
        federalSchoolCode
      ].filter(Boolean).join(' ').toLowerCase();

      schools.push({
        schoolName,
        schoolType,
        city,
        state,
        country: country || 'USA',
        address: address || null,
        zip: zip || null,
        phone: phone || null,
        ceebCode: ceebCode || null,
        federalSchoolCode: federalSchoolCode || null,
        website: website || null,
        notes: notes || null,
        searchText,
        timestamp
      });
    }

    console.log(`4. Inserting ${schools.length} schools in batches...`);
    
    // Batch insert for better performance
    const batchSize = 50;
    let loaded = 0;
    
    for (let i = 0; i < schools.length; i += batchSize) {
      const batch = schools.slice(i, i + batchSize);
      
      // Build a multi-row insert statement
      const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
      const values = batch.flatMap(school => [
        school.schoolName,
        school.schoolType,
        school.city,
        school.state,
        school.country,
        school.address,
        school.zip,
        school.phone,
        school.ceebCode,
        school.federalSchoolCode,
        school.website,
        school.notes,
        school.searchText,
        school.timestamp
      ]);

      try {
        await client.execute({
          sql: `INSERT INTO schools (
            school_name, school_type, city, state, country,
            address, zip, phone,
            ceeb_code, federal_school_code, website, notes,
            search_text, created_at
          ) VALUES ${placeholders}`,
          args: values
        });
        
        loaded += batch.length;
        const percent = Math.round((loaded / schools.length) * 100);
        process.stdout.write(`\r   Progress: ${loaded}/${schools.length} (${percent}%) `);
      } catch (error) {
        console.error(`\n   Error loading batch at position ${i}:`, error.message);
      }
    }

    console.log(`\n\n✓ Successfully loaded ${loaded} California schools`);

    // Show verification data
    const result = await client.execute(`SELECT COUNT(*) as count FROM schools WHERE state = 'CA'`);
    console.log(`\nTotal California schools in database: ${result.rows[0].count}`);

    const sample = await client.execute(`
      SELECT school_name, school_type, city, state, ceeb_code, address, phone
      FROM schools 
      WHERE state = 'CA'
      LIMIT 5
    `);
    console.log('\nSample California schools:');
    sample.rows.forEach(row => {
      console.log(`  - ${row.school_name} (${row.school_type}, ${row.city}, ${row.state})`);
      if (row.address) console.log(`    ${row.address}`);
      if (row.phone) console.log(`    ${row.phone}`);
    });

  } catch (error) {
    console.error('\nError loading schools:', error);
    throw error;
  } finally {
    client.close();
  }
}

// Run the script
if (require.main === module) {
  loadSchools()
    .then(() => {
      console.log('\n✓ California schools database loaded successfully\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Failed to load schools:', error.message);
      process.exit(1);
    });
}

module.exports = { loadSchools };
