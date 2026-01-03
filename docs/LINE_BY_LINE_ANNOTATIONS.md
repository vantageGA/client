# UserProfileEditView.jsx - Detailed Line-by-Line Analysis

## File: `/client/src/views/userProfileEditView/UserProfileEditView.jsx` (373 lines)

This document provides detailed annotations for every problematic section of the component.

---

## Lines 1-19: Imports & Initialization

### Status: ACCEPTABLE
```javascript
1  import React, { useEffect, useState } from 'react';
2  import { useDispatch, useSelector } from 'react-redux';
3  import { useNavigate } from 'react-router-dom';
4  import './UserProfileEditView.scss';
5
6  import {
7    getUserDetailsAction,
8    updateUserProfileAction,
9  } from '../../store/actions/userActions';
10 import { USER_UPDATE_PROFILE_RESET } from '../../store/constants/userConstants';
11 import { profileOfLoggedInUserAction } from '../../store/actions/profileActions';
12 import { userProfileImageUploadAction } from '../../store/actions/imageUploadActions';
13
14 import InputField from '../../components/inputField/InputField';
15 import Button from '../../components/button/Button';
16 import Message from '../../components/message/Message';
17 import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
18 import LinkComp from '../../components/linkComp/LinkComp';
```

**Analysis:** Imports are correct and well-organized. All necessary dependencies included.

---

## Lines 20-27: Regular Expression Definitions

### Status: CRITICAL ISSUES

```javascript
20 const UserProfileEditView = () => {
21   const nameRegEx = /^([\w])+\s+([\w\s])+$/i;
22   const emailRegEx =
23     /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
24   const passwordRegEx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/;
25   const passwordConfirmRegEx =
26     /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/;
```

#### Line 21: Name Regex
**Issue:** Too strict - uses `[\w]` which includes underscores, rejects hyphens, apostrophes
```javascript
// Current pattern: /^([\w])+\s+([\w\s])+$/i
// Accepts: "John Smith" ✓
// Rejects: "Jean-Paul Smith" ✗
// Rejects: "O'Brien" ✗
// Rejects: "Mary Jane" (trailing space) ✗

// Better pattern:
const nameRegEx = /^[a-zA-Z\s'-]{2,}$/;
```

**Recommendation:** Simplify like ContactFormView (line 14 of ContactFormView.jsx)

---

#### Line 23: Email Regex
**Status:** ACCEPTABLE (verbose but correct)
```javascript
// This regex is correct, just verbose
// HTML5 input type="email" validation is simpler alternative
// But keeping this pattern is fine if consistent

// Recommendation: Keep as-is (consistent with ContactFormView)
```

---

#### Lines 24-26: Password Regex - CRITICAL MISMATCH
**CRITICAL ISSUE #1: Regex Mismatch with Error Message**

```javascript
// Line 24-26
const passwordRegEx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/;
const passwordConfirmRegEx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/;

// Analysis of regex pattern:
// (?=.*\d)       - Lookahead: must contain at least one digit
// (?=.*[a-z])    - Lookahead: must contain at least one lowercase
// (?=.*[A-Z])    - Lookahead: must contain at least one uppercase
// [0-9a-zA-Z]{6,}- Must be 6+ characters from: digits and letters ONLY
//                  ^ This part is CRITICAL: NO special characters allowed!

// Problem:
// ✓ Requires: uppercase, lowercase, digit, 6+ characters
// ❌ Disallows: special characters (!, @, #, $, %, ^, &, *, etc.)
// But error message at line 210 doesn't mention this constraint

// This will REJECT passwords with special characters:
// "P@ssw0rd" → REJECTED (has @)
// "MyPass1!" → REJECTED (has !)

// BUT the error message says:
// "Password must contain at least 1 uppercase letter and a number"
// This doesn't mention NO special characters

// User's mental model: "I'll use special characters for security"
// System response: "Invalid! But I won't tell you why..."
// Result: User frustration and confusion

// Solution Options:

// Option A: Keep alphanumeric only, fix error message
const passwordRegEx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/;
// Error message (line 210):
error: password.length > 0 && !passwordRegEx.test(password)
  ? "Password must be 6+ characters with uppercase letter, lowercase letter, number, and letters/numbers only (no special characters)"
  : null

// Option B: Allow special characters, update regex
const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
// Error message (line 210):
error: password.length > 0 && !passwordRegEx.test(password)
  ? "Password must be 8+ characters with uppercase letter, lowercase letter, number, and special character (!@#$%^&*)"
  : null

// Option C: Simplify to minimum 6 chars (no special requirements)
const passwordRegEx = /^.{6,}$/;
// Error message (line 210):
error: password.length > 0 && !passwordRegEx.test(password)
  ? "Password must be at least 6 characters"
  : null
```

**Action:** Choose one option and update both regex AND error message (line 210)

---

## Lines 28-44: Redux State Management

### Status: ACCEPTABLE (with minor issues)

```javascript
28 const dispatch = useDispatch();
29 const navigate = useNavigate();
30
31 // Logged in user Details saved in local storage
32 const userLogin = useSelector((state) => state.userLogin);
33 const { userInfo } = userLogin;
34
35 // User details in DB
36 const userDetails = useSelector((state) => state.userDetails);
37 const { loading, error, user } = userDetails;
38
39 // Profile details in DB
40 useSelector((state) => state.profileOfLoggedInUser);
41
42 // Profile details in DB  [DUPLICATE COMMENT]
43 const profileState = useSelector((state) => state.profileOfLoggedInUser);
44 const { profile } = profileState;
45
46 // USER Profile image upload
47 const userProfileImage = useSelector((state) => state.userProfileImage);
48 const { loading: userProfileImageLoading } = userProfileImage;
```

**Issues:**
- Line 40: Unused selector (result is discarded)
- Lines 39 & 42: Duplicate comment
- Line 48: Destructuring `loading` as `userProfileImageLoading` is confusing (different variable names for same concept)

**Fixes:**
```javascript
// Remove line 40 (unused)
// Line 42: Change duplicate comment to something unique
// Line 48: Keep as-is OR use consistent naming convention
```

---

## Lines 50-59: Component State

### Status: NEEDS REFACTORING (Too many separate state variables)

```javascript
50 const [name, setName] = useState('');
51 const [email, setEmail] = useState('');
52
53 const [password, setPassword] = useState('');
54 const [confirmPassword, setConfirmPassword] = useState('');
55 const [hidePassword, setHidePassword] = useState(true);
56 const [message, setMessage] = useState('');
57
58 const [previewImage, setPreviewImage] = useState('');
59 const [previewImageFile, setPreviewImageFile] = useState('');
```

**Issues:**
- 9 separate useState calls (hard to manage)
- No `touched` state for validation
- Manual message state management (should use Message component)
- `hidePassword` misleading name (should be `showPasswordSettings`)
- No `loading` state for form submission

**Recommended Structure:**
```javascript
// Group related state
const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const [touched, setTouched] = useState({
  name: false,
  email: false,
  password: false,
  confirmPassword: false,
});

const [ui, setUi] = useState({
  showPasswordSettings: false,
  isSubmitting: false,
  previewImage: '',
  previewImageFile: null,
});

const [notification, setNotification] = useState({
  text: '',
  variant: 'error',
  visible: false,
  autoClose: null,
});
```

---

## Lines 61-85: useEffect Hook

### Status: ACCEPTABLE (with improvements possible)

```javascript
61 useEffect(() => {
62   if (!userInfo) {
63     navigate('/login');
64   } else {
65     if (!user || !user.name) {
66       dispatch({ type: USER_UPDATE_PROFILE_RESET });
67       dispatch(getUserDetailsAction(userInfo._id));
68     } else {
69       if (user.isConfirmed === false) {
70         setMessage(
71           'In oder to update you profile you will need to confirm your email address. This can be done by referring back to the email you received when you first registered.',
72         );
73       }
74       setName(user.name);
75       setEmail(user.email);
76     }
77   }
78   dispatch(profileOfLoggedInUserAction());
79
80   const abortConst = new AbortController();
81   return () => {
82     abortConst.abort();
82      console.log('useEffect cleaned UserProfileEditView');
84   };
85 }, [dispatch, navigate, user, userInfo]);
```

#### Line 70-72: TYPO "In oder to"
**Issue:** "In oder to" should be "In order to"
```javascript
// Current (WRONG):
'In oder to update you profile...'

// Fixed:
'In order to update your profile...'
```

Also: "you profile" should be "your profile"

#### Line 71: Long Warning Message
**Issue:** Warning scattered at top, not prominent
- User sees message once on load
- If user scrolls down, message is out of view
- Not persistent in current design

**Better:** Use Message component with persistent variant

#### Line 80: Unused AbortController
**Issue:** AbortController created but never used
```javascript
const abortConst = new AbortController();
return () => {
  abortConst.abort();  // Called but never used for fetch/requests
  console.log('useEffect cleaned UserProfileEditView');
};
```

**Recommendation:** Remove if not used, or implement request cancellation

---

## Lines 87-109: handleSubmit Function - CRITICAL

### Status: CRITICAL ISSUES (No validation before dispatch)

```javascript
87 const handleSubmit = (e) => {
88   e.preventDefault();
89   // Contact form action
90   if (password !== confirmPassword) {
91     setMessage('Passwords do not match');
92   } else {
93     // Dispatch UPDATED PROFILE
94     if (user.isConfirmed === true) {
95       dispatch(
96         updateUserProfileAction({
97           id: user._id,
98           name,
99           email,
100          password,
101        }),
102      );
103    } else {
104      setMessage(
105        'You have not yet confirmed your email. Please check you emails.',
106      );
107    }
108  }
109};
```

#### CRITICAL ISSUE #4: No Pre-Submit Validation

**Problems:**
1. **Line 90-91:** Only checks password match, no regex validation
2. **Line 98:** `name` not validated - could submit invalid name
3. **Line 99:** `email` not validated - could submit invalid email
4. **Line 100:** `password` not required - can be empty (bypasses regex)
5. **Line 95-102:** Dispatches action with potentially invalid data
6. **No feedback:** User doesn't know if dispatch succeeded/failed

**Current Flow:**
```
User clicks Submit
     ↓
name match check? NO → Show "passwords don't match"
                  YES ↓
           isConfirmed? NO → Show "confirm email"
                        YES ↓
           DISPATCH without validation ← BUG!
```

**Fixed Flow:**
```
User clicks Submit
     ↓
name valid? NO → Show error, return
             YES ↓
email valid? NO → Show error, return
              YES ↓
password entered? YES → valid? NO → Show error, return
                              YES ↓
               confirmPassword valid? NO → Show error, return
                                      YES ↓
               match? NO → Show "don't match", return
                      YES ↓
isConfirmed? NO → Show "confirm email", return
              YES ↓
         DISPATCH with confidence
```

**Solution:**
```javascript
const handleSubmit = (e) => {
  e.preventDefault();

  // Validation checks
  if (!nameRegEx.test(name)) {
    showNotification('Name must contain a first and last name, each starting with capital letter', 'error');
    return;
  }

  if (!emailRegEx.test(email)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }

  // Password validation only if user tried to change password
  if (password.length > 0 || confirmPassword.length > 0) {
    if (!passwordRegEx.test(password)) {
      showNotification('Password must be 6+ characters with uppercase, lowercase, and number', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }
  }

  // Check confirmation status
  if (user.isConfirmed !== true) {
    showNotification('Please confirm your email before updating your profile', 'warning');
    return;
  }

  // Dispatch action
  dispatch(updateUserProfileAction({
    id: user._id,
    name,
    email,
    ...(password && { password }),
  }));

  // Provide feedback
  showNotification('Profile updated successfully', 'success', 5000);

  // Clear sensitive fields
  setPassword('');
  setConfirmPassword('');
  setShowPasswordSettings(false);
};
```

---

#### Line 105: TYPO "you emails"
**Issue:** "check you emails" should be "check your emails"
```javascript
// Current (WRONG):
'You have not yet confirmed your email. Please check you emails.'

// Fixed:
'You have not yet confirmed your email. Please check your emails.'
```

---

## Lines 112-138: Image Upload Functions

### Status: CRITICAL ISSUE (DOM Manipulation Anti-Pattern)

```javascript
112 const previewFile = (imageFile) => {
113   const reader = new FileReader();
114   reader.readAsDataURL(imageFile);
115   reader.onload = () => {
116     setPreviewImage(reader.result);
117    };
118 };
119
120 const uploadFileHandler = (e) => {
121   const imageFile = e.target.files[0];
122   setPreviewImageFile(imageFile);
123   previewFile(imageFile);
124 };
125
126 const handleUserProfileImageUpdate = (e) => {
127   e.preventDefault();
128   const formImageData = new FormData();
129   formImageData.append('userProfileImage', previewImageFile);
130   //Dispatch upload action here
131   dispatch(userProfileImageUploadAction(formImageData));
132   setPreviewImage('');
133 };
134
135 const handleCancelImageUpload = () => {
136   document.querySelector('#userProfileImage').value = '';
137   setPreviewImage('');
137 };
```

#### Lines 112-124: Image Preview (ACCEPTABLE)
These functions correctly handle file preview using FileReader API.

#### Line 126-133: Image Upload (Missing feedback)
**Issues:**
- No loading state shown (should show spinner)
- No success message (user doesn't know if upload succeeded)
- No error handling (what if upload fails?)

#### Line 136: CRITICAL ISSUE #3 - DOM Manipulation Anti-Pattern
**CRITICAL ISSUE #3: Direct DOM Manipulation**

```javascript
// WRONG - React anti-pattern
const handleCancelImageUpload = () => {
  document.querySelector('#userProfileImage').value = '';
  setPreviewImage('');
};

// WHY THIS IS BAD:
// ❌ Violates React principles (direct DOM access)
// ❌ Bypasses React's rendering system
// ❌ State and DOM can get out of sync
// ❌ Uncontrolled component (not managed by React)
// ❌ Brittle (depends on CSS selectors)
// ❌ Hard to test and maintain
```

**Correct Solution:**
```javascript
// Create ref at component level
const fileInputRef = useRef(null);

// Use ref in JSX
<input
  ref={fileInputRef}
  id="userProfileImage"
  type="file"
  onChange={uploadFileHandler}
/>

// Use ref in handler
const handleCancelImageUpload = () => {
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
  setPreviewImage('');
  setPreviewImageFile('');
};
```

---

## Lines 147-148: Message Display - CRITICAL

### Status: CRITICAL ISSUE #2 - Message Stacking

```javascript
147 {error ? <Message message={error} /> : null}
148 {message ? <Message message={message} /> : null}
```

#### CRITICAL ISSUE #2: Multiple Messages Without Management

**Problems:**
```
Scenario 1: User has validation error from backend
├─ error state = "Email already exists"
├─ message state = "In order to update your profile..."
└─ RESULT: TWO messages render simultaneously ❌

Scenario 2: User tries to update
├─ Redux action returns error
├─ message state was set in useEffect (unconfirmed user)
└─ RESULT: Old message still visible ❌

Scenario 3: Submission succeeds
├─ No message displayed at all
├─ User doesn't know if it worked
└─ RESULT: Poor user experience ❌

Visual Impact:
┌─────────────────────────┐
│ In order to update your │  ← Message from line 148
│ profile you need to...  │
├─────────────────────────┤
│ Email already exists    │  ← Error from line 147
├─────────────────────────┤  Two messages stack poorly
│ Form content below      │
└─────────────────────────┘
```

**Missing Features:**
- ❌ No `variant` prop (can't distinguish error vs warning vs success)
- ❌ No `autoClose` prop (messages persist indefinitely)
- ❌ No controlled `isVisible` prop
- ❌ No message type system
- ❌ No success message pattern

**Solution:**
```javascript
// Single notification state (see Full Review for details)
const [notification, setNotification] = useState({
  text: '',
  variant: 'error',
  visible: false,
  autoClose: null,
});

// JSX:
{notification.visible && (
  <Message
    message={notification.text}
    variant={notification.variant}
    autoClose={notification.autoClose}
    isVisible={notification.visible}
    onDismiss={() => setNotification(prev => ({ ...prev, visible: false }))}
  />
)}
```

---

## Lines 154-245: User Update Fieldset

### Status: MULTIPLE ISSUES (Missing props, validation, accessibility)

```javascript
154 <fieldset className="fieldSet item">
155   <legend>
156     UPDATE <span>USER</span>
157   </legend>
158   <form onSubmit={handleSubmit}>
159     <InputField
160       label="Name"
161       value={name}
162       onChange={(e) => setName(e.target.value)}
163       type="text"
164       name="name"
164       required
166       className={!nameRegEx.test(name) ? 'invalid' : 'entered'}
167       error={
168         !nameRegEx.test(name) && name.length !== 0
169           ? `Name field must contain a first name and surname both of which must start with a capital letter.`
170           : null
171       }
172     />
```

#### Lines 159-172: Name Field - MISSING REQUIRED PROPS

**Current Implementation (INCOMPLETE):**
```jsx
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

**Issues:**
1. **Missing `id` prop** - Required for label association
   ```javascript
   // Without id, accessibility is degraded
   <InputField id="name" ... />  // ADD THIS
   ```

2. **Missing `hint` prop** - Should show requirements upfront
   ```javascript
   // Reference pattern from ContactFormView line 89:
   hint="First name and surname, each starting with capital letter"
   ```

3. **Missing `onBlur` handler** - Validates immediately on keystroke
   ```javascript
   // Current: Shows error while user is typing (bad UX)
   // Should: Show error only after blur (good UX)
   // Add state: const [nameTouched, setNameTouched] = useState(false);
   // Add handler: onBlur={() => setNameTouched(true)}
   ```

4. **Validation shows too early** - Line 166
   ```javascript
   // Current: Immediately marks invalid while typing
   className={!nameRegEx.test(name) ? 'invalid' : 'entered'}

   // Better: Only mark invalid after blur
   className={
     name.length === 0 ? '' : (!nameRegEx.test(name) ? 'invalid' : 'entered')
   }
   ```

5. **Missing `aria-invalid` and `aria-describedby`**
   ```javascript
   // Should include for accessibility:
   aria-invalid={nameTouched && !nameRegEx.test(name) && name.length !== 0}
   aria-describedby={nameTouched && !nameRegEx.test(name) ? 'name-error' : undefined}
   ```

**Complete Corrected Version:**
```jsx
<InputField
  id="name"  // ADD
  label="Name"
  type="text"
  name="name"
  value={name}
  required
  hint="First name and surname, each starting with capital letter"  // ADD
  className={
    name.length === 0 ? '' : (!nameRegEx.test(name) ? 'invalid' : 'entered')
  }
  error={
    nameTouched && !nameRegEx.test(name) && name.length !== 0
      ? `Name must contain a first name and surname both starting with capital letters`
      : null
  }
  onChange={(e) => setName(e.target.value)}
  onBlur={() => setNameTouched(true)}  // ADD
  aria-invalid={nameTouched && !nameRegEx.test(name) && name.length !== 0}  // ADD
  aria-describedby={nameTouched && !nameRegEx.test(name) ? 'name-error' : undefined}  // ADD
/>
```

---

#### Lines 173-185: Email Field - SAME ISSUES AS NAME

```javascript
173 <InputField
174   label="Email"
175   type="email"
176   name="email"
177   value={email}
178   onChange={(e) => setEmail(e.target.value)}
179   className={!emailRegEx.test(email) ? 'invalid' : 'entered'}
180   error={
181     !emailRegEx.test(email) && email.length !== 0
182       ? `Invalid email address.`
183       : null
184   }
185 />
```

**Missing Same Props:**
- [ ] `id` prop
- [ ] `hint` prop ("Valid email format required")
- [ ] `onBlur` handler
- [ ] `aria-invalid` prop
- [ ] `aria-describedby` prop

---

#### Lines 187-196: Password Toggle Checkbox - CRITICAL ACCESSIBILITY ISSUE

### CRITICAL ISSUE #5: Checkbox Accessibility Failure

```javascript
187 <label>
188   <input
189     type="checkbox"
190     defaultChecked={!hidePassword}
191     onChange={() => setHidePassword(!hidePassword)}
192   />
193   {!hidePassword
194     ? 'Hide Password Settings'
195     : 'Hide Password Settings'
196   }
197 </label>
```

#### Multiple Accessibility Problems:

**Problem 1: No `id` on checkbox**
```javascript
// Current (WRONG):
<label>
  <input type="checkbox" ... />  // No id attribute
</label>

// Better:
<label htmlFor="password-toggle">
  <input
    id="password-toggle"  // Add id
    type="checkbox"
    ...
  />
</label>
```

**Problem 2: Missing `aria-controls`**
```javascript
// Screen reader users don't know what this checkbox controls
<input
  type="checkbox"
  aria-controls="password-fields-section"  // ADD - links to controlled section
  ...
/>

// And mark the controlled section:
<div id="password-fields-section">
  {/* password fields */}
</div>
```

**Problem 3: Missing `aria-expanded`**
```javascript
// Screen reader users can't tell if section is expanded/collapsed
<input
  type="checkbox"
  aria-expanded={!hidePassword}  // ADD
  ...
/>
```

**Problem 4: Inverted label logic**
```javascript
// Current (confusing):
{!hidePassword ? 'Hide Password Settings' : 'Hide Password Settings'}
// Both conditions show same text!?

// Better:
{showPasswordSettings ? 'Hide' : 'Show'} password settings
```

**Problem 5: Not using semantic switch role**
```javascript
// This is functionally a switch, not a checkbox
<input
  type="checkbox"
  role="switch"  // ADD - semantic meaning
  aria-checked={showPasswordSettings}
  ...
/>
```

**Problem 6: Checkbox controls hidden section (poor a11y pattern)**
```javascript
// Current pattern: Show/hide entire section with checkbox
// This creates disconnection between control and fields

// Better pattern: Let InputField handle password show/hide
// Only use checkbox for optional "change password" feature
```

**Corrected Implementation:**
```jsx
<div className="password-section">
  <label htmlFor="password-toggle">
    <input
      id="password-toggle"
      type="checkbox"
      checked={showPasswordSettings}
      onChange={(e) => setShowPasswordSettings(e.target.checked)}
      aria-controls="password-fields-section"
      aria-expanded={showPasswordSettings}
    />
    <span>{showPasswordSettings ? 'Hide' : 'Show'} password settings</span>
  </label>

  {showPasswordSettings && (
    <div id="password-fields-section" className="password-fields">
      <InputField
        id="password"
        label="New Password"
        type="password"
        hint="Leave blank to keep current password"
        // ... rest of props
      />
      <InputField
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        hint="Must match password field"
        // ... rest of props
      />
    </div>
  )}
</div>
```

---

#### Lines 199-235: Password Fields - MULTIPLE ISSUES

```javascript
199 <InputField
200   label="Password"
201   type="password"
202   name={password}  // ← WRONG: should be name prop not variable
203   value={password}
203   required        // ← WRONG: optional field marked required
205   className={
206     !passwordRegEx.test(password) ? 'invalid' : 'entered'
207   }
208   error={
209     !passwordRegEx.test(password) && password.length !== 0
210       ? `Password must contain at least 1 uppercase letter and a number`
211       : null
212   }
213   onChange={(e) => setPassword(e.target.value)}
214 />
```

**Issue 1: Line 202 - Wrong `name` prop**
```javascript
// WRONG:
name={password}  // This passes the VALUE, not the field name!

// CORRECT:
name="password"  // Pass the string "password"
```

**Issue 2: Line 204 - `required={true}` on optional field**
```javascript
// WRONG - Password is optional, but marked required:
required  // Because field only shows when checkbox checked

// CORRECT - Only require if shown:
required={showPasswordSettings}
```

**Issue 3: Line 210 - Error message mismatch with regex**
Already covered in Line 24 analysis above.

**Issue 4: Missing `id` prop**
```javascript
// Add for accessibility:
id="password"
```

**Issue 5: Missing `hint` prop**
```javascript
// Should show requirements upfront:
hint="6+ characters: uppercase, lowercase, number. Letters and numbers only."
```

**Issue 6: Missing `onBlur` handler**
```javascript
// Should track touched state:
onBlur={() => setPasswordTouched(true)}
```

**Issue 7: Missing ARIA attributes**
```javascript
// Should include:
aria-invalid={passwordTouched && !passwordRegEx.test(password)}
aria-describedby={passwordTouched && !passwordRegEx.test(password) ? 'password-error' : undefined}
```

**Corrected Implementation:**
```jsx
<InputField
  id="password"  // ADD
  label="Password"
  type="password"
  name="password"  // FIX: Change from {password}
  value={password}
  required={showPasswordSettings}  // FIX: Only required when shown
  hint="6+ characters: uppercase, lowercase, and number. Letters and numbers only."  // ADD
  className={
    password.length === 0 ? '' : (!passwordRegEx.test(password) ? 'invalid' : 'entered')
  }
  error={
    passwordTouched && !passwordRegEx.test(password) && password.length !== 0
      ? `Password must be 6+ characters with uppercase letter, lowercase letter, and number`
      : null
  }
  onChange={(e) => setPassword(e.target.value)}
  onBlur={() => setPasswordTouched(true)}  // ADD
  aria-invalid={passwordTouched && !passwordRegEx.test(password) && password.length !== 0}  // ADD
  aria-describedby={passwordTouched && !passwordRegEx.test(password) && password.length !== 0 ? 'password-error' : undefined}  // ADD
/>
```

**Lines 216-234: Confirm Password field - SAME ISSUES**

Same fixes needed as password field above.

---

#### Lines 237-243: Submit Button

```javascript
237 <Button
238   colour="transparent"
239   text="submit"
240   className="btn"
241   title={!user.isConfirmed ? 'User must be confirmed' : null}
242   disabled={!user.isConfirmed}
243 ></Button>
```

**Issues:**

1. **Missing `type` prop**
   ```javascript
   // Current: No type specified, defaults to "button"
   // Should be "submit" for form submission:
   type="submit"  // ADD
   ```

2. **Using `colour="transparent"` is imprecise**
   ```javascript
   // Current:
   colour="transparent"

   // Better - use semantic color names:
   colour={user.isConfirmed ? "$burnt-orange" : "$disabled"}
   ```

3. **`text` prop should be standard capitalization**
   ```javascript
   // Current:
   text="submit"  // Lowercase

   // Better:
   text="Submit"  // Proper capitalization
   ```

4. **Title attribute not user-friendly**
   ```javascript
   // Current:
   title={!user.isConfirmed ? 'User must be confirmed' : null}

   // Better - hint text that's visible:
   // Add above button:
   {!user.isConfirmed && (
     <p className="form-hint">
       You must confirm your email before updating your profile.
     </p>
   )}
   ```

5. **No loading state during submission**
   ```javascript
   // Should show loading spinner while submitting:
   disabled={!user.isConfirmed || isSubmitting}
   // aria-busy={isSubmitting}
   ```

**Corrected Implementation:**
```jsx
<Button
  type="submit"  // ADD
  text="Submit"  // FIX
  disabled={!user.isConfirmed}
  colour={user.isConfirmed ? "$burnt-orange" : "$disabled"}  // IMPROVE
  // Remove title prop, use visible hint instead
/>
```

---

## Lines 247-365: Summary & Statistics Sections

### Status: INFORMATION ARCHITECTURE ISSUES

These sections display useful information but create cognitive load on a single page that's primarily for form submission.

#### Lines 247-320: User Summary Fieldset
**Status:** Generally acceptable, but has issues in detail

#### Lines 289-301: Email Confirmation Icon
```javascript
289 <i
290   className="fa fa-check"
291   style={{
292     fontSize: 20 + 'px',
293     color: 'rgba(92, 184, 92, 1)',
294   }}
295 ></i>
```

**Issues:**
- Inline styles instead of CSS classes
- Icon-only without text alternative (color-blind users can't see status)
- No aria-label explaining the icon
- Color alone used to indicate status (WCAG violation)

**Corrected:**
```jsx
<span className="status-indicator confirmed">
  <i className="fa fa-check" aria-hidden="true"></i>
  <span className="status-label">Confirmed</span>
</span>
```

**Add CSS:**
```scss
.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &.confirmed {
    color: $success;

    i { font-size: 1.25rem; }
    .status-label { font-weight: 600; }
  }

  &.unconfirmed {
    color: $danger;

    i { font-size: 1.25rem; }
    .status-label { font-weight: 600; }
  }
}
```

---

#### Lines 260-282: Image Upload Form - CRITICAL UX ISSUES

```javascript
260 <form onSubmit={handleUserProfileImageUpdate}>
261   <InputField
262     id="userProfileImage"
263     label="Change USER Profile Image"
264     type="file"
265     name="userProfileImage"
266     onChange={uploadFileHandler}
267   />
268   {previewImage ? (
269     <>
270       Image Preview
271       <img src={previewImage} alt="profile" style={{ width: '120px' }} />
272       <button>I Like it</button>
273       <button type="button" onClick={handleCancelImageUpload}>
274         I Dont Like it
275       </button>
276     </>
277   ) : null}
278 </form>
```

**Issue 1: Lines 272-275 - Buttons not using Button component**
```javascript
// Current:
<button>I Like it</button>
<button type="button" onClick={handleCancelImageUpload}>
  I Dont Like it  // Typo: should be "Don't Like it"
</button>

// Better:
<Button
  type="submit"
  text="Confirm and Upload"
  disabled={userProfileImageLoading}
  colour={userProfileImageLoading ? "$disabled" : "$burnt-orange"}
/>
<Button
  type="button"
  text="Cancel"
  disabled={userProfileImageLoading}
  onClick={handleCancelImageUpload}
  colour="transparent"
/>
```

**Issue 2: Line 270 - Plain text label**
```javascript
// Current (plain):
Image Preview

// Better (semantic):
<h3 className="preview-title">Image Preview</h3>
```

**Issue 3: Missing loading state**
```javascript
// Should show spinner while uploading:
{userProfileImageLoading ? (
  <LoadingSpinner />
) : null}
```

**Issue 4: Missing success/error feedback**
```javascript
// No indication if upload succeeded:
// Should show Message component with success/error variant
```

**Issue 5: Line 274 - Typo "I Dont Like it"**
```javascript
// Current:
'I Dont Like it'  // Missing apostrophe

// Correct:
"I Don't Like it"  // Or better: "Cancel"
```

**Improved Implementation:**
```jsx
<fieldset className="image-upload-fieldset">
  <legend>Profile Image</legend>

  {userProfileImageLoading && (
    <div role="status" aria-live="polite" aria-busy="true">
      <LoadingSpinner />
    </div>
  )}

  <form onSubmit={handleUserProfileImageUpdate}>
    <InputField
      id="userProfileImage"
      label="Select profile image"
      type="file"
      name="userProfileImage"
      hint="JPG, PNG, or WebP up to 5MB"
      onChange={uploadFileHandler}
      disabled={userProfileImageLoading}
    />

    {previewImage && !userProfileImageLoading ? (
      <div className="image-preview-section">
        <h3>Image Preview</h3>
        <img
          src={previewImage}
          alt="Preview of new profile image"
          className="preview-image"
        />

        <div className="preview-actions">
          <Button
            type="submit"
            text="Confirm and Upload"
            disabled={userProfileImageLoading}
            colour="$burnt-orange"
          />
          <Button
            type="button"
            text="Cancel"
            onClick={handleCancelImageUpload}
            disabled={userProfileImageLoading}
            colour="transparent"
          />
        </div>
      </div>
    ) : null}
  </form>
</fieldset>
```

---

#### Lines 306-318: Admin Status Icon
**Issue:** Same as email confirmation icon above
- Inline styles
- Icon-only without text
- No aria-label

**Should be converted to status component pattern**

---

#### Lines 322-342: Admin Options Section

**Status:** Should consider moving to separate admin dashboard

**Issues:**
- Only visible to admins (good)
- Adds clutter to user profile edit page
- Links to admin panels (admin-users, admin-profiles, admin-reviewers)
- "Verify qualification" has no implementation

**Recommendation:**
Consider moving admin options to separate route like `/admin/dashboard`

---

#### Lines 344-365: Profile Statistics Section

**Issues:**
- "Time spent on viewing your profile" shows no value
- Only one complete metric (profile clicks)
- Limited usefulness on this form-focused page

**Recommendation:**
Move to separate `/profile/analytics` or `/profile/insights` page

---

## Lines 368-373: Close and Export

```javascript
368   </>
369 )}
370 </div>
371);
372};
373
374 export default UserProfileEditView;
```

**Status:** ACCEPTABLE

---

## Summary of Issues by Line Ranges

| Lines | Issue | Severity | Type |
|-------|-------|----------|------|
| 21 | Name regex too strict | MEDIUM | Validation |
| 24-26 | Password regex mismatch | CRITICAL | Validation |
| 40 | Unused selector | LOW | Code Quality |
| 50-59 | Too many state variables | HIGH | Refactor |
| 71 | Typo "In oder to" | LOW | Typo |
| 80 | Unused AbortController | MEDIUM | Code Quality |
| 87-109 | No pre-submit validation | CRITICAL | Functionality |
| 105 | Typo "you emails" | LOW | Typo |
| 136 | DOM query anti-pattern | CRITICAL | React Pattern |
| 147-148 | Message stacking | CRITICAL | UX |
| 159-172 | Name field missing props | HIGH | Consistency |
| 173-185 | Email field missing props | HIGH | Consistency |
| 187-196 | Checkbox accessibility | CRITICAL | Accessibility |
| 199-235 | Password fields issues | HIGH | Consistency |
| 237-243 | Button missing type | MEDIUM | Functionality |
| 260-282 | Image upload UX | HIGH | UX |
| 272-275 | Button labels informal | MEDIUM | UX |
| 289-319 | Icon-only indicators | HIGH | Accessibility |
| 322-342 | Admin section misplaced | MEDIUM | IA |
| 344-365 | Stats section incomplete | LOW | UX |

---

## Quick Fix Checklist

Use this to track fixes by line:

- [ ] Line 24: Fix password regex mismatch
- [ ] Line 71: Fix typo "In oder" → "In order"
- [ ] Line 105: Fix typo "you emails" → "your emails"
- [ ] Line 136: Replace querySelector with useRef
- [ ] Line 147-148: Consolidate messages with variants
- [ ] Lines 159-235: Add all missing InputField props
- [ ] Lines 187-196: Fix checkbox accessibility
- [ ] Line 202: Fix name prop value
- [ ] Line 204: Fix required on optional field
- [ ] Line 274: Fix typo "Dont" → "Don't"
- [ ] Lines 272-275: Use Button component
- [ ] Lines 289-319: Add text to icons
- [ ] Lines 87-109: Add validation before dispatch
- [ ] Line 50-59: Refactor state structure

---

