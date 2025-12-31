# Message Component - Testing Checklist

Use this checklist to verify all improvements are working correctly.

---

## Pre-Testing Setup

1. **Start the development server:**
   ```bash
   cd /home/gary/Documents/WebApps/dev/bodyvantage/client
   npm run dev
   ```

2. **Optional: Add test route for MessageExamples:**
   ```jsx
   import MessageExamples from './components/message/MessageExamples';

   // In your routes
   <Route path="/message-test" element={<MessageExamples />} />
   ```

3. **Navigate to any view that uses Message component:**
   - Login form
   - Registration form
   - Profile edit
   - Contact form
   - etc.

---

## TIER 1: Critical Accessibility Tests

### 1. ARIA Attributes

**Test:** Inspect the DOM when a message is shown

**Expected:**
```html
<div
  class="message-wrapper message-error"
  role="alert"
  aria-live="polite"
  aria-atomic="true"
  tabindex="-1"
>
```

- [ ] `role="alert"` is present
- [ ] `aria-live="polite"` is present
- [ ] `aria-atomic="true"` is present
- [ ] `tabindex="-1"` is present

**How to test:**
1. Trigger an error message (submit form with invalid data)
2. Open browser DevTools (F12)
3. Inspect the message element
4. Verify all ARIA attributes are present

---

### 2. Semantic Button (Not Span)

**Test:** Inspect close button element

**Expected:**
```html
<button
  type="button"
  class="message-close-btn"
  aria-label="Close error notification"
>
  <i class="fa fa-times" aria-hidden="true"></i>
</button>
```

- [ ] Element is `<button>`, not `<span>`
- [ ] Has `type="button"`
- [ ] Has descriptive `aria-label`
- [ ] Icon has `aria-hidden="true"`

**How to test:**
1. Show a message
2. Right-click close button → Inspect
3. Verify it's a `<button>` element
4. Check attributes

---

### 3. Keyboard Accessibility

**Test:** Navigate and interact with keyboard only

- [ ] Press **Tab** to navigate to close button
- [ ] Focus ring is clearly visible (2px outline)
- [ ] Press **Enter** → message dismisses
- [ ] Show another message
- [ ] Press **Tab** to close button
- [ ] Press **Space** → message dismisses
- [ ] Tab order is logical (doesn't trap focus)

**How to test:**
1. Show a message
2. Use only keyboard (no mouse)
3. Tab through page until close button is focused
4. Verify visual focus indicator
5. Press Enter to dismiss
6. Repeat with Space key

---

### 4. Color Contrast (WCAG AA)

**Test:** Measure color contrast ratios

**Error Variant:**
- [ ] White text on red background ≥ 4.5:1 ratio
- [ ] Close button visible and high contrast

**Success Variant:**
- [ ] Dark text on green background ≥ 4.5:1 ratio
- [ ] Close button visible and high contrast

**Warning Variant:**
- [ ] Dark text on yellow background ≥ 4.5:1 ratio
- [ ] Close button visible and high contrast

**How to test:**
1. Use browser DevTools contrast checker
2. Or use online tool: https://webaim.org/resources/contrastchecker/
3. Check each variant's text/background combination

---

## TIER 2: Important Features

### 5. onDismiss Callback

**Test:** Verify callback fires when dismissed

```jsx
<Message
  message="Test"
  onDismiss={() => console.log('Dismissed!')}
/>
```

- [ ] Open browser console (F12 → Console)
- [ ] Dismiss message
- [ ] "Dismissed!" appears in console
- [ ] Callback fires on button click
- [ ] Callback fires on auto-close (if enabled)

---

### 6. Variant Prop

**Test:** All three variants display correctly

**Error (default):**
```jsx
<Message message="Error!" variant="error" />
```
- [ ] Red background
- [ ] White text
- [ ] White close button

**Success:**
```jsx
<Message message="Success!" variant="success" />
```
- [ ] Green background
- [ ] Dark text
- [ ] Dark close button

**Warning:**
```jsx
<Message message="Warning!" variant="warning" />
```
- [ ] Yellow/orange background
- [ ] Dark text
- [ ] Dark close button

---

### 7. Auto-Close Feature

**Test:** Message dismisses automatically

```jsx
<Message
  message="Auto-close test"
  variant="success"
  autoClose={3000}
/>
```

- [ ] Message appears
- [ ] Message dismisses after 3 seconds
- [ ] Can manually dismiss before timer expires
- [ ] onDismiss callback fires (if provided)
- [ ] No console errors
- [ ] Timer cleans up (no memory leaks)

**How to test:**
1. Show message with autoClose
2. Wait for timer
3. Verify dismissal
4. Check console for errors
5. Repeat several times to check for memory leaks

---

### 8. 44x44px Touch Targets

**Test:** Close button meets minimum size

- [ ] Inspect close button
- [ ] Width is 44px or greater
- [ ] Height is 44px or greater
- [ ] Easy to tap on mobile device
- [ ] No accidental taps on adjacent elements

**How to test:**
1. Right-click close button → Inspect
2. Check computed styles: width and height
3. Test on mobile device or use DevTools mobile emulation
4. Verify easy to tap

---

### 9. Focus Management

**Test:** Screen reader announces alert immediately

- [ ] Enable screen reader (NVDA, JAWS, VoiceOver, etc.)
- [ ] Trigger a message
- [ ] Screen reader announces "alert"
- [ ] Screen reader reads message text
- [ ] Focus moves to message wrapper

**How to test:**
1. Enable screen reader
2. Trigger an error (e.g., submit invalid form)
3. Listen for announcement
4. Verify message is read aloud

---

## TIER 3: Nice-to-Have Features

### 10. Consistent Padding

**Test:** Visual consistency across variants

- [ ] All variants have same padding
- [ ] Padding doesn't use `inherit`
- [ ] Content is properly aligned
- [ ] No layout shifts between variants

---

### 11. Long Message Text Wrapping

**Test:** Long text wraps properly

```jsx
<Message message="This is a very long message that should wrap properly without breaking the layout or pushing the close button off the screen. The close button should remain visible and accessible even with very long text content that spans multiple lines." />
```

- [ ] Text wraps to multiple lines
- [ ] Close button stays visible
- [ ] Close button maintains 44x44px size
- [ ] No horizontal scrolling
- [ ] Layout remains intact

---

### 12. Controlled Component

**Test:** Parent controls visibility

```jsx
const [visible, setVisible] = useState(true);

<button onClick={() => setVisible(!visible)}>Toggle</button>
<Message
  message="Controlled"
  isVisible={visible}
  onDismiss={() => setVisible(false)}
/>
```

- [ ] Toggle button shows/hides message
- [ ] Close button updates parent state
- [ ] Component respects `isVisible` prop
- [ ] onDismiss callback fires correctly

---

### 13. Slide-In Animation

**Test:** Smooth entrance animation

- [ ] Message slides in from top (-8px)
- [ ] Fade in effect (opacity 0 → 1)
- [ ] Animation is smooth (300ms)
- [ ] No layout shift
- [ ] Animation respects `prefers-reduced-motion`

**How to test:**
1. Show a message
2. Watch entrance animation
3. Enable reduced motion in OS settings
4. Show message again
5. Verify animation is disabled

**Enable reduced motion:**
- **Windows:** Settings → Accessibility → Visual effects → Animation effects OFF
- **macOS:** System Preferences → Accessibility → Display → Reduce motion
- **Linux:** Varies by desktop environment

---

## Backward Compatibility Tests

### 14. Deprecated `success` Prop

**Test:** Old API still works

```jsx
// Old way (deprecated but functional)
<Message message="Success!" success />
```

- [ ] Displays as success variant
- [ ] Green background
- [ ] Works same as `variant="success"`
- [ ] No console errors
- [ ] No PropTypes warnings

---

### 15. All Views Still Work

**Test:** No breaking changes in existing code

Navigate to each view and verify messages work:

- [ ] Login form (`/login`)
- [ ] Registration form (`/register`)
- [ ] Reviewer registration (`/reviewer-register`)
- [ ] Reviewer login (`/reviewer-login`)
- [ ] Password reset (`/reset-password`)
- [ ] Forgot password (`/forgot-password`)
- [ ] Contact form (`/contact`)
- [ ] Profile edit
- [ ] User profile edit
- [ ] Admin profile view
- [ ] Admin reviewers view
- [ ] Admin user view
- [ ] Home view
- [ ] Full profile view

**For each view:**
- [ ] Error messages display correctly
- [ ] Success messages display correctly (if applicable)
- [ ] No console errors
- [ ] No PropTypes warnings

---

## Browser Compatibility Tests

### 16. Cross-Browser Testing

**Chrome/Edge:**
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

**Firefox:**
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

**Safari:**
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

**Mobile Safari (iOS):**
- [ ] Touch targets work
- [ ] Animations smooth (if motion enabled)
- [ ] 44x44px buttons easy to tap

**Chrome Mobile (Android):**
- [ ] Touch targets work
- [ ] Animations smooth (if motion enabled)
- [ ] 44x44px buttons easy to tap

---

## Code Quality Tests

### 17. No Linting Errors

```bash
cd /home/gary/Documents/WebApps/dev/bodyvantage/client
npm run lint -- src/components/message/Message.jsx
```

- [ ] No ESLint errors
- [ ] No ESLint warnings
- [ ] PropTypes match usage

---

### 18. No Runtime Errors

- [ ] Open browser console
- [ ] Navigate through app
- [ ] Trigger various messages
- [ ] No errors in console
- [ ] No warnings in console (except unrelated issues)

---

## Performance Tests

### 19. Memory Leaks

**Test:** Auto-close timers clean up properly

1. Show message with `autoClose={3000}`
2. Manually dismiss before timer
3. Check for timer cleanup (no errors)
4. Repeat 10+ times
5. Monitor memory in DevTools Performance tab

- [ ] No memory leaks
- [ ] Timers clean up when dismissed early
- [ ] Timers clean up when component unmounts
- [ ] No console errors about unmounted components

---

### 20. Animation Performance

**Test:** Smooth 60fps animations

1. Open DevTools Performance tab
2. Record while showing message
3. Check frame rate during animation
4. Should maintain ~60fps

- [ ] Animation is smooth
- [ ] No jank or stuttering
- [ ] Uses GPU acceleration (transform)

---

## Accessibility Audit

### 21. Automated Accessibility Testing

**Using axe DevTools or Lighthouse:**

1. Install axe DevTools extension
2. Open page with message
3. Run accessibility scan

- [ ] No violations for message component
- [ ] Passes WCAG 2.1 Level A
- [ ] Passes WCAG 2.1 Level AA
- [ ] Ideally passes AAA (touch targets)

---

### 22. Manual Screen Reader Testing

**Test with actual screen readers:**

**NVDA (Windows):**
- [ ] Message announced as alert
- [ ] Full text read
- [ ] Close button labeled properly

**JAWS (Windows):**
- [ ] Message announced as alert
- [ ] Full text read
- [ ] Close button labeled properly

**VoiceOver (macOS/iOS):**
- [ ] Message announced as alert
- [ ] Full text read
- [ ] Close button labeled properly

**TalkBack (Android):**
- [ ] Message announced as alert
- [ ] Full text read
- [ ] Close button labeled properly

---

## Final Verification

### All Tiers Complete

**TIER 1 (Critical):**
- [ ] ARIA attributes
- [ ] Semantic button
- [ ] Keyboard accessibility
- [ ] Color contrast

**TIER 2 (Important):**
- [ ] onDismiss callback
- [ ] Variant prop
- [ ] Auto-close
- [ ] 44x44px touch targets
- [ ] Focus management

**TIER 3 (Nice-to-Have):**
- [ ] Consistent padding
- [ ] Long text wrapping
- [ ] Controlled component
- [ ] Slide-in animation

**Backward Compatibility:**
- [ ] Old `success` prop works
- [ ] All views still functional

**Cross-Cutting:**
- [ ] No linting errors
- [ ] No runtime errors
- [ ] Cross-browser compatible
- [ ] Accessibility compliant
- [ ] Performance optimized

---

## Sign-Off

Once all tests pass:

- [ ] Component is production-ready
- [ ] Documentation is complete
- [ ] Examples are provided
- [ ] All stakeholders informed

**Tested by:** _______________
**Date:** _______________
**Browser versions:** _______________
**Screen readers tested:** _______________

---

## Troubleshooting

### Common Issues

**Message doesn't appear:**
- Check `message` prop is provided (required)
- Check visibility state (if using controlled mode)

**Auto-close doesn't work:**
- Verify `autoClose` prop is a number (milliseconds)
- Check browser console for errors

**Keyboard navigation not working:**
- Verify no JavaScript errors
- Check Tab key isn't captured by parent element
- Test in different browser

**Screen reader not announcing:**
- Verify ARIA attributes in DOM
- Check screen reader is running
- Try different screen reader

**Animation not smooth:**
- Check browser performance
- Disable other extensions
- Test in incognito mode

**Contrast issues:**
- Verify SCSS variables are correct
- Check browser zoom level (should be 100%)
- Test on different monitor

---

## Next Steps

After all tests pass:

1. Deploy to staging environment
2. Conduct user acceptance testing
3. Monitor for issues in production
4. Gather user feedback
5. Iterate as needed

---

**Document version:** 1.0
**Last updated:** 2025-12-31
**Component version:** 2.0 (major refactor)
