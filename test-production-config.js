// Test production configuration without full build
const { createClient } = require('@libsql/client');

console.log('Testing production configuration...');

// Test database configuration
try {
  const client = createClient({
    url: process.env.DATABASE_URL || 'file:./.data/dev.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  console.log('✅ Database client configuration: OK');
} catch (error) {
  console.log('❌ Database client configuration failed:', error.message);
}

// Test SFTP configuration
const sftpConfig = {
  host: process.env.PARCHMENT_SFTP_HOST || '',
  username: process.env.PARCHMENT_SFTP_USERNAME || '',
  password: process.env.PARCHMENT_SFTP_PASSWORD || '',
  port: parseInt(process.env.PARCHMENT_SFTP_PORT || '22'),
  path: process.env.PARCHMENT_SFTP_PATH || '/incoming'
};

console.log('SFTP Configuration:');
console.log('- Host:', sftpConfig.host || '(not set)');
console.log('- Username:', sftpConfig.username ? '***configured***' : '(not set)');
console.log('- Password:', sftpConfig.password ? '***configured***' : '(not set)');
console.log('- Port:', sftpConfig.port);
console.log('- Path:', sftpConfig.path);

const hasRequiredSftpConfig = sftpConfig.host && sftpConfig.username && sftpConfig.password;
console.log(hasRequiredSftpConfig ? '✅ SFTP configuration: Complete' : '⚠️ SFTP configuration: Development mode (missing credentials)');

// Test environment variables
console.log('\nEnvironment Variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '***configured***' : 'Using default local');
console.log('- NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
console.log('- ENCRYPTION_SECRET:', process.env.ENCRYPTION_SECRET ? '***configured***' : '(not set)');

console.log('\n=== Production Readiness Check ===');
console.log('Database ready:', !!process.env.DATABASE_URL);
console.log('SFTP ready:', hasRequiredSftpConfig);
console.log('Security ready:', !!process.env.ENCRYPTION_SECRET);
console.log('App URL set:', !!process.env.NEXT_PUBLIC_APP_URL);

const productionReady = process.env.DATABASE_URL && hasRequiredSftpConfig && process.env.ENCRYPTION_SECRET;
console.log('\n' + (productionReady ? '🚀 READY FOR PRODUCTION' : '⚠️ NEEDS CONFIGURATION BEFORE PRODUCTION'));

if (!productionReady) {
  console.log('\nTo prepare for production:');
  if (!process.env.DATABASE_URL) console.log('- Set up Turso database and configure DATABASE_URL');
  if (!hasRequiredSftpConfig) console.log('- Configure Parchment SFTP credentials');
  if (!process.env.ENCRYPTION_SECRET) console.log('- Generate and set ENCRYPTION_SECRET');
}