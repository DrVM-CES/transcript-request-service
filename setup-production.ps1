#!/usr/bin/env pwsh
# Production Setup Script for My Future Capacity Transcript Request Service
# This script sets up Turso database and guides through production configuration

Write-Host "=== My Future Capacity Transcript Request Service - Production Setup ===" -ForegroundColor Green
Write-Host ""

# Set up Node.js path if needed
$nodePath = "C:\Users\jamie\Workspace\cat_gpt_foundation_platform\node-v20.11.0-win-x64"
if (Test-Path $nodePath) {
    $env:PATH += ";$nodePath"
    Write-Host "✓ Added Node.js to PATH" -ForegroundColor Green
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the transcript-request project directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Production Setup Checklist:" -ForegroundColor Yellow
Write-Host ""

# Step 1: Turso Database Setup
Write-Host "1️⃣  Setting up Turso Database..." -ForegroundColor Blue
Write-Host ""

Write-Host "First, you need to create a Turso account and database:" -ForegroundColor Cyan
Write-Host "   1. Go to https://turso.tech and sign up"
Write-Host "   2. Install Turso CLI: curl -sSfL https://get.turso.tech/install.sh | bash"
Write-Host "   3. Login: turso auth login"
Write-Host "   4. Create database: turso db create mfc-transcript-requests"
Write-Host "   5. Get connection URL: turso db show mfc-transcript-requests --url"
Write-Host "   6. Create auth token: turso db tokens create mfc-transcript-requests"
Write-Host ""

$setupTurso = Read-Host "Have you completed the Turso setup? (y/N)"
if ($setupTurso.ToLower() -eq "y") {
    Write-Host "✓ Turso setup confirmed" -ForegroundColor Green
    
    # Get Turso credentials
    $tursoUrl = Read-Host "Enter your Turso database URL (libsql://...)"
    $tursoToken = Read-Host "Enter your Turso auth token" -AsSecureString
    
    if ($tursoUrl -and $tursoToken) {
        # Update .env.production with Turso credentials
        $envContent = Get-Content ".env.production" -Raw
        $envContent = $envContent -replace 'DATABASE_URL="libsql://.*"', "DATABASE_URL=`"$tursoUrl`""
        $envContent = $envContent -replace 'TURSO_AUTH_TOKEN=".*"', "TURSO_AUTH_TOKEN=`"$([System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($tursoToken)))`""
        Set-Content ".env.production" $envContent
        Write-Host "✓ Updated .env.production with Turso credentials" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Complete Turso setup before continuing" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Push Schema to Production Database
Write-Host "2️⃣  Pushing database schema to production..." -ForegroundColor Blue

$pushSchema = Read-Host "Push schema to Turso database? (y/N)"
if ($pushSchema.ToLower() -eq "y") {
    try {
        # Load production environment for database push
        Get-Content ".env.production" | ForEach-Object {
            if ($_ -match '^([^#][^=]*)=(.*)$') {
                [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], [System.EnvironmentVariableTarget]::Process)
            }
        }
        
        npm run db:push
        Write-Host "✓ Database schema pushed to Turso" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to push schema: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Step 3: Generate API Keys
Write-Host "3️⃣  Generating API Keys..." -ForegroundColor Blue

function Generate-APIKey {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

$mfcApiKey = Generate-APIKey
$encryptionSecret = Generate-APIKey
$webhookSecret = Generate-APIKey

Write-Host "Generated API Keys:" -ForegroundColor Cyan
Write-Host "  MFC_API_KEY: $mfcApiKey"
Write-Host "  ENCRYPTION_SECRET: $encryptionSecret"
Write-Host "  MFC_WEBHOOK_SECRET: $webhookSecret"
Write-Host ""

# Update .env.production with generated keys
$envContent = Get-Content ".env.production" -Raw
$envContent = $envContent -replace 'MFC_API_KEY=".*"', "MFC_API_KEY=`"$mfcApiKey`""
$envContent = $envContent -replace 'ENCRYPTION_SECRET=".*"', "ENCRYPTION_SECRET=`"$encryptionSecret`""
$envContent = $envContent -replace 'MFC_WEBHOOK_SECRET=".*"', "MFC_WEBHOOK_SECRET=`"$webhookSecret`""
Set-Content ".env.production" $envContent

Write-Host "✓ Updated .env.production with generated API keys" -ForegroundColor Green
Write-Host ""

# Step 4: Parchment SFTP Credentials
Write-Host "4️⃣  Parchment SFTP Configuration..." -ForegroundColor Blue
Write-Host ""
Write-Host "You need to contact Parchment to get SFTP credentials:" -ForegroundColor Cyan
Write-Host "  Contact: Maggie West (mwest@instructure.com) or Kim Underwood (kunderwood@instructure.com)"
Write-Host "  Mention: Setting up SFTP for electronic transcript delivery"
Write-Host "  Request: SFTP host, username, password, and upload path"
Write-Host ""

$parchmentReady = Read-Host "Do you have Parchment SFTP credentials? (y/N)"
if ($parchmentReady.ToLower() -eq "y") {
    $sftpHost = Read-Host "SFTP Host"
    $sftpUser = Read-Host "SFTP Username"
    $sftpPass = Read-Host "SFTP Password" -AsSecureString
    $sftpPath = Read-Host "SFTP Upload Path (default: /incoming)"
    
    if (-not $sftpPath) { $sftpPath = "/incoming" }
    
    # Update .env.production with SFTP credentials
    $envContent = Get-Content ".env.production" -Raw
    $envContent = $envContent -replace 'PARCHMENT_SFTP_HOST=".*"', "PARCHMENT_SFTP_HOST=`"$sftpHost`""
    $envContent = $envContent -replace 'PARCHMENT_SFTP_USERNAME=".*"', "PARCHMENT_SFTP_USERNAME=`"$sftpUser`""
    $envContent = $envContent -replace 'PARCHMENT_SFTP_PASSWORD=".*"', "PARCHMENT_SFTP_PASSWORD=`"$([System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($sftpPass)))`""
    $envContent = $envContent -replace 'PARCHMENT_SFTP_PATH=".*"', "PARCHMENT_SFTP_PATH=`"$sftpPath`""
    Set-Content ".env.production" $envContent
    
    Write-Host "✓ Updated .env.production with Parchment SFTP credentials" -ForegroundColor Green
} else {
    Write-Host "⚠️  Service will run in development mode until SFTP credentials are added" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Test Production Configuration
Write-Host "5️⃣  Testing Production Configuration..." -ForegroundColor Blue

$testConfig = Read-Host "Test the production configuration? (y/N)"
if ($testConfig.ToLower() -eq "y") {
    try {
        # Load production environment variables
        Get-Content ".env.production" | ForEach-Object {
            if ($_ -match '^([^#][^=]*)=(.*)$') {
                [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], [System.EnvironmentVariableTarget]::Process)
            }
        }
        
        # Build the application
        Write-Host "Building application..." -ForegroundColor Cyan
        npm run build
        
        # Test the health endpoint
        Write-Host "Testing health endpoint..." -ForegroundColor Cyan
        npm start &
        Start-Sleep 5
        
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Health check passed" -ForegroundColor Green
            $healthData = $response.Content | ConvertFrom-Json
            Write-Host "  Database: $($healthData.checks.database)" -ForegroundColor Cyan
            Write-Host "  SFTP: $($healthData.checks.sftp)" -ForegroundColor Cyan
            Write-Host "  Mode: $($healthData.checks.mode)" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Health check failed" -ForegroundColor Red
        }
        
        # Stop the server
        Get-Process -Name "node" | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
        
    } catch {
        Write-Host "❌ Configuration test failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Step 6: Deployment Information
Write-Host "6️⃣  Deployment Information" -ForegroundColor Blue
Write-Host ""
Write-Host "Your production environment is configured! Next steps:" -ForegroundColor Green
Write-Host "  1. Deploy to Netlify: npm run deploy" -ForegroundColor Cyan
Write-Host "  2. Set environment variables in Netlify dashboard from .env.production" -ForegroundColor Cyan
Write-Host "  3. Test the deployed health endpoint: https://your-app.netlify.app/api/health" -ForegroundColor Cyan
Write-Host "  4. Share the API endpoint with MFC developers: https://your-app.netlify.app/api/external/submit" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎉 Production setup complete!" -ForegroundColor Green
Write-Host ""

# Display final environment summary
Write-Host "📋 Environment Summary:" -ForegroundColor Yellow
Get-Content ".env.production" | ForEach-Object {
    if ($_ -match '^([^#][^=]*)=(.*)$') {
        $key = $matches[1]
        $value = $matches[2]
        if ($key -match "(PASSWORD|SECRET|TOKEN)") {
            $value = "***HIDDEN***"
        }
        Write-Host "  $key=$value" -ForegroundColor Gray
    }
}