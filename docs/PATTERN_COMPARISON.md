# Pattern Comparison: ProfileEditView vs UserProfileEditView

This document shows side-by-side comparisons of how the same patterns differ between the two components. ProfileEditView should follow UserProfileEditView's patterns which have already been fixed.

---

## 1. DOM Manipulation Pattern

### UserProfileEditView (CORRECT)
```javascript
// Line 75: Using useRef
const fileInputRef = useRef(null);

// Line 210-213: Using ref to manipulate
const handleCancelImageUpload = () => {
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
  setPreviewImage('');
  setPreviewImageFile('');
};

// Line 366-374: In JSX with ref
<input
  ref={fileInputRef}
  id="userProfileImage"
  type="file"
  name="userProfileImage"
  onChange={uploadFileHandler}
  accept="image/jpeg,image/png,image/webp"
  aria-describedby="image-requirements"
/>
```

### ProfileEditView (WRONG)
```javascript
// Line 289: Using document.querySelector
const handleCancelImageUpload = () => {
  document.querySelector('#profileImage').value = '';  // ❌ Anti-pattern
  setPreviewImage('');
};

// Line 800-806: Missing ref
<InputField
  id="profileImage"
  label="Change PROFILE Image"
  type="file"
  name="profileImage"
  onChange={uploadFileHandler}
/>
```

**Why It Matters:**
- React state and DOM can get out of sync
- Direct DOM manipulation violates React principles
- Harder to test and maintain
- Browser compatibility issues

---

## 2. Message State Management

### UserProfileEditView (CORRECT)
```javascript
// Lines 64-68: Consolidated notification state
const [notification, setNotification] = useState({
  text: '',
  variant: 'error',
  visible: false,
});

// Lines 78-84: Helper function
const showNotification = (text, variant = 'error') => {
  setNotification({
    text,
    variant,
    visible: true,
  });
};

// Lines 224-232: In render - only one message at a time
{error && <Message message={error} variant="error" />}
{notification.visible && (
  <Message
    message={notification.text}
    variant={notification.variant}
    isVisible={notification.visible}
    onDismiss={() => setNotification((prev) => ({ ...prev, visible: false }))}
  />
)}
```

### ProfileEditView (WRONG)
```javascript
// Lines 312-313: Multiple unmanaged messages
{error ? <Message message={error} /> : null}
{createError ? <Message message={createError} /> : null}

// Issues:
// - Both can render simultaneously
// - No variant specified (unclear semantics)
// - No auto-close
// - No dismissal handling
```

**Why It Matters:**
- Messages can stack unpredictably
- No distinction between error types
- Can clutter screen indefinitely
- Poor user experience

---

## 3. Form Validation Pattern

### UserProfileEditView (CORRECT)
```javascript
// Lines 56-61: Touched state for blur-triggered validation
const [touched, setTouched] = useState({
  name: false,
  email: false,
  password: false,
  confirmPassword: false,
});

// Lines 87-89: Blur handler
const handleBlur = (field) => {
  setTouched((prev) => ({ ...prev, [field]: true }));
};

// Lines 92-101: Validation helpers
const isNameValid = nameRegEx.test(name);
const isEmailValid = emailRegEx.test(email);
const isPasswordValid = !hidePassword && password.length > 0
  ? passwordRegEx.test(password)
  : true;

// Lines 98-101: Show errors only after blur
const showNameError = touched.name && !isNameValid && name.length !== 0;
const showEmailError = touched.email && !isEmailValid && email.length !== 0;

// Lines 130-156: Form submit with validation
const handleSubmit = (e) => {
  e.preventDefault();

  // Validate all fields before submit
  if (!nameRegEx.test(name)) {
    showNotification('Please enter a valid name...', 'error');
    return;
  }

  if (!emailRegEx.test(email)) {
    showNotification('Please enter a valid email...', 'error');
    return;
  }

  // Only dispatch if validation passes
  dispatch(updateUserProfileAction({...}));
  showNotification('Profile updated successfully!', 'success');
};
```

### ProfileEditView (WRONG)
```javascript
// No touched state at all

// Lines 373: Real-time validation (shows error while typing)
className={name?.length === 0 ? 'invalid' : 'entered'}
error={name?.length === 0 ? `Name field cant be empty!` : null}

// Lines 386-389: Email validation on keystroke
className={!emailRegEx.test(email) ? 'invalid' : 'entered'}
error={!emailRegEx.test(email) ? `Invalid email address.` : null}

// Lines 171-260: No validation before submit
const handleSubmit = (e) => {
  e.preventDefault();

  let prom = new Promise((resolve, reject) => {
    // Keyword algorithm...
  });

  prom.then((res) => {
    dispatch(profileUpdateAction({...}));  // ❌ No validation!
  });
};

// Issues:
// - Errors shown while user is still typing
// - No validation check before dispatch
// - Invalid data can be submitted
```

**Why It Matters:**
- Real-time errors frustrate users (shows "invalid" before they're done)
- Invalid data reaches backend
- No form-level validation gate
- Inconsistent UX across application

---

## 4. InputField Component Usage

### UserProfileEditView (CORRECT)
```javascript
// Lines 246-260: Complete InputField usage
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

Component receives:
- id ✓
- label ✓
- hint ✓
- value ✓
- onChange ✓
- onBlur ✓
- type ✓
- name ✓
- required ✓
- className ✓
- error ✓
- aria-invalid ✓
- aria-describedby ✓

### ProfileEditView (WRONG)
```javascript
// Lines 365-375: Incomplete InputField usage
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

Missing:
- id ❌
- hint ❌
- onBlur ❌
- aria-invalid ❌
- aria-describedby ❌

**Why It Matters:**
- Hint provides upfront validation guidance
- onBlur enables blur-triggered validation
- aria-invalid/describedby required for accessibility
- id is best practice for associating elements

---

## 5. Message Component Usage

### UserProfileEditView (CORRECT)
```javascript
// Line 224: Static errors with variant
{error && <Message message={error} variant="error" />}

// Lines 225-231: Notifications with full control
{notification.visible && (
  <Message
    message={notification.text}
    variant={notification.variant}
    isVisible={notification.visible}
    onDismiss={() => setNotification((prev) => ({ ...prev, visible: false }))}
  />
)}

// In handleSubmit:
showNotification('Profile updated successfully!', 'success');  // Auto-closes in 3s
showNotification('Please check errors below.', 'error');  // Persists
showNotification('Confirm email first.', 'warning');  // Persists
```

### ProfileEditView (WRONG)
```javascript
// Lines 312-313: No variant, no control
{error ? <Message message={error} /> : null}
{createError ? <Message message={createError} /> : null}

// Issues:
// - No variant="error" (relies on default)
// - No autoClose prop
// - No onDismiss handler
// - Both messages can render together
// - Messages persist forever
```

**Why It Matters:**
- Variants allow semantic meaning (error vs success vs warning)
- autoClose prevents message clutter
- Multiple messages confuse users
- Users expect to dismiss messages

---

## 6. Button Component Usage

### UserProfileEditView (CORRECT)
```javascript
// Lines 337-344: Professional button
<Button
  type="submit"
  colour="transparent"
  text="Update Profile"
  className="btn"
  title={!user.isConfirmed ? 'You must confirm your email...' : null}
  disabled={!user.isConfirmed}
/>

// Image upload buttons (lines 388-402):
<div className="button-group">
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
</div>
```

### ProfileEditView (WRONG)
```javascript
// Line 815-818: Native HTML buttons with unprofessional text
<button>I Like it</button>
<button type="button" onClick={handleCancelImageUpload}>
  I Dont Like it
</button>

// Issues:
// - Not using Button component
// - "I Like it" / "I Dont Like it" is informal
// - No accessibility labels
// - Inconsistent with application UI
// - Grammar error: "Dont" should be "Don't"
```

**Why It Matters:**
- Consistent styling across application
- Professional language builds user trust
- Button component handles accessibility
- Disabled state with loading indicator
- Proper semantic HTML

---

## 7. Icon Styling Pattern

### UserProfileEditView (CORRECT)
```javascript
// Lines 412-420: Icon + text + CSS class
<p className="status-item">
  <span className="label">Confirmed User:</span>
  <span className={`status-indicator ${user.isConfirmed ? 'confirmed' : 'not-confirmed'}`}>
    <i
      className={user.isConfirmed ? 'fa fa-check' : 'fa fa-times'}
      aria-hidden="true"
    />
    <span className="status-text">
      {user.isConfirmed ? 'Confirmed' : 'Not Confirmed'}
    </span>
  </span>
</p>
```

CSS (UserProfileEditView.scss):
```scss
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &.confirmed {
    color: $success;  // Design token
  }

  &.not-confirmed {
    color: $danger;  // Design token
  }

  i {
    font-size: 1.25rem;
  }
}
```

### ProfileEditView (WRONG)
```javascript
// Lines 880-892: Icon-only with inline styles
{profile.isQualificationsVerified === true ? (
  <i
    className="fa fa-check"
    style={{
      fontSize: 20 + 'px',  // Magic number, inline style
      color: 'rgba(92, 184, 92, 1)',  // Hard-coded color
    }}
  ></i>
) : (
  <i
    className="fa fa-times"
    style={{ fontSize: 20 + 'px', color: 'crimson' }}  // Different colors
  ></i>
)}

// Issues:
// - Inline styles (hard to maintain)
// - Hard-coded colors (can't change globally)
// - Icon-only (fails color-blind users)
// - No text label
// - No ARIA label
// - Magic numbers (20px not consistent)
```

**Why It Matters:**
- CSS classes vs inline styles: maintainability
- Design tokens vs hard-coded: consistency
- Icon + text: accessibility for all users
- WCAG 1.4.1 violation without text

---

## 8. Rich Text Editor Error Handling

### UserProfileEditView
(Not applicable - doesn't use QuillEditor)

### ProfileEditView (WRONG)
```javascript
// Lines 437-441: No error display
<div className="input-wrapper">
  <label>Brief Description of yourself</label>
  <QuillEditor
    value={description}
    onChange={setDescription}
    className={description?.length < 10 ? 'invalid' : 'entered'}
  />
</div>

// Issues:
// - className applied but no visual error
// - No error message displayed
// - No hint about minimum length
// - User doesn't see validation feedback
```

**How to Fix:**
```javascript
// With proper error display
<div className="input-wrapper">
  <label htmlFor="description-editor">Brief Description</label>
  <QuillEditor
    id="description-editor"
    value={description}
    onChange={setDescription}
    className={showDescriptionError ? 'invalid' : 'entered'}
  />
  {showDescriptionError && (
    <p className="validation-error" role="alert">
      Description must have at least 10 characters ({description.length} entered)
    </p>
  )}
  <span className="field-hint">
    Minimum 10 characters to help clients understand your approach
  </span>
</div>
```

---

## 9. File Input with Accessibility

### UserProfileEditView (CORRECT)
```javascript
// Lines 366-377: Complete file input setup
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

### ProfileEditView (WRONG)
```javascript
// Lines 800-806: Missing attributes
<InputField
  id="profileImage"
  label="Change PROFILE Image"
  type="file"
  name="profileImage"
  onChange={uploadFileHandler}
/>

// Missing:
// - accept attribute (file type restriction)
// - aria-describedby (accessibility)
// - hint about formats/size
```

**Why It Matters:**
- accept attribute limits files in file picker (UX)
- aria-describedby links input to description
- Format/size guidance helps users
- Accessibility requirement

---

## 10. Form Structure: Multiple Save Buttons

### UserProfileEditView (CORRECT)
```javascript
// Single submit button for entire form
<Button
  type="submit"
  colour="transparent"
  text="Update Profile"
  className="btn"
  disabled={!user.isConfirmed}
/>
```

### ProfileEditView (PROBLEMATIC)
```javascript
// Multiple save buttons scattered throughout:
// Line 418-425: "Save profile basics"
// Line 443-450: "Save description"
// Line 679-686: "Save specialisation"
// Line 700-707: "Save qualifications"
// Line 727-734: "Save location"

// Issues:
// - 5+ buttons submit same form
// - Users confused which one to click
// - What gets saved with each button?
// - Visual clutter
// - Violates single form = single action principle
```

**Recommended Fix:**
Choose one pattern:

Option A: Single submit at bottom
```jsx
<form onSubmit={handleSubmit}>
  {/* All fields... */}
  <Button type="submit" text="Save All Profile Changes" />
</form>
```

Option B: Multiple independent forms
```jsx
<form onSubmit={handleBasicInfoSubmit}>
  {/* Name, email, social fields... */}
  <Button type="submit" text="Save Basic Info" />
</form>

<form onSubmit={handleDescriptionSubmit}>
  {/* Description field... */}
  <Button type="submit" text="Save Description" />
</form>
```

Option C: Sections with single submit
```jsx
<form onSubmit={handleSubmit}>
  <fieldset>
    <legend>Basic Information</legend>
    {/* Fields... */}
  </fieldset>

  <fieldset>
    <legend>Description</legend>
    {/* Fields... */}
  </fieldset>

  <Button type="submit" text="Save All Changes" />
</form>
```

---

## Summary Table

| Pattern | UserProfileEditView | ProfileEditView | Status |
|---------|---|---|---|
| File Input | useRef | document.querySelector | ❌ WRONG |
| Messages | Consolidated state | Multiple unmanaged | ❌ WRONG |
| Validation | Blur-triggered + submit check | Real-time keystroke | ❌ WRONG |
| InputField Props | All props (hint, onBlur, aria) | Missing 5+ props | ❌ WRONG |
| Message Variant | Explicit variants | No variants specified | ❌ WRONG |
| Button Labels | "Update Profile" | "I Like it" / "I Dont Like it" | ❌ WRONG |
| Icon Styling | CSS classes + tokens | Inline styles + hard-coded | ❌ WRONG |
| Error Display | Visible + role="alert" | Missing or non-functional | ❌ WRONG |
| File Input | accept + aria-describedby | Missing attributes | ❌ WRONG |
| Form Structure | Single submit | Multiple buttons | ⚠ INCONSISTENT |

---

## Key Takeaway

**ProfileEditView needs to adopt ALL patterns already implemented in UserProfileEditView.**

UserProfileEditView has been fixed to align with application standards. Those same fixes need to be applied to ProfileEditView to ensure consistency across the application.

The patterns are proven, tested, and already in use. Simply apply them to ProfileEditView systematically.

