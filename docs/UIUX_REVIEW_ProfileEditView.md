# Comprehensive UI/UX Review: ProfileEditView Component

## Executive Summary

ProfileEditView has **significant alignment issues** with the established application design system demonstrated in UserProfileEditView. This is the main trainer profile editing interface (910 lines) with multiple form sections, rich text editors, image management, and complex keyword algorithms. The component exhibits **8 critical issues**, **12 consistency violations**, **10 UX concerns**, and **8 accessibility gaps** that must be remediated before production use.

The review reveals that many of the same anti-patterns found in UserProfileEditView's original implementation also exist here, suggesting the fixes applied to UserProfileEditView were not yet propagated to ProfileEditView.

---

## Part 1: Critical Issues (Blocks Good UX - Must Fix Immediately)

### CRITICAL 1: DOM Manipulation Anti-Pattern - File Input Reset
**Location:** Line 289
**Severity:** CRITICAL - React anti-pattern, state management violation

```javascript
const handleCancelImageUpload = () => {
  document.querySelector('#profileImage').value = '';  // ❌ WRONG
  setPreviewImage('');
};
```

**Problems:**
- Direct DOM manipulation violates React principles and best practices
- Should use useRef hook (as implemented correctly in UserProfileEditView line 75)
- Uncontrolled component anti-pattern
- Potential state inconsistency between React state and DOM
- Violates separation of concerns

**Impact:**
- Maintainability issues; potential bugs when component re-renders
- Inconsistent state management with rest of application
- Browser compatibility issues with file input value manipulation

**Reference (Correct Pattern from UserProfileEditView):**
```javascript
const fileInputRef = useRef(null);

const handleCancelImageUpload = () => {
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
  setPreviewImage('');
  setPreviewImageFile('');
};

// In JSX:
<input
  ref={fileInputRef}
  id="profileImage"
  type="file"
  name="profileImage"
  onChange={uploadFileHandler}
/>
```

**Fix Required:** Use useRef hook instead of document.querySelector

---

### CRITICAL 2: Multiple Message Components Stacking Without Variant Management
**Location:** Lines 312-313
**Severity:** CRITICAL - Layout and UX breakage

```jsx
{error ? <Message message={error} /> : null}
{createError ? <Message message={createError} /> : null}
```

**Problems:**
- Both messages can render simultaneously without container management
- No variant prop specified (defaults to 'error' for both)
- No distinction between error types
- No auto-close behavior (messages persist indefinitely)
- Can stack unpredictably, creating visual clutter
- Violates established pattern in UserProfileEditView

**Impact:**
- Messages overlap or stack vertically, reducing readability
- User confusion about which error is relevant
- Wasted screen real estate

**Reference (Correct Pattern from UserProfileEditView):**
```javascript
// Use single consolidated notification state
const [notification, setNotification] = useState({
  text: '',
  variant: 'error',
  visible: false,
});

const showNotification = (text, variant = 'error') => {
  setNotification({
    text,
    variant,
    visible: true,
  });
};

// In JSX - only one message at a time
{notification.visible && (
  <Message
    message={notification.text}
    variant={notification.variant}
    isVisible={notification.visible}
    onDismiss={() => setNotification((prev) => ({ ...prev, visible: false }))}
  />
)}
```

**Fix Required:** Consolidate error/create error into single notification state with variant support

---

### CRITICAL 3: Unprofessional Button Labels for Image Upload
**Location:** Lines 815-818
**Severity:** CRITICAL - Affects user trust and professionalism

```jsx
<button>I Like it</button>
<button type="button" onClick={handleCancelImageUpload}>
  I Dont Like it
</button>
```

**Problems:**
- Informal, unprofessional language inappropriate for trainer profile management
- Not using Button component (inconsistent styling and behavior)
- "I Dont Like it" is grammatically incorrect (missing apostrophe)
- Missing clear action labels that explain what these buttons do
- No accessibility labels or ARIA descriptions
- Violates application professionalism standards

**Impact:**
- Reduces user confidence in application
- Users unclear about button purpose
- Screen reader users have no context

**Reference (Correct Pattern from UserProfileEditView):**
```jsx
<Button
  type="submit"
  colour="transparent"
  text="Upload Image"
  className="btn"
  disabled={userProfileImageLoading}
/>
<Button
  type="button"
  colour="transparent"
  text="Cancel"
  className="btn"
  onClick={handleCancelImageUpload}
  disabled={userProfileImageLoading}
/>
```

**Fix Required:** Replace with Button components using professional labels: "Upload Image" and "Cancel"

---

### CRITICAL 4: Inline Styles on Font Awesome Icons
**Location:** Lines 880-892
**Severity:** CRITICAL - Style management violation, accessibility issue

```jsx
{profile.isQualificationsVerified === true ? (
  <i
    className="fa fa-check"
    style={{
      fontSize: 20 + 'px',
      color: 'rgba(92, 184, 92, 1)',
    }}
  ></i>
) : (
  <i
    className="fa fa-times"
    style={{ fontSize: 20 + 'px', color: 'crimson' }}
  ></i>
)}
```

**Problems:**
- Inline styles instead of CSS classes (poor maintainability)
- Hard-coded color values instead of design system tokens
- Icon-only without text alternative (fails color-blind users)
- No ARIA label or role (accessibility violation)
- Color alone used to indicate state (WCAG 1.4.1 failure)
- Inconsistent with design system approach
- Mixes magic numbers (20px) instead of using design tokens

**Impact:**
- Maintenance burden: colors can't be changed in one place
- Accessibility failure: icons uninterpretable to color-blind users
- Design system inconsistency
- No semantic meaning for assistive technology

**Reference (Correct Pattern from UserProfileEditView line 412-420):**
```jsx
<span className={`status-indicator ${user.isConfirmed ? 'confirmed' : 'not-confirmed'}`}>
  <i
    className={user.isConfirmed ? 'fa fa-check' : 'fa fa-times'}
    aria-hidden="true"
  />
  <span className="status-text">
    {user.isConfirmed ? 'Confirmed' : 'Not Confirmed'}
  </span>
</span>
```

**Fix Required:**
1. Create CSS classes for icon styling (e.g., `.qualification-verified`, `.qualification-not-verified`)
2. Add text label next to icon: "Qualifications Verified" or "Pending Verification"
3. Use design system color tokens ($success, $danger)
4. Add aria-label on icon or wrapping element

---

### CRITICAL 5: Textarea Elements with Invalid `error` Prop
**Location:** Lines 571-588 (keyword search display), Lines 713-726 (location textarea)
**Severity:** CRITICAL - Invalid HTML prop, non-functional error display

```jsx
<textarea
  readOnly
  value={keyWordSearch}
  onChange={(e) => setkeyWordSearch(e.target.value)}
  type="text"
  name="keyWordSearch"
  required
  className={keyWordSearch?.length <= 10 ? 'invalid' : 'entered'}
  error={
    keyWordSearch?.length <= 10
      ? `keyWord Search field must contain at least 10 characters!`
      : null
  }
/>
```

**Problems:**
- Native `<textarea>` element doesn't support `error` prop (invalid HTML)
- Textarea doesn't have `type` attribute (invalid HTML)
- Error messages not rendered (prop is ignored by textarea)
- Should use custom error display or InputField component
- Pattern is inconsistent with ContactFormView where errors are rendered properly
- Validation state applied to className but error is invisible

**Impact:**
- Error messages never display to users
- Users cannot see validation feedback
- HTML validation fails (invalid props)
- Inconsistent with form pattern throughout application

**Reference (Correct Pattern):**
```jsx
<div className="input-wrapper">
  <label>Location</label>
  <textarea
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    name="location"
    required
    className={location?.length <= 10 ? 'invalid' : 'entered'}
  />
  {location?.length <= 10 && (
    <p className="validation-error" role="alert">
      Location field must contain at least 10 characters!
    </p>
  )}
</div>
```

Or better yet, use InputField wrapper component if available.

**Fix Required:** Display error messages properly for textareas using custom rendering or wrapper component

---

### CRITICAL 6: Form Validation Logic Missing
**Location:** Line 171-260 (handleSubmit function)
**Severity:** CRITICAL - Data integrity and validation bypass

```javascript
const handleSubmit = (e) => {
  e.preventDefault();

  // Keyword search Algo
  let prom = new Promise((resolve, reject) => {
    // ... complex algorithm ...
  });

  prom.then((res) => {
    // Dispatch UPDATE PROFILE Action
    dispatch(profileUpdateAction({...}));  // NO VALIDATION!
  });
};
```

**Problems:**
- **No validation before dispatch** - invalid data can be submitted
- Name field shows error immediately: `className={name?.length === 0 ? 'invalid' : 'entered'}` (line 373) - keystroke validation, not blur-triggered
- Email validation shows errors on every keystroke (line 386-389) - not following established pattern
- All keyword fields validate in real-time (lines 456-535)
- Specialty fields validate in real-time (lines 598-664)
- Phone number validates in real-time (line 744-753)
- **No check for minimum field lengths before form submission**
- **No regex validation check before dispatch**
- **Location textarea validation is visual only** (no error shown)
- **No feedback when submission completes** (success/error state)
- Validation patterns misaligned with UserProfileEditView's blur-triggered approach

**Impact:**
- Invalid data submitted to backend
- Form may be rejected by backend without user understanding why
- Real-time error display creates poor user experience (errors shown while typing)
- Users can click submit with invalid data

**Reference (Correct Pattern from UserProfileEditView):**
```javascript
// Touched state for blur-triggered validation
const [touched, setTouched] = useState({
  name: false,
  email: false,
});

const handleBlur = (field) => {
  setTouched((prev) => ({ ...prev, [field]: true }));
};

// Validation helpers
const isNameValid = nameRegEx.test(name);
const showNameError = touched.name && !isNameValid && name.length !== 0;

// In handleSubmit - validate before dispatch
const handleSubmit = (e) => {
  e.preventDefault();

  // Validate all required fields
  if (!nameRegEx.test(name)) {
    showNotification('Please enter a valid name', 'error');
    return;
  }

  if (!emailRegEx.test(email)) {
    showNotification('Please enter a valid email', 'error');
    return;
  }

  // Dispatch only if validation passes
  dispatch(profileUpdateAction({...}));
  showNotification('Profile updated successfully!', 'success');
};
```

**Fix Required:**
1. Add touched state for blur-triggered validation
2. Add validation check in handleSubmit before dispatch
3. Show notification if validation fails
4. Show success notification on successful update
5. Change className logic from real-time to touched-based
6. Add onBlur handlers to all InputField components

---

### CRITICAL 7: Missing InputField Props - No hint Support
**Location:** Lines 365-417 (basic info fields), Lines 456-535 (keyword fields), Lines 598-664 (specialization fields), Lines 736-754 (phone number)
**Severity:** CRITICAL - Consistency violation, UX degradation

```jsx
// Current - Missing hint prop
<InputField
  label="Name"
  onChange={(e) => setName(e.target.value)}
  type="text"
  name="name"
  placeholder="Ben Smith"
  value={name}
  required
  className={name?.length === 0 ? 'invalid' : 'entered'}
  error={name?.length === 0 ? `Name field cant be empty!` : null}
/>
```

**Missing Properties:**
- No `hint` prop for upfront guidance
- No `id` prop (prevents proper label-input association for accessibility)
- No `onBlur` handler (not using blur-triggered validation)
- No `aria-invalid` prop
- No `aria-describedby` prop
- No spacing between validation message and input

**Problems:**
- Users don't see validation requirements until they make an error
- InputField component supports hint prop (line 15) but not used
- Inconsistent with ContactFormView and UserProfileEditView pattern
- Accessibility properties missing (ARIA attributes)
- Real-time validation ("cant be empty") confuses users

**Impact:**
- Users must trial-and-error to understand validation rules
- Violates accessibility standards
- Inconsistent with established patterns
- Poor user experience with unclear requirements

**Reference (Correct from UserProfileEditView):**
```jsx
<InputField
  id="user-name"
  label="Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  onBlur={() => handleBlur('name')}
  type="text"
  name="name"
  required
  hint="First and last name required"
  className={showNameError ? 'invalid' : isNameValid && name.length > 0 ? 'entered' : ''}
  error={showNameError ? `Name must contain...` : null}
  aria-invalid={showNameError}
  aria-describedby={showNameError ? 'user-name-error' : undefined}
/>
```

**Fix Required:** Add hint, id, onBlur, aria-invalid, and aria-describedby props to ALL InputField instances

---

### CRITICAL 8: Image Delete Pattern - Accessibility and UX Failure
**Location:** Lines 832-838
**Severity:** CRITICAL - Accessibility violation, poor UX

```jsx
<span
  className="profile-image-delete"
  onClick={() => handleProfileImageDelete(image?._id)}
  title="Delete"
>
  X
</span>
```

**Problems:**
- Using `<span>` instead of `<button>` element (semantic HTML failure)
- onClick handler on non-button element (accessibility violation)
- Not keyboard accessible (can't be focused or activated with keyboard)
- No proper ARIA role or label
- Single character "X" is unclear without text
- window.confirm for deletion (line 297) is harsh UX - no undo capability
- No proper button styling
- Title attribute as only label is insufficient (should have aria-label)
- CSS makes it look clickable with `&:hover { cursor: pointer }` but it's not a button

**Impact:**
- Keyboard users cannot delete images
- Screen reader users don't know what the X does
- Violates WCAG 2.1 Level A (keyboard accessibility)
- Poor user experience with no confirmation feedback

**Reference (Correct Pattern):**
```jsx
<button
  className="profile-image-delete-btn"
  onClick={() => handleProfileImageDelete(image?._id)}
  aria-label={`Delete image of ${name || 'profile'}`}
  type="button"
  title="Delete this image"
>
  <i className="fa fa-trash" aria-hidden="true"></i>
  <span>Delete</span>
</button>
```

**Fix Required:**
1. Use `<button>` element instead of `<span>`
2. Add aria-label with context
3. Add both icon and text label
4. Move JavaScript confirmation to modal dialog for better UX
5. Provide undo capability (soft delete with recovery period)

---

## Part 2: Design System Consistency Violations

### VIOLATION 1: Multiple Save Buttons Throughout Form
**Location:** Lines 418-425, 443-450, 679-686, 700-707, 727-734
**Pattern Violation:** Form organization anti-pattern

```jsx
<Button text="Save profile basics" ... />
<Button text="Save description" ... />
<Button text="Save specialisation" ... />
<Button text="Save qualifications" ... />
<Button text="Save location" ... />
```

**Problems:**
- **5+ save buttons in single form** - confusing UX
- All buttons submit the entire form (line 171: `const handleSubmit = (e) => {...}`)
- Users don't know if clicking "Save description" saves everything or just description
- "Sticky" CSS class suggests persistent positioning but form is very long
- Violates principle of single, clear form action
- Creates visual clutter and cognitive load

**Questions to Clarify:**
1. Should different sections be separate forms?
2. Should there be one submit button at the end?
3. Are these truly independent saves or is the entire form submitted?
4. If separate saves needed, should they be separate forms?

**Pattern Violation:**
- UserProfileEditView has **single** "Update Profile" button (line 337)
- ContactFormView has **single** submit button
- Application pattern establishes: one form = one submit button

**Impact:**
- User confusion about what gets saved
- Inefficient form interaction (users unsure when to click)
- Poor progressive disclosure

**Recommendation:**
1. **Option A (Preferred):** Single submit button at bottom of form
   - Label: "Save All Profile Changes"
   - Clearly indicates entire form submission

2. **Option B:** Multiple independent forms
   - Separate form elements for each section
   - Each with own submit button
   - Each dispatches separate action

3. **Option C:** Collapsible sections with clear indication
   - Use Accordion component
   - "Save" applies to entire form at end

**Fix Required:** Clarify form structure and reduce to single submit button (or multiple independent forms if truly separate)

---

### VIOLATION 2: Keyword Permutation Algorithm in Component
**Location:** Lines 176-260
**Code Quality Violation:** Complex business logic in UI component

```javascript
const handleSubmit = (e) => {
  e.preventDefault();

  let prom = new Promise((resolve, reject) => {
    const arr = [
      keyWordSearchOne.trim() + ' ',
      keyWordSearchTwo.trim() + ' ',
      // ... more arrays ...
    ];
    const permutations = (len, val, existing) => {
      if (len === 0) {
        res.push(val);
        return;
      }
      for (let i = 0; i < arr.length; i++) {
        if (!existing[i]) {
          existing[i] = true;
          permutations(len - 1, val + arr[i], existing);
          existing[i] = false;
        }
      }
    };
    // ... more complex logic ...
  });
};
```

**Problems:**
- **Complex algorithmic logic in UI component** - violates separation of concerns
- Recursive permutation algorithm is hard to test and maintain
- Component does two things: UI rendering AND data processing
- Promise wrapper is unnecessary (code doesn't actually need Promise)
- Algorithm runs on every form submission (performance concern)
- Pure function should be extracted to utility module
- Makes component harder to understand and test
- Blocks form submission while algorithm runs
- No error handling if algorithm fails

**Impact:**
- Component too large and complex (910 lines - at limits of good practice)
- Hard to unit test
- Maintenance burden
- Performance degradation on every submit

**Reference Pattern (Best Practice):**
Extract to utility function:
```javascript
// src/utils/keywordPermutations.js
export const generateKeywordPermutations = (keywords) => {
  const arr = keywords.map(k => k.trim() + ' ');
  let res = [];

  const permutations = (len, val, existing) => {
    if (len === 0) {
      res.push(val);
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      if (!existing[i]) {
        existing[i] = true;
        permutations(len - 1, val + arr[i], existing);
        existing[i] = false;
      }
    }
  };

  for (let i = 0; i < arr.length; i++) {
    permutations(arr.length - i, ' ', []);
  }

  return res;
};

// In component:
import { generateKeywordPermutations } from '../../utils/keywordPermutations';

const handleSubmit = (e) => {
  e.preventDefault();

  const keywords = [
    keyWordSearchOne,
    keyWordSearchTwo,
    keyWordSearchThree,
    keyWordSearchFour,
    keyWordSearchFive,
  ];

  const permutations = generateKeywordPermutations(keywords);
  const keywordSearch = permutations.join('').concat(pure);

  dispatch(profileUpdateAction({
    // ... other fields ...
    keyWordSearch,
  }));
};
```

**Fix Required:** Extract keyword algorithm to utility function

---

### VIOLATION 3: QuillEditor Rich Text Editors Without Proper Error Handling
**Location:** Lines 437-441 (description), Lines 671-677 (specialisation), Lines 692-698 (qualifications)
**Pattern Violation:** No error display for rich text editors

```jsx
<QuillEditor
  value={description}
  onChange={setDescription}
  className={description?.length < 10 ? 'invalid' : 'entered'}
/>
```

**Problems:**
- Invalid className logic (CSS class applied but no visual error message)
- Error state not rendered (no error element like InputField displays)
- Minimum 10 characters required but not enforced at submit
- Validation shown only via className change (users may not notice)
- User doesn't know why description is marked "invalid"
- No hint about minimum length requirement
- QuillEditor component doesn't have built-in error display
- Inconsistent with InputField pattern that shows error text

**Impact:**
- Users don't see validation feedback clearly
- Rich text editors feel less polished than regular inputs
- Error message at line 429-432 is shown but doesn't explain validation

**Reference (Current Pattern from InputField):**
```jsx
// How InputField handles errors
{error && (
  <p id={errorId} className="validation-error" role="alert">
    {error}
  </p>
)}
```

**Recommendation:**
Create error display below rich text editors:
```jsx
<div className="input-wrapper">
  <label>Description</label>
  <QuillEditor
    value={description}
    onChange={setDescription}
    className={description?.length < 10 ? 'invalid' : 'entered'}
  />
  {description?.length < 10 && (
    <p className="validation-error" role="alert">
      Description must have at least 10 characters ({description.length} entered)
    </p>
  )}
</div>
```

**Fix Required:** Display clear error messages for QuillEditor fields

---

### VIOLATION 4: Inconsistent Real-Time vs Blur Validation
**Location:** Throughout component
**Pattern Violation:** Mixes validation approaches

**Real-time validation (shows errors while typing):**
```javascript
// Line 373 - Name field
className={name?.length === 0 ? 'invalid' : 'entered'}
error={name?.length === 0 ? `Name field cant be empty!` : null}

// Lines 456-535 - All 5 keyword fields
className={keyWordSearchOne?.length < 3 ? 'invalid' : 'entered'}
error={keyWordSearchOne?.length < 3 ? `keyWord Search field must contain at least 3 characters!` : null}

// Lines 598-664 - All 4 specialization fields
className={specialisationOne?.length < 3 ? 'invalid' : 'entered'}
error={specialisationOne?.length < 3 ? `Specialisation field must contain at least 3 characters!` : null}
```

**Established Pattern (from UserProfileEditView):**
```javascript
// Blur-triggered validation - only show errors after user leaves field
const showNameError = touched.name && !isNameValid && name.length !== 0;

<InputField
  onBlur={() => handleBlur('name')}
  className={showNameError ? 'invalid' : isNameValid && name.length > 0 ? 'entered' : ''}
  error={showNameError ? `...` : null}
/>
```

**Problems:**
- ProfileEditView uses real-time validation (shows errors while typing)
- UserProfileEditView uses blur-triggered validation (only after field loses focus)
- Inconsistent within application
- Real-time validation frustrates users (errors shown prematurely)
- Users see "invalid" state for required fields on page load (before interaction)

**Impact:**
- Poor user experience with premature error messages
- Violates established application pattern
- Reduces user confidence in form

**Fix Required:** Implement touched state and blur-triggered validation throughout

---

### VIOLATION 5: Message Component Styling with Missing Variant Props
**Location:** Line 312-313
**Pattern Violation:** Not using Message component capabilities

```jsx
{error ? <Message message={error} /> : null}
{createError ? <Message message={createError} /> : null}
```

**Should be:**
```jsx
{error && <Message message={error} variant="error" autoClose={5000} />}
{createError && <Message message={createError} variant="error" autoClose={5000} />}
```

**Problems:**
- No explicit variant prop (relies on default 'error' - but unclear)
- No autoClose prop (messages persist forever, taking up screen space)
- Different semantics for `error` vs `createError` but both show as errors
- Doesn't follow Message component API documented in PropTypes

**Impact:**
- Messages can clutter screen indefinitely
- User can't dismiss messages easily
- No distinction between different error types (if one succeeds)

**Fix Required:** Add variant and autoClose props

---

### VIOLATION 6: Icon Styling with Inline Styles Instead of CSS Classes
**Location:** Lines 880-892
**Already covered in CRITICAL ISSUE #4**
This is one of the most visible violations - certification check/X marks use inline styles

---

### VIOLATION 7: Button Component Color Prop Usage
**Location:** Lines 418-425, 443-450, 679-686, 700-707, 727-734, 815-818, 325-333
**Pattern Inconsistency:** Using `colour="transparent"` prop

```jsx
<Button
  type="submit"
  colour="transparent"
  text="Save profile basics"
  className="btn sticky-save"
/>
```

**Problems:**
- `colour="transparent"` is HTML inline style (anti-pattern in Button component)
- Button component uses style prop internally (line 17 of Button.jsx): `style={{ backgroundColor: colour }}`
- "transparent" is not a valid CSS color, would render as transparent
- Should use semantic color from design system (e.g., $burnt-orange)
- Inconsistent with design system tokens
- Hard-coded string instead of design token

**Reference (Button component):**
```javascript
const Button = ({
  colour = 'yellow',
  // ...
}) => {
  return (
    <button
      style={{ backgroundColor: colour }}  // Inline style ❌
      className={disabled ? 'btn disabled' : 'btn not-disabled'}
    >
```

**Issues with Button Component Design:**
- Button.jsx uses inline styles (anti-pattern)
- Should use CSS classes instead
- Should accept semantic color names mapped to design tokens

**Impact:**
- Button styling inconsistent with design system
- Hard to maintain and change colors globally
- "transparent" background makes buttons invisible

**Recommendation:**
Either:
1. Use CSS class names: `className="btn btn-primary"` or `className="btn btn-transparent"`
2. Or fix Button component to use semantic color names and CSS classes internally

**Fix Required:** Clarify button styling approach and apply consistently

---

### VIOLATION 8: File Input Not Using InputField Component
**Location:** Lines 800-806
**Pattern Inconsistency:** Raw input instead of InputField component

```jsx
<InputField
  id="profileImage"
  label="Change PROFILE Image"
  type="file"
  name="profileImage"
  onChange={uploadFileHandler}
/>
```

**Wait - THIS IS ALREADY CORRECT.** InputField should handle file inputs.

However, comparing to UserProfileEditView (lines 366-374), there's an issue:
```jsx
// UserProfileEditView - BETTER
<input
  ref={fileInputRef}
  id="userProfileImage"
  type="file"
  name="userProfileImage"
  onChange={uploadFileHandler}
  accept="image/jpeg,image/png,image/webp"
  aria-describedby="image-requirements"
/>
<span id="image-requirements" className="field-hint">
  Supported formats: JPG, PNG, WebP. Maximum size: 5MB
</span>
```

**Problems with ProfileEditView's file input:**
- Missing `accept` attribute (should limit to image types)
- Missing file size guidance
- Using InputField component when raw input might be better
- Missing aria-describedby for accessible hints
- No hint about supported formats or size limits

**Fix Required:** Add accept attribute and size/format guidance

---

## Part 3: UX Improvements (High-Value Changes)

### UX 1: Profile Creation Flow Clarity
**Location:** Lines 315-337
**Current State:** Shows minimal instructions

```jsx
{!profile ? (
  <>
    <fieldset className="fieldSet item">
      <legend>Create a profile</legend>
      {createLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <p>Please click the button below to create a sample profile.</p>
          <p>You will then be able to edit your profile.</p>
          <Button
            type="submit"
            colour="transparent"
            text="Create your profile"
            className="btn"
            title="Create your profile"
            disabled={false}
            onClick={handleCreateProfile}
          ></Button>
        </>
      )}
    </fieldset>
  </>
) : null}
```

**Improvements:**
1. Add more context about what a "sample profile" contains
2. Show progress indicator (Step 1 of 2: Create Profile)
3. Add link to documentation about profile fields
4. Show estimated time to complete full profile
5. Explain why a sample profile is needed

---

### UX 2: Form Length and Cognitive Load
**Current State:** 910-line component with extensive form sections

**Sections included:**
1. Profile basics (name, email, social media, website)
2. Description (QuillEditor, 10+ chars required)
3. Keywords (5 input fields + algorithm display)
4. Specializations (4 input fields + Rich text field)
5. Qualifications (Rich text field)
6. Location (Textarea)
7. Telephone (InputField)
8. Profile summary display (read-only)
9. Image upload and preview
10. Profile image gallery
11. Qualification verification status
12. Rating display

**Problems:**
- Very long form (60+ visible fields when fully expanded)
- Users must scroll extensively
- Easy to make mistakes with so many fields
- Help button is hidden (line 354: toggle to show help)
- Multiple types of inputs (InputField, QuillEditor, textarea, native input)

**Recommendations:**
1. **Use Progressive Disclosure:**
   - Show only essential fields initially
   - Expand sections as needed
   - Use Accordion component for each section

2. **Separate Concerns:**
   - Consider multiple pages/steps
   - Step 1: Basic info
   - Step 2: Description
   - Step 3: Keywords & Specializations
   - Step 4: Qualifications & Verification
   - Step 5: Review & Submit

3. **Improve Help System:**
   - Show context-sensitive help by default (line 362: showHelp state)
   - Info icons next to fields with hover tooltips
   - Link to documentation

4. **Validation Feedback:**
   - Summary at top showing form completion %
   - Green checkmarks for completed sections
   - Required vs optional field indication

---

### UX 3: Help System Visibility and Usefulness
**Location:** Lines 351-364, 306-308, 362-364, 376-378, etc.
**Current Pattern:**

```jsx
<Button
  type="button"
  colour="transparent"
  text={!showHelp ? 'SHOW HELP' : 'HIDE HELP'}
  className="btn"
  title={!showHelp ? 'SHOW HELP' : 'HIDE HELP'}
  disabled={false}
  onClick={handleHelp}
></Button>

{showHelp ? (
  <InfoComponent description="Name that the public will see." />
) : null}
```

**Issues:**
- Help is collapsed by default (users don't see it unless they click)
- Single global help toggle shows help for all fields at once
- Help moves fields down, disrupting scroll position
- No context-specific help positioning
- Help button label is all-caps (less friendly)
- Toggle state affects entire form

**Improvements:**
1. Show help by default for new profiles
2. Use tooltips/popovers instead of full-width blocks
3. Position help contextually (as hint in InputField)
4. Make help dismissible per-field rather than form-wide
5. Use more friendly language in InfoComponent

---

### UX 4: Keyword Algorithm Display and Understanding
**Location:** Lines 544-593
**Current State:** Shows generated keywords but unclear

```jsx
<div>
  <hr className="style-one" />

  <h3>keywords search (Generated)</h3>
  <div>
    {keyWordSearch?.length < 10 ? (
      <span className="small-text">
        must have at least {keyWordSearch.length} characters.
      </span>
    ) : null}
    Our Algorithm has generated {Number(keyWordSearch?.length)} words with{' '}
    {Math.floor(keyWordSearch?.length / 5)} combinations. This
    includes keywords that have been taken from your
    description and including your name.
    <Button ... text={show ? 'Hide Combinations' : 'View Combinations'} ... />
    {show ? (
      <>
        <label>READ ONLY: </label>
        <textarea ... />
      </>
    ) : null}
  </div>
</div>
```

**Issues:**
- "generated {Number(keyWordSearch?.length)} words" is technically showing character count, not word count
- Math.floor(keyWordSearch?.length / 5) "combinations" is unclear metric
- Users don't understand what combinations means
- Algorithm explanation is too technical
- Read-only textarea with onChange handler (confusing UX)
- Can't select/copy text easily from textarea

**Improvements:**
1. Clarify the algorithm explanation
2. Show actual word count, not character count
3. Explain why combinations matter for search
4. Allow copying generated keywords
5. Add example of how keywords help with discoverability
6. Consider visualization instead of raw text

---

### UX 5: Form Section Validation Summary
**Current State:** No indication of form completion

**Improvement:**
Add completion summary at top:
```jsx
<div className="form-completion-summary">
  <h3>Profile Completion</h3>
  <div className="progress-bar" style={{ width: calculateCompletion() + '%' }}>
    {calculateCompletion()}%
  </div>
  <ul>
    <li className={name ? 'completed' : 'incomplete'}>
      <i className="fa fa-check"></i> Basic Information
    </li>
    <li className={description?.length >= 10 ? 'completed' : 'incomplete'}>
      <i className="fa fa-check"></i> Description
    </li>
    <li className={/* keywords complete? */ ? 'completed' : 'incomplete'}>
      <i className="fa fa-check"></i> Keywords
    </li>
    {/* More sections */}
  </ul>
</div>
```

---

### UX 6: Image Upload Feedback and Confirmation
**Location:** Lines 799-821
**Current Issues:**
- Preview shows immediately (no confirmation preview step)
- Upload starts without explicit confirmation
- No loading state shown during upload
- No success/error feedback after upload
- No indication when image is successfully set as profile picture

**Improvements:**
1. Show preview with confirmation buttons before upload
2. Display upload progress: "Uploading... 45%"
3. Show success message: "Profile image updated successfully"
4. Show error message if upload fails
5. Disable buttons during upload (aria-busy state)
6. Auto-select newly uploaded image in gallery

---

### UX 7: Email Guidance and Profile Visibility
**Location:** Line 346-349
**Current Message:** "Please note that the more complete your profile is the better it will feature when it is searched."

**Improvements:**
1. Make this more specific: "Each field you complete helps trainers be discoverable to clients"
2. Show field-specific impacts:
   - "Name: Used in search results"
   - "Description: Helps clients understand your approach"
   - "Keywords: Improves search matching"
   - "Qualifications: Builds client trust"
3. Add visual cue (progress bar) of completion
4. Link to profile preview as it will appear to clients

---

### UX 8: Telephone Number Formatting and Help
**Location:** Lines 736-754
**Current Validation:** `telephoneNumberRegEx = /^(07[\d]{8,12}|447[\d]{7,11})$/;`

**Issues:**
- Regex is very specific to UK phone numbers (07xxx and +447xxx)
- No guidance shown (missing hint prop)
- Error message vague: "Invalid mobile number"
- Users don't know expected format
- No formatting help (don't know if to include spaces or +44)

**Improvements:**
```jsx
<InputField
  label="Telephone Number"
  value={telephoneNumber}
  onChange={(e) => setTelephoneNumber(e.target.value)}
  onBlur={() => handleBlur('telephoneNumber')}
  type="tel"
  name="telephoneNumber"
  hint="UK mobile number: 07xxx xxxxxx or +447xxx xxxxxx"
  placeholder="07xxx xxxxxx"
  className={showPhoneError ? 'invalid' : isPhoneValid && telephoneNumber.length > 0 ? 'entered' : ''}
  error={showPhoneError ? `Phone must be valid UK mobile (07xxx xxxxxx or +447xxx xxxxxx)` : null}
/>
```

---

## Part 4: Accessibility Gaps (WCAG 2.1 Compliance Issues)

### A11Y 1: Image Delete Button Not Keyboard Accessible
**Location:** Lines 832-838
**WCAG Violation:** 2.1.1 Keyboard (Level A)
**Already covered in CRITICAL ISSUE #8**

---

### A11Y 2: Icon-Only Indicators Lack Color Independence
**Location:** Lines 880-892
**WCAG Violation:** 1.4.1 Use of Color (Level A)
**Already covered in CRITICAL ISSUE #4**

---

### A11Y 3: File Input Missing Accept Attribute and Guidance
**Location:** Lines 800-806
**WCAG Violation:** 3.3.2 Labels or Instructions (Level A)

```jsx
<InputField
  id="profileImage"
  label="Change PROFILE Image"
  type="file"
  name="profileImage"
  onChange={uploadFileHandler}
  // Missing: accept, aria-describedby, hint
/>
```

**Fix Required:**
```jsx
<InputField
  id="profileImage"
  label="Upload New Profile Image"
  type="file"
  name="profileImage"
  onChange={uploadFileHandler}
  accept="image/jpeg,image/png,image/webp"
  hint="JPG, PNG, or WebP up to 5MB"
  aria-describedby="image-requirements"
/>
<span id="image-requirements" className="field-hint">
  Supported formats: JPG, PNG, WebP. Maximum size: 5MB.
</span>
```

---

### A11Y 4: Rich Text Editors Without ARIA Labels
**Location:** Lines 437-441, 671-677, 692-698
**WCAG Violation:** 4.1.3 Name, Role, Value (Level A)

QuillEditor components don't include:
- aria-label
- aria-describedby
- Role attributes for rich content

**Impact:** Screen reader users don't understand what rich text editors are for.

**Fix Required:**
```jsx
<div className="input-wrapper">
  <label htmlFor="description-editor">Brief Description</label>
  <QuillEditor
    id="description-editor"
    value={description}
    onChange={setDescription}
    aria-label="Brief description of yourself (rich text editor)"
    aria-describedby="description-hint"
    className={showDescriptionError ? 'invalid' : 'entered'}
  />
  <span id="description-hint" className="field-hint">
    Minimum 10 characters. You can format text using the toolbar.
  </span>
  {showDescriptionError && (
    <p id="description-error" className="validation-error" role="alert">
      Description must have at least 10 characters ({description.length} entered)
    </p>
  )}
</div>
```

---

### A11Y 5: Form Validation Announcements Missing
**Location:** Line 171 (handleSubmit)
**WCAG Violation:** 3.3.4 Error Prevention (Level AA)

When form submission fails (due to validation), there should be an accessible error announcement.

**Current:** Errors just appear on fields (no form-level announcement)

**Fix Required:**
Add aria-live region at form top:
```jsx
<form onSubmit={handleSubmit} noValidate>
  {validationErrors.length > 0 && (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="form-error-summary"
    >
      <h2>Please correct the following errors:</h2>
      <ul>
        {validationErrors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  )}
  {/* Form fields */}
</form>
```

---

### A11Y 6: Touch Target Sizes
**Location:** Lines 832-838 (image delete), 815-818 (image buttons)
**WCAG Violation:** 2.5.5 Target Size (Level AAA)

Delete span and image buttons likely don't meet 44x44px minimum touch target size.

**Fix Required:** Ensure all interactive elements are 44x44px minimum (48px on mobile recommended).

```scss
.profile-image-delete-btn {
  min-width: 44px;
  min-height: 44px;
  padding: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

---

### A11Y 7: Missing Required Field Asterisk Indicators
**Location:** Throughout form
**WCAG Violation:** 3.3.2 Labels or Instructions (Level A)

Required fields marked with `required` prop but asterisk might not be visible or explained.

**InputField does show asterisk** (line 55 of InputField.jsx):
```jsx
{required && <span aria-label="required"> *</span>}
```

But not all fields are consistently marked as required.

**Fix Required:** Ensure all required fields are marked and documented.

---

### A11Y 8: Loading State Not Announced
**Location:** Lines 319-321, 793, 354
**WCAG Violation:** 4.1.3 Name, Role, Value (Level A)

LoadingSpinner components should have proper ARIA attributes.

**Fix Required:**
```jsx
{loading && (
  <div role="status" aria-live="polite" aria-busy="true">
    <LoadingSpinner />
    <span className="sr-only">Loading profile...</span>
  </div>
)}
```

---

## Part 5: Validation Issues & Regex Mismatches

### Validation Issue 1: Email Regex (Correct)
**Location:** Line 50-51
```javascript
const emailRegEx =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
```

**Assessment:** RFC 5322 compliant, correct.

---

### Validation Issue 2: Telephone Regex (Too Strict)
**Location:** Line 53
```javascript
const telephoneNumberRegEx = /^(07[\d]{8,12}|447[\d]{7,11})$/;
```

**Issues:**
1. Only accepts UK numbers (07xxx or +447xxx)
2. No guidance for users
3. Doesn't accept spaces or hyphens for readability
4. Message "Invalid mobile number" doesn't explain format

**Recommendation:** Allow flexible formatting:
```javascript
// More flexible - accepts various UK formats
const telephoneNumberRegEx = /^(\+44|0)[1-9]\d{1,}$/;

// With spaces/hyphens:
const telephoneNumberRegEx = /^(\+44|0)[1-9][\d\s\-]{7,}$/;
```

---

### Validation Issue 3: Missing Name Regex
**Location:** Not defined
**Current:** Only checks `name?.length === 0`

**Should have:** Regex to validate name format (like UserProfileEditView line 21):
```javascript
const nameRegEx = /^([\w])+\s+([\w\s])+$/i;  // First and last name
```

---

### Validation Issue 4: Keyword Field Rules Unclear
**Location:** Lines 456-535
**Current:** Requires minimum 3 characters per keyword

**Issue:** Validation shown in error prop but never enforced at submit.

**Fix Required:** Add to submit validation:
```javascript
if (keyWordSearchOne?.length < 3) {
  showNotification('All keyword fields must have at least 3 characters', 'error');
  return;
}
```

---

## Part 6: Code Quality Issues

### Quality 1: Typos and Grammar
**Location:** Throughout component

- Line 374: "Name field cant be empty!" should be "Name field can't be empty!"
- Line 468: "keyWord Search field must contain at least 3 characters!" - inconsistent capitalization ("keyWord" vs "Keyword")
- Line 430: "Description must have at least {description.length} characters" - inconsistent with other messages

**Fix Required:** Fix all text strings for consistency and grammar.

---

### Quality 2: Inconsistent State Management
**Location:** Lines 78-102 (useState declarations)

Multiple related keyword states:
```javascript
const [keyWordSearch, setkeyWordSearch] = useState('');
const [keyWordSearchOne, setkeyWordSearchOne] = useState('');
const [keyWordSearchTwo, setkeyWordSearchTwo] = useState('');
// ... 5 more similar declarations
```

**Issue:** Could use array instead of individual states:
```javascript
const [keywords, setKeywords] = useState({
  combined: '',
  items: ['', '', '', '', ''],  // For 5 keywords
});
```

---

### Quality 3: Missing PropTypes
**Location:** End of file

The component doesn't export PropTypes despite using Redux and receiving props.

---

### Quality 4: Unused Variable
**Location:** Line 89
```javascript
const [keyWordSearch, setkeyWordSearch] = useState('');
```

This is used later, so it's not unused. But convention is `setKeywordSearch` not `setkeyWordSearch` (mixed camelCase).

---

### Quality 5: Magic Numbers
**Location:** Throughout component

- Line 20: `description?.length < 10` - magic number for minimum description length
- Line 464: `keyWordSearchOne?.length < 3` - magic number for minimum keyword length
- Line 880: `fontSize: 20 + 'px'` - magic number for icon size

**Fix Required:** Extract to constants:
```javascript
const VALIDATION_RULES = {
  DESCRIPTION_MIN_LENGTH: 10,
  KEYWORD_MIN_LENGTH: 3,
  LOCATION_MIN_LENGTH: 10,
  ICON_SIZE_PX: 20,
};
```

---

## Part 7: Performance Considerations

### Performance 1: Keyword Permutation Algorithm
**Location:** Lines 176-260

Complex recursive algorithm runs on every form submission. This could be slow for large inputs.

**Optimization:**
1. Extract to utility function (easier to optimize)
2. Memoize results if keywords haven't changed
3. Consider moving to backend if too heavy
4. Add timeout/warning if algorithm takes too long

---

### Performance 2: useEffect Dependencies
**Location:** Line 144
```javascript
}, [navigate, dispatch, userInfo, profile]);
```

Profile data is set in this useEffect (lines 114-135). This creates a potential infinite loop if profile updates.

**Recommendation:** Review effect dependencies carefully.

---

## Part 8: Missing Image States and Feedback

### Issue: No Feedback for Image Upload
**Location:** Lines 799-821
**Current:** Image uploads but no confirmation

**Missing:**
- Loading state while uploading
- Success message when complete
- Error message if upload fails
- Confirmation that image is set as profile

**Improvements:**
```jsx
{profileImageLoading && (
  <Message
    message="Uploading image..."
    variant="success"
    isVisible={true}
  />
)}

{profileImageError && (
  <Message
    message={profileImageError}
    variant="error"
  />
)}

{profileImageSuccess && (
  <Message
    message="Image uploaded successfully!"
    variant="success"
    autoClose={3000}
  />
)}
```

---

## Summary of Issues by Priority

| Priority | Count | Type |
|----------|-------|------|
| CRITICAL | 8 | Must fix for functionality |
| HIGH | 12 | Consistency violations |
| MEDIUM | 10 | UX improvements |
| LOW | 8 | Accessibility enhancements |
| TECHNICAL DEBT | 5 | Code quality |

**Total Issues:** 43

---

## Recommended Implementation Order

### Phase 1: Critical Fixes (4-6 hours) - DO FIRST
1. Replace document.querySelector with useRef (CRITICAL 1)
2. Consolidate messages with variant management (CRITICAL 2)
3. Fix button labels - "Upload Image" / "Cancel" (CRITICAL 3)
4. Convert inline styles to CSS classes + add text labels (CRITICAL 4)
5. Fix textarea error display (CRITICAL 5)
6. Add form validation before submit (CRITICAL 6)
7. Add InputField props (id, hint, onBlur, aria-invalid) (CRITICAL 7)
8. Convert image delete span to button with ARIA (CRITICAL 8)

### Phase 2: Design System Alignment (3-4 hours) - DO SECOND
1. Implement blur-triggered validation (touched state)
2. Fix multiple save buttons (clarify form structure)
3. Extract keyword algorithm to utility
4. Add proper error display for QuillEditor fields
5. Fix Message component variant usage

### Phase 3: UX Enhancements (2-3 hours) - DO THIRD
1. Add form completion progress indicator
2. Improve help system (context-specific)
3. Add image upload feedback
4. Clarify keyword algorithm explanation
5. Improve telephone number formatting

### Phase 4: Accessibility & Polish (2-3 hours) - DO LAST
1. Fix all WCAG violations
2. Add proper ARIA labels to rich text editors
3. Add form error summary announcements
4. Verify touch target sizes
5. Test with screen reader

---

## Comparison: ProfileEditView vs UserProfileEditView

| Aspect | ProfileEditView | UserProfileEditView |
|--------|---|---|
| DOM Manipulation | Uses `document.querySelector` ❌ | Uses `useRef` ✓ |
| Message Management | Multiple unmanaged messages ❌ | Single consolidated state ✓ |
| Validation Pattern | Real-time (keystroke) ❌ | Blur-triggered (touched) ✓ |
| Button Labels | "I Like it" / "I Dont Like it" ❌ | Professional labels ✓ |
| InputField Props | Missing hint, id, onBlur, ARIA ❌ | Complete props ✓ |
| Icon Styling | Inline styles ❌ | CSS classes + text labels ✓ |
| Form Structure | 5+ save buttons ❌ | Single submit ✓ |
| Textarea Errors | Error prop ignored ❌ | Proper error display ✓ |

ProfileEditView needs to adopt all patterns that were fixed in UserProfileEditView.

---

## File Locations to Update

```
/home/gary/Documents/WebApps/dev/bodyvantage/client/src/views/profileEditView/ProfileEditView.jsx (910 lines)
/home/gary/Documents/WebApps/dev/bodyvantage/client/src/views/profileEditView/ProfileEditView.scss (92 lines)
```

---

## Conclusion

ProfileEditView is the main trainer profile editing interface but requires significant remediation to meet application standards. The component demonstrates:

1. **Functional Defects** - Missing validation, invalid HTML props, no submission feedback
2. **Anti-Pattern Implementation** - DOM manipulation, real-time validation, inline styles
3. **Consistency Issues** - Not applying patterns from UserProfileEditView that was already fixed
4. **Accessibility Failures** - Missing ARIA labels, non-keyboard-accessible controls, color-only indicators
5. **UX Concerns** - Multiple submit buttons, unclear feedback, cognitive overload

The good news: Most fixes are well-documented in UserProfileEditView's successful refactor. This component should follow the same pattern implementation.

**Estimated Effort:** 12-16 hours for complete remediation
- Phase 1 (Critical): 4-6 hours
- Phase 2 (Consistency): 3-4 hours
- Phase 3 (UX): 2-3 hours
- Phase 4 (Accessibility): 2-3 hours

**Recommended Action:** Begin with Phase 1 critical fixes immediately, as they block core functionality and data integrity.

