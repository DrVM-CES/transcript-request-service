# Transcript Service Enhancement Plan

## Phase 1: Critical UI/UX Fixes (Immediate - Today)

### 1.1 Fix Validation Issues
- [ ] Make ZIP code truly optional or fix validation message
- [ ] Add better error display for form validation
- [ ] Fix date picker interference with autofill

### 1.2 Improve Button Styling
- [ ] Style Previous/Next buttons with MFC colors
- [ ] Add hover effects and proper sizing
- [ ] Make buttons visually distinct and clickable

### 1.3 Typography & Modern UI
- [ ] Increase base font size (16px minimum)
- [ ] Update to modern font stack matching MFC app
- [ ] Improve spacing and readability
- [ ] Match MFC app gradient background and card style

### 1.4 Navigation & Flow
- [ ] Add success page with clear next steps
- [ ] Add "Return to Home" button on success
- [ ] Add breadcrumb navigation
- [ ] Link to My Future Capacity main app

### 1.5 Add Key Pages
- [ ] About Us page
- [ ] How It Works (detailed)
- [ ] FAQs page
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Contact/Support page

## Phase 2: School Database & Search (Next 2-3 days)

### 2.1 School Lookup Integration
- [ ] Integrate NCES (National Center for Education Statistics) database
- [ ] Create autocomplete search for high schools
- [ ] Create autocomplete search for universities/colleges
- [ ] Auto-fill CEEB codes from school selection
- [ ] Add "School not found?" fallback with manual entry

### 2.2 CEEB Code Database
- [ ] Build searchable database of US high schools with CEEB codes
- [ ] Build searchable database of US colleges/universities with CEEB codes
- [ ] API endpoint for school search
- [ ] Cache commonly searched schools

## Phase 3: Parental Consent (Next Week)

### 3.1 Age Verification
- [ ] Check student age from DOB
- [ ] If under 18, require parent/guardian consent
- [ ] Add parent/guardian information section

### 3.2 Consent Methods
- [ ] Email verification to parent/guardian
- [ ] SMS verification option
- [ ] Digital signature capture
- [ ] Record IP address and timestamp for legal compliance

### 3.3 Legal Research
- [ ] Verify FERPA requirements for minors
- [ ] Check state-specific consent laws
- [ ] Consult with legal counsel on acceptable auth methods

## Phase 4: User Authentication & Dashboard (1-2 weeks)

### 4.1 User Accounts
- [ ] Implement Better Auth (already in package.json)
- [ ] Student registration/login
- [ ] Email verification
- [ ] Password reset flow

### 4.2 Student Dashboard
- [ ] View all submitted transcript requests
- [ ] Track request status (submitted, processing, delivered, failed)
- [ ] Download copies of requests
- [ ] Cancel pending requests
- [ ] Re-submit failed requests

### 4.3 Request History
- [ ] Timeline view of each request
- [ ] Email notifications for status changes
- [ ] Delivery confirmation

## Phase 5: MFC Client Authentication & Pricing (2 weeks)

### 5.1 Client Verification
- [ ] MFC client database integration
- [ ] Client ID verification at start of process
- [ ] SSO integration with MFC main app (if available)
- [ ] Manual client verification fallback

### 5.2 Pricing Structure
**Option A: Simple Two-Tier**
- MFC Clients: Free
- Non-Clients: $5.99 per transcript

**Option B: Tiered Service**
- MFC Clients: Free (all features)
- Non-Client Basic: $5.99 (single transcript, 7-10 days)
- Non-Client Premium: $9.99 (single transcript, 3-5 days, priority support)
- Non-Client Rush: $14.99 (single transcript, 24-48 hours)

### 5.3 Payment Integration
- [ ] Stripe payment integration
- [ ] Payment page UI
- [ ] Receipt generation
- [ ] Refund processing for failed requests

### 5.4 Client Onboarding
- [ ] Landing page explaining MFC vs non-MFC pricing
- [ ] "Are you an MFC client?" verification step
- [ ] Client code/ID entry
- [ ] Clear messaging about free service for MFC clients

## Phase 6: Enhanced Features (Ongoing)

### 6.1 Email Notifications
- [ ] Request received confirmation
- [ ] Processing status updates
- [ ] Delivery confirmation
- [ ] Failed request alerts

### 6.2 Admin Dashboard
- [ ] View all transcript requests
- [ ] Monitor SFTP upload status
- [ ] Manage failed requests
- [ ] Client verification tools
- [ ] Revenue reporting (for paid requests)

### 6.3 Analytics
- [ ] Request volume tracking
- [ ] Success/failure rates
- [ ] Average processing time
- [ ] Revenue metrics
- [ ] Popular destination schools

## Implementation Priority

**This Week:**
1. Critical UI fixes (buttons, fonts, validation)
2. Success page and navigation
3. Basic school search/autocomplete

**Next Week:**
1. Full school database integration
2. Parental consent for minors
3. About/FAQ pages

**Following 2 Weeks:**
1. User authentication system
2. Student dashboard
3. MFC client verification
4. Payment integration

## Technical Debt to Address

- [ ] Remove node_modules from git (already in .gitignore but was committed)
- [ ] Set up proper environment variable management
- [ ] Add error tracking (Sentry)
- [ ] Add analytics (PostHog or similar)
- [ ] Set up automated testing
- [ ] Performance optimization
- [ ] SEO optimization

## Legal & Compliance

- [ ] FERPA compliance review
- [ ] Privacy policy creation
- [ ] Terms of service creation
- [ ] Data retention policy
- [ ] COPPA compliance (for users under 13, if applicable)
- [ ] Payment PCI compliance
- [ ] Accessibility (WCAG 2.1 AA) compliance

## Questions for Stakeholders

1. **MFC Client Verification**: How do we verify if someone is an MFC client?
   - Do they have a client ID?
   - Can we integrate with MFC's existing auth system?
   - Manual verification process?

2. **Pricing Decision**: Which pricing model do you prefer?
   - Simple free/paid split?
   - Tiered service levels?

3. **Parental Consent**: What level of verification is acceptable?
   - Email only?
   - Require digital signature?
   - Phone verification?

4. **Parchment SFTP**: Still waiting on credentials from Parchment
   - When do we expect these?
   - What's the fallback if delayed?

5. **Go-Live Timeline**: What's the target launch date for:
   - MVP (current features)?
   - Full version (with auth, payment)?
   - MFC integration?
