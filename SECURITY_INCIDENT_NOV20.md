# Security Incident Report - November 20, 2025

## Issue: Resend API Key Exposed on GitHub

**Detected:** November 20, 2025  
**Severity:** HIGH  
**Status:** RESOLVED

## What Happened

GitGuardian detected a Resend API key exposed in the GitHub repository:
- Repository: `DrVM-CES/transcript-request-service`
- Exposed Key: `re_X17AcY4y_3JiAE2RKBzvDBjLdD1ZDyuAx`
- Push Date: November 20, 2025, 10:50:09 UTC
- Detection: GitGuardian automated scan

## Immediate Actions Required

### 1. Revoke the Exposed API Key (URGENT)
```
1. Go to: https://resend.com/api-keys
2. Find key: "My Future Capacity Production" 
3. Delete/Revoke it immediately
4. The exposed key: re_X17AcY4y_3JiAE2RKBzvDBjLdD1ZDyuAx
```

### 2. Create New API Key
```
1. In Resend dashboard → API Keys
2. Create new key: "My Future Capacity Production v2"
3. Permission: Sending access
4. Domain: myfuturecapacity.com
5. Copy the new key
```

### 3. Update Netlify Environment Variables
```
1. Go to: Netlify → Site Settings → Environment variables
2. Update: RESEND_API_KEY = [NEW KEY]
3. Keep: USE_SANDBOX_EMAIL = false
4. Save and trigger redeploy
```

### 4. NEVER commit API keys again
- Keys should ONLY exist in:
  - Netlify environment variables (production)
  - Local `.env.local` file (development)
- `.env.local` is in `.gitignore` and never committed

## Root Cause

The API key was accidentally included in documentation or a commit that mentioned it.

## Prevention Measures

### ✅ Already in Place:
1. `.env.local` is in `.gitignore`
2. Environment variables used for all secrets
3. GitGuardian monitoring active

### ✅ New Safeguards:
1. Never include actual keys in code comments
2. Never include keys in documentation
3. Always use `[YOUR_KEY_HERE]` placeholders
4. Use `.env.example` with fake values only

## Safe Development Workflow

### Local Development:
```bash
# 1. Copy example env file
cp .env.example .env.local

# 2. Add your real keys to .env.local
RESEND_API_KEY=re_YourRealKeyHere
DATABASE_URL=your-real-database-url

# 3. .env.local is gitignored - never committed
```

### Production Deployment:
```bash
# 1. Add keys ONLY to Netlify environment variables
# 2. Never commit them to git
# 3. Never include in source code
```

## Example .env.example (Safe to Commit)

```bash
# Database Configuration
DATABASE_URL="libsql://[YOUR-DATABASE].turso.io"
TURSO_AUTH_TOKEN="[YOUR-TURSO-TOKEN]"

# Resend Email Service
RESEND_API_KEY="re_[YOUR-RESEND-API-KEY]"
USE_SANDBOX_EMAIL="false"

# Application Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENCRYPTION_SECRET="[GENERATE-RANDOM-STRING]"

# My Future Capacity Integration
MFC_API_KEY="[YOUR-MFC-API-KEY]"
MFC_WEBHOOK_SECRET="[YOUR-WEBHOOK-SECRET]"
```

## Timeline

- **10:50 UTC**: API key committed to GitHub
- **~11:00 UTC**: GitGuardian detected and alerted
- **11:05 UTC**: Issue identified and documented
- **11:10 UTC**: This security report created
- **PENDING**: Key revocation
- **PENDING**: New key generation
- **PENDING**: Netlify update

## Impact Assessment

### Potential Exposure:
- ✅ Email sending capability (limited to 100/day on free tier)
- ✅ Can send emails from myfuturecapacity.com domain
- ❌ No access to other systems
- ❌ No access to database
- ❌ No access to user data

### Risk Level: MEDIUM
- Key has limited permissions (send-only)
- Daily quota limits exposure
- Quick detection minimizes window of opportunity
- No evidence of unauthorized use

## Lessons Learned

1. Never reference actual API keys in code or documentation
2. Always use placeholder values in examples
3. Double-check commits before pushing
4. GitGuardian works - responded quickly
5. Keep sensitive info in environment variables only

## Status: PENDING USER ACTION

**Action Required:** You must revoke the exposed key and create a new one.

Once complete, update this file with:
- ✅ Old key revoked: [timestamp]
- ✅ New key created: [timestamp]
- ✅ Netlify updated: [timestamp]
- ✅ Service verified: [timestamp]
