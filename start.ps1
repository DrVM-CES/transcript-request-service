#!/usr/bin/env pwsh

Write-Host "Starting Transcript Request Service..." -ForegroundColor Green

# Check if Node.js is available
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js not found in PATH. Adding portable Node.js..." -ForegroundColor Yellow
    $env:PATH = "$PSScriptRoot\..\node-v20.11.0-win-x64;$env:PATH"
}

# Check if npm is available
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Error: npm not found. Please ensure Node.js is installed." -ForegroundColor Red
    exit 1
}

# Create data directory if it doesn't exist
if (!(Test-Path ".data")) {
    Write-Host "Creating database directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path ".data" -Force
}

# Install dependencies if node_modules doesn't exist
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Initialize database if needed
Write-Host "Initializing database..." -ForegroundColor Yellow
npm run db:push
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to initialize database" -ForegroundColor Red
    exit 1
}

# Start the development server
Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "Application will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev