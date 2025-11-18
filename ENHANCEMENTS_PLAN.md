# Transcript Request Service - Enhancement Plan

## ✅ Completed (Quick Wins)

### 1. Date Picker Year Selection
- **Status:** ✅ DONE
- **Changes:** Updated DatePicker component to include year dropdown
- **Implementation:** Added `fromYear` and `toYear` props to DayPicker
- **User Experience:** Users can now quickly jump to any year instead of clicking through months

### 2. Auto-populate School Contact Information
- **Status:** ✅ DONE  
- **Changes:**
  - Added `address`, `zip`, `phone` fields to schools database schema
  - Updated API to return these fields
  - Modified SchoolInfoStep to auto-fill: address, city, state, zip, phone
  - Modified DestinationInfoStep to auto-fill: address, city, state, zip
- **User Experience:** When selecting a school from autocomplete, all contact fields populate automatically

---

## 🚧 In Progress / Planned

### 3. California Schools Database Expansion

**Goal:** Include ALL California educational institutions

**Categories to Include:**
1. **High Schools** (~1,300 public high schools)
   - All California public high schools
   - Major private high schools
   - Charter schools

2. **Community Colleges** (116 campuses)
   - All California Community Colleges system schools

3. **Trade/Vocational Schools**
   - Accredited trade schools in California
   - Technical institutes
   - Vocational training centers

4. **Universities & Colleges** (~150)
   - All UC system (10 campuses)
   - All CSU system (23 campuses)
   - Private universities (Stanford, USC, etc.)
   - Private colleges

**Data Sources:**
- California Department of Education (CDE) - Public school data
- NCES (National Center for Education Statistics)
- California Community Colleges Chancellor's Office
- CEEB code directories
- IPEDS database for higher education

**Implementation Steps:**
1. ☐ Create Python script to fetch CA public schools from CDE API
2. ☐ Fetch community college data
3. ☐ Compile trade school list from accreditation databases
4. ☐ Compile complete UC/CSU/private university list
5. ☐ Merge and deduplicate data
6. ☐ Enhance with address, phone, CEEB codes
7. ☐ Load into production database

**Estimated Total:** ~2,000-2,500 California schools

---

### 4. Digital Signature Component

**Requirements:**
- Capture signature after consent step
- Store signature as base64 image data
- Include in application record
- Display in PDF output

**Implementation Plan:**

#### A. Create SignaturePad Component
```typescript
// src/components/SignaturePad.tsx
- Canvas-based signature capture
- "Clear" and "Done" buttons
- Touch and mouse support
- Generates base64 PNG
- MFC-styled
```

#### B. Add to Form Flow
- New step after ConsentStep (Step 4.5)
- OR embedded at bottom of ConsentStep
- Required field validation
- Store in form state

#### C. Database Schema Update
```sql
ALTER TABLE transcript_requests ADD COLUMN signature_data TEXT;
ALTER TABLE transcript_requests ADD COLUMN signature_timestamp INTEGER;
```

#### D. Legal Compliance
- Add text: "By signing below, I certify that..."
- Include timestamp with signature
- Store IP address (already captured)

**Libraries to Consider:**
- `react-signature-canvas` (most popular)
- `signature_pad` (vanilla JS)

---

### 5. PDF Generation & Email Delivery

**Requirements:**
- Generate PDF of completed application
- Include all form data
- Include digital signature
- Email PDF to user
- Store PDF copy in database/S3

**Implementation Plan:**

#### A. PDF Generation
**Library:** `@react-pdf/renderer` or `pdfkit`

**PDF Layout:**
```
┌─────────────────────────────────────┐
│ TRANSCRIPT REQUEST APPLICATION      │
│ My Future Capacity                  │
├─────────────────────────────────────┤
│ Student Information                 │
│ - Name, DOB, Email                  │
│ - Partial SSN                       │
├─────────────────────────────────────┤
│ Current School Information          │
│ - School name, address, CEEB        │
│ - Enrollment dates                  │
├─────────────────────────────────────┤
│ Destination Institution             │
│ - School name, address, CEEB        │
│ - Document type requested           │
├─────────────────────────────────────┤
│ Consent & Authorization             │
│ - FERPA disclosure acknowledgment   │
│ - Consent timestamp                 │
│ - Digital signature (image)         │
├─────────────────────────────────────┤
│ Request Details                     │
│ - Tracking ID                       │
│ - Submission date/time              │
│ - IP address                        │
└─────────────────────────────────────┘
```

#### B. Email Delivery
**Options:**
1. **Resend** (recommended - already have account?)
2. **SendGrid** (reliable, good API)
3. **AWS SES** (if using AWS)

**Email Content:**
```
Subject: Your Transcript Request Confirmation - [Tracking ID]

Dear [Student Name],

Thank you for submitting your transcript request through My Future Capacity.

Request Details:
- From: [School Name]
- To: [Destination School]
- Document Type: [Type]
- Request ID: [Tracking ID]
- Submitted: [Date/Time]

Your completed application is attached as a PDF for your records.

Processing typically takes 5-7 business days. You will receive email 
notifications when your transcript has been sent.

If you have questions, please contact support@myfuturecapacity.com

Best regards,
My Future Capacity Team
```

**Attachments:**
- application_[trackingID].pdf

#### C. Implementation Steps
1. ☐ Install PDF generation library
2. ☐ Create PDF template component
3. ☐ Generate PDF on successful submission
4. ☐ Set up email service (API key, templates)
5. ☐ Create email sending function
6. ☐ Test email delivery
7. ☐ Optional: Store PDF in S3/database
8. ☐ Add "Resend confirmation email" feature

---

## 📋 Implementation Priority

### Phase 1 (Completed) ✅
- [x] Date picker year selection
- [x] Auto-populate school contact info (schema updates)

### Phase 2 (Next Week)
- [ ] California schools database expansion
  - Priority: High schools first (largest group)
  - Then: Community colleges
  - Then: Universities
  - Finally: Trade schools

### Phase 3 (Following Week)
- [ ] Digital signature component
- [ ] PDF generation
- [ ] Email delivery system

---

## 📊 Database Schema Updates Needed

### Schools Table (Already Updated)
```sql
ALTER TABLE schools ADD COLUMN address TEXT;
ALTER TABLE schools ADD COLUMN zip TEXT;
ALTER TABLE schools ADD COLUMN phone TEXT;
```

### Transcript Requests Table
```sql
ALTER TABLE transcript_requests ADD COLUMN signature_data TEXT;
ALTER TABLE transcript_requests ADD COLUMN signature_timestamp INTEGER;
ALTER TABLE transcript_requests ADD COLUMN pdf_url TEXT;
ALTER TABLE transcript_requests ADD COLUMN confirmation_email_sent INTEGER;
```

---

## 🧪 Testing Checklist

### Date Picker
- [ ] Year dropdown appears
- [ ] Can select dates from 100 years ago to today
- [ ] For DOB fields, defaults to ~18 years ago
- [ ] Mobile friendly

### School Auto-fill
- [ ] Address fills when school selected
- [ ] Phone fills when school selected
- [ ] Zip fills when school selected
- [ ] Works for both School Info and Destination steps

### California Schools
- [ ] Can search and find any CA high school
- [ ] Can search community colleges
- [ ] Can search UC/CSU schools
- [ ] Trade schools appear in search

### Digital Signature
- [ ] Signature captures smoothly (mouse)
- [ ] Signature captures smoothly (touch)
- [ ] Clear button works
- [ ] Signature required validation works
- [ ] Signature displays in PDF

### PDF & Email
- [ ] PDF generates with all data
- [ ] PDF includes signature image
- [ ] Email sends successfully
- [ ] PDF attachment opens correctly
- [ ] Email arrives within 1 minute
- [ ] Email lands in inbox (not spam)

---

## 🔐 Security Considerations

### Digital Signature
- Store as base64 encoded PNG
- Include timestamp to prevent replay attacks
- Bind signature to specific request (tracking ID)
- Don't allow editing after submission

### Email
- Use environment variable for API key
- Rate limiting to prevent abuse
- Validate email address format
- Log all email attempts

### PDF
- Don't include full SSN (only partial)
- Secure storage if saving PDFs
- Generate unique tracking IDs
- Include watermark/timestamp

---

## 💰 Cost Estimates

### Email Service
- Resend: $20/month (50,000 emails)
- SendGrid: Free tier (100/day), then $19.95/month
- AWS SES: $0.10 per 1,000 emails

### Storage (if storing PDFs)
- AWS S3: ~$0.023 per GB/month
- Estimate: 100KB per PDF = 10,000 PDFs = 1GB = $0.02/month

### API/Data Sources
- Most education data APIs are free
- NCES/CDE data is public domain

---

## 📝 Next Steps

1. **Immediate:** Create California schools data collection script
2. **This Week:** Load expanded CA schools database
3. **Next Week:** Implement digital signature component
4. **Following Week:** PDF generation and email delivery

Would you like me to proceed with implementing any of these components?
