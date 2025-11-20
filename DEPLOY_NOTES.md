# Deployment Notes - November 19, 2025

## Changes Made

### 1. Compact Single-Page PDF ✅
- Created new `pdf-generator-compact.ts` for ultra-compact single-page PDFs
- Two-column layout to maximize space
- Smaller fonts and tighter spacing
- Embedded digital signature with date
- MFC branding in header and footer

### 2. Email Domain Update ✅
- Updated from `transcripts@myfuturecapacity.org` to `transcripts@myfuturecapacity.com`
- Domain is verified in Resend

### 3. Environment Variable for Email
**ACTION REQUIRED**: Add this environment variable in Netlify:

```
USE_SANDBOX_EMAIL=false
```

This tells the system to use `transcripts@myfuturecapacity.com` instead of the Resend sandbox.

## How to Set Environment Variable in Netlify

1. Go to: https://app.netlify.com
2. Select your site: "frolicking-horse-f44773"
3. Click "Site settings" → "Environment variables"
4. Click "Add a variable"
5. Key: `USE_SANDBOX_EMAIL`
6. Value: `false`
7. Click "Save"
8. Trigger a new deploy (or it will apply on next deploy)

## Database

**Already configured** - Using Turso production database:
- Database URL: `libsql://transcript-requests-prod-jamie32872.aws-us-west-2.turso.io`
- All requests are saved to the cloud database
- No local storage required

## Testing Checklist

- [ ] Submit a test form on production
- [ ] Verify email arrives from `transcripts@myfuturecapacity.com`
- [ ] Check PDF is single-page and compact
- [ ] Verify digital signature appears in PDF
- [ ] Confirm MFC branding (header/footer)
- [ ] Test school registrar email notification (if school email provided)

## Known Issues / Future Enhancements

1. **Logo in PDF**: Currently text-based header. To add logo image:
   - Need PNG version of logo (SVG not supported by pdf-lib)
   - Add to `/public/mfc-logo.png`
   - Update pdf-generator-compact.ts to embed image

2. **Production Redirect**: Need to verify success page routing works on Netlify

3. **SFTP**: Still in simulation mode (awaiting Parchment credentials)
