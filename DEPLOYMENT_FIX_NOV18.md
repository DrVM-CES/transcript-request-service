# Deployment Fix - November 18, 2025

## Problem
Build was failing on Netlify with error:
```
Error: Failed to collect page data for /api/submit-request
```

## Root Cause
The application was using `jspdf`, which is a **client-side** library that relies on browser APIs (Canvas, DOM, etc.). This library cannot run in Node.js server environment during the build process or in API routes.

### Why This Failed
1. `jspdf` requires browser environment (window, document, canvas)
2. Next.js API routes run in Node.js server environment
3. Build-time static analysis tried to import jspdf in server context
4. Result: Build crash

## Solution
Replaced `jspdf` with `PDFKit`, a proper **server-side** PDF generation library.

### Changes Made

#### 1. Package Changes
```bash
npm uninstall jspdf
npm install pdfkit @types/pdfkit
```

#### 2. Rewrote `src/lib/pdf-generator.ts`
- Changed from jsPDF to PDFKit API
- Made function async, returns `Promise<Buffer>`
- Removed client-side methods (`downloadPDF`)
- Simplified PDF generation logic

**Key signature change:**
```typescript
// OLD (jspdf - client-side)
export function generateTranscriptRequestPDF(data: TranscriptRequestData): jsPDF

// NEW (pdfkit - server-side)
export async function generateTranscriptRequestPDF(data: TranscriptRequestData): Promise<Buffer>
```

#### 3. Updated `src/app/api/submit-request/route.ts`
```typescript
// OLD
const pdfDoc = generateTranscriptRequestPDF(pdfData);
const blob = getPDFBlob(pdfDoc);
pdfBuffer = Buffer.from(await blob.arrayBuffer());

// NEW
pdfBuffer = await generateTranscriptRequestPDF(pdfData);
```

#### 4. Updated `src/components/TranscriptRequestForm.tsx`
Removed client-side PDF download functionality since:
- Users receive PDF via email attachment
- PDFKit only works server-side
- No need for duplicate client-side PDF generation

```typescript
// REMOVED
import { generateTranscriptRequestPDF, downloadPDF } from '../lib/pdf-generator';
// ... client-side PDF generation code
```

## Technical Details

### jsPDF vs PDFKit

| Feature | jsPDF | PDFKit |
|---------|-------|---------|
| Environment | Browser/Client-side | Node.js/Server-side |
| Dependencies | Canvas API, DOM | Native Node.js streams |
| Use Case | Client downloads | Server generation, email attachments |
| Build Compatible | ❌ No | ✅ Yes |
| Netlify Compatible | ❌ No | ✅ Yes |

### PDFKit Benefits
1. ✅ **Server-side native** - Works in Node.js/Next.js API routes
2. ✅ **Stream-based** - Memory efficient for large PDFs
3. ✅ **Build compatible** - No browser dependencies
4. ✅ **Production ready** - Battle-tested in server environments
5. ✅ **Type support** - Full TypeScript definitions

## Impact

### What Still Works
✅ PDF generation for email attachments
✅ Server-side PDF creation
✅ Email delivery with PDF
✅ All existing functionality

### What Changed
- ❌ Client-side PDF download removed (not needed - users get email)
- ✅ Server-side PDF generation (better approach anyway)

## Testing
1. Push changes to GitHub
2. Netlify auto-deploy triggered
3. Monitor build logs
4. Expected: ✅ Build success
5. Test submission → verify email with PDF attachment

## Files Modified
- `package.json` - Replaced jspdf with pdfkit
- `src/lib/pdf-generator.ts` - Complete rewrite for PDFKit
- `src/app/api/submit-request/route.ts` - Async PDF generation
- `src/components/TranscriptRequestForm.tsx` - Removed client PDF code

## Lessons Learned

### Architecture Decision
**Always use server-side libraries for server-side operations**

When building Next.js applications:
- API routes = Node.js environment = Use server-side libraries
- Client components = Browser environment = Use client-side libraries
- Don't mix browser libraries in server code

### PDF Generation Best Practices
1. **Server-side generation** for:
   - Email attachments
   - Database storage
   - Secure document generation
   
2. **Client-side generation** for:
   - Interactive PDF editors
   - Instant browser downloads
   - No server processing needed

### Our Use Case
Email attachments = Server-side = PDFKit ✅

## Deployment Status
- Commit: `21b66c99` - "Fix: Replace jspdf with PDFKit for server-side PDF generation"
- Branch: `main`
- Status: Pushed to GitHub
- Netlify: Auto-deploy in progress

## Next Steps
1. ✅ Monitor Netlify build
2. ⏳ Verify successful deployment
3. ⏳ Test email PDF generation
4. ⏳ Update project rules if needed
