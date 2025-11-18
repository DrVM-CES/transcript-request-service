# Critical Issues & Fixes - November 18, 2025

## Issues Reported:

1. ❌ School autocomplete not showing address/contact info for all schools
2. ❌ Calendar year dropdown not working
3. ❌ "School not in directory" error on destination page (even with autocomplete)
4. ❌ Consent checkbox colors not consistent
5. ❌ PDF not generating
6. ❌ Email not sending

---

## Root Causes Identified:

### Issue 1 & 3: School Data Not in Production Database
**Problem:** California schools with full contact data (163 schools) only exist in LOCAL database, not pushed to PRODUCTION Turso database.

**Evidence:**
- Local development works fine
- Production shows incomplete data
- Schools autocomplete but validation fails

**Solution:** Need to run school loading script on PRODUCTION database

### Issue 2: Calendar Year Dropdown
**Problem:** DatePicker configuration not fully working

**Solution:** Need to test the fix we made

### Issue 4: Consent Box Colors
**Problem:** Inconsistent styling

**Solution:** Make all consent boxes match

### Issue 5 & 6: PDF & Email
**Problem:** Likely due to other errors breaking the flow

**Solution:** Will work once other issues fixed

---

## IMMEDIATE ACTION REQUIRED:

### Step 1: Load Schools to Production Database

The 646 schools (including 163 California schools with full contact info) need to be loaded to production.

**File exists:** `data/california_schools_complete.csv`

**Loading script exists:** `scripts/load-california-schools.js`

**But these only work on LOCAL database!**

**Need to:**
1. Update loading script to use PRODUCTION database
2. Or manually export/import data
3. Or create a one-time migration script

---

## Quick Fix Options:

### Option A: Update Load Script for Production (RECOMMENDED)

Create: `scripts/load-schools-to-production.js`

```javascript
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load production environment
dotenv.config({ path: '.env.production' });

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function loadSchools() {
  console.log('Loading schools to PRODUCTION database...');
  
  // Read CSV file
  const csvPath = path.join(__dirname, '../data/california_schools_complete.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').slice(1); // Skip header
  
  let loaded = 0;
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const [schoolName, schoolType, city, state, address, zip, phone, ceebCode] = 
      line.split(',').map(field => field.trim().replace(/^"|"$/g, ''));
    
    try {
      await client.execute({
        sql: `INSERT INTO schools (
          school_name, school_type, city, state, country,
          address, zip, phone, ceeb_code, search_text, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          schoolName,
          schoolType,
          city,
          state,
          'USA',
          address || null,
          zip || null,
          phone || null,
          ceebCode || null,
          schoolName.toLowerCase(),
          Date.now()
        ]
      });
      loaded++;
    } catch (error) {
      console.error(`Failed to load ${schoolName}:`, error.message);
    }
  }
  
  console.log(`✅ Loaded ${loaded} schools to production`);
}

loadSchools();
```

### Option B: Use Turso CLI

```bash
# Export from local
turso db shell transcript-requests-local ".dump schools" > schools.sql

# Import to production  
turso db shell transcript-requests-prod < schools.sql
```

### Option C: Manual via Turso Dashboard

1. Go to https://turso.tech/app
2. Open production database
3. Use SQL Editor to INSERT schools manually

---

## Other Fixes to Apply:

### Fix 1: Make All Consent Boxes Match

**File:** `src/components/form-steps/ConsentStep.tsx`

All checkboxes should have:
```tsx
className="border border-neutral-200 rounded-lg p-4"
```

Currently MFC liability has:
```tsx
className="border-2 border-amber-300 rounded-lg p-4 bg-amber-50"
```

**Decision needed:** Should MFC liability stand out (amber) or match others (neutral)?

### Fix 2: Calendar Year Dropdown

Test if current fix works. If not, may need to use a different date picker library.

### Fix 3: Validation Error on Destination

**File:** `src/lib/validation.ts` or form validation logic

Need to check why school validation fails even when school is selected from autocomplete.

---

## Testing Checklist After Fixes:

- [ ] School autocomplete shows full address/phone for CA schools
- [ ] Selected school auto-fills ALL fields (address, zip, phone)
- [ ] Calendar year dropdown works (can select year directly)
- [ ] No validation errors for schools selected from autocomplete
- [ ] All consent boxes have consistent styling
- [ ] PDF generates and downloads
- [ ] Email sends (after RESEND_API_KEY configured)

---

## Priority Order:

**CRITICAL (Do First):**
1. Load schools to production database
2. Fix consent box styling consistency
3. Test school validation

**HIGH (Do Next):**
4. Verify calendar year dropdown
5. Test PDF generation  
6. Configure RESEND_API_KEY

**MEDIUM (After Above Works):**
7. Deploy and test all features
8. Monitor for other issues

---

## Notes:

- Local development has all data and works correctly
- Production is missing school data (only partial)
- Once production has full school data, many issues should resolve
- PDF/Email likely work but can't complete due to other errors

