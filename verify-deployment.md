# Deployment Verification Protocol

## Status
- **Commit:** 6395b59a (forced rebuild)
- **Previous:** 37676e19 (actual bug fixes)
- **Build Started:** ~22:20 MST
- **Expected Complete:** 22:25-22:27 MST

## Wait Time: 5 Minutes

Netlify needs time to:
1. Receive git push (instant)
2. Start build process (30 seconds)
3. Install dependencies (60-90 seconds)
4. Build Next.js app (90-120 seconds)
5. Deploy to CDN (30 seconds)

**Total: 3-5 minutes from push**

## How to Verify (After 5 Minutes)

### Step 1: Check Netlify Build Status
1. Go to Netlify dashboard
2. Find latest deploy
3. Verify:
   - Status: Published
   - Time: Recent (within last 5 min)
   - Commit: 6395b59a

### Step 2: Clear Your Browser Cache
**Critical:** Browser may cache old version

**Chrome/Edge:**
- Open DevTools (F12)
- Right-click refresh button
- Select "Empty Cache and Hard Reload"

**Firefox:**
- Ctrl+Shift+Del
- Clear cached images and files
- Time range: Everything

**Safari:**
- Cmd+Option+E (empty cache)
- Then Cmd+R (reload)

### Step 3: Test Bug #1 - Date Picker Autofill

**URL:** https://frolicking-horse-f44773.netlify.app/request

**Steps:**
1. Open DevTools (F12)
2. Go to Elements/Inspector tab
3. Find Date of Birth input field
4. Look for this attribute: `data-lpignore="true"`
5. **PASS:** Attribute present, calendar icon clickable
6. **FAIL:** Attribute missing or icon still covered

### Step 4: Test Bug #2 - Future Dates

**Steps:**
1. Fill Step 1, continue to Step 2
2. Find "Expected Graduation Date" field
3. Open DevTools, inspect the input
4. Check `max` attribute
5. **PASS:** `max="2100-12-31"` or later
6. **FAIL:** `max` is today's date or in past

**Then click calendar:**
- Try selecting June 2026
- **PASS:** Date is selectable (not grayed out)
- **FAIL:** Future dates grayed out

### Step 5: Test Bug #3 - Submit Button

**Steps:**
1. Complete Steps 1-3
2. Arrive at Step 4 (Consent)
3. Open DevTools, inspect submit button
4. Check className for:
   - `bg-gray-400` (should be present)
   - `opacity-50` (should be present)
   - NOT `bg-mfc-green-600` (should be absent initially)
5. **PASS:** Button is gray, dull looking
6. **FAIL:** Button is green with checkmark

**Then check all boxes and sign:**
- Button should turn green
- ClassName should change to `bg-mfc-green-600`

### Step 6: Test Bug #4 - Email Validation

**Steps:**
1. On Step 1, in Email field
2. Type: `test@`
3. Try to click Continue
4. **PASS:** Error message appears, can't proceed
5. **FAIL:** No error, or can proceed

**Error message should say:**
"Please enter a valid email address (format: name@domain.com)"

**Try these invalid formats:**
- `test` - should error
- `@example.com` - should error  
- `test@domain` - should error (no TLD)

**Try valid format:**
- `student@example.com` - should work

## If All Tests Pass

✅ **Deployment successful**
✅ **All 4 bugs fixed**
✅ **Ready for production use**

## If Any Test Fails

**Do NOT assume it's a deployment issue.**

The failure means either:
1. Code logic is wrong (our fault)
2. React props not passing correctly (our fault)
3. Component not re-rendering (our fault)

**Next step:** Debug the actual component code, not just redeploy.

## Current Status

⏳ **Waiting for Netlify build to complete (2-4 minutes remaining)**

Check back at: **22:25 MST**

Then run all verification steps above.

---

**Key Point:** We must **actually verify with DevTools** that the attributes are present in the DOM. Just testing functionality isn't enough - we need to see the actual HTML attributes.

