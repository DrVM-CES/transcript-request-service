# Project Rules: My Future Capacity Transcript Request Service

*Last Updated: 2025-11-07*

---

## 🎯 Project Overview

**Purpose:** Electronic transcript request service for high school students to send transcripts to universities  
**Integration:** Standalone Next.js app with API integration to My Future Capacity main application  
**Current Status:** Production deployment active at https://frolicking-horse-f44773.netlify.app  
**Database:** Turso (libSQL) production database operational  
**SFTP:** Simulated mode (awaiting Parchment credentials)

---

## 🏗️ Architecture & Technology Stack

### Core Technologies
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript (.ts/.tsx files throughout)
- **Database:** SQLite (local dev), Turso/libSQL (production)
- **ORM:** Drizzle ORM with schema-first approach
- **Styling:** TailwindCSS with custom MFC brand colors
- **Deployment:** Netlify with manual build commands
- **File Uploads:** SFTP via ssh2-sftp-client (Parchment integration)

### Directory Structure
```
src/
├── app/
│   ├── api/
│   │   ├── health/              # Database & SFTP health monitoring
│   │   ├── debug/               # Environment variable debugging
│   │   ├── submit-request/      # Form submission handler
│   │   └── external/            # API for MFC integration
│   ├── request/                 # Multi-step transcript request form
│   ├── success/                 # Post-submission success page
│   ├── layout.tsx               # Root layout with MFC branding
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles with TailwindCSS
├── components/
│   ├── FormButtons.tsx          # Reusable MFC-styled buttons
│   ├── ProgressIndicator.tsx    # Multi-step form progress bar
│   ├── TranscriptRequestForm.tsx # Main form orchestrator
│   └── form-steps/
│       ├── StudentInfoStep.tsx  # Step 1: Personal information
│       ├── SchoolInfoStep.tsx   # Step 2: High school details
│       ├── DestinationInfoStep.tsx # Step 3: University details
│       └── ConsentStep.tsx      # Step 4: FERPA consent
├── lib/
│   ├── validation.ts            # Zod schemas for type-safe validation
│   ├── pesc-xml-generator.ts    # PESC v1.2.0 XML generation
│   ├── sftp-client.ts           # Parchment SFTP integration
│   └── school-lookup.ts         # School database (TO BE IMPLEMENTED)
└── db/
    ├── index.ts                 # Drizzle client initialization
    └── schema.ts                # Database schema definitions
```

### Critical File Locations
- **Database files:** Must be in `src/db/` for proper Next.js imports
- **API routes:** Must be in `src/app/api/` with `export const runtime = 'nodejs'`
- **TypeScript files:** Use .ts/.tsx extensions (Next.js handles natively)
- **Public assets:** Place in `public/` directory (e.g., MFC logo)

---

## 🎨 Branding & Design System

### My Future Capacity Brand Colors
```typescript
// Primary Colors
purple: '#8B5CF6'    // Main brand color
orange: '#F97316'    // Accent/CTA buttons
blue: '#3B82F6'      // Secondary actions
green: '#16A34A'     // Success states

// Background Gradient (matching MFC app)
background: 'linear-gradient(to bottom, #1a1a2e, #0f0f1a)'

// Text Colors
text-primary: white
text-secondary: gray-300
```

### Typography
- **Base font size:** 16px (increased from 14px for readability)
- **Headings:** font-bold with appropriate scale
- **Body text:** font-normal
- **Font family:** System font stack (via TailwindCSS defaults)

### Component Styling Patterns
- **Cards:** Dark background with subtle borders, rounded corners
- **Buttons:** Gradient backgrounds on primary actions, hover states with scale transforms
- **Inputs:** Dark backgrounds with focus states (purple ring)
- **Spacing:** Consistent padding (p-6 for cards, p-4 for inputs)

### Logo Usage
- **File:** `public/My-Future-Capacity (1).jpg`
- **Placement:** Header and footer
- **Alt text:** "My Future Capacity"

---

## 🗄️ Database Architecture

### Schema Design
```typescript
// src/db/schema.ts
transcriptRequests table:
- id: integer (primary key, autoincrement)
- studentFirstName, studentLastName, studentEmail
- studentPhone, studentDOB, studentSSN (encrypted)
- studentAddress, studentCity, studentState, studentZip
- highSchoolName, highSchoolCEEB, highSchoolAddress
- highSchoolCity, highSchoolState, highSchoolZip
- destinationName, destinationType, destinationCEEB
- destinationAddress, destinationCity, destinationState, destinationZip
- attendanceStart, attendanceEnd, graduationDate
- requestPurpose, deliveryMethod
- consentGiven (boolean), consentTimestamp
- ipAddress, userAgent (FERPA compliance)
- pescXmlGenerated (boolean), pescXmlPath
- uploadedToParchment (boolean), uploadTimestamp
- status: pending | processing | sent | failed
- createdAt, updatedAt
```

### Database Connections

**Local Development:**
```typescript
// DATABASE_URL in .env.local
file:.data/dev.db
```

**Production (Turso):**
```typescript
// Set in Netlify environment variables
DATABASE_URL=libsql://transcript-requests-prod-jamie32872.aws-us-west-2.turso.io
TURSO_AUTH_TOKEN=[auth token]
```

### Migration Patterns
- **Development:** `npm run db:push` (Drizzle direct push)
- **Production:** Proper migrations via `drizzle-kit generate` then `drizzle-kit migrate`
- **Schema changes:** Always test locally first, then deploy to production

### Health Check Implementation
```typescript
// Correct method (uses Drizzle select)
await db.select().from(transcriptRequests).limit(1)

// NEVER use (throws error)
await db.query.transcriptRequests.findFirst() // ❌
```

---

## 🚀 Deployment Architecture (Netlify)

### Critical Build Configuration

**Build Command (Set in Netlify Dashboard):**
```bash
npm install --save-dev typescript @types/node @types/react @types/react-dom && npm run build
```

**Why this is required:**
- Netlify doesn't always install TypeScript from package.json devDependencies
- Next.js detects .ts/.tsx files and requires TypeScript package
- Explicit installation in build command ensures TypeScript availability

**Publish Directory:**
```
out
# OR leave empty (not .next for manual builds)
```

### Netlify Runtime Considerations
- **Avoid Next.js Runtime:** Automatic runtime can override configurations
- **Manual builds preferred:** Use explicit build commands for better control
- **Cache management:** Use "Clear cache and deploy site" for config changes
- **Environment variables:** Set in Netlify dashboard, not .env files

### TypeScript Deployment Requirements
- **Critical:** Next.js requires TypeScript when .ts/.tsx files exist
- **Solution:** Explicitly install in build command (see above)
- **Config files:** tsconfig.json and next-env.d.ts are optional but recommended
- **devDependencies:** TypeScript must be in package.json AND build command

### Import Path Patterns for Netlify

**❌ NEVER USE (Unreliable on Netlify):**
```typescript
import { db } from '@/db'
import { generatePESCXML } from '@/lib/pesc-xml-generator'
```

**✅ ALWAYS USE (Reliable):**
```typescript
import { db } from '../../../../db'
import { generatePESCXML } from '../../../../lib/pesc-xml-generator'
```

**Reason:** Netlify's build process doesn't consistently resolve TypeScript path mappings

### Production Dependencies Management

**Must be in `dependencies` (not devDependencies):**
- tailwindcss
- postcss
- autoprefixer
- @tailwindcss/forms (if used)

**Must be in `devDependencies` AND build command:**
- typescript
- @types/node
- @types/react
- @types/react-dom

### CSS and Styling for Deployment
- **TailwindCSS:** Must be properly configured in postcss.config.js
- **Directives:** Never comment out @tailwind directives in globals.css
- **Processing:** PostCSS required in production dependencies
- **Config files:** Ensure postcss.config.js and tailwind.config.ts are committed

---

## 🔐 Environment Variables

### Production Environment (Netlify Dashboard)

```bash
# Database
DATABASE_URL=libsql://transcript-requests-prod-jamie32872.aws-us-west-2.turso.io
TURSO_AUTH_TOKEN=[secret token]

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://frolicking-horse-f44773.netlify.app

# Security
ENCRYPTION_SECRET=pPu5QbJLrGPjkNGDr3Oh5QZxosIw4ZRS
MFC_API_KEY=JO8bFFYapQP9w0R99ANB4SjdNoE4jNow

# SFTP (when available)
PARCHMENT_SFTP_HOST=[pending]
PARCHMENT_SFTP_USERNAME=[pending]
PARCHMENT_SFTP_PASSWORD=[pending]
PARCHMENT_SFTP_PORT=22
```

### Local Development (.env.local)

```bash
DATABASE_URL=file:.data/dev.db
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENCRYPTION_SECRET=[local secret]
MFC_API_KEY=[local key]

# SFTP simulation mode (no credentials needed)
```

### Environment Variable Access Patterns

**Server-side only:**
```typescript
process.env.DATABASE_URL
process.env.TURSO_AUTH_TOKEN
process.env.ENCRYPTION_SECRET
```

**Client-side accessible (NEXT_PUBLIC_ prefix):**
```typescript
process.env.NEXT_PUBLIC_APP_URL
```

---

## 📡 API Architecture

### Internal API Endpoints

**POST /api/submit-request**
- Purpose: Handle transcript request form submissions
- Authentication: None (public endpoint)
- Request body: Complete transcript request data
- Response: Request ID and status
- Side effects: Database insert, PESC XML generation, SFTP upload

**GET /api/health**
- Purpose: Monitor database and SFTP connectivity
- Authentication: None (public health check)
- Response: Status of database and SFTP connections
- Use case: Monitoring, debugging, deployment verification

**GET /api/debug**
- Purpose: Environment variable verification (development only)
- Authentication: None (should be removed in production)
- Response: Redacted environment variable list
- Use case: Deployment troubleshooting

### External API Endpoints (MFC Integration)

**POST /api/external/submit**
- Purpose: Accept pre-populated student data from MFC app
- Authentication: x-api-key header (MFC_API_KEY)
- Request body: Student profile, school info, destination selection
- Response: Request ID and submission status
- Integration effort: 2-3 hours to connect MFC button

**GET /api/external/status/{requestId}**
- Purpose: Check transcript request status
- Authentication: x-api-key header
- Response: Current status, timestamp, delivery information
- Use case: Status tracking in MFC app dashboard

### API Contract Standards

**Request format:**
```typescript
{
  student: { firstName, lastName, email, dob, ... },
  highSchool: { name, ceeb, address, ... },
  destination: { name, ceeb, type, address, ... },
  attendance: { startDate, endDate, graduationDate },
  consent: { given: boolean, timestamp: string }
}
```

**Response format:**
```typescript
// Success
{
  success: true,
  requestId: "uuid",
  status: "pending" | "processing" | "sent" | "failed"
}

// Error
{
  success: false,
  error: "Error message",
  fieldErrors?: { fieldName: ["error details"] }
}
```

### Authentication Pattern
```typescript
// Header validation
const apiKey = request.headers.get('x-api-key')
if (apiKey !== process.env.MFC_API_KEY) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
```

---

## 📋 PESC Standards Implementation

### PESC TranscriptRequest v1.2.0 Compliance

**Required XML elements:**
- TransmissionData: Document ID, creation date, sender/receiver info
- Student: Name, DOB, SSN, contact info
- SchoolAttended: High school details, CEEB code, attendance dates
- TranscriptDestination: University details, CEEB code, purpose
- ReleaseAuthorizedIndicator: FERPA consent confirmation

### Document ID Generation
```typescript
// UUID v4 format with hyphens removed
const documentId = crypto.randomUUID().replace(/-/g, '')
// Result: 32 alphanumeric characters (e.g., "a1b2c3d4e5f6...")
```

### File Naming Convention
```typescript
const fileName = `PESC${timestamp}_${firstName}_${lastName}_request.xml`
// Example: PESC20251107_143022_John_Smith_request.xml
// Format: PESC[YYYYMMDD]_[HHMMSS]_[FirstName]_[LastName]_request.xml
```

### XML Generation Implementation
```typescript
// src/lib/pesc-xml-generator.ts
export function generatePESCXML(requestData: TranscriptRequest): string {
  // Build XML with proper PESC namespaces
  // Include all required elements
  // Validate data before generation
  // Return XML string
}
```

---

## 📤 Parchment SFTP Integration

### Connection Configuration

**Development Mode (Simulation):**
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('SFTP: Simulated upload to Parchment')
  console.log('File:', fileName)
  return { success: true, simulated: true }
}
```

**Production Mode (Real SFTP):**
```typescript
const config = {
  host: process.env.PARCHMENT_SFTP_HOST,
  port: parseInt(process.env.PARCHMENT_SFTP_PORT || '22'),
  username: process.env.PARCHMENT_SFTP_USERNAME,
  password: process.env.PARCHMENT_SFTP_PASSWORD
}
```

### Upload Process
1. Generate PESC XML file
2. Save to temporary location
3. Connect to Parchment SFTP server
4. Upload to `/incoming` directory
5. Verify upload success
6. Update database status
7. Clean up temporary file

### Error Handling Patterns
```typescript
try {
  await sftp.connect(config)
  await sftp.put(localPath, remotePath)
  return { success: true }
} catch (error) {
  console.error('SFTP upload failed:', error)
  // Update request status to 'failed'
  // Log error for debugging
  // Return graceful error response
}
```

### Parchment Contact Information
- **Technical Support:** Maggie West, Kim Underwood (Instructure)
- **Purpose:** Obtain SFTP credentials for production
- **Pending:** Host, username, password, upload directory path
- **Timeline:** Required before production SFTP can be enabled

---

## ⚖️ FERPA Compliance Requirements

### Legal Compliance Patterns

**Consent Recording:**
- Must display complete FERPA disclosure text
- Student must actively acknowledge consent
- Record timestamp of consent
- Log IP address and user agent
- Store consent status in database

**Data Retention:**
- All requests logged with full audit trail
- Timestamps for creation, updates, submission
- IP address and user agent for each request
- Retention period: [to be determined based on state law]

**Student Rights Disclosure:**
- Right to inspect and review education records
- Right to request amendment of records
- Right to consent to disclosure (with exceptions)
- Right to file complaints with Department of Education
- Process for revoking consent

### FERPA Text (from ConsentStep.tsx)
```
By electronically signing this form, I authorize my high school to release 
my academic records to the educational institution(s) I have specified above.

I understand that:
1. This authorization is voluntary
2. I may revoke this authorization at any time by contacting my high school
3. Once records are released, the receiving institution may further disclose them
4. This authorization expires one year from the date of signature
```

### Security Implementation
- **Data encryption:** Sensitive fields encrypted in database
- **Input validation:** Server-side validation via Zod schemas
- **Access logging:** All data access tracked for compliance
- **Privacy protection:** Minimize data collection to required fields

### Audit Trail Requirements
```typescript
// Every request must include:
{
  consentGiven: boolean,
  consentTimestamp: string,
  ipAddress: string,
  userAgent: string,
  createdAt: string,
  updatedAt: string
}
```

---

## 🔧 Development Workflow

### Version Control Standards

**Git Workflow:**
```bash
git status                    # Always check before committing
git add -A                    # Stage all changes
git commit -m "descriptive message"
git push origin main
# ⚠️ CRITICAL: Verify on GitHub web interface!
```

**Critical Git Pattern:**
- Git commands can fail silently
- Always verify changes appear on GitHub after pushing
- Netlify deploys from GitHub, not local files
- If deployment shows old code, check GitHub first

**Branch Strategy:**
- `main` branch: Production-ready code
- `feature/*` branches: New features in development
- Commit early and often
- Merge to main only after testing

**Files to Track:**
```
.gitignore should exclude:
- node_modules/
- .next/
- .env.local
- .data/
- out/

Must track:
- netlify.toml
- .env.production.example
- All config files (tsconfig.json, next.config.js, etc.)
```

### Build and Test Patterns

**Local Testing Workflow:**
```bash
# 1. Install dependencies
npm install

# 2. Test development build
npm run dev

# 3. Test production build (critical!)
npm run build

# 4. Run production locally
npm start

# 5. Check health endpoint
curl http://localhost:3000/api/health
```

**Pre-Deployment Checklist:**
- ✅ Local production build successful
- ✅ All environment variables set in Netlify
- ✅ Database health check passing
- ✅ No TypeScript errors
- ✅ All imports use relative paths (not @/ aliases)
- ✅ Changes verified on GitHub
- ✅ TailwindCSS properly configured

### Debugging Netlify Deployments

**When deployment fails:**
1. **Scroll through entire error log** (don't trust truncated errors)
2. **Check GitHub** to verify code changes are present
3. **Run `npm run build` locally** to reproduce errors
4. **Check Netlify environment variables** for missing/incorrect values
5. **Clear cache** and redeploy if config changed
6. **Verify TypeScript** is in devDependencies and build command

**Common Issues and Solutions:**
- **503 errors:** Database connection issue, check DATABASE_URL
- **TypeScript errors:** Verify TypeScript in build command
- **Import errors:** Switch from @/ aliases to relative paths
- **CSS not loading:** Check TailwindCSS in production dependencies
- **Old code deployed:** Verify changes are on GitHub

---

## 🎯 Implementation Status

### ✅ Completed Features

**Infrastructure:**
- Next.js 15 app with App Router
- Turso production database (transcript-requests-prod-jamie32872.aws-us-west-2.turso.io)
- Netlify deployment (https://frolicking-horse-f44773.netlify.app)
- Database health monitoring
- SFTP client (simulation mode)

**UI/UX:**
- Multi-step transcript request form (4 steps)
- MFC brand colors and gradient background
- Official MFC logo integration
- Responsive design with TailwindCSS
- Form validation with Zod schemas
- Success page with navigation
- Progress indicator
- Modern button components (FormButtons.tsx)
- 16px base font size for readability

**Form Steps:**
1. Student Information (personal details, DOB, SSN)
2. School Information (high school details, attendance dates)
3. Destination Information (university details, purpose)
4. Consent (FERPA disclosure and authorization)

**API Endpoints:**
- POST /api/submit-request (form submission)
- GET /api/health (system monitoring)
- GET /api/debug (environment check)
- Prepared: /api/external/* (MFC integration)

**Data Processing:**
- PESC XML generation (v1.2.0 compliant)
- Database storage with audit trail
- SFTP upload simulation
- IP address and user agent logging

### 🚧 In Progress / Next Priority

**Phase 1 - Critical (Next Steps):**

1. **School Database with Autocomplete**
   - Comprehensive high school database
   - University database with CEEB codes
   - Autocomplete search (by name, location, CEEB)
   - Auto-fill school details from database
   - Implementation: src/lib/school-lookup.ts

2. **Date Pickers**
   - Date of Birth selector (calendar UI)
   - Attendance start/end dates
   - Graduation date
   - Library: react-day-picker or similar
   - Validation: Past dates only (no future DOB)

3. **Match MFC App UI More Closely**
   - Font family alignment
   - Card styling refinement
   - Spacing/padding consistency
   - Animation patterns
   - Mobile responsiveness improvements

**Phase 2 - Important:**

4. **Parental Consent Workflow**
   - Age detection (under 18 requires parent consent)
   - Parent email collection
   - Consent email with secure link
   - Parent authorization form
   - Database schema update for parent records

5. **Content Pages**
   - About Us page
   - FAQ page (common questions about transcript requests)
   - Privacy Policy (FERPA compliance)
   - Terms of Service
   - Contact information

6. **Navigation Improvements**
   - Link back to My Future Capacity app
   - Header navigation menu
   - Footer with links
   - Breadcrumbs

**Phase 3 - Advanced Features:**

7. **User Authentication**
   - Better Auth integration (already in package.json)
   - Student login/registration
   - Email verification
   - Password reset flow

8. **Student Dashboard**
   - View submitted transcript requests
   - Track delivery status
   - Download submitted forms
   - Request history

9. **MFC Client Verification System**
   - API endpoint for client verification
   - Client ID validation
   - Discount/free service for MFC clients
   - Integration with MFC user database

10. **Payment Integration**
    - $5.99 fee for non-MFC clients
    - Stripe or similar payment processor
    - Receipt generation
    - Refund handling

11. **Tiered Service Options**
    - Standard delivery (free for MFC clients)
    - Rush delivery (premium option)
    - Multiple transcript copies
    - Additional services

**Phase 4 - External Dependencies:**

12. **Parchment SFTP Integration**
    - Obtain production SFTP credentials
    - Test connection and upload
    - Enable real transcript delivery
    - Monitor delivery status
    - Error handling and retries

13. **MFC App Integration**
    - Connect existing MFC transcript button
    - API authentication
    - Data flow from MFC to transcript service
    - Status updates back to MFC dashboard
    - Estimated effort: 2-3 hours

---

## 📈 Timeline & Milestones

### Rapid Deployment Strategy (Original Plan)
- **Day 1:** Infrastructure setup ✅ (Complete)
- **Day 2:** MFC integration (2-3 hours) ⏳ (Pending MFC coordination)
- **Day 3:** External dependencies ⏳ (Pending Parchment credentials)
- **Day 4:** End-to-end testing 📋 (Next)
- **Day 5:** Production go-live 🎯 (Soft launch complete)

### Current Milestone Targets

**Immediate (This Week):**
- Implement school database with autocomplete
- Add date pickers to all date fields
- Create FAQ and Privacy Policy pages

**Short-term (Next 2 Weeks):**
- Parental consent workflow
- Student dashboard (basic version)
- MFC app integration

**Medium-term (Next Month):**
- Payment integration
- Better Auth implementation
- Parchment SFTP production credentials

**Long-term (Future):**
- Tiered service options
- Advanced dashboard features
- Analytics and reporting

---

## 🔍 Lessons Learned from Deployment

### Git Verification is Critical
- **Issue:** Git commands appeared to succeed but failed silently
- **Solution:** Always verify changes on GitHub web interface after push
- **Impact:** Netlify deploys from GitHub, not local files
- **Pattern:** If deployment shows old code, check GitHub first

### Netlify Build System Quirks
- **Automatic runtimes** can override configurations unpredictably
- **Environment variables** like SKIP_TYPE_CHECK don't always work
- **TypeScript detection** based on file extensions, not config files
- **Manual builds** with explicit commands more reliable than auto-detection

### TypeScript in Production
- **package.json devDependencies not enough** for Netlify builds
- **Must explicitly install** TypeScript in build command
- **Next.js always requires TypeScript** when .ts/.tsx files present
- **Removing tsconfig.json** doesn't disable TypeScript checking

### Import Path Resolution
- **Path aliases (@/*)** unreliable in Netlify builds
- **Relative imports** more verbose but significantly more reliable
- **Worth the extra typing** for deployment reliability
- **Update all imports** before production deployment

### Database Health Checks
- **Wrong Drizzle method** caused deployment failures
- **Correct pattern:** `db.select().from(table).limit(1)`
- **Incorrect pattern:** `db.query.table.findFirst()` (throws error)
- **Always test** database operations in production environment

### TailwindCSS Configuration
- **Must be in production** dependencies, not devDependencies
- **PostCSS required** in production for TailwindCSS processing
- **Never comment out** @tailwind directives in globals.css
- **Config files** must be committed to repository

### Form Validation Improvements
- **ZIP codes** now truly optional (removed regex when empty)
- **User experience** improved with clear field requirements
- **Error messages** more helpful and specific
- **Client-side** and server-side validation must match

---

## 📞 Stakeholder Communication

### Technical Documentation
- **API integration guide** for MFC developers (prepared)
- **Environment setup** instructions for team members
- **Deployment process** documentation (this file)
- **FERPA compliance** checklist for legal review

### External Coordination
- **Parchment support:** Maggie West, Kim Underwood (Instructure)
- **Purpose:** SFTP credentials for production transcript delivery
- **Status:** Awaiting response
- **Impact:** Blocking real transcript delivery (simulation mode works)

### Production Readiness Communication
- **Current status:** Soft launch complete, accepting submissions
- **Database:** Operational and monitored
- **API:** Functional and ready for MFC integration
- **SFTP:** Simulated (waiting on Parchment credentials)
- **Next steps:** School database, date pickers, parental consent

---

## 🛡️ Security & Privacy

### Data Protection
- **Sensitive data encryption:** SSN and other PII encrypted at rest
- **HTTPS:** All traffic encrypted in transit (Netlify SSL)
- **API authentication:** x-api-key header for external API
- **Input sanitization:** All user inputs validated and sanitized

### FERPA Compliance
- **Consent tracking:** Every request records consent timestamp
- **Audit trail:** IP address, user agent, all actions logged
- **Data minimization:** Only collect necessary information
- **Student rights:** Clear disclosure of rights and revocation process

### Environment Security
- **Secrets management:** Never commit .env files
- **Environment variables:** Set in Netlify dashboard
- **API keys rotation:** Regular rotation of MFC_API_KEY
- **Database access:** Production database uses auth tokens

---

## 📊 Monitoring & Maintenance

### Health Monitoring
- **Endpoint:** GET /api/health
- **Checks:** Database connectivity, SFTP status
- **Frequency:** On-demand (could add automated monitoring)
- **Alerts:** [To be implemented]

### Database Maintenance
- **Backups:** Turso automatic backups (verify schedule)
- **Schema updates:** Always test locally first
- **Data retention:** Define policy for old requests
- **Performance:** Monitor query performance as data grows

### Deployment Monitoring
- **Netlify dashboard:** Monitor build success/failure
- **Error tracking:** Consider Sentry or similar (not yet implemented)
- **Usage metrics:** Track API usage, form submissions
- **Performance:** Monitor page load times, API response times

---

## 🎓 Project-Specific Patterns

### Form State Management
- Multi-step form uses local state in TranscriptRequestForm.tsx
- Each step validates independently
- Progress indicator shows current step
- Data persists across steps until submission

### API Error Handling
- Consistent JSON error responses
- Field-level validation errors (Zod)
- HTTP status codes: 200 (success), 400 (validation), 500 (server error)
- Graceful degradation (SFTP failures don't break submission)

### Component Organization
- Reusable components in src/components/
- Step components in src/components/form-steps/
- Each step is self-contained with own validation
- Shared types defined in src/lib/validation.ts

---

## 📝 Notes for Future Developers

### When Adding New Form Fields
1. Update Zod schema in src/lib/validation.ts
2. Update database schema in src/db/schema.ts
3. Run `npm run db:push` to update database
4. Update appropriate form step component
5. Update PESC XML generator if field should be in XML
6. Test validation on both client and server side

### When Modifying API Endpoints
1. Consider impact on MFC integration
2. Update API documentation
3. Test with curl or Postman
4. Update error handling
5. Log changes for audit trail

### When Deploying Changes
1. Test production build locally (`npm run build`)
2. Commit and push to GitHub
3. Verify changes on GitHub web interface
4. Deploy to Netlify (auto-deploy or manual)
5. Test deployed site immediately
6. Check /api/health endpoint
7. Monitor Netlify logs for errors

### When Troubleshooting Issues
1. Check Netlify deployment logs first
2. Verify environment variables are set
3. Test database connection via /api/health
4. Check browser console for client-side errors
5. Review server logs (Netlify Functions tab)
6. Verify GitHub has latest code
7. Try "Clear cache and deploy site" on Netlify

---

## 🔗 Important Links

### Production Resources
- **Live Site:** https://frolicking-horse-f44773.netlify.app
- **Netlify Dashboard:** [Login required]
- **Turso Database:** transcript-requests-prod-jamie32872.aws-us-west-2.turso.io
- **GitHub Repository:** [Your repository URL]

### Development Resources
- **Next.js Docs:** https://nextjs.org/docs
- **Drizzle ORM Docs:** https://orm.drizzle.team
- **TailwindCSS Docs:** https://tailwindcss.com/docs
- **PESC Standards:** https://www.pesc.org/transcriptrequest.html
- **Turso Docs:** https://docs.turso.tech

### My Future Capacity
- **Main App:** [URL needed]
- **API Documentation:** [To be created]
- **Integration Guide:** [To be created]

---

*This document is a living resource. Update it as the project evolves.*
