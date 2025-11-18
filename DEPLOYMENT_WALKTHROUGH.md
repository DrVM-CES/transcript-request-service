# Complete Deployment Walkthrough

**Date:** November 18, 2025  
**Status:** Ready for Production Deployment

---

## 📋 Overview

This guide walks you through deploying all new features to production:
- ✅ Digital signature with canvas
- ✅ PDF generation with MFC branding
- ✅ Email delivery system
- ✅ MFC liability release
- ✅ UI enhancements (calendar, styling)

---

## STEP 1: Push to GitHub (5 minutes)

### 1.1 Verify Commits

Open PowerShell in project directory:

```powershell
cd C:\Users\jamie\Workspace\cat_gpt_foundation_platform\transcript-request
git log --oneline -5
```

**Expected output:**
```
<hash> UI fixes: calendar year dropdown, MFC liability styling, PDF branding
<hash> Add canvg dependency for jsPDF compatibility
<hash> Add digital signature, PDF generation, and email delivery
...
```

### 1.2 Check What Will Be Pushed

```powershell
git status
```

**Expected:** "Your branch is ahead of 'origin/main' by X commits"

### 1.3 Push to GitHub

```powershell
git push origin main
```

**What this does:**
- Uploads all commits to GitHub
- Triggers automatic Netlify deployment
- Makes code available for team

**Expected output:**
```
Counting objects: XX, done.
Writing objects: 100% (XX/XX), done.
To https://github.com/DrVM-CES/transcript-request-service.git
   abc1234..def5678  main -> main
```

---

## STEP 2: Monitor Netlify Deployment (10-15 minutes)

### 2.1 Open Netlify Dashboard

1. Go to: https://app.netlify.com
2. Sign in with your credentials
3. Find site: **frolicking-horse-f44773**

### 2.2 Watch Build Progress

**In Netlify Dashboard:**
1. Click **"Deploys"** tab
2. You'll see: **"Building"** (yellow dot)
3. Click on the build to see live logs

**Build Steps to Watch:**
```
1. Cloning repository
2. Installing dependencies (npm install)
3. Building Next.js application
4. Deploying to CDN
5. Publishing (green checkmark)
```

**Build time:** Usually 3-5 minutes

### 2.3 If Build Fails

**Common Issues:**

**Issue: "Module not found: canvg"**
```
Solution: Already fixed! The build should pass now.
```

**Issue: "Type errors"**
```
Check the logs for specific TypeScript errors
Fix locally, commit, push again
```

**Issue: "Out of memory"**
```
Netlify's free plan has limits
Usually not an issue for this project
```

### 2.4 Get Production URL

Once deployed (green checkmark):
- **Production URL:** https://frolicking-horse-f44773.netlify.app
- **Deploy ID:** Shows in dashboard
- **Deploy time:** Shows timestamp

---

## STEP 3: Test Production Site (5 minutes)

### 3.1 Open Production Site

Visit: **https://frolicking-horse-f44773.netlify.app**

### 3.2 Quick Smoke Test

**Test 1: Homepage Loads**
- ✅ Page loads without errors
- ✅ MFC gradient background visible
- ✅ "Start Request" button works

**Test 2: Form Navigation**
- ✅ Step 1: Student Info (fill name, email, DOB)
- ✅ Step 2: School autocomplete works
- ✅ Step 3: Destination school
- ✅ Step 4: Consent page loads

**Test 3: New Features**
- ✅ Calendar has year dropdown (click calendar icon)
- ✅ MFC liability section has amber styling
- ✅ Signature canvas appears
- ✅ Can draw signature
- ✅ Clear button works
- ✅ Date auto-fills

**Test 4: Submission**
- ✅ Fill all required fields
- ✅ Draw signature
- ✅ Submit form
- ✅ PDF downloads (check Downloads folder)
- ✅ Success page appears

**Test 5: PDF Quality**
- ✅ Open downloaded PDF
- ✅ MFC gradient header present
- ✅ "MY FUTURE CAPACITY" logo visible
- ✅ Signature embedded correctly
- ✅ All form data present
- ✅ MFC branded footer with tagline

### 3.3 What Won't Work Yet

❌ **Email delivery** - Needs RESEND_API_KEY (next step)
❌ **Parchment SFTP** - Still in simulation mode (awaiting credentials)

---

## STEP 4: Set Up Email Delivery (15 minutes)

### 4.1 Create Resend Account

**Go to:** https://resend.com

**Steps:**
1. Click **"Sign Up"**
2. Enter email address
3. Verify email (check inbox)
4. Complete profile

**Account Details:**
- **Free Plan:** 3,000 emails/month, 100/day
- **No credit card required**
- **Takes 2 minutes**

### 4.2 Create API Key

**In Resend Dashboard:**
1. Click **"API Keys"** in left menu
2. Click **"+ Create API Key"**
3. Name: `MFC Transcript Service - Production`
4. Permissions: Keep default (Full Access)
5. Click **"Create"**

**Important:** Copy the key immediately! Format: `re_XXXXXXXXXXXXX`

**Store it safely** - You can't see it again after closing the modal.

### 4.3 Add to Netlify Environment

**In Netlify Dashboard:**
1. Go to your site: **frolicking-horse-f44773**
2. Click **"Site settings"**
3. Click **"Environment variables"** (left menu)
4. Click **"Add a variable"** button

**Add this variable:**
```
Key:   RESEND_API_KEY
Value: re_XXXXXXXXXXXXX  (paste your actual key)
```

5. Click **"Save"**
6. Click **"Trigger deploy"** → **"Deploy site"**

**Wait for redeploy:** ~3-5 minutes

### 4.4 Test Email Delivery

**Once redeployed:**

1. Visit: https://frolicking-horse-f44773.netlify.app
2. Fill out a complete transcript request
3. Draw signature
4. Submit form
5. **Check your email** (the one you entered in the form)

**Expected:**
- ✅ Email arrives within 10 seconds
- ✅ Subject: "Transcript Request Confirmation - TR-XXXX"
- ✅ From: onboarding@resend.dev (or transcripts@myfuturecapacity.org if domain verified)
- ✅ Beautiful HTML email with MFC gradient
- ✅ PDF attachment included

**If email doesn't arrive:**
- Check spam folder
- Check Netlify function logs (Site settings → Functions)
- Check Resend dashboard (Shows sent emails)

---

## STEP 5: Optional - Verify Custom Domain (30 minutes)

**Why:** Email will come from `transcripts@myfuturecapacity.org` instead of `onboarding@resend.dev`

### 5.1 Add Domain to Resend

**In Resend Dashboard:**
1. Click **"Domains"** in left menu
2. Click **"Add Domain"**
3. Enter: `myfuturecapacity.org`
4. Click **"Add"**

### 5.2 Get DNS Records

Resend will show 3 DNS records to add:

**Record 1: SPF**
```
Type: TXT
Name: @
Value: v=spf1 include:amazonses.com ~all
```

**Record 2: DKIM**
```
Type: TXT
Name: resend._domainkey
Value: [long string provided by Resend]
```

**Record 3: DMARC**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none
```

### 5.3 Add DNS Records

**Where to add:** Your domain registrar's DNS management (GoDaddy, Namecheap, Cloudflare, etc.)

**Steps vary by provider, but generally:**
1. Log into domain registrar
2. Find DNS Management / DNS Settings
3. Add new TXT records
4. Copy/paste values exactly from Resend
5. Save changes

**Wait time:** 5-30 minutes for DNS propagation

### 5.4 Verify Domain

**Back in Resend:**
1. Click **"Verify"** button
2. Resend checks DNS records
3. Status changes to **"Verified"** (green checkmark)

### 5.5 Update Email Code

**Edit:** `src/lib/email-service.ts`

**Change line 37:**
```typescript
// Before domain verification:
from: 'My Future Capacity <onboarding@resend.dev>',

// After domain verification:
from: 'My Future Capacity <transcripts@myfuturecapacity.org>',
```

**Commit and deploy:**
```powershell
git add src/lib/email-service.ts
git commit -m "Update email from address to custom domain"
git push origin main
```

---

## STEP 6: Testing Checklist (10 minutes)

### 6.1 Create Test Spreadsheet

Track your tests:

| Test | Expected | Status | Notes |
|------|----------|--------|-------|
| Homepage loads | MFC gradient visible | ✅ |  |
| Form Step 1 | Can enter student info | ✅ |  |
| Form Step 2 | School autocomplete works | ✅ |  |
| Calendar | Year dropdown visible | ✅ |  |
| Signature | Can draw on canvas | ✅ |  |
| Signature date | Auto-fills when signed | ✅ |  |
| MFC liability | Amber styling visible | ✅ |  |
| Form submit | PDF downloads | ✅ |  |
| PDF content | Signature embedded | ✅ |  |
| PDF branding | MFC gradient header | ✅ |  |
| Email delivery | Arrives within 10 sec | ✅ |  |
| Email content | HTML formatted | ✅ |  |
| Email attachment | PDF included | ✅ |  |
| Mobile test | Works on phone | ⏳ |  |

### 6.2 Test on Different Devices

**Desktop:**
- ✅ Chrome
- ✅ Firefox
- ✅ Safari (if on Mac)
- ✅ Edge

**Mobile:**
- ✅ iPhone Safari
- ✅ Android Chrome
- ✅ Signature drawing with finger works

### 6.3 Test Edge Cases

**Test Invalid Data:**
- Try submitting without signature → Should show error
- Try future date → Should reject
- Try incomplete form → Should highlight errors

**Test Long Names:**
- Enter very long school name → Should fit in PDF
- Enter long student name → Should format correctly

**Test Special Characters:**
- Names with apostrophes (O'Brien)
- Names with hyphens (Mary-Ann)
- International characters (José)

---

## STEP 7: Database Verification (5 minutes)

### 7.1 Check Database

**Verify signature data is saved:**

1. Open Turso dashboard: https://turso.tech/app
2. Find database: `transcript-requests-prod`
3. Click **"Query"** or **"SQL Editor"**

**Run query:**
```sql
SELECT 
  id, 
  student_first_name, 
  student_last_name,
  LENGTH(student_signature) as signature_size,
  signature_date,
  mfc_liability_agreed,
  created_at
FROM transcript_requests
ORDER BY created_at DESC
LIMIT 5;
```

**Expected results:**
- ✅ Recent submissions visible
- ✅ `signature_size` > 1000 (signature stored)
- ✅ `signature_date` matches form date
- ✅ `mfc_liability_agreed` = 1

### 7.2 Verify Migration

**Check new columns exist:**
```sql
PRAGMA table_info(transcript_requests);
```

**Look for:**
- ✅ `mfc_liability_agreed`
- ✅ `student_signature`
- ✅ `signature_date`

---

## STEP 8: Monitor Production (Ongoing)

### 8.1 Set Up Monitoring

**Netlify Functions Logs:**
1. Netlify Dashboard → Functions
2. Click on function name
3. View recent invocations
4. Check for errors

**Resend Email Logs:**
1. Resend Dashboard → Emails
2. See all sent emails
3. Check delivery status
4. View any errors

### 8.2 Check Daily

**First Week After Launch:**
- Check Netlify logs daily
- Monitor email delivery rate
- Watch for error patterns
- Review user submissions

**Metrics to Track:**
- Form submissions per day
- Email delivery success rate
- PDF generation success rate
- Average form completion time

---

## 🎯 Success Criteria

### Deployment Successful When:
- ✅ Netlify build passes (green checkmark)
- ✅ Production site loads without errors
- ✅ All form steps navigate correctly
- ✅ Signature canvas works (mouse + touch)
- ✅ Calendar year dropdown visible
- ✅ MFC liability has amber styling
- ✅ PDF downloads with signature embedded
- ✅ PDF has MFC gradient branding
- ✅ Email arrives with PDF attachment
- ✅ Database stores signature correctly
- ✅ Mobile works (test on phone)

### You're Done When:
1. All tests above pass ✅
2. Email delivery working ✅
3. PDF looks professional ✅
4. No errors in logs ✅
5. Mobile responsive ✅

---

## 🚨 Troubleshooting Common Issues

### Issue: Build Fails on Netlify

**Check:**
- Build logs in Netlify
- Missing dependencies?
- TypeScript errors?

**Fix:**
```powershell
# Test build locally first
npm run build

# If it works locally, clear Netlify cache:
# Netlify Dashboard → Site settings → Build & deploy → Clear cache
```

### Issue: Email Not Sending

**Check:**
1. RESEND_API_KEY in Netlify environment
2. Resend dashboard for delivery status
3. Netlify function logs for errors
4. Email address is valid

**Common causes:**
- API key not set
- API key has wrong permissions
- Recipient email invalid
- Rate limit exceeded (100/day on free plan)

### Issue: PDF Download Fails

**Check:**
- Browser console for errors
- PDF size (should be < 1MB)
- Signature data present

**Test:**
```javascript
// In browser console:
console.log('Testing PDF generation...');
```

### Issue: Signature Canvas Not Drawing

**Check:**
- Touch events working on mobile?
- Canvas element visible?
- Z-index conflicts?

**Test:**
- Try with mouse on desktop
- Try with finger on mobile
- Check browser console for errors

---

## 📞 Need Help?

### Resources

**Documentation:**
- `SIGNATURE_AND_PDF_IMPLEMENTATION.md` - Technical details
- `EMAIL_SETUP_GUIDE.md` - Email configuration
- `ENVIRONMENT_SETUP.md` - Environment variables

**External Links:**
- Netlify Docs: https://docs.netlify.com
- Resend Docs: https://resend.com/docs
- Next.js Docs: https://nextjs.org/docs

**Logs & Dashboards:**
- Netlify: https://app.netlify.com
- Resend: https://resend.com/emails
- Turso: https://turso.tech/app

---

## ✅ Next Steps After Deployment

Once everything above is working:

**Phase 2 Features:**
1. Parental consent workflow (students under 18)
2. User authentication (Better Auth)
3. Student dashboard (view requests)
4. Expand California schools (163 → 1,500)

**Phase 3 Features:**
5. Payment integration (Stripe - $5.99 for non-MFC)
6. Tiered service options
7. Parchment SFTP production credentials
8. Expand to all 50 states

---

**You've got this! 🚀**

Start with Step 1 (push to GitHub) and work through each step methodically. Let me know if you hit any issues!
