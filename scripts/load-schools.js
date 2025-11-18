/**
 * Load schools from CSV into Turso database
 * Run with: node scripts/load-schools.js
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
      // Remove surrounding quotes
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
    console.log('Creating schools table...');
    
    // Create schools table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS schools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        school_name TEXT NOT NULL,
        school_type TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        country TEXT NOT NULL DEFAULT 'USA',
        ceeb_code TEXT,
        federal_school_code TEXT,
        website TEXT,
        notes TEXT,
        search_text TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);

    // Create indexes for fast searching
    console.log('Creating indexes...');
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_schools_search_text ON schools(search_text)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_schools_type ON schools(school_type)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_schools_state ON schools(state)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_schools_ceeb ON schools(ceeb_code)
    `);

    // Clear existing data
    console.log('Clearing existing schools...');
    await client.execute('DELETE FROM schools');

    // Read and parse CSV
    const csvPath = path.join(__dirname, '..', 'data', 'us_schools_ceeb_and_federal_codes_template.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').slice(1); // Skip header

    console.log(`Loading ${lines.length} schools...`);

    let loaded = 0;
    const timestamp = Date.now();

    for (const line of lines) {
      if (!line.trim()) continue;

      // Parse CSV line (handle commas in quotes)
      const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
      if (!matches || matches.length < 6) continue;

      const [
        schoolName,
        schoolType,
        city,
        state,
        country,
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

      try {
        await client.execute({
          sql: `INSERT INTO schools (
            school_name, school_type, city, state, country,
            ceeb_code, federal_school_code, website, notes,
            search_text, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            schoolName,
            schoolType,
            city,
            state,
            country || 'USA',
            ceebCode || null,
            federalSchoolCode || null,
            website || null,
            notes || null,
            searchText,
            timestamp
          ]
        });
        loaded++;
      } catch (error) {
        console.error(`Error loading school "${schoolName}":`, error.message);
      }
    }

    console.log(`✓ Successfully loaded ${loaded} schools`);

    // Show sample data
    const result = await client.execute('SELECT COUNT(*) as count FROM schools');
    console.log(`\nTotal schools in database: ${result.rows[0].count}`);

    const sample = await client.execute(`
      SELECT school_name, school_type, city, state, ceeb_code 
      FROM schools 
      LIMIT 5
    `);
    console.log('\nSample schools:');
    sample.rows.forEach(row => {
      console.log(`  - ${row.school_name} (${row.school_type}, ${row.city}, ${row.state})`);
    });

  } catch (error) {
    console.error('Error loading schools:', error);
    throw error;
  } finally {
    client.close();
  }
}

// Run the script
if (require.main === module) {
  loadSchools()
    .then(() => {
      console.log('\n✓ Schools database loaded successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Failed to load schools:', error);
      process.exit(1);
    });
}

module.exports = { loadSchools };
