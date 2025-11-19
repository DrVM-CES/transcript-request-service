/**
 * Check how many schools are in production database
 */

const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');

// Load from .env.local (which has production credentials)
dotenv.config({ path: '.env.local' });

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function checkSchools() {
  console.log('\n📊 Checking Production Database...\n');
  console.log(`Database: ${process.env.DATABASE_URL}\n`);
  
  try {
    // Count total schools
    const countResult = await client.execute('SELECT COUNT(*) as count FROM schools');
    const totalSchools = countResult.rows[0].count;
    
    console.log(`Total schools: ${totalSchools}`);
    
    if (totalSchools === 0) {
      console.log('\n❌ No schools found! Database is empty.');
      console.log('   Need to load schools from CSV file.\n');
      return;
    }
    
    // Count by state
    console.log('\nSchools by state:');
    const stateResult = await client.execute(
      'SELECT state, COUNT(*) as count FROM schools GROUP BY state ORDER BY count DESC LIMIT 10'
    );
    
    stateResult.rows.forEach(row => {
      console.log(`   ${row.state}: ${row.count} schools`);
    });
    
    // Check California schools with full data
    const caFullData = await client.execute(`
      SELECT COUNT(*) as count 
      FROM schools 
      WHERE state = 'CA' 
        AND address IS NOT NULL 
        AND phone IS NOT NULL
    `);
    
    console.log(`\nCA schools with address & phone: ${caFullData.rows[0].count}`);
    
    // Sample a few schools
    console.log('\nSample schools:');
    const sampleResult = await client.execute(
      'SELECT school_name, city, state, address, phone FROM schools LIMIT 5'
    );
    
    sampleResult.rows.forEach(row => {
      console.log(`   ${row.school_name} (${row.city}, ${row.state})`);
      console.log(`      Address: ${row.address || 'N/A'}`);
      console.log(`      Phone: ${row.phone || 'N/A'}`);
    });
    
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSchools();
