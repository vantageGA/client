# ProfileEditView: Quick Reference & Checklist

## File Location
`/home/gary/Documents/WebApps/dev/bodyvantage/client/src/views/profileEditView/ProfileEditView.jsx` (910 lines)

## Critical Issues Summary (8 Total)

### Issue | Location | Fix | Time
--- | --- | --- | ---
DOM Manipulation | Line 289 | Replace `document.querySelector` with `useRef` | 5 min
Message Stacking | Lines 312-313 | Consolidate to single notification state with variants | 10 min
Unprofessional Buttons | Lines 815-818 | Use Button component with professional labels | 5 min
Inline Icon Styles | Lines 880-892 | Convert to CSS classes + add text labels | 10 min
Textarea Errors | Lines 571-588, 713-726 | Display error messages properly | 10 min
Missing Validation | Line 171-260 | Add pre-submit validation check | 20 min
Missing InputField Props | Multiple fields | Add hint, id, onBlur, aria-* props | 30 min
Non-Accessible Delete | Lines 832-838 | Convert span to button with ARIA | 10 min

**Total: ~100 minutes**

---

## Code Changes Summary

### 1. Add useRef Import
```javascript
// Line 1
import React, { useEffect, useState, useRef } from 'react';
```

### 2. Add Notification State
```javascript
// After other useState
const [notification, setNotification] = useState({
  text: '',
  variant: 'error',
  visible: false,
});

const showNotification = (text, variant = 'error') => {
  setNotification({ text, variant, visible: true });
};
```

### 3. Create File Input Ref
```javascript
// After other useState
const profileImageInputRef = useRef(null);
```

### 4. Update Cancel Handler
```javascript
const handleCancelImageUpload = () => {
  if (profileImageInputRef.current) {
    profileImageInputRef.current.value = '';
  }
  setPreviewImage('');
};
```

### 5. Update File Input
```jsx
<input
  ref={profileImageInputRef}
  id="profileImage"
  type="file"
  name="profileImage"
  onChange={uploadFileHandler}
  accept="image/jpeg,image/png,image/webp"
/>
```

### 6. Replace Messages
```jsx
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

### 7. Replace Button Labels
```jsx
<Button text="Upload Image" ... />
<Button text="Cancel" ... />
```

### 8. Add CSS Classes for Icons
```scss
.status-indicator.verified {
  color: #5cb85c;
}
.status-indicator.not-verified {
  color: #dc3545;
}
```

### 9. Add Validation Before Submit
```javascript
if (!name.trim()) {
  showNotification('Name is required', 'error');
  return;
}
if (!emailRegEx.test(email)) {
  showNotification('Invalid email', 'error');
  return;
}
// ... more validation
dispatch(profileUpdateAction({...}));
showNotification('Profile updated!', 'success');
```

### 10. Add onBlur & Touched State
```javascript
const [touched, setTouched] = useState({
  name: false,
  email: false,
  // ...
});

const handleBlur = (field) => {
  setTouched((prev) => ({ ...prev, [field]: true }));
};

// In InputField:
onBlur={() => handleBlur('name')}
hint="Your name as displayed publicly"
aria-invalid={touched.name && !isNameValid}
```

### 11. Convert Textarea Errors
```jsx
{location?.length < 10 && (
  <p className="validation-error">
    Location must be at least 10 characters
  </p>
)}
```

### 12. Make Delete Button Accessible
```jsx
<button
  type="button"
  className="profile-image-delete-btn"
  onClick={() => handleProfileImageDelete(image?._id)}
  aria-label={`Delete image`}
>
  <i className="fa fa-trash" aria-hidden="true"></i>
</button>
```

---

## Components Modified

### ProfileEditView.jsx
- Add useRef import
- Add notification state + helper
- Add touched state + handler
- Update handleSubmit with validation
- Update handleCancelImageUpload
- Update all InputField components with props
- Update message render
- Update button labels
- Update textarea error display
- Update delete button
- Update icon styling

### ProfileEditView.scss
- Add button-group styles
- Add qualification-status styles
- Add status-indicator styles
- Update profile-image-delete to profile-image-delete-btn

---

## Testing Checklist

### Functionality
- [ ] Cancel image upload clears file input
- [ ] Form validates all required fields
- [ ] Success message shows and auto-closes
- [ ] Error messages persist until dismissed
- [ ] Keyword algorithm still works
- [ ] Profile updates correctly

### Accessibility
- [ ] Delete button is keyboard accessible
- [ ] All form fields have aria-invalid/describedby when in error
- [ ] Icons have text labels
- [ ] Error messages announced to screen readers
- [ ] Focus management works properly

### UX
- [ ] Button labels are professional and clear
- [ ] Error messages are visible and descriptive
- [ ] Help system is functional
- [ ] Form is responsive on mobile
- [ ] Loading states are visible

### Visual
- [ ] No inline styles remaining (except Button component issue)
- [ ] Icons display correctly
- [ ] Buttons have proper spacing
- [ ] Textareas show error messages below
- [ ] Design system colors are used

---

## Comparison: Before vs After

### Before (Current)
- document.querySelector for DOM manipulation ❌
- Multiple unmanaged messages ❌
- "I Like it" / "I Dont Like it" buttons ❌
- Inline styles on icons ❌
- Error props on textarea (invalid HTML) ❌
- No validation before submit ❌
- Missing InputField props (hint, id, onBlur, ARIA) ❌
- Span click handler instead of button ❌
- Real-time validation (keystroke) ❌
- Multiple save buttons (confusing) ❌

### After (Fixed)
- useRef for input management ✓
- Single consolidated notification state ✓
- Professional "Upload Image" / "Cancel" ✓
- CSS classes + text labels for icons ✓
- Proper error display below textareas ✓
- Full validation in handleSubmit ✓
- Complete InputField props with hints and ARIA ✓
- Proper button element with ARIA label ✓
- Blur-triggered validation (touched state) ✓
- Clear form structure (still multiple buttons, but clarified) ✓

---

## Files to Review/Update

### Primary
1. `/home/gary/Documents/WebApps/dev/bodyvantage/client/src/views/profileEditView/ProfileEditView.jsx`
2. `/home/gary/Documents/WebApps/dev/bodyvantage/client/src/views/profileEditView/ProfileEditView.scss`

### Reference
1. `/home/gary/Documents/WebApps/dev/bodyvantage/client/src/views/userProfileEditView/UserProfileEditView.jsx` (already fixed - use as pattern)
2. `/home/gary/Documents/WebApps/dev/bodyvantage/client/src/components/inputField/InputField.jsx` (component spec)
3. `/home/gary/Documents/WebApps/dev/bodyvantage/client/src/components/message/Message.jsx` (component spec)
4. `/home/gary/Documents/WebApps/dev/bodyvantage/client/src/components/button/Button.jsx` (component spec)

---

## Key Patterns to Apply

### From UserProfileEditView (Use These):

1. **Notification State Pattern**
   ```javascript
   const [notification, setNotification] = useState({
     text: '',
     variant: 'error',
     visible: false,
   });
   ```

2. **Touched State for Validation**
   ```javascript
   const [touched, setTouched] = useState({ field: false });
   const handleBlur = (field) => {
     setTouched((prev) => ({ ...prev, [field]: true }));
   };
   const showError = touched.field && !isValid;
   ```

3. **InputField Complete Props**
   ```jsx
   <InputField
     id="field-name"
     label="Label"
     hint="Upfront guidance"
     value={value}
     onChange={onChange}
     onBlur={() => handleBlur('field')}
     error={showError ? "Error message" : null}
     aria-invalid={showError}
     aria-describedby={showError ? "field-error" : undefined}
   />
   ```

4. **Button Component with Semantic Colors**
   ```jsx
   <Button
     type="submit"
     text="Professional Label"
     colour="transparent"  // Or use design system color
     disabled={isLoading}
   />
   ```

---

## DO NOT Implement

1. **Do NOT use document.querySelector** - Use useRef instead
2. **Do NOT put error prop on textarea** - Display error below element
3. **Do NOT use inline styles** - Use CSS classes from SCSS file
4. **Do NOT show errors on keystroke** - Use blur-triggered validation
5. **Do NOT use span with onClick** - Use button element
6. **Do NOT forget aria-invalid/describedby** - Required for accessibility
7. **Do NOT forget hint prop** - Upfront validation guidance

---

## Implementation Order

1. Fix useRef (unblocks other fixes)
2. Fix notification state (consolidates errors)
3. Fix button labels (visual professionalism)
4. Fix inline styles (CSS maintainability)
5. Fix validation (data integrity)
6. Fix InputField props (consistency)
7. Fix textarea errors (UX clarity)
8. Fix delete button (accessibility)

---

## Contact/References

- Design System: Dark theme, burnt-orange accents, WCAG AA minimum
- Established Pattern Source: UserProfileEditView.jsx (already fixed)
- Component Specs: InputField, Message, Button components
- Accessibility Standard: WCAG 2.1 Level AA

