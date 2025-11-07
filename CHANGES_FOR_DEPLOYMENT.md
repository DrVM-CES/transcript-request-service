# Essential Changes for Successful Netlify Deployment

## Summary
Fixed all TypeScript compilation errors. Build succeeds locally. Ready for deployment.

## Files Changed (13 files)

### 1. netlify.toml ⚠️ CRITICAL
```diff
[build]
-  command = "npm install && npm run build"
+  command = "npm install --save-dev typescript @types/node @types/react @types/react-dom && npm run build"
  publish = ".next"

+[[plugins]]
+  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"
  NPM_VERSION = "10"
-  NETLIFY_SKIP_CACHE = "true"

-[[redirects]]
-  from = "/api/*"
-  to = "/.netlify/functions/api/*"
-  status = 200
-
-[[redirects]]
-  from = "/*"
-  to = "/index.html"
-  status = 200

[functions]
  node_bundler = "esbuild"

# Headers for security (unchanged)
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```

### 2. next.config.js
```diff
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@libsql/client', 'ssh2-sftp-client']
  },
  
-  // Ensure TypeScript path mapping works in production
+  // Ensure TypeScript builds properly
  typescript: {
    ignoreBuildErrors: false,
  },
+  
  // Production optimizations
  compress: true,
  poweredByHeader: false,
+  
+  // Output configuration for Netlify
+  output: 'standalone',
```

### 3. src/app/api/external/status/[requestId]/route.ts
```diff
import { NextRequest, NextResponse } from 'next/server';
+import { eq } from 'drizzle-orm';
import { db } from '../../../../../db';

// Line 38: Fixed variable naming conflict
-    const request_data = await db
+    const requestData = await db
      .select({...})
      .from(transcriptRequests)
      .where(eq(transcriptRequests.id, requestId))
      
-    if (request_data.length === 0) {
+    if (requestData.length === 0) {
      return NextResponse.json(...);
    }
    
-    const request = request_data[0];
+    const requestRecord = requestData[0];

// Use requestRecord instead of request in response
```

### 4. src/app/api/external/submit/route.ts
```diff
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
+import { eq } from 'drizzle-orm';

// Line 178: Fixed where clause
await db.update(transcriptRequests)
  .set({ ... })
-  .where({ id: requestId });
+  .where(eq(transcriptRequests.id, requestId));
```

### 5. src/app/api/health/route.ts
```diff
import { NextRequest, NextResponse } from 'next/server';
+import { sql } from 'drizzle-orm';
import { parchmentSFTP } from '../../../lib/sftp-client';

// Line 18: Fixed database health check
try {
-  await db.$client.execute('SELECT 1');
+  await db.run(sql`SELECT 1`);
  checks.database = true;
```

### 6. src/app/api/submit-request/route.ts
```diff
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
+import { eq } from 'drizzle-orm';

// Line 108 and 119: Fixed where clauses (2 occurrences)
await db.update(transcriptRequests)
  .set({ ... })
-  .where({ id: requestId });
+  .where(eq(transcriptRequests.id, requestId));
```

### 7. src/lib/sftp-client.ts
```diff
+// @ts-ignore - ssh2-sftp-client doesn't have type definitions
import Client from 'ssh2-sftp-client';
```

### 8. src/types/ssh2-sftp-client.d.ts ⭐ NEW FILE
```typescript
declare module 'ssh2-sftp-client' {
  export default class SFTPClient {
    connect(config: any): Promise<void>;
    end(): Promise<void>;
    put(input: Buffer | string, remotePath: string): Promise<string>;
    list(remotePath: string): Promise<any[]>;
  }
}
```

## Other Modified Files
These files have minor changes from UI adjustments or previous work:
- src/app/api/test/route.ts
- src/app/globals.css
- src/app/request/page.tsx
- src/components/TranscriptRequestForm.tsx
- src/components/form-steps/DestinationInfoStep.tsx

## Build Result ✅
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    6.95 kB          94 kB
├ ○ /_not-found                          871 B          87.9 kB
├ ƒ /api/external/status/[requestId]     0 B                0 B
├ ƒ /api/external/submit                 0 B                0 B
├ ○ /api/health                          0 B                0 B
├ ƒ /api/submit-request                  0 B                0 B
├ ƒ /api/test                            0 B                0 B
└ ○ /request                             21.4 kB         108 kB
```

## Next Steps

### Deploy to Netlify:

**Option A: Force push and deploy**
```bash
# If you want to overwrite remote
git push origin main --force

# Then in Netlify dashboard:
# Site Settings → Build & deploy → Clear cache and deploy site
```

**Option B: Create fresh Netlify site**
1. Connect new Netlify site to this repository
2. Build command: `npm install --save-dev typescript @types/node @types/react @types/react-dom && npm run build`
3. Publish directory: `.next`
4. Add environment variables (see below)

### Required Environment Variables in Netlify:
```
DATABASE_URL=libsql://[your-turso-db].turso.io
TURSO_AUTH_TOKEN=[your-token]
MFC_API_KEY=[your-api-key]
NODE_ENV=production

# When available from Parchment:
PARCHMENT_SFTP_HOST=[host]
PARCHMENT_SFTP_USERNAME=[username]
PARCHMENT_SFTP_PASSWORD=[password]
PARCHMENT_SFTP_PATH=/incoming
```

## Verification After Deployment
1. Visit https://[your-site].netlify.app/api/health
2. Test form at https://[your-site].netlify.app/request
3. Verify API at https://[your-site].netlify.app/api/external/submit (with API key)

## Key Lessons from Project Rules Applied
✅ Explicit TypeScript installation in build command
✅ Next.js plugin instead of manual redirects
✅ Proper Drizzle ORM where clauses using eq()
✅ Type declarations for untyped packages
✅ Local build verification before deployment
