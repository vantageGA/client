# Code Remediation Examples for UserProfileEditView

This document provides concrete code examples for implementing the recommendations from the UI/UX review.

---

## 1. Critical Issue: Password Regex Mismatch

### Current Code (WRONG)
```javascript
// Line 24
const passwordRegEx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/;

// Line 210 - Error message incomplete
error={
  !passwordRegEx.test(password) && password.length !== 0
    ? `Password must contain at least 1 uppercase letter and a number`
    : null
}
```

### Issue
The regex rejects special characters, but the error message doesn't mention this requirement.

### Solution A: Keep Alphanumeric Only (RECOMMENDED)
```javascript
// Top of component
const passwordRegEx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/;

// Line 199-212 (Password field)
<InputField
  label="Password"
  type="password"
  name="password"
  value={password}
  required={!hidePassword}  // Only required when section shown
  hint="6+ characters: must include uppercase, lowercase, and number. Letters and numbers only (no special characters)."
  className={
    password.length === 0 ? '' : (!passwordRegEx.test(password) ? 'invalid' : 'entered')
  }
  error={
    !passwordRegEx.test(password) && password.length !== 0
      ? `Password must contain at least 6 characters with uppercase letter, lowercase letter, and a number. Special characters are not allowed.`
      : null
  }
  onChange={(e) => setPassword(e.target.value)}
  onBlur={() => setPasswordTouched(true)}
  aria-invalid={!passwordRegEx.test(password) && password.length !== 0}
  aria-describedby={
    !passwordRegEx.test(password) && password.length !== 0
      ? 'password-error'
      : undefined
  }
/>
```

### Solution B: Allow Special Characters (MORE SECURE)
```javascript
// Change regex to require special characters
const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

// Then use in InputField:
hint="8+ characters: must include uppercase, lowercase, number, and special character (!@#$%^&*)"
error={
  !passwordRegEx.test(password) && password.length !== 0
    ? `Password must contain 8+ characters with uppercase, lowercase, number, and special character (!@#$%^&*)`
    : null
}
```

---

## 2. Critical Issue: Multiple Message Components

### Current Code (WRONG)
```jsx
// Lines 147-148
{error ? <Message message={error} /> : null}
{message ? <Message message={message} /> : null}
```

### Problems
- Both render simultaneously
- No variant distinction
- No auto-close
- Manual state management of `message`

### Solution
```javascript
// State management - replace lines 50-56
const [messageState, setMessageState] = useState({
  text: '',
  variant: 'error',  // 'error' | 'success' | 'warning'
  visible: false,
});

// Helper function to set messages
const showMessage = (text, variant = 'error', autoClose = false) => {
  setMessageState({
    text,
    variant,
    visible: true,
  });

  // Auto-close if specified
  if (autoClose) {
    setTimeout(() => {
      setMessageState((prev) => ({ ...prev, visible: false }));
    }, autoClose);
  }
};

// In useEffect, replace lines 70-72
if (user.isConfirmed === false) {
  showMessage(
    'In order to update your profile you will need to confirm your email address. This can be done by referring back to the email you received when you first registered.',
    'warning'
  );
}

// In handleSubmit, replace lines 90-108
const handleSubmit = (e) => {
  e.preventDefault();

  // Validation check
  if (!nameRegEx.test(name)) {
    showMessage('Please enter a valid name', 'error');
    return;
  }

  if (!emailRegEx.test(email)) {
    showMessage('Please enter a valid email', 'error');
    return;
  }

  // Password validation only if entered
  if (password.length > 0) {
    if (!passwordRegEx.test(password)) {
      showMessage('Please enter a valid password', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }
  }

  // Check confirmation
  if (user.isConfirmed !== true) {
    showMessage(
      'You have not yet confirmed your email. Please check your emails.',
      'warning'
    );
    return;
  }

  // Dispatch action with loading state
  dispatch(
    updateUserProfileAction({
      id: user._id,
      name,
      email,
      password,
    })
  );

  // Clear password fields after successful dispatch
  setPassword('');
  setConfirmPassword('');
  setHidePassword(true);

  showMessage(
    'Profile updated successfully',
    'success',
    5000  // auto-close after 5 seconds
  );
};

// JSX replacement for lines 147-148
{messageState.visible && (
  <Message
    message={messageState.text}
    variant={messageState.variant}
    autoClose={messageState.variant === 'success' ? 5000 : null}
    isVisible={messageState.visible}
    onDismiss={() => setMessageState((prev) => ({ ...prev, visible: false }))}
  />
)}
```

---

## 3. Critical Issue: DOM Manipulation Anti-Pattern

### Current Code (WRONG)
```javascript
// Line 136
const handleCancelImageUpload = () => {
  document.querySelector('#userProfileImage').value = '';
  setPreviewImage('');
};
```

### Solution
```javascript
// Add useRef at top of component (after line 20)
const fileInputRef = useRef(null);

// Replace line 136
const handleCancelImageUpload = () => {
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
  setPreviewImage('');
  setPreviewImageFile('');  // Also reset file state
};

// Update InputField usage (lines 261-267)
<InputField
  id="userProfileImage"
  label="Change user profile image"
  type="file"
  name="userProfileImage"
  onChange={uploadFileHandler}
  // Add ref to InputField OR use wrapper:
/>

// Better: wrap input in form with ref
<input
  ref={fileInputRef}
  id="userProfileImage"
  type="file"
  name="userProfileImage"
  onChange={uploadFileHandler}
  aria-label="Upload new profile image"
/>
```

**Note:** The InputField component doesn't expose a ref prop. Consider either:
1. Adding ref forwarding to InputField component, OR
2. Using a separate controlled file input with ref

---

## 4. Critical Issue: Form Validation Before Submit

### Current Code (WRONG)
```javascript
// Lines 87-109 - no validation before dispatch
const handleSubmit = (e) => {
  e.preventDefault();
  if (password !== confirmPassword) {
    setMessage('Passwords do not match');
  } else {
    if (user.isConfirmed === true) {
      dispatch(updateUserProfileAction({...}));  // May have invalid data!
    }
  }
};
```

### Solution (See Section 2 above for complete implementation)

Key additions:
```javascript
const handleSubmit = (e) => {
  e.preventDefault();

  // Validate name
  if (!nameRegEx.test(name)) {
    showMessage('Name must contain a first name and surname both starting with capital letters', 'error');
    return;
  }

  // Validate email
  if (!emailRegEx.test(email)) {
    showMessage('Please enter a valid email address', 'error');
    return;
  }

  // Validate password if entered
  if (password.length > 0 || confirmPassword.length > 0) {
    if (!passwordRegEx.test(password)) {
      showMessage('Password must contain at least 1 uppercase letter, 1 lowercase letter, and a number', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }
  }

  // Check user confirmation
  if (user.isConfirmed !== true) {
    showMessage('You must confirm your email before updating your profile', 'warning');
    return;
  }

  // All validations passed, dispatch action
  dispatch(
    updateUserProfileAction({
      id: user._id,
      name,
      email,
      ...(password && { password }),  // Only include password if it was changed
    })
  );
};
```

---

## 5. Critical Issue: Password Toggle Checkbox Accessibility

### Current Code (WRONG)
```jsx
// Lines 187-196
<label>
  <input
    type="checkbox"
    defaultChecked={!hidePassword}
    onChange={() => setHidePassword(!hidePassword)}
  />
  {!hidePassword
    ? 'Hide Password Settings'
    : 'Show Password Settings'}
</label>
```

### Problems
- No id on input
- No aria-controls
- No aria-expanded
- Inverted label logic
- Controls section via conditional rendering (poor a11y)

### Solution
```jsx
// Add state tracking (line 55)
const [showPasswordSettings, setShowPasswordSettings] = useState(false);

// Add touched state for validation (add with other touched states)
const [passwordTouched, setPasswordTouched] = useState(false);
const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

// Replace lines 187-235
<div className="password-toggle-wrapper">
  <label htmlFor="password-toggle">
    <input
      id="password-toggle"
      type="checkbox"
      checked={showPasswordSettings}
      onChange={(e) => setShowPasswordSettings(e.target.checked)}
      aria-controls="password-fields-section"
      aria-expanded={showPasswordSettings}
    />
    <span className="toggle-label">
      {showPasswordSettings ? 'Hide' : 'Show'} password settings
    </span>
  </label>
</div>

{showPasswordSettings && (
  <div id="password-fields-section" className="password-fields-section">
    <InputField
      id="password"
      label="New Password"
      type="password"
      name="password"
      value={password}
      required
      hint="6+ characters: uppercase, lowercase, and number only (no special characters)"
      className={
        password.length === 0 ? '' : (!passwordRegEx.test(password) ? 'invalid' : 'entered')
      }
      error={
        passwordTouched && password.length > 0 && !passwordRegEx.test(password)
          ? `Password must contain at least 6 characters with uppercase letter, lowercase letter, and a number`
          : null
      }
      onChange={(e) => setPassword(e.target.value)}
      onBlur={() => setPasswordTouched(true)}
      aria-invalid={passwordTouched && password.length > 0 && !passwordRegEx.test(password)}
      aria-describedby={
        passwordTouched && password.length > 0 && !passwordRegEx.test(password)
          ? 'password-error'
          : undefined
      }
    />

    <InputField
      id="confirmPassword"
      label="Confirm Password"
      type="password"
      name="confirmPassword"
      value={confirmPassword}
      required
      hint="Must match password field exactly"
      className={
        confirmPassword.length === 0
          ? ''
          : !passwordRegEx.test(confirmPassword)
          ? 'invalid'
          : 'entered'
      }
      error={
        confirmPasswordTouched && confirmPassword.length > 0 && !passwordRegEx.test(confirmPassword)
          ? `Password must contain at least 6 characters with uppercase letter, lowercase letter, and a number`
          : confirmPasswordTouched && password !== confirmPassword && confirmPassword.length > 0
          ? 'Passwords do not match'
          : null
      }
      onChange={(e) => setConfirmPassword(e.target.value)}
      onBlur={() => setConfirmPasswordTouched(true)}
      aria-invalid={
        confirmPasswordTouched &&
        (password !== confirmPassword ||
          !passwordRegEx.test(confirmPassword)) &&
        confirmPassword.length > 0
      }
      aria-describedby={
        confirmPasswordTouched &&
        (password !== confirmPassword ||
          !passwordRegEx.test(confirmPassword)) &&
        confirmPassword.length > 0
          ? 'confirmPassword-error'
          : undefined
      }
    />
  </div>
)}
```

### Add CSS (UserProfileEditView.scss)
```scss
.password-toggle-wrapper {
  margin-bottom: 1rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;

    input[type='checkbox'] {
      cursor: pointer;
      width: 18px;
      height: 18px;
      accent-color: $burnt-orange;

      &:focus {
        outline: 2px solid $burnt-orange;
        outline-offset: 2px;
      }
    }

    .toggle-label {
      user-select: none;
    }
  }
}

.password-fields-section {
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: rgba(25, 25, 25, 0.5);
  border-left: 3px solid $burnt-orange;
  border-radius: 4px;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}
```

---

## 6. Design System: Add Hint Props to InputFields

### Current Code (WRONG)
```jsx
// Lines 159-172 (Name field)
<InputField
  label="Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  type="text"
  name="name"
  required
  className={!nameRegEx.test(name) ? 'invalid' : 'entered'}
  error={
    !nameRegEx.test(name) && name.length !== 0
      ? `Name field must contain a first name and surname both of which must start with a capital letter.`
      : null
  }
/>
```

### Solution
```jsx
// State for touched tracking
const [nameTouched, setNameTouched] = useState(false);
const [emailTouched, setEmailTouched] = useState(false);

// Lines 159-172 (Name field) - UPDATED
<InputField
  id="name"
  label="Name"
  type="text"
  name="name"
  value={name}
  required
  hint="First name and surname, each starting with a capital letter (e.g., John Smith)"
  className={
    name.length === 0 ? '' : (!nameRegEx.test(name) ? 'invalid' : 'entered')
  }
  error={
    nameTouched && name.length !== 0 && !nameRegEx.test(name)
      ? `Name must contain a first name and surname both starting with capital letters`
      : null
  }
  onChange={(e) => setName(e.target.value)}
  onBlur={() => setNameTouched(true)}
  aria-invalid={nameTouched && name.length !== 0 && !nameRegEx.test(name)}
  aria-describedby={
    nameTouched && name.length !== 0 && !nameRegEx.test(name)
      ? 'name-error'
      : undefined
  }
/>

// Lines 173-185 (Email field) - UPDATED
<InputField
  id="email"
  label="Email"
  type="email"
  name="email"
  value={email}
  required
  hint="Valid email format required (e.g., user@example.com)"
  className={
    email.length === 0 ? '' : (!emailRegEx.test(email) ? 'invalid' : 'entered')
  }
  error={
    emailTouched && email.length !== 0 && !emailRegEx.test(email)
      ? `Please enter a valid email address`
      : null
  }
  onChange={(e) => setEmail(e.target.value)}
  onBlur={() => setEmailTouched(true)}
  aria-invalid={emailTouched && email.length !== 0 && !emailRegEx.test(email)}
  aria-describedby={
    emailTouched && email.length !== 0 && !emailRegEx.test(email)
      ? 'email-error'
      : undefined
  }
/>
```

---

## 7. Image Upload Flow Improvement

### Current Code (WRONG)
```jsx
// Lines 260-282
<form onSubmit={handleUserProfileImageUpdate}>
  <InputField
    id="userProfileImage"
    label="Change USER Profile Image"
    type="file"
    name="userProfileImage"
    onChange={uploadFileHandler}
  />
  {previewImage ? (
    <>
      Image Preview
      <img src={previewImage} alt="profile" style={{ width: '120px' }} />
      <button>I Like it</button>
      <button type="button" onClick={handleCancelImageUpload}>
        I Dont Like it
      </button>
    </>
  ) : null}
</form>
```

### Solution
```jsx
// State (add near line 48)
const [imageUploadLoading, setImageUploadLoading] = useState(false);

// Effect to handle upload completion (add after line 85)
useEffect(() => {
  if (userProfileImageLoading === false && previewImage) {
    // Check if upload was successful by checking if user.profileImage changed
    if (user.profileImage && user.profileImage !== previewImage) {
      // Success - clear preview
      handleCancelImageUpload();
      showMessage('Profile image updated successfully', 'success', 5000);
    }
  }
}, [userProfileImageLoading]);

// Updated form (lines 260-282)
<fieldset className="fieldSet item">
  <legend>
    <span>PROFILE</span> IMAGE
  </legend>

  {userProfileImageLoading ? (
    <div role="status" aria-live="polite" aria-busy="true">
      <LoadingSpinner />
    </div>
  ) : null}

  <form onSubmit={handleUserProfileImageUpdate}>
    <InputField
      id="userProfileImage"
      label="Select new profile image"
      type="file"
      name="userProfileImage"
      hint="JPG, PNG, or WebP up to 5MB"
      onChange={uploadFileHandler}
      disabled={userProfileImageLoading}
      aria-describedby="image-requirements"
    />
    <span id="image-requirements" className="field-hint">
      Supported formats: JPG, PNG, WebP. Maximum file size: 5MB
    </span>

    {previewImage ? (
      <div className="image-preview-section">
        <h3>Image Preview</h3>
        <img
          src={previewImage}
          alt="Preview of new profile image"
          className="preview-image"
        />

        <div className="image-preview-actions">
          <Button
            type="submit"
            text="Confirm and Upload"
            disabled={userProfileImageLoading}
            colour={userProfileImageLoading ? 'grey' : '$burnt-orange'}
            aria-busy={userProfileImageLoading}
          />
          <Button
            type="button"
            text="Cancel"
            disabled={userProfileImageLoading}
            colour={userProfileImageLoading ? 'grey' : 'transparent'}
            onClick={handleCancelImageUpload}
          />
        </div>
      </div>
    ) : null}
  </form>
</fieldset>
```

### Add CSS (UserProfileEditView.scss)
```scss
.image-preview-section {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: rgba(25, 25, 25, 0.5);
  border-radius: 4px;

  h3 {
    margin-bottom: 1rem;
    color: $burnt-orange;
  }

  .preview-image {
    width: 120px;
    height: 120px;
    margin-bottom: 1rem;
    border-radius: 4px;
    object-fit: cover;
  }

  .image-preview-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;

    button {
      min-width: 44px;
      min-height: 44px;
    }
  }
}
```

---

## 8. Icon-Only Indicators Fix

### Current Code (WRONG)
```jsx
// Lines 287-301 (Confirmed User status)
<p>
  Confirmed User:{' '}
  {user.isConfirmed === true ? (
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
</p>
```

### Solution
```jsx
// Create reusable component for status indicator
// (in a new file: components/statusIndicator/StatusIndicator.jsx)
const StatusIndicator = ({ status, label, confirmedLabel, unconfirmedLabel }) => (
  <span className={`status-indicator status-${status}`}>
    <i
      className={status ? 'fa fa-check' : 'fa fa-times'}
      aria-hidden="true"
    />
    <span className="status-label">
      {status ? confirmedLabel : unconfirmedLabel}
    </span>
  </span>
);

// OR inline in component:
<p className="status-item">
  <span className="label">Email Confirmed:</span>
  <span className={`status-indicator ${user.isConfirmed ? 'confirmed' : 'unconfirmed'}`}>
    <i
      className={user.isConfirmed ? 'fa fa-check' : 'fa fa-times'}
      aria-hidden="true"
    />
    <span className="status-text">
      {user.isConfirmed ? 'Confirmed' : 'Not Confirmed'}
    </span>
  </span>
</p>

<p className="status-item">
  <span className="label">Admin:</span>
  <span className={`status-indicator ${user.isAdmin ? 'confirmed' : 'unconfirmed'}`}>
    <i
      className={user.isAdmin ? 'fa fa-check' : 'fa fa-times'}
      aria-hidden="true"
    />
    <span className="status-text">
      {user.isAdmin ? 'Administrator' : 'User'}
    </span>
  </span>
</p>
```

### Add CSS (UserProfileEditView.scss)
```scss
.status-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.5rem 0;

  .label {
    font-weight: 600;
    min-width: 120px;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &.confirmed {
      color: $success;

      i {
        font-size: 1.25rem;
      }

      .status-text {
        font-weight: 600;
      }
    }

    &.unconfirmed {
      color: $danger;

      i {
        font-size: 1.25rem;
      }

      .status-text {
        font-weight: 600;
      }
    }
  }
}
```

---

## 9. Consolidate Messages with Auto-Close

### New Message State Management
```javascript
// Replace lines 56 with:
const [notification, setNotification] = useState({
  text: '',
  variant: 'error',  // 'error' | 'success' | 'warning'
  visible: false,
  autoClose: null,
});

// Helper function
const showNotification = (text, variant = 'error', autoClose = null) => {
  setNotification({
    text,
    variant,
    visible: true,
    autoClose,
  });
};

// In component JSX (replace lines 147-148)
{notification.visible && (
  <Message
    message={notification.text}
    variant={notification.variant}
    autoClose={notification.autoClose}
    isVisible={notification.visible}
    onDismiss={() => setNotification((prev) => ({ ...prev, visible: false }))}
  />
)}
```

---

## 10. Mobile Responsive CSS Fix

### Current Code (WRONG)
```scss
// Line 29 in UserProfileEditView.scss
@media (max-width: 812px) {
  .user-profile-wrapper {
    flex-wrap: wrap;
    .item {
      width: 100vw; /* Causes horizontal scroll! */
    }
  }
}
```

### Solution
```scss
@media (max-width: 812px) {
  .user-profile-wrapper {
    flex-wrap: wrap;
    gap: 0.5rem;

    .item {
      width: 100%; /* Use percentage, not viewport width */
      padding: 0 1rem; /* Add padding to account for screen edges */
      box-sizing: border-box;
    }

    .image {
      width: 100px;
      height: 100px;
    }
  }
}

/* Additional small screen optimizations */
@media (max-width: 480px) {
  .user-profile-wrapper {
    gap: 0.5rem;

    .item {
      width: 100%;
      padding: 0 0.75rem;
    }

    .image {
      width: 80px;
      height: 80px;
    }

    /* Ensure buttons have adequate touch targets */
    button {
      min-height: 48px;
      padding: 0.875rem 1rem;
    }
  }
}
```

---

## 11. Complete State Management Refactor

### New State Structure (Replace lines 50-60)
```javascript
// Form state
const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

// Validation state
const [touched, setTouched] = useState({
  name: false,
  email: false,
  password: false,
  confirmPassword: false,
});

// UI state
const [showPasswordSettings, setShowPasswordSettings] = useState(false);
const [previewImage, setPreviewImage] = useState('');
const [previewImageFile, setPreviewImageFile] = useState('');

// Notification state
const [notification, setNotification] = useState({
  text: '',
  variant: 'error',
  visible: false,
  autoClose: null,
});

// Helper function
const showNotification = (text, variant = 'error', autoClose = null) => {
  setNotification({
    text,
    variant,
    visible: true,
    autoClose,
  });
};

const handleTouchField = (field) => {
  setTouched((prev) => ({ ...prev, [field]: true }));
};

const handleFieldChange = (field, value) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
};
```

---

## Implementation Checklist

Use this checklist to track remediation progress:

### Critical Issues (Phase 1)
- [ ] Fix password regex mismatch with error message
- [ ] Implement message state management with variant prop
- [ ] Replace document.querySelector with useRef
- [ ] Add form validation before submission
- [ ] Fix password toggle checkbox accessibility

### Design System Alignment (Phase 2)
- [ ] Add hint props to all InputFields
- [ ] Add onBlur handlers with touched state
- [ ] Add aria-invalid and aria-describedby
- [ ] Use Message variant prop consistently
- [ ] Fix Button component usage

### UX Enhancements (Phase 3)
- [ ] Add loading state for form submission
- [ ] Refactor password toggle pattern
- [ ] Improve image upload flow
- [ ] Add email confirmation resend
- [ ] Consolidate warning messages

### Accessibility & Polish (Phase 4)
- [ ] Fix all WCAG violations
- [ ] Add aria-live regions
- [ ] Verify touch target sizes
- [ ] Test with screen reader
- [ ] Fix mobile responsive issues
- [ ] Fix typos ("In order to", "your emails", "Don't")

---

## Testing Checklist

After implementing changes, test:

### Functionality
- [ ] Form validates name/email/password before submission
- [ ] Password fields only required when shown
- [ ] Image upload shows loading state
- [ ] Messages auto-close appropriately
- [ ] Password toggle shows/hides section

### Accessibility
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators visible and burnt-orange
- [ ] Screen reader announces form errors
- [ ] Touch targets are 44px+ (48px on mobile)
- [ ] Color contrast meets WCAG AA (4.5:1+)
- [ ] No keyboard traps

### Responsive
- [ ] No horizontal scrollbar on mobile
- [ ] Touch targets adequate on small screens
- [ ] Layout adapts below 812px
- [ ] Images responsive

### Browser Compatibility
- [ ] Works in Chrome/Edge
- [ ] Works in Firefox
- [ ] Works in Safari (including iOS)
- [ ] File input works across browsers

---

