# Implementation Guide: ProfileEditView Critical Fixes

This guide provides step-by-step code fixes for the 8 critical issues identified in the UI/UX review. Apply these fixes in order.

---

## CRITICAL FIX #1: Replace document.querySelector with useRef

**File:** `/home/gary/Documents/WebApps/dev/bodyvantage/client/src/views/profileEditView/ProfileEditView.jsx`

### Step 1: Add useRef import
**Location:** Line 1

```javascript
// CHANGE FROM:
import React, { useEffect, useState } from 'react';

// CHANGE TO:
import React, { useEffect, useState, useRef } from 'react';
```

### Step 2: Create ref in component
**Location:** After state declarations (around line 90, with other state)

```javascript
// Add after other state declarations
const profileImageInputRef = useRef(null);
```

### Step 3: Update handleCancelImageUpload function
**Location:** Lines 288-291

```javascript
// CHANGE FROM:
const handleCancelImageUpload = () => {
  document.querySelector('#profileImage').value = '';
  setPreviewImage('');
};

// CHANGE TO:
const handleCancelImageUpload = () => {
  if (profileImageInputRef.current) {
    profileImageInputRef.current.value = '';
  }
  setPreviewImage('');
};
```

### Step 4: Update file input element
**Location:** Lines 800-806

```jsx
// CHANGE FROM:
<InputField
  id="profileImage"
  label="Change PROFILE Image"
  type="file"
  name="profileImage"
  onChange={uploadFileHandler}
/>

// CHANGE TO:
<div className="file-input-wrapper">
  <label htmlFor="profileImage">Change Profile Image</label>
  <input
    ref={profileImageInputRef}
    id="profileImage"
    type="file"
    name="profileImage"
    onChange={uploadFileHandler}
    accept="image/jpeg,image/png,image/webp"
    aria-describedby="image-requirements"
  />
  <span id="image-requirements" className="field-hint">
    Supported formats: JPG, PNG, WebP. Maximum size: 5MB
  </span>
</div>
```

---

## CRITICAL FIX #2: Consolidate Messages with Variant Management

**File:** `/home/gary/Documents/WebApps/dev/bodyvantage/client/src/views/profileEditView/ProfileEditView.jsx`

### Step 1: Add notification state
**Location:** After other useState declarations (around line 91)

```javascript
// Add after other state declarations
const [notification, setNotification] = useState({
  text: '',
  variant: 'error', // 'error', 'success', 'warning'
  visible: false,
});
```

### Step 2: Add notification helper
**Location:** After handleHelp function (around line 309)

```javascript
const showNotification = (text, variant = 'error') => {
  setNotification({
    text,
    variant,
    visible: true,
  });
};
```

### Step 3: Update render - replace old messages
**Location:** Lines 312-313

```jsx
// CHANGE FROM:
{error ? <Message message={error} /> : null}
{createError ? <Message message={createError} /> : null}

// CHANGE TO:
{(error || createError) && (
  <Message
    message={error || createError}
    variant="error"
    isVisible={true}
    onDismiss={() => setNotification((prev) => ({ ...prev, visible: false }))}
    autoClose={5000}
  />
)}

{notification.visible && (
  <Message
    message={notification.text}
    variant={notification.variant}
    isVisible={notification.visible}
    onDismiss={() => setNotification((prev) => ({ ...prev, visible: false }))}
    autoClose={notification.variant === 'success' ? 3000 : null}
  />
)}
```

### Step 4: Update handleSubmit to use new notification
**Location:** Lines 171-260

```javascript
// At the end of handleSubmit, change to use showNotification instead of console.log
// FIND THIS:
prom
  .then((res) => {
    dispatch(profileUpdateAction({...}));
  })
  .catch((message) => {
    console.log(message);
  });

// CHANGE TO:
prom
  .then((res) => {
    dispatch(profileUpdateAction({
      // ... existing fields ...
    }));
    showNotification('Profile updated successfully!', 'success');
  })
  .catch((message) => {
    showNotification('Failed to update profile: ' + message, 'error');
  });
```

---

## CRITICAL FIX #3: Replace Unprofessional Button Labels

**File:** `/home/gary/Documents/WebApps/dev/bodyvantage/client/src/views/profileEditView/ProfileEditView.jsx`

**Location:** Lines 815-818

```jsx
// CHANGE FROM:
<button>I Like it</button>
<button type="button" onClick={handleCancelImageUpload}>
  I Dont Like it
</button>

// CHANGE TO:
<div className="button-group">
  <Button
    type="submit"
    colour="transparent"
    text="Upload Image"
    className="btn"
    title="Upload this profile image"
    disabled={profileImageLoading}
  />
  <Button
    type="button"
    colour="transparent"
    text="Cancel"
    className="btn"
    title="Cancel image upload and go back"
    onClick={handleCancelImageUpload}
    disabled={profileImageLoading}
  />
</div>
```

### Optional: Add CSS styling for button group
**File:** `/home/gary/Documents/WebApps/dev/bodyvantage/client/src/views/profileEditView/ProfileEditView.scss`

```scss
.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

  .btn {
    flex: 1;
    min-width: 150px;

    @media (max-width: 812px) {
      min-width: 100%;
    }
  }
}
```

---

## CRITICAL FIX #4: Convert Inline Styles to CSS Classes

**File:** `/home/gary/Documents/WebApps/dev/bodyvantage/client/src/views/profileEditView/ProfileEditView.jsx`

**Location:** Lines 880-892

```jsx
// CHANGE FROM:
<p>
  QualificationsVerified:{' '}
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
</p>

// CHANGE TO:
<p className="qualification-status">
  <span className="label">Qualifications Verified:</span>
  <span
    className={`status-indicator ${
      profile.isQualificationsVerified ? 'verified' : 'not-verified'
    }`}
  >
    <i
      className={
        profile.isQualificationsVerified ? 'fa fa-check' : 'fa fa-times'
      }
      aria-hidden="true"
    />
    <span className="status-text">
      {profile.isQualificationsVerified ? 'Verified' : 'Pending Verification'}
    </span>
  </span>
</p>
```

### Add CSS classes
**File:** `/home/gary/Documents/WebApps/dev/bodyvantage/client/src/views/profileEditView/ProfileEditView.scss`

```scss
.qualification-status {
  display: flex;
  align-items: center;
  gap: 1rem;

  .label {
    font-weight: 600;
  }

  .status-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;

    &.verified {
      background-color: rgba(92, 184, 92, 0.1);
      color: #5cb85c;

      i {
        font-size: 1.25rem;
        color: #5cb85c;
      }
    }

    &.not-verified {
      background-color: rgba(220, 53, 69, 0.1);
      color: #dc3545;

      i {
        font-size: 1.25rem;
        color: #dc3545;
      }
    }
  }

  .status-text {
    font-size: 0.95rem;
    font-weight: 500;
  }
}
```

---

## CRITICAL FIX #5: Fix Textarea Error Display

**File:** `/home/gary/Documents/WebApps/dev/bodyvantage/client/src/views/profileEditView/ProfileEditView.jsx`

### Issue 1: Location Textarea (Lines 713-726)

```jsx
// CHANGE FROM:
<div className="input-border">
  <label>Location</label>
  <textarea
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    type="text"
    name="location"
    required
    className={location?.length <= 10 ? 'invalid' : 'entered'}
    error={
      location?.length <= 10
        ? `Location field must contain at least 10 characters!`
        : null
    }
  />
</div>

// CHANGE TO:
<div className="input-border">
  <label htmlFor="location">Location</label>
  <textarea
    id="location"
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    name="location"
    required
    className={location?.length <= 10 ? 'invalid' : 'entered'}
    placeholder="Enter detailed location information..."
  />
  {location?.length <= 10 && (
    <p id="location-error" className="validation-error" role="alert">
      Location must contain at least 10 characters ({location.length} entered)
    </p>
  )}
</div>
```

### Issue 2: Keyword Search Textarea (Lines 571-588)

```jsx
// CHANGE FROM:
{show ? (
  <>
    <label>READ ONLY: </label>
    <textarea
      readOnly
      value={keyWordSearch}
      onChange={(e) => setkeyWordSearch(e.target.value)}
      type="text"
      name="keyWordSearch"
      required
      className={
        keyWordSearch?.length <= 10
          ? 'invalid'
          : 'entered'
      }
      error={
        keyWordSearch?.length <= 10
          ? `keyWord Search field must contain at least 10 characters!`
          : null
      }
    />
  </>
) : null}

// CHANGE TO:
{show ? (
  <div className="keyword-display">
    <label htmlFor="keyword-search">Generated Keywords (Read-Only)</label>
    <textarea
      id="keyword-search"
      readOnly
      value={keyWordSearch}
      className={keyWordSearch?.length <= 10 ? 'invalid' : 'entered'}
      onClick={() => {
        // Allow text selection and copying
        const textarea = event.target;
        textarea.select();
        document.execCommand('copy');
      }}
    />
    {keyWordSearch?.length <= 10 && (
      <p className="validation-error">
        Generated keywords must be at least 10 characters ({keyWordSearch.length} characters)
      </p>
    )}
    <p className="small-text">
      Tip: Click to select and copy keywords for reference
    </p>
  </div>
) : null}
```

---

## CRITICAL FIX #6: Add Form Validation Before Submit

**File:** `/home/gary/Documents/WebApps/dev/bodyvantage/client/src/views/profileEditView/ProfileEditView.jsx`

### Add at top of component (after regex definitions, around line 54)

```javascript
// Validation rules constants
const VALIDATION_RULES = {
  DESCRIPTION_MIN_LENGTH: 10,
  KEYWORD_MIN_LENGTH: 3,
  LOCATION_MIN_LENGTH: 10,
  PHONE_MIN_LENGTH: 11,
};
```

### Add touched state
**Location:** After other useState declarations (around line 104)

```javascript
const [touched, setTouched] = useState({
  name: false,
  email: false,
  description: false,
  location: false,
  phone: false,
});

const handleBlur = (field) => {
  setTouched((prev) => ({ ...prev, [field]: true }));
};
```

### Update handleSubmit validation
**Location:** Lines 171-260

```javascript
const handleSubmit = (e) => {
  e.preventDefault();

  // Validate all required fields before processing
  if (!name || name.trim().length === 0) {
    showNotification('Please enter your name', 'error');
    return;
  }

  if (!emailRegEx.test(email)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }

  if (description.length < VALIDATION_RULES.DESCRIPTION_MIN_LENGTH) {
    showNotification(
      `Description must be at least ${VALIDATION_RULES.DESCRIPTION_MIN_LENGTH} characters`,
      'error'
    );
    return;
  }

  if (keyWordSearchOne.length < VALIDATION_RULES.KEYWORD_MIN_LENGTH) {
    showNotification(
      'All keyword fields must have at least 3 characters',
      'error'
    );
    return;
  }

  if (
    keyWordSearchTwo.length < VALIDATION_RULES.KEYWORD_MIN_LENGTH ||
    keyWordSearchThree.length < VALIDATION_RULES.KEYWORD_MIN_LENGTH ||
    keyWordSearchFour.length < VALIDATION_RULES.KEYWORD_MIN_LENGTH ||
    keyWordSearchFive.length < VALIDATION_RULES.KEYWORD_MIN_LENGTH
  ) {
    showNotification(
      'All keyword fields must have at least 3 characters',
      'error'
    );
    return;
  }

  if (location.length < VALIDATION_RULES.LOCATION_MIN_LENGTH) {
    showNotification(
      `Location must be at least ${VALIDATION_RULES.LOCATION_MIN_LENGTH} characters`,
      'error'
    );
    return;
  }

  if (!telephoneNumberRegEx.test(telephoneNumber)) {
    showNotification('Please enter a valid UK mobile number', 'error');
    return;
  }

  // If validation passes, process keyword algorithm
  let prom = new Promise((resolve, reject) => {
    const arr = [
      keyWordSearchOne.trim() + ' ',
      keyWordSearchTwo.trim() + ' ',
      keyWordSearchThree.trim() + ' ',
      keyWordSearchFour.trim() + ' ',
      keyWordSearchFive.trim() + ' ',
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

    let res = [];
    const buildPermutations = (arr = []) => {
      for (let i = 0; i < arr.length; i++) {
        permutations(arr.length - i, ' ', []);
      }
    };

    buildPermutations(arr);

    if (res) {
      resolve(res);
    } else {
      reject('Failed to generate keywords');
    }
  });

  prom
    .then((res) => {
      const purekeyWordSearch = description.concat(
        name,
        location,
        specialisation,
      );
      const pure = purekeyWordSearch.replace(
        /\b(?:and|'|"|""|from|for|this|must|just|something|any|anything|say|help|can|can't|cant|path|during|after|by|however|is|we| we'll|to|you|your|ll|highly|from|our|the|in|for|of|an|or|i|am|me|my|other|have|if|you|are|come|with|through|going|over|past|years|year|cater|getting|currently|current|have|having|people|worked|work|. |)\b/gi,
        '',
      );

      // Dispatch UPDATE PROFILE Action
      dispatch(
        profileUpdateAction({
          name,
          email,
          faceBook,
          instagram,
          websiteUrl,
          profileImage,
          description,
          specialisation,
          qualifications,
          location,
          telephoneNumber,
          keyWordSearch: res.join('').concat(pure),
          keyWordSearchOne,
          keyWordSearchTwo,
          keyWordSearchThree,
          keyWordSearchFour,
          keyWordSearchFive,
          specialisationOne,
          specialisationTwo,
          specialisationThree,
          specialisationFour,
        }),
      );

      showNotification('Profile updated successfully!', 'success');
    })
    .catch((message) => {
      showNotification('Error updating profile: ' + message, 'error');
    });
};
```

---

## CRITICAL FIX #7: Add InputField Props (hint, id, onBlur, aria attributes)

**File:** `/home/gary/Documents/WebApps/dev/bodyvantage/client/src/views/profileEditView/ProfileEditView.jsx`

This is a large fix affecting many fields. Add touched state first (from Fix #6), then update InputField components.

### Example 1: Name Field (Lines 365-375)

```jsx
// CHANGE FROM:
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

// CHANGE TO:
<InputField
  id="trainer-name"
  label="Name"
  onChange={(e) => setName(e.target.value)}
  onBlur={() => handleBlur('name')}
  type="text"
  name="name"
  placeholder="Ben Smith"
  value={name}
  required
  hint="Your name as it will appear publicly"
  className={
    touched.name && name.length === 0 ? 'invalid' :
    name.length > 0 ? 'entered' : ''
  }
  error={
    touched.name && name.length === 0 ? `Name is required` : null
  }
  aria-invalid={touched.name && name.length === 0}
  aria-describedby={
    touched.name && name.length === 0 ? 'trainer-name-error' : undefined
  }
/>
```

### Example 2: Email Field (Lines 379-390)

```jsx
// CHANGE FROM:
<InputField
  label="Email"
  type="email"
  name="email"
  placeholder="ben@mail.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className={!emailRegEx.test(email) ? 'invalid' : 'entered'}
  error={
    !emailRegEx.test(email) ? `Invalid email address.` : null
  }
/>

// CHANGE TO:
<InputField
  id="trainer-email"
  label="Email"
  type="email"
  name="email"
  placeholder="ben@mail.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  onBlur={() => handleBlur('email')}
  hint="Valid email format required (example@domain.com)"
  required
  className={
    touched.email && !emailRegEx.test(email) && email.length > 0 ? 'invalid' :
    emailRegEx.test(email) && email.length > 0 ? 'entered' : ''
  }
  error={
    touched.email && !emailRegEx.test(email) && email.length > 0
      ? `Invalid email address (example@domain.com)`
      : null
  }
  aria-invalid={touched.email && !emailRegEx.test(email) && email.length > 0}
  aria-describedby={
    touched.email && !emailRegEx.test(email) && email.length > 0
      ? 'trainer-email-error'
      : undefined
  }
/>
```

### Example 3: Phone Number Field (Lines 736-754)

```jsx
// CHANGE FROM:
<InputField
  label="Telephone Number"
  value={telephoneNumber}
  onChange={(e) => setTelephoneNumber(e.target.value)}
  type="text"
  name="telephoneNumber"
  required
  className={
    !telephoneNumberRegEx.test(telephoneNumber)
      ? 'invalid'
      : 'entered'
  }
  error={
    !telephoneNumberRegEx.test(telephoneNumber) ||
    telephoneNumber?.length === 0
      ? `Invalid mobile number`
      : null
  }
/>

// CHANGE TO:
<InputField
  id="trainer-phone"
  label="Telephone Number"
  value={telephoneNumber}
  onChange={(e) => setTelephoneNumber(e.target.value)}
  onBlur={() => handleBlur('phone')}
  type="tel"
  name="telephoneNumber"
  required
  hint="UK mobile: 07xxx xxxxxx or +447xxx xxxxxx"
  placeholder="07xxx xxxxxx"
  className={
    touched.phone && telephoneNumber.length > 0 && !telephoneNumberRegEx.test(telephoneNumber)
      ? 'invalid'
      : telephoneNumberRegEx.test(telephoneNumber) && telephoneNumber.length > 0
      ? 'entered'
      : ''
  }
  error={
    touched.phone && telephoneNumber.length > 0 && !telephoneNumberRegEx.test(telephoneNumber)
      ? `Invalid mobile number. Use UK format: 07xxx xxxxxx or +447xxx xxxxxx`
      : null
  }
  aria-invalid={
    touched.phone && telephoneNumber.length > 0 && !telephoneNumberRegEx.test(telephoneNumber)
  }
  aria-describedby={
    touched.phone && telephoneNumber.length > 0 && !telephoneNumberRegEx.test(telephoneNumber)
      ? 'trainer-phone-error'
      : undefined
  }
/>
```

**Apply same pattern to:**
- Keyword fields (all 5): Lines 456-535
- Specialization keyword fields (all 4): Lines 598-664
- Facebook username: Lines 391-399
- Instagram username: Lines 400-408
- Website URL: Lines 409-417

---

## CRITICAL FIX #8: Convert Image Delete Span to Accessible Button

**File:** `/home/gary/Documents/WebApps/dev/bodyvantage/client/src/views/profileEditView/ProfileEditView.jsx`

**Location:** Lines 832-838

```jsx
// CHANGE FROM:
<span
  className="profile-image-delete"
  onClick={() => handleProfileImageDelete(image?._id)}
  title="Delete"
>
  X
</span>

// CHANGE TO:
<button
  type="button"
  className="profile-image-delete-btn"
  onClick={() => handleProfileImageDelete(image?._id)}
  aria-label={`Delete image of ${name}`}
  title="Delete this image"
>
  <i className="fa fa-trash" aria-hidden="true"></i>
  <span className="sr-only">Delete</span>
</button>
```

### Update CSS
**File:** `/home/gary/Documents/WebApps/dev/bodyvantage/client/src/views/profileEditView/ProfileEditView.scss`

```scss
// CHANGE FROM:
.profile-image-delete {
  position: relative;
  top: 14px;
  color: $danger;
  background-color: $main-font-colour;
  text-transform: capitalize;
  text-align: center;
  opacity: 0.8;
  border-radius: 50%;
  padding: 0.2em;
  font-size: 1.2em;
  &:hover {
    cursor: pointer;
    font-weight: bold;
    opacity: 1;
  }
}

// CHANGE TO:
.profile-image-delete-btn {
  position: relative;
  top: 14px;
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  padding: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  background-color: $danger;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s ease, background-color 0.2s ease;
  font-size: 0.9rem;

  i {
    font-size: 1.2em;
    margin-right: 0.25rem;
  }

  &:hover {
    opacity: 1;
    background-color: darken($danger, 10%);
  }

  &:focus {
    outline: 2px solid $burnt-orange;
    outline-offset: 2px;
  }

  &:active {
    transform: scale(0.95);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }
}
```

---

## Summary: Priority Implementation

1. **FIX #1** (useRef): 5 minutes - prerequisite for fix #2
2. **FIX #2** (Messages): 10 minutes - blocks proper feedback
3. **FIX #3** (Buttons): 5 minutes - professionalism
4. **FIX #4** (Inline Styles): 10 minutes - maintainability
5. **FIX #5** (Textarea Errors): 10 minutes - UX clarity
6. **FIX #6** (Validation): 20 minutes - data integrity
7. **FIX #7** (InputField Props): 30 minutes - consistency (largest change)
8. **FIX #8** (Accessibility): 10 minutes - keyboard support

**Total Time:** ~90 minutes for all critical fixes

---

## Testing Checklist After Fixes

- [ ] File input clears properly when canceling
- [ ] Success/error messages display with proper variants
- [ ] Form validates before submit
- [ ] Image upload buttons are clearly labeled
- [ ] Icon indicators have text labels
- [ ] Textarea error messages display
- [ ] Phone number validation works with UK numbers
- [ ] Image delete button is keyboard accessible (Tab + Enter)
- [ ] Screen reader announces all form fields with hints
- [ ] No console errors related to invalid HTML props
- [ ] Form submission shows loading state
- [ ] Success notification auto-closes after 3 seconds

