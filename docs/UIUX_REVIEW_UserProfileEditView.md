# Comprehensive UI/UX Review: UserProfileEditView Component

## Executive Summary

UserProfileEditView has **significant inconsistencies** with the application's established design system and several **critical UX and accessibility issues**. The component violates multiple patterns established in ContactFormView and other reference implementations. This review identifies **5 critical issues**, **8 consistency violations**, **12 UX improvements**, and **6 accessibility gaps** that require remediation.

---

## Part 1: Critical Issues (Blocks Good UX - Must Fix)

### 1. Password Regex Mismatch with Error Message
**Location:** Lines 24, 210
**Severity:** Critical - User confusion

The password regex requires special characters, but the error message does not reflect this:

```javascript
// Line 24: Regex REQUIRES digit, lowercase, uppercase, minimum 6 chars
const passwordRegEx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/;

// Line 210: Error message doesn't mention NO special characters allowed
error: `Password must contain at least 1 uppercase letter and a number`
```

**Problem:** The regex explicitly requires `[0-9a-zA-Z]` (no special characters), but users will attempt to use special characters based on common password rules. The error message should state "alphanumeric characters only" or "letters and numbers only."

**Impact:** Users will be frustrated when passwords with special characters (!, @, #, etc.) are rejected with unclear messaging.

---

### 2. Multiple Message Components Without Stack Management
**Location:** Lines 147-148
**Severity:** Critical - Layout breakage potential

```jsx
{error ? <Message message={error} /> : null}
{message ? <Message message={message} /> : null}
```

**Problems:**
- Both render at full width without container management
- Can stack unpredictably
- No visual distinction between message types (error vs. warning vs. success)
- No auto-close behavior specified (unlike ContactFormView which uses `autoClose={5000}`)
- `message` state is manually set for temporary messages but never cleared

**Impact:** Messages can overlap or stack vertically unexpectedly, reducing readability and screen space.

---

### 3. Manual DOM Manipulation Anti-Pattern
**Location:** Line 136
**Severity:** Critical - React anti-pattern, state management issue

```javascript
const handleCancelImageUpload = () => {
  document.querySelector('#userProfileImage').value = '';
  setPreviewImage('');
};
```

**Problems:**
- Direct DOM manipulation violates React principles
- Should use useRef hook instead
- Uncontrolled component pattern
- File input value manipulation is unreliable across browsers
- Violates separation of concerns

**Impact:** Potential state inconsistency between React state and DOM state; poor maintainability.

---

### 4. Uncaught Validation Race Condition
**Location:** Lines 87-109 (handleSubmit)
**Severity:** Critical - Data integrity issue

```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  if (password !== confirmPassword) {
    setMessage('Passwords do not match');
  } else {
    if (user.isConfirmed === true) {
      dispatch(updateUserProfileAction({...}));
    } else {
      setMessage('You have not yet confirmed your email.');
    }
  }
};
```

**Problems:**
- No validation against regex patterns before submission
- Users can submit invalid name/email formats without validation
- Password fields optional (can be empty, bypassing regex validation)
- No validation for empty optional fields
- No feedback if submission succeeds or fails (Redux action dispatched without visibility)

**Impact:** Invalid data may be submitted to backend; poor user feedback.

---

### 5. Checkbox Label Not Properly Associated
**Location:** Lines 187-196
**Severity:** Critical - Accessibility violation (WCAG 2.1 Level A failure)

```jsx
<label>
  <input type="checkbox" ... />
  {!hidePassword ? 'Hide Password Settings' : 'Show Password Settings'}
</label>
```

**Problems:**
- Label is wrapping checkbox correctly but has several issues:
  - No `htmlFor` attribute (though implicit association works)
  - No aria-label on checkbox itself
  - No aria-controls to indicate what section it controls
  - No role="switch" (semantic improvement for toggle)
  - Label text is inverted (confusing UX)

**Accessibility Impact:** Screen reader users may not understand that this checkbox toggles a section; keyboard users may not have clear affordances.

---

## Part 2: Design System Consistency Violations

### 1. InputField Missing `hint` Props
**Location:** Lines 159-172 (Name), Lines 173-185 (Email), Lines 199-234 (Password fields)
**Pattern Violation:** ContactFormView provides upfront validation hints; UserProfileEditView does not

**Reference (ContactFormView - CORRECT):**
```jsx
<InputField
  id="name"
  label="Name"
  hint="Minimum 2 characters"
  className={showNameError ? 'invalid' : isNameValid ? 'entered' : ''}
  error={showNameError ? 'Name must contain at least 2 characters.' : null}
  onChange={(e) => setName(e.target.value)}
  onBlur={() => handleBlur('name')}
/>
```

**Current Implementation (WRONG):**
```jsx
<InputField
  label="Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  error={!nameRegEx.test(name) && name.length !== 0 ? `Name must...` : null}
/>
// Missing: hint, onBlur, aria-invalid, proper className
```

**Fixes Needed:**
- Name field: Add hint "First name and surname, each starting with capital letter"
- Email field: Add hint "Valid email format required"
- Password field: Add hint "6+ characters: uppercase, lowercase, and number only"
- Confirm Password field: Add hint "Must match password field"

---

### 2. Missing `onBlur` Validation Handlers
**Location:** All InputField components (Lines 159-235)
**Pattern Violation:** ContactFormView uses `onBlur` for touched state; UserProfileEditView validates on every keystroke

**Issue:** The component shows/hides errors immediately on every keystroke:
```javascript
className={!nameRegEx.test(name) ? 'invalid' : 'entered'}
error={!nameRegEx.test(name) && name.length !== 0 ? `...` : null}
```

This shows the "invalid" state before user finishes typing, violating the established pattern of blur-triggered validation.

**Reference Pattern (Correct):**
```javascript
const showNameError = touched.name && !isNameValid && name.length !== 0;

<InputField
  onBlur={() => handleBlur('name')}
  error={showNameError ? '...' : null}
/>
```

---

### 3. Missing `aria-invalid` and `aria-describedby` Props
**Location:** All InputField components
**Pattern Violation:** InputField supports ARIA attributes; UserProfileEditView doesn't provide them

The InputField component properly handles these attributes (lines 82-87), but UserProfileEditView never passes them:

```jsx
// Should include:
aria-invalid={showNameError}
aria-describedby={showNameError ? 'name-error' : undefined}
```

---

### 4. Message Component Not Using `variant` Prop
**Location:** Lines 147-148
**Pattern Violation:** Message component supports semantic variants (error, success, warning); inconsistent usage

**Current (Wrong):**
```jsx
{error ? <Message message={error} /> : null}
{message ? <Message message={message} /> : null}
```

**Correct Pattern (from ContactFormView):**
```jsx
{success && (
  <Message message="Form successfully submitted" variant="success" autoClose={5000} />
)}
{error && (
  <Message message={payload} variant="error" />
)}
```

**Issues:**
- No `variant` specified - defaults to 'error' even for success messages
- No `autoClose` prop - messages persist indefinitely
- Doesn't match ContactFormView's clear success/error separation

---

### 5. Missing Required Asterisk on Optional Password Fields
**Location:** Lines 199-234
**Pattern Issue:** Fields marked `required={true}` but are conditionally displayed and can be empty

The password fields are inside `{!hidePassword ? <div>...</div> : null}` so they're technically optional, but are marked `required={true}`, creating semantic confusion.

**Fix:** Remove `required` prop or wrap in a validation that requires if shown:
```jsx
required={!hidePassword}  // Only required when visible
```

---

### 6. Inconsistent Button Implementation
**Location:** Lines 237-243
**Pattern Violation:** Uses inline `colour` prop; doesn't match ContactFormView pattern

```jsx
<Button
  colour="transparent"  // Wrong: inline style prop
  text="submit"
  className="btn"
  title={...}
  disabled={!user.isConfirmed}
/>
```

**Issues:**
- `colour="transparent"` is imprecise; should be a semantic color name
- `text` should be `children` or component prop (more standard React)
- No `type="submit"` specified (required for form submission)
- No aria-busy or loading state handling during submission

---

### 7. Image Preview Section Not Following Form Patterns
**Location:** Lines 260-282
**Pattern Issue:** Button elements not using the Button component

```jsx
<button>I Like it</button>
<button type="button" onClick={handleCancelImageUpload}>
  I Dont Like it
</button>
```

**Issues:**
- Not using Button component (inconsistent)
- "I Dont Like it" is informal/unprofessional
- No className for styling consistency
- No aria-labels explaining what images they operate on
- Missing loading state indicator during upload

---

### 8. Icon-Only Indicators Without Text Alternatives
**Location:** Lines 289-301 (Confirmed User), Lines 306-318 (Admin)
**Pattern Violation:** Inline styles and no semantic alternatives

```jsx
<i
  className="fa fa-check"
  style={{ fontSize: 20 + 'px', color: 'rgba(92, 184, 92, 1)' }}
></i>
```

**Issues:**
- Inline styles instead of CSS classes (poor maintainability)
- Icon-only without text alternative (accessibility failure)
- Color alone used to indicate state (fails color-blind users)
- Should be wrapped in semantic element with aria-label

---

## Part 3: UX Improvements (Would Significantly Improve Experience)

### 1. Password Toggle Checkbox UX
**Current Problem:** Lines 187-196
- Pattern is confusing: checkbox toggles a hidden section rather than field visibility
- Label text is inverted logic: "Show" when hidden, "Hide" when visible
- Not using the enhanced password show/hide toggle that InputField provides

**Better Pattern:**
The InputField component already has a built-in password show/hide toggle (FaEye icon, lines 58-69). Use that instead of a separate checkbox for toggling an entire section.

**Recommendation:** Remove the checkbox wrapper and password section hiding. Instead:
- Always show password fields but hidden
- Use InputField's built-in show/hide toggle for each field
- Let users see/hide password fields independently

---

### 2. Empty Optional Fields Confusion
**Current State:**
- Password and confirm password fields are optional (only shown when checkbox is checked)
- But they're marked `required={true}`
- The form allows submission with empty password (no update to password)

**Recommendation:**
1. Clarify form intent: Are password updates optional or required?
2. If optional, show placeholder like "Leave blank to keep current password"
3. Add hint text: "Optional - only fill if you want to change your password"
4. Remove from form if not intended to be editable in this view

---

### 3. Unconfirmed User Experience
**Lines 70-72, 104-106, 242:**
- Users can see the form but can't submit
- Button is disabled with title tooltip (not user-friendly)
- Message text has typo "In oder to" (should be "In order to")
- Two separate warnings scattered in the UI

**Recommendation:**
1. Fix typo: "In order to update your profile..."
2. Consolidate warnings into single, clear message at top
3. Show disabled state clearly (gray button with descriptive message)
4. Add link to "Re-send confirmation email" or "Check your email"
5. Make button title more descriptive: "Confirm your email before updating"

---

### 4. Image Upload Flow Clarity
**Location:** Lines 260-282
**UX Issues:**
- "Image Preview" label is not clearly associated with preview image
- "I Like it" / "I Dont Like it" buttons are informal
- Preview shows before user confirms they want to upload
- No loading state shown during upload
- No success/failure feedback after upload
- Cancel button doesn't provide feedback that action completed

**Recommendation:**
1. Use clearer labels: "Confirm New Image" and "Cancel Upload"
2. Show upload progress with LoadingSpinner
3. Display success message: "Profile image updated successfully" with autoClose
4. Show error message if upload fails
5. Disable buttons during upload (aria-busy state)
6. Clear preview after successful upload

---

### 5. Form Submission Feedback
**Location:** Line 87-109
**Issues:**
- Redux action dispatched but no indication to user if it succeeded
- No loading state shown while submitting
- No success message displayed
- User has to navigate away to verify changes

**Recommendation:**
1. Show LoadingSpinner while submitting (aria-busy="true")
2. Display success message: "Profile updated successfully" with autoClose={5000}
3. Optional: Clear password fields after success
4. Add success variant Message component (as in ContactFormView)

---

### 6. Multi-Fieldset Layout Cognitive Load
**Current:** 4-5 fieldsets on one page creates visual separation but feels overwhelming
- UPDATE USER form
- USER SUMMARY
- Admin Options (if admin)
- UPDATE PROFILE (just a link)
- PROFILE Statistics

**Recommendation:**
1. Consider progressive disclosure (expanding sections)
2. Move "UPDATE PROFILE" link into the UPDATE USER fieldset as secondary action
3. Consider moving "Admin Options" to separate route/page
4. Move "PROFILE Statistics" to a separate dedicated statistics view
5. Core form should be: UPDATE USER + USER SUMMARY only

---

### 7. Email Confirmation Status Visibility
**Location:** Lines 285-319
**Issue:** Confirmation status is shown, but update flow doesn't reflect impact

**Recommendation:**
1. Clearly link email confirmation requirement to form behavior
2. Show green check for confirmed, red X for unconfirmed
3. Add semantic text: "Email verified" / "Email not verified"
4. If unconfirmed, show link: "Resend confirmation email"
5. Consider moving to prominent top position

---

### 8. Profile Statistics Usefulness
**Location:** Lines 353-365
**Issues:**
- "Time spent on viewing your profile" has no value shown
- "Profile clicks" is only data point - limited value on this view
- These metrics may be better suited to a dedicated profile analytics page

**Recommendation:**
1. If keeping these, ensure both have complete data displays
2. Consider moving to separate "Analytics" or "Profile Insights" page
3. Add date ranges, trends, or comparative data if keeping here
4. Make useful for user goals (understanding profile visibility/engagement)

---

## Part 4: Accessibility Gaps (WCAG 2.1 Compliance Issues)

### 1. Password Toggle Checkbox Lacks Semantics
**Location:** Lines 187-196
**WCAG Violation:** 4.1.3 Name, Role, Value

The checkbox doesn't communicate:
- What it controls (the password section)
- Its current state clearly to screen readers
- Should use aria-controls and aria-expanded

**Fix:**
```jsx
<label htmlFor="password-toggle">
  <input
    id="password-toggle"
    type="checkbox"
    checked={!hidePassword}
    onChange={() => setHidePassword(!hidePassword)}
    aria-controls="password-section"
    aria-expanded={!hidePassword}
  />
  {!hidePassword ? 'Hide' : 'Show'} password settings
</label>
<div id="password-section" hidden={hidePassword}>
  {/* password fields */}
</div>
```

---

### 2. Message Component Focus Management
**Location:** Lines 147-148
**Issue:** Messages with role="alert" render but focus isn't managed to them

**WCAG 2.1 Section 4.1.3** requires proper name/role/value. The Message component handles this internally (focus, aria-live), but multiple messages can cause focus issues.

**Fix:**
1. Use state management to ensure only one message displays
2. Store message with type: `{ text: '...', type: 'error'|'success' }`
3. Show appropriate variant and auto-close with timeout

---

### 3. Icon-Only Indicators Fail Color-Blind Users
**Location:** Lines 289-319
**WCAG Violation:** 1.4.1 Use of Color

Icons with only color difference are not accessible:
```jsx
// Bad: Color only
<i className="fa fa-check" style={{ color: 'rgba(92, 184, 92, 1)' }}></i>

// Good: Icon + text + aria-label
<span aria-label="Email confirmed">
  <i className="fa fa-check" style={{ color: '$success' }}></i>
  Confirmed
</span>
```

---

### 4. File Input Not Properly Labeled
**Location:** Lines 261-267
**Issue:** File input in InputField component may not be fully accessible

**Check:** Does InputField handle file inputs correctly?
- Should have clear label (✓ has label prop)
- Should have aria-describedby (✓ InputField handles)
- But: Missing hint about file types/size

**Fix:**
```jsx
<InputField
  id="userProfileImage"
  label="Choose profile image"
  type="file"
  name="userProfileImage"
  hint="JPG, PNG, or WebP up to 5MB"
  onChange={uploadFileHandler}
  aria-describedby="image-requirements"
/>
<span id="image-requirements" className="field-hint">
  Supported formats: JPG, PNG, WebP. Maximum size: 5MB
</span>
```

---

### 5. Form Validation Announcements
**Location:** Lines 159-235
**WCAG 2.1 Violation:** 3.3.4 Error Prevention

Validation errors appear on screen but are not announced to screen readers appropriately. The InputField component does this with role="alert" on error (line 95), but the form doesn't announce that overall submission failed.

**Fix:**
Add aria-live region above form:
```jsx
{error && (
  <div role="alert" aria-live="polite" aria-atomic="true">
    Form submission failed. Please check the errors below.
  </div>
)}
```

---

### 6. Touch Target Sizes
**Location:** Image upload buttons (lines 276-279)
**WCAG 2.1 Violation:** 2.5.5 Target Size (Level AAA)

Custom buttons likely don't meet 44x44px minimum:
```jsx
<button>I Like it</button>  // No size styling, likely too small
```

**Fix:**
Use Button component or ensure CSS enforces minimum size:
```scss
button {
  min-width: 44px;
  min-height: 44px;
  padding: 0.75rem 1rem;
}
```

---

## Part 5: Security & Best Practices

### 1. Password Validation Mismatch
**Location:** Lines 24, 210
Already covered in Critical Issues #1

### 2. Password Field Handling
**Current:** Passwords stored in React state (normal pattern)
**Recommendation:**
- Consider clearing password fields after successful submission
- Add warning about unsecured password editing (HTTPS assumed)
- Implement password strength meter (visual feedback)

### 3. Email Confirmation Flow
**Issue:** Component shows confirmation status but doesn't explain implications
**Recommendation:**
- Add warning if unconfirmed: "You must confirm your email to update your profile"
- Provide clear path to resend confirmation (link, button)
- Show email that confirmation was sent to

### 4. Admin Section Visibility
**Location:** Lines 322-342
**Issue:** Shows conditional admin options without explanation of permissions
**Recommendation:**
- Add role="contentinfo" or similar for admin section
- Clearly label: "Administrator Options"
- Consider moving to separate admin dashboard
- Add audit logging for admin actions

---

## Part 6: Mobile Responsiveness Issues

### 1. Layout Breakpoint (812px) Is Problematic
**Location:** UserProfileEditView.scss line 25
```scss
@media (max-width: 812px) {
  .item {
    width: 100vw; /* Causes horizontal overflow! */
  }
}
```

**Issue:** Using `100vw` causes horizontal scrollbar because it doesn't account for scrollbar width. Should use `100%`.

### 2. Image Size Not Responsive
**Location:** Lines 274, 280
```jsx
<img src={previewImage} alt="profile" style={{ width: '120px' }} />
```

Should use responsive units or media queries.

### 3. Button Size on Mobile
Image upload buttons may be too small on mobile (touch targets should be 48px minimum).

### 4. Form Field Padding
InputField component respects mobile padding (lines 259-284 of InputField.scss), but overall form needs viewport unit review.

---

## Part 7: Code Quality Issues

### 1. Typos
- Line 71: "In oder to" should be "In order to"
- Line 105: "you emails" should be "your emails"
- Line 278: "I Dont Like it" should be "I Don't Like it" (apostrophe)

### 2. Unused Variables
**Location:** Line 40
```javascript
useSelector((state) => state.profileOfLoggedInUser);  // Unused result
```

Should be removed (line 43 uses it correctly).

### 3. Inconsistent Naming
- `hidePassword` state vs `password` fields (not parallel)
- `previewImage` vs `previewImageFile` (both for preview, different purposes)

### 4. Missing PropTypes for custom props
The Button component receives `className` but it's not in PropTypes (line 27-34).

---

## Part 8: Missing Error States

### 1. Image Upload Error Handling
No error message shown if image upload fails.

**Recommendation:**
```jsx
{userProfileImage.error && (
  <Message message={userProfileImage.error} variant="error" />
)}
```

### 2. Email Update Conflict
If user changes email while updating profile, no verification of new email is required.

**Recommendation:**
- Require email verification if email is changed
- Show warning: "Changing email requires verification"

### 3. Name Update Validation
Invalid name doesn't prevent submission; will fail on backend.

**Recommendation:**
- Add client-side validation check before submit
- Prevent submission of invalid fields

---

## Summary of Issues by Category

| Category | Count | Severity |
|----------|-------|----------|
| Critical Issues | 5 | MUST FIX |
| Design System Violations | 8 | HIGH |
| UX Improvements | 8 | HIGH |
| Accessibility Gaps | 6 | HIGH |
| Code Quality | 4 | MEDIUM |
| Mobile Responsiveness | 4 | MEDIUM |
| Security | 4 | MEDIUM |

**Total Issues Identified:** 39 (5 critical, 14 high-priority, 20 medium-priority)

---

## Recommended Priority Implementation Order

### Phase 1: Critical Fixes (Do First)
1. Fix password regex mismatch with error message (Issue 1)
2. Implement proper message state management with variant prop (Issue 2)
3. Replace document.querySelector with useRef (Issue 3)
4. Add form submission validation check (Issue 4)
5. Fix password toggle checkbox accessibility (Issue 5)

### Phase 2: Design System Alignment (Do Second)
1. Add hint props to all InputFields
2. Add onBlur handlers with touched state tracking
3. Add aria-invalid and aria-describedby to InputFields
4. Use Message variant prop consistently
5. Fix Button component usage (use proper theme colors)

### Phase 3: UX Enhancements (Do Third)
1. Add loading state and success feedback for form submission
2. Refactor password toggle pattern
3. Improve image upload flow with feedback
4. Add email confirmation resend functionality
5. Consolidate and improve warning messages

### Phase 4: Accessibility & Polish (Do Last)
1. Fix all WCAG violations
2. Add aria-live regions
3. Verify touch targets meet requirements
4. Test with screen reader
5. Fix mobile responsive issues

---

## References & Pattern Sources

**Established Patterns (from ContactFormView):**
- ✓ InputField with hint prop for upfront validation
- ✓ Blur-triggered validation with touched state
- ✓ Message component with variant="success"|"error" and autoClose
- ✓ Proper aria-invalid and aria-describedby
- ✓ Loading state with role="status" aria-live="polite" aria-busy="true"

**Component Capabilities:**
- **InputField:** Supports hint, error, aria-invalid, aria-describedby, onBlur, className, required
- **Message:** Supports message, variant, autoClose, onDismiss, isVisible
- **Button:** Supports text, disabled, colour, title, type, onClick

**Design System:**
- Colors: $burnt-orange (primary), $success (green), $danger (red), $warning (orange)
- Typography: Comfortaa (body), Bebas Neue (headings)
- Spacing: 1rem baseline, 4px border-radius
- Contrast: Minimum 4.5:1 (WCAG AA)
- Touch targets: 44px minimum (mobile: 48px)

---

## Validation Regex Issues & Improvements

### Current Issues
```javascript
// Line 21 - Too strict, requires exact format
const nameRegEx = /^([\w])+\s+([\w\s])+$/i;
// Rejects: "Jean-Paul", "O'Brien", "Mary Jane"

// Line 22 - Email regex is good, but long
const emailRegEx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
// This is correct but verbose; consider using HTML5 email input type

// Line 24 - Mismatch with error message (CRITICAL)
const passwordRegEx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/;
// Requires: digit, lowercase, uppercase, alphanumeric only, minimum 6 chars
// Error says only "uppercase and number" - incomplete messaging
```

### Recommended Pattern
```javascript
// Align with ContactFormView's simpler pattern
const nameRegEx = /^[a-zA-Z\s'-]{2,}$/;  // Simpler, more inclusive
const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // Simpler validation

// Password: decide on security requirements
// Option A: Simple (6+ chars)
const passwordRegEx = /^.{6,}$/;

// Option B: Medium (6+ with uppercase, lowercase, digit)
const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

// Option C: Strong (medium + special chars) - requires regex AND message fix
const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
// Error message: "8+ characters with uppercase, lowercase, number, and special character"
```

---

## Conclusion

UserProfileEditView requires significant refactoring to meet application standards and provide good user experience. The most critical issues are:

1. **Functional defects** that impact data integrity (validation bypass, message stacking)
2. **Anti-pattern implementations** that violate React best practices (DOM manipulation)
3. **Accessibility failures** that violate WCAG standards
4. **Inconsistencies** that contradict established design system patterns

The component demonstrates the patterns established in ContactFormView but hasn't applied them consistently. A full remediation is recommended following the Priority Implementation Order outlined above.

**Estimated effort:** 8-12 hours for full remediation (2-3 hours per phase)

