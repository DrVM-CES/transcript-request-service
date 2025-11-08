# Immediate Fixes Based on User Feedback
*Priority: CRITICAL - To be deployed today*

---

## 🔴 Issues Identified

### 1. ZIP Validation Error
**Problem:** Destination ZIP showing "invalid_string" error even when optional  
**Current Code:** Uses `.refine()` which still validates even when optional  
**Fix:** Update to properly handle empty strings

### 2. Button Styling
**Problem:** Previous/Next buttons don't look like buttons, no colors  
**Status:** ✅ FormButtons component exists with proper styling  
**Issue:** May not be used in all form steps  
**Fix:** Verify all form steps use FormButtons component

### 3. Font Sizes
**Problem:** Font looks "circa 1990", too small  
**Current:** 16px base font size set in globals.css  
**Status:** ✅ Should be adequate  
**Fix:** May need to increase further or check if being overridden

### 4. DOB Calendar/Autofill Conflict
**Problem:** Calendar widget interferes with browser autofill  
**Current:** Using basic text input with type="date"  
**Fix:** Need proper date picker component (react-day-picker)

### 5. Success Page Navigation
**Problem:** No way to get back to home page after submission  
**Status:** Success page exists at /success  
**Fix:** Verify navigation links are present and functional

---

## ✅ Fixes to Deploy

### Fix 1: ZIP Code Validation
```typescript
// OLD (src/lib/validation.ts)
destinationZip: z.string()
  .optional()
  .refine((val) => !val || /^\d{5}(-\d{4})?$/.test(val), {
    message: 'Please enter a valid ZIP code'
  }),

// NEW
destinationZip: z.string()
  .optional()
  .transform(val => val === '' ? undefined : val)
  .refine((val) => val === undefined || /^\d{5}(-\d{4})?$/.test(val), {
    message: 'Please enter a valid ZIP code'
  }),
```

### Fix 2: Verify Form Steps Use FormButtons
Check each step component:
- StudentInfoStep.tsx
- SchoolInfoStep.tsx
- DestinationInfoStep.tsx
- ConsentStep.tsx

All should import and use `<FormButtons />` component

### Fix 3: Success Page Navigation
Verify src/app/success/page.tsx has:
- Link back to home page
- Link to My Future Capacity app
- Clear call-to-action buttons

### Fix 4: Date Picker Implementation
Install react-day-picker:
```bash
npm install react-day-picker date-fns
```

Create DatePicker component with proper styling

### Fix 5: Global Font Size Adjustment
If needed, increase to 17px or 18px for better readability

---

## 📋 Priority Order

1. **Fix ZIP validation** (5 minutes)
2. **Verify button styling** (10 minutes)
3. **Check success page navigation** (5 minutes)
4. **Increase font sizes if needed** (5 minutes)
5. **Implement date picker** (30 minutes)

**Total time:** ~1 hour

---

## 🚀 After Immediate Fixes

### Next Features (Priority Order):
1. School database with autocomplete (6-8 hours)
2. About Us, FAQ, Privacy Policy pages (4-6 hours)
3. MFC redirect links from all pages (1 hour)
4. Parental consent workflow for under 18 (8-10 hours)
5. User authentication (10-12 hours)
6. User dashboard (12-16 hours)
7. MFC client verification (6-8 hours)
8. Payment system ($5.99 for non-MFC) (16-20 hours)
9. Tiered service options (10-12 hours)

---

## 📝 Testing Checklist

After deploying fixes:
- [ ] Submit form with empty destination ZIP (should not error)
- [ ] Submit form with valid ZIP (should work)
- [ ] Submit form with invalid ZIP (should show error)
- [ ] Check Previous/Next buttons are styled with MFC colors
- [ ] Verify font sizes look modern and readable
- [ ] Test DOB input with browser autofill
- [ ] Test DOB input with manual entry
- [ ] Submit form and verify navigation options on success page
- [ ] Test on mobile devices
- [ ] Test on different browsers

---

**Ready to implement these fixes now.**
