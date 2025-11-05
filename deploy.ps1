#!/usr/bin/env pwsh
# Production Deployment Script for My Future Capacity Transcript Service

param(
    [switch]$SkipBuild,
    [switch]$TestOnly,
    [string]$Environment = "production"
)

Write-Host "=== My Future Capacity Transcript Service Deployment ===" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow

# Check if Node.js is available
$nodeVersion = try { node --version } catch { $null }
if (-not $nodeVersion) {
    Write-Error "Node.js is not installed or not in PATH"
    exit 1
}

Write-Host "Node.js Version: $nodeVersion" -ForegroundColor Green

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies"
    exit 1
}

# Run tests if not skipping
if (-not $SkipBuild) {
    Write-Host "Running type check..." -ForegroundColor Yellow
    npx tsc --noEmit
    if ($LASTEXITCODE -ne 0) {
        Write-Error "TypeScript compilation failed"
        exit 1
    }

    Write-Host "Running linting..." -ForegroundColor Yellow
    npm run lint
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Linting issues found, but continuing..."
    }
}

# Test health endpoints
if ($TestOnly) {
    Write-Host "Testing health endpoints..." -ForegroundColor Yellow
    
    # Start the server in background
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow
    Start-Sleep -Seconds 5
    
    try {
        $healthResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -TimeoutSec 10
        Write-Host "Health Check Response:" -ForegroundColor Green
        $healthResponse | ConvertTo-Json -Depth 3
    }
    catch {
        Write-Error "Health check failed: $_"
    }
    
    # Stop the test server
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next*dev*" } | Stop-Process
    exit 0
}

# Build the application
if (-not $SkipBuild) {
    Write-Host "Building application..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed"
        exit 1
    }
}

# Production deployment instructions
Write-Host "=== Deployment Instructions ===" -ForegroundColor Green
Write-Host ""
Write-Host "1. Set up Turso Database:" -ForegroundColor Yellow
Write-Host "   - Go to https://turso.tech and create an account"
Write-Host "   - Create a new database: 'transcript-requests-prod'"
Write-Host "   - Generate an auth token"
Write-Host "   - Run database migrations: npm run db:push"
Write-Host ""
Write-Host "2. Configure Parchment SFTP:" -ForegroundColor Yellow
Write-Host "   - Contact Parchment for SFTP credentials"
Write-Host "   - Get your organization's CEEB code"
Write-Host "   - Test connection with provided credentials"
Write-Host ""
Write-Host "3. Deploy to Netlify:" -ForegroundColor Yellow
Write-Host "   - Connect your Git repository to Netlify"
Write-Host "   - Set environment variables from .env.production"
Write-Host "   - Deploy automatically on push to main branch"
Write-Host ""
Write-Host "4. Environment Variables to Set:" -ForegroundColor Yellow
Write-Host "   DATABASE_URL=libsql://your-db.turso.io"
Write-Host "   TURSO_AUTH_TOKEN=your-token"
Write-Host "   PARCHMENT_SFTP_HOST=sftp.parchment.com"
Write-Host "   PARCHMENT_SFTP_USERNAME=your-username"
Write-Host "   PARCHMENT_SFTP_PASSWORD=your-password"
Write-Host "   NEXT_PUBLIC_APP_URL=https://your-domain.com"
Write-Host "   ENCRYPTION_SECRET=your-32-char-secret"
Write-Host ""
Write-Host "5. Post-Deployment Testing:" -ForegroundColor Yellow
Write-Host "   - Test health endpoint: https://your-domain.com/api/health"
Write-Host "   - Submit a test transcript request"
Write-Host "   - Verify SFTP upload works"
Write-Host "   - Check database audit trail"
Write-Host ""
Write-Host "Build completed successfully! Ready for deployment." -ForegroundColor Green