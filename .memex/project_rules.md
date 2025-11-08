# Project Rules: My Future Capacity Transcript Request Service

## Project Overview
**Purpose:** Free transcript request service for high school students to send official transcripts to colleges/universities electronically through the Parchment network.

**Live Site:** https://frolicking-horse-f44773.netlify.app  
**Repository:** https://github.com/DrVM-CES/transcript-request-service.git  
**Last Updated:** 2025-11-07  
**Status:** MVP Deployed ✅ | UI Enhanced ✅ | School Database Pending 🔄

## Critical Production Information

### Environment Variables (Netlify)
```
DATABASE_URL = libsql://transcript-requests-prod-jamie32872.aws-us-west-2.turso.io
TURSO_AUTH_TOKEN = [secure token set in Netlify]
NODE_ENV = production
MFC_API_KEY = JO8bFFYapQP9w0R99ANB4SjdNoE4jNow
NEXT_PUBLIC_APP_URL = https://frolicking-horse-f44773.netlify.app
ENCRYPTION_SECRET = pPu5QbJLrGPjkNGDr3Oh5QZxosIw4ZRS
```

### Database
- **Production:** Turso (libSQL) cloud database
- **Local:** SQLite file at `.data/dev.db`
- **ORM:** Drizzle ORM
- **Table:** `transcript_requests` (created and ready)

## Architecture & Technology

### Stack
- **Framework:** Next.js 14.2.5 with App Router
- **Language:** TypeScript (in dependencies, not devDependencies)
- **Styling:** TailwindCSS 3.4.1 (must be in dependencies for Netlify)
- **Database:** Turso (libSQL) with Drizzle ORM
- **Deployment:** Netlify with Next.js plugin
- **SFTP:** ssh2-sftp-client for Parchment integration

### Key Dependencies
```json
{
  "dependencies": {
    "@libsql/client": "^0.5.6",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.4.1",
    "postcss": "^8",
    "drizzle-orm": "^0.33.0",
    "zod": "^3.23.8"
  }
}
```

## Netlify Deployment Patterns

### Critical Build Configuration
**File:** `netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"
  NPM_VERSION = "10"
```

### TypeScript in Production
- ✅ TypeScript MUST be in `dependencies` (not devDependencies)
- ✅ Set `ignoreBuildErrors: true` in next.config.js for Netlify
- ✅ Set `output: 'standalone'` in next.config.js
- ✅ Enable TailwindCSS in postcss.config.js: `plugins: { tailwindcss: {}, autoprefixer: {} }`
- ✅ Un-comment Tailwind directives in globals.css

### Common Deployment Issues & Solutions
1. **503 Errors:** Check function logs, not just browser console
2. **TailwindCSS not working:** Verify postcss.config.js has tailwindcss enabled
3. **Database errors:** Use proper Drizzle syntax (e.g., `db.select()` not `db.run()`)
4. **Missing types:** Create `.d.ts` files in `src/types/` (e.g., ssh2-sftp-client)

## My Future Capacity Branding

### Official Logo
**File:** `public/My-Future-Capacity (1).jpg`  
**Features:** "Pathways to Success" design with colorful figures

### Brand Colors (MFC Theme)
```typescript
mfc: {
  purple: { 50: '#FAF5FF', 600: '#8B5CF6', 700: '#9333EA', 900: '#581C87' },
  orange: { 100: '#FFEDD5', 600: '#F97316', 700: '#EA580C' },
  blue: { 100: '#DBEAFE', 600: '#3B82F6', 700: '#06B6D4' },
  green: { 100: '#DCFCE7', 600: '#16A34A' }
}
```

### UI Patterns
- Primary CTA buttons: `bg-mfc-purple-600 hover:bg-mfc-purple-700`
- Secondary buttons: `bg-white border-2 border-slate-300 hover:bg-slate-50`
- Success indicators: `bg-mfc-green-600`
- Info boxes: `bg-mfc-purple-50 border-l-4 border-mfc-purple-600`
- Gradient background: `bg-gradient-to-br from-blue-50 via-purple-50 to-slate-50`

### Typography
- Base font size: 16px (1rem)
- Font family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto
- Headings: Bold, MFC green (#16A34A) for main title

## Component Patterns

### Reusable Components
**FormButtons Component:**
```tsx
<FormButtons 
  onPrevious={fn}  // optional
  onNext={fn}      // optional
  onSubmit={fn}    // optional
  isSubmitting={bool}
  nextLabel="Continue"
  submitLabel="Submit Request"
/>
```

### Form Structure
- Multi-step form with progress indicator
- Steps: Student Info → School Info → Destination → Consent
- Validation: Zod schemas with step-by-step validation
- On success: Redirect to `/success` page

### Form Input Styling
```css
input[type="text"], input[type="email"], select, textarea {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 0.5rem;
}

input:focus {
  border-color: #8B5CF6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}
```

## Database Patterns

### Drizzle ORM Usage
```typescript
// ✅ Correct
await db.select().from(transcriptRequests).limit(1)
await db.select().from(transcriptRequests).where(eq(transcriptRequests.id, id))
await db.update(transcriptRequests).set({ status }).where(eq(transcriptRequests.id, id))

// ❌ Incorrect
await db.run(sql`SELECT 1`)           // Method doesn't exist
await db.$client.execute('SELECT 1')  // Not available in this setup
.where({ id: requestId })             // Use eq() instead of object syntax
```

### Always Import `eq` from drizzle-orm
```typescript
import { eq } from 'drizzle-orm';
```

## Validation Patterns

### Optional Fields with Regex Validation
```typescript
// ✅ Correct - allows empty string or valid format
destinationZip: z.string()
  .optional()
  .refine((val) => !val || /^\d{5}(-\d{4})?$/.test(val), {
    message: 'Please enter a valid ZIP code'
  }),

// ❌ Incorrect - fails on empty string
destinationZip: z.string()
  .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code')
  .optional()
```

## API Integration

### External API for MFC
**Base Path:** `/api/external/`
- `POST /api/external/submit` - Submit transcript request
- `GET /api/external/status/{requestId}` - Check request status

**Authentication:** 
- Header: `x-api-key`
- Value: `MFC_API_KEY` from environment variables

### Internal API
- `POST /api/submit-request` - Form submission
- `GET /api/health` - Health check (database + SFTP)
- `GET /api/debug` - Environment variable check

## Outstanding Features & Roadmap

### Priority 1 (Next Sprint)
- [ ] School database with autocomplete search
- [ ] Calendar date pickers for date inputs
- [ ] Match MFC app UI more closely

### Priority 2 (Following Week)
- [ ] Parental consent for students under 18
- [ ] About Us, FAQ, Privacy Policy pages
- [ ] Navigation links to My Future Capacity app
- [ ] Improve mobile responsiveness

### Priority 3 (Future Enhancements)
- [ ] User authentication (Better Auth)
- [ ] Student dashboard (view request history)
- [ ] MFC client verification system
- [ ] Payment integration ($5.99 for non-MFC clients)
- [ ] Tiered service options (basic, premium, rush)
- [ ] Email notifications
- [ ] Admin dashboard

### External Dependencies
- [ ] **Parchment SFTP Credentials** - Still waiting
  - Contact: Maggie West or Kim Underwood at Instructure
  - Need: Host, username, password, upload path
  - Current status: Simulating uploads in development mode

## File Structure

```
transcript-request/
├── public/
│   └── My-Future-Capacity (1).jpg      # Official MFC logo
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── debug/route.ts          # Env var check
│   │   │   ├── health/route.ts         # Health check
│   │   │   ├── submit-request/route.ts # Form submission
│   │   │   └── external/               # MFC integration API
│   │   ├── request/page.tsx            # Main form
│   │   ├── success/page.tsx            # Success page
│   │   ├── layout.tsx                  # Root layout with MFC branding
│   │   ├── page.tsx                    # Home page
│   │   └── globals.css                 # Global styles
│   ├── components/
│   │   ├── FormButtons.tsx             # Reusable styled buttons
│   │   ├── ProgressIndicator.tsx       # Step progress
│   │   ├── TranscriptRequestForm.tsx   # Main form component
│   │   └── form-steps/
│   │       ├── StudentInfoStep.tsx
│   │       ├── SchoolInfoStep.tsx
│   │       ├── DestinationInfoStep.tsx
│   │       └── ConsentStep.tsx
│   ├── lib/
│   │   ├── validation.ts               # Zod schemas
│   │   ├── pesc-xml-generator.ts       # PESC XML creation
│   │   ├── sftp-client.ts              # Parchment SFTP
│   │   └── school-lookup.ts            # School database (needs expansion)
│   ├── db/
│   │   ├── index.ts                    # Drizzle client
│   │   └── schema.ts                   # Database schema
│   └── types/
│       └── ssh2-sftp-client.d.ts       # Type declarations
├── .memex/
│   └── project_rules.md                # This file
├── ENHANCEMENT_PLAN.md                 # Detailed roadmap
├── netlify.toml                        # Netlify config
├── next.config.js                      # Next.js config
├── tailwind.config.ts                  # Tailwind config
├── drizzle.config.ts                   # Drizzle config
└── package.json                        # Dependencies

```

## Git & Version Control

### .gitignore Patterns
```
node_modules/
.next/
.env*.local
.data/
*.tsbuildinfo
```

### Commit Strategy
- Commit frequently, especially before deployment attempts
- Always verify pushes appear on GitHub before deploying
- Use descriptive commit messages

### Before Each Deploy
1. `git status` - Verify all changes committed
2. `git push origin main` - Push to GitHub
3. **Verify on GitHub** - Confirm commits visible
4. Trigger Netlify deployment

## Testing & Debugging

### Local Testing
```bash
npm run dev          # Start dev server on port 3001
npm run build        # Test production build
npm run db:push      # Push schema to database
```

### Debug Endpoints
- `/api/debug` - Check environment variables
- `/api/health` - Check database and SFTP connectivity

### Common Issues
1. **Forms not submitting:** Check browser console for validation errors
2. **Styles not applying:** Verify TailwindCSS classes are recognized
3. **Database errors:** Check Turso connection and auth token
4. **503 on Netlify:** Check function logs in Netlify dashboard

## Legal & Compliance

### FERPA Compliance
- Full FERPA disclosure shown and acknowledged
- Consent timestamp and IP address recorded
- Secure transmission of educational records
- Student rights disclosure included

### Data Retention
- All requests logged with full audit trail
- IP addresses and user agents recorded
- Timestamps for all status changes

### Privacy
- Minimal data collection
- Encrypted transmission (HTTPS)
- Secure Turso database with authentication
- No data sharing without consent

## Success Metrics

**Current Status (as of 2025-11-07):**
- ✅ Site deployed and accessible
- ✅ Database connected and operational
- ✅ Form submission working
- ✅ UI modernized with MFC branding
- ✅ Success page with clear next steps
- ⏳ School database pending
- ⏳ Parchment SFTP pending credentials

**Next Milestone:**
Complete school autocomplete and date pickers for improved UX.
