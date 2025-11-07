#!/usr/bin/env node
/**
 * Production Database Migration Script
 * Pushes the schema to Turso database using production environment variables
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
}

// Validate required environment variables
const requiredVars = ['DATABASE_URL', 'TURSO_AUTH_TOKEN'];
const missing = requiredVars.filter(varName => !process.env[varName]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing.join(', '));
  console.error('Please update .env.production with your Turso credentials');
  process.exit(1);
}

console.log('📊 Migrating database schema to production...');
console.log(`   Database: ${process.env.DATABASE_URL}`);

try {
  // Run drizzle schema push
  execSync('npx drizzle-kit push', { 
    stdio: 'inherit',
    env: process.env 
  });
  
  console.log('✅ Database schema successfully migrated to production!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}