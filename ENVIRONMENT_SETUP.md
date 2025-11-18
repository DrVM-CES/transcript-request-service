# Environment Variables Setup Guide

## 🔐 Security Note

**NEVER commit `.env.local` or any file with real credentials to GitHub!**

- ✅ `.env.example` - Template with placeholders (safe to commit)
- ❌ `.env.local` - Real secrets (in .gitignore, never commit)
- ❌ `.env.production` - Real secrets (in .gitignore, never commit)

---

## 🏠 Local Development Setup

### Step 1: Copy Template

```bash
cp .env.example .env.local
```

### Step 2: Fill in Values

Edit `.env.local` with your actual credentials:

```bash
# Database (from Turso Dashboard)
DATABASE_URL="libsql://transcript-requests-prod-jamie32872.aws-us-west-2.turso.io"
TURSO_AUTH_TOKEN="eyJhbGc..."  # Your actual token

# Email (from Resend)
RESEND_API_KEY="re_..."  # Your actual key

# Other settings
NEXT_PUBLIC_APP_URL="http://localhost:3001"
ENCRYPTION_SECRET="your-32-char-random-string"
MFC_API_KEY="your-mfc-key"
```

### Step 3: Test

```bash
npm run dev
# Visit http://localhost:3001
```

---

## ☁️ Production Deployment (Netlify)

Environment variables are set in the Netlify Dashboard, NOT in code.

### Current Production Variables

Go to: **Netlify Dashboard → Site Settings → Environment Variables**

Add these variables:

```bash
DATABASE_URL=libsql://transcript-requests-prod-jamie32872.aws-us-west-2.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://frolicking-horse-f44773.netlify.app
ENCRYPTION_SECRET=your-production-secret
MFC_API_KEY=your-production-mfc-key
RESEND_API_KEY=re_your_production_key  # ← NEW
```

### How to Add in Netlify

1. Go to https://app.netlify.com
2. Select your site: `frolicking-horse-f44773`
3. Click **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Add each key-value pair
6. Click **Save**
7. Redeploy site (Deploys → Trigger deploy)

---

## 🔑 Getting the Credentials

### Database (Turso)

Already configured:
- URL: `libsql://transcript-requests-prod-jamie32872.aws-us-west-2.turso.io`
- Token: Already set in local and Netlify

### Email (Resend) - NEW

1. **Sign up:** https://resend.com
2. **Create API key:**
   - Dashboard → API Keys
   - Click "Create API Key"
   - Name: "MFC Transcript Service - Production"
   - Copy key (starts with `re_`)
3. **Add to environments:**
   - Local: Add to `.env.local`
   - Netlify: Add in dashboard

**Free Plan:** 3,000 emails/month (sufficient for launch)

### Encryption Secret

Generate a random 32-character string:

```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

Use different secrets for development and production.

---

## 🧪 Testing Configuration

### Test Database Connection

```bash
node test-turso.js
```

Should show: `✅ Connected to Turso database`

### Test Email Configuration

```bash
node scripts/test-email.js your-email@example.com
```

Should send test email within seconds.

### Test Full Flow

1. Start dev server: `npm run dev`
2. Fill out transcript request form
3. Draw signature
4. Submit
5. Verify:
   - PDF downloads
   - Email arrives (if RESEND_API_KEY set)
   - Database entry created

---

## 🚨 Troubleshooting

### "DATABASE_URL not found"

**Problem:** Environment variables not loaded

**Solution:**
```bash
# Check .env.local exists
ls -la .env.local

# Restart dev server
# Kill with Ctrl+C, then:
npm run dev
```

### "Invalid Resend API key"

**Problem:** API key incorrect or missing

**Solution:**
```bash
# Check .env.local contains:
RESEND_API_KEY="re_..."

# Verify key starts with "re_"
# No extra spaces or quotes
```

### Environment variables not updating

**Problem:** Cached by Next.js

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 📋 Environment Variables Checklist

### Required (Always)
- [x] `DATABASE_URL` - Turso database URL
- [x] `TURSO_AUTH_TOKEN` - Turso authentication
- [x] `NEXT_PUBLIC_APP_URL` - App base URL
- [x] `ENCRYPTION_SECRET` - Data encryption

### Required (For Email)
- [ ] `RESEND_API_KEY` - Email delivery

### Optional
- [ ] `MFC_API_KEY` - MFC integration (future)
- [ ] `PARCHMENT_SFTP_HOST` - SFTP host (awaiting credentials)
- [ ] `PARCHMENT_SFTP_USERNAME` - SFTP user
- [ ] `PARCHMENT_SFTP_PASSWORD` - SFTP password

---

## 🔄 Syncing Between Environments

### From Local to Production

1. **Test locally first** with real credentials in `.env.local`
2. **Add to Netlify** via dashboard (never commit)
3. **Deploy and test** on production URL
4. **Monitor logs** in Netlify Functions

### Keeping .env.example Updated

When adding new environment variables:

1. Update `.env.example` with placeholder
2. Document in this file
3. Add to Netlify dashboard
4. Update team members
5. Commit `.env.example` (safe - no secrets)

---

## 📝 .env.local Template (Copy This)

```bash
# Database
DATABASE_URL="libsql://transcript-requests-prod-jamie32872.aws-us-west-2.turso.io"
TURSO_AUTH_TOKEN="your-turso-token-here"

# Parchment SFTP (leave empty until credentials received)
PARCHMENT_SFTP_HOST=""
PARCHMENT_SFTP_USERNAME=""
PARCHMENT_SFTP_PASSWORD=""
PARCHMENT_SFTP_PATH="/incoming"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3001"
ENCRYPTION_SECRET="your-random-32-char-string"

# MFC Integration
MFC_API_KEY="your-mfc-api-key"
MFC_WEBHOOK_SECRET="your-webhook-secret"

# Email (get from https://resend.com)
RESEND_API_KEY="re_your_api_key_here"
```

---

## 🎯 Quick Start

For new developers joining the project:

```bash
# 1. Clone repo
git clone <repo-url>
cd transcript-request

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Get credentials from team lead
# - Ask for Turso database URL and token
# - Get Resend API key (or create your own)
# - Generate encryption secret

# 5. Edit .env.local with real values
nano .env.local

# 6. Run database migration
node scripts/add-signature-fields-migration.js

# 7. Start dev server
npm run dev

# 8. Test at http://localhost:3001
```

---

**Remember:** `.env.local` is git-ignored for security. Share credentials securely (1Password, team vault, etc.), never via Slack/email/git! 🔐
