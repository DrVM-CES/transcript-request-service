#!/usr/bin/env node
/**
 * Production Setup Test Script
 * Tests database connection and SFTP configuration
 */

const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🧪 Testing Production Setup...\n');

  // Load production environment variables
  const envPath = path.join(__dirname, '.env.production');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^"(.*)"$/, '$1');
          process.env[key] = value;
        }
      }
    });
    console.log('✓ Loaded production environment variables');
  } else {
    console.error('❌ .env.production file not found');
    return;
  }

  // Test 1: Environment Variables
  console.log('\n📋 Environment Variables Check:');
  const requiredVars = [
    'DATABASE_URL',
    'TURSO_AUTH_TOKEN', 
    'MFC_API_KEY',
    'ENCRYPTION_SECRET',
    'NEXT_PUBLIC_APP_URL'
  ];

  const optionalVars = [
    'PARCHMENT_SFTP_HOST',
    'PARCHMENT_SFTP_USERNAME', 
    'PARCHMENT_SFTP_PASSWORD',
    'PARCHMENT_SFTP_PATH'
  ];

  let allRequiredSet = true;
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value && value !== 'your-database-name' && value !== 'generate-secure-api-key-32-chars-min') {
      console.log(`  ✓ ${varName}: configured`);
    } else {
      console.log(`  ❌ ${varName}: not configured`);
      allRequiredSet = false;
    }
  });

  console.log('\n📡 Optional SFTP Variables:');
  let sftpConfigured = true;
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value && !value.startsWith('your-') && value !== 'sftp.parchment.com') {
      console.log(`  ✓ ${varName}: configured`);
    } else {
      console.log(`  ⚠️  ${varName}: using default/placeholder`);
      if (varName !== 'PARCHMENT_SFTP_PATH') {
        sftpConfigured = false;
      }
    }
  });

  // Test 2: Database Connection
  console.log('\n🗄️  Database Connection Test:');
  try {
    const { db } = require('./src/db/index.js');
    await db.$client.execute('SELECT 1');
    console.log('  ✅ Database connection successful');
  } catch (error) {
    console.log(`  ❌ Database connection failed: ${error.message}`);
  }

  // Test 3: SFTP Configuration
  console.log('\n📤 SFTP Configuration Test:');
  try {
    const { parchmentSFTP } = require('./src/lib/sftp-client.js');
    const config = parchmentSFTP.getConfigSummary();
    console.log(`  Mode: ${config.mode}`);
    console.log(`  Host: ${config.host}`);
    console.log(`  Port: ${config.port}`);
    console.log(`  Path: ${config.path}`);
    
    if (parchmentSFTP.isProductionMode()) {
      console.log('  🔄 Testing SFTP connection...');
      const testResult = await parchmentSFTP.testConnection();
      if (testResult.success) {
        console.log('  ✅ SFTP connection successful');
      } else {
        console.log(`  ❌ SFTP connection failed: ${testResult.error}`);
      }
    } else {
      console.log('  ⚠️  SFTP in development mode (will simulate uploads)');
    }
  } catch (error) {
    console.log(`  ❌ SFTP test failed: ${error.message}`);
  }

  // Test 4: API Key Generation
  console.log('\n🔑 API Key Validation:');
  const apiKey = process.env.MFC_API_KEY;
  const encryptionSecret = process.env.ENCRYPTION_SECRET;
  
  if (apiKey && apiKey.length >= 32) {
    console.log('  ✅ MFC_API_KEY length is sufficient');
  } else {
    console.log('  ❌ MFC_API_KEY is too short or missing');
  }

  if (encryptionSecret && encryptionSecret.length >= 32) {
    console.log('  ✅ ENCRYPTION_SECRET length is sufficient');
  } else {
    console.log('  ❌ ENCRYPTION_SECRET is too short or missing');
  }

  // Summary
  console.log('\n📊 Production Readiness Summary:');
  if (allRequiredSet) {
    console.log('  ✅ All required environment variables configured');
  } else {
    console.log('  ❌ Some required environment variables need configuration');
  }

  if (sftpConfigured) {
    console.log('  ✅ SFTP fully configured for production');
  } else {
    console.log('  ⚠️  SFTP will run in development mode');
  }

  console.log('\n🚀 Next steps:');
  console.log('  1. Deploy to Netlify with: npm run deploy');
  console.log('  2. Set environment variables in Netlify dashboard');
  console.log('  3. Test deployed health endpoint');
  console.log('  4. Share API documentation with MFC team');
}

main().catch(console.error);