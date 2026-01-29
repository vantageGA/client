# UI/UX Review: AdminProfileView

**File:** `client/src/views/adminProfileView/AdminProfileView.jsx`
**Stylesheet:** `client/src/views/adminProfileView/AdminProfileView.scss`
**Date:** 2026-01-29

---

## 1. Layout and Visual Hierarchy

### 1.1 Poor Visual Hierarchy in Table Layout (JSX lines 150-182)

**Problem:** The table layout uses fixed width columns (`width: calc(100% / 6)` per `.item`) without clear visual prioritisation. The "DESCRIPTION" column is 52% wide, creating an unbalanced layout where information importance is unclear.

**Location:** `AdminProfileView.scss` lines 5, 53-60

**Recommendation:** Implement a card-based view for mobile and a proper semantic table for desktop. Establish clear information hierarchy: Name/Profile > Verification Status > Reviews > Actions. Consider using a data grid component with sortable columns.

### 1.2 Inconsistent Spacing and Padding (SCSS lines 27, 61)

**Problem:** Mixed use of `padding: 0.75rem` for rows and `padding: 0 0.6em` for wider items creates visual inconsistency. No whitespace hierarchy between sections.

**Recommendation:** Implement consistent spacing system: rows need min-height of at least 60px, items need consistent padding (1rem horizontal, 0.75rem vertical).

### 1.3 Column Header Alignment Mismatch (JSX lines 150-182)

**Problem:** The sticky header (SCSS lines 6-13) has dark background but no visual connection to content rows. The header row structure does not align perfectly with data rows due to margin/padding differences.

**Recommendation:** Use semantic `<table>`, `<thead>`, `<tbody>` with proper alignment guarantee, or ensure perfectly matching grid templates between header and content.

---

## 2. Form Design and Usability

### 2.1 Confusing Search Interaction (JSX lines 132-148)

**Problem:** The search field and "Clear search" button are side-by-side but the search does not provide real-time feedback. The label "SEARCH A NAME" does not explain the behaviour clearly.

**Recommendation:**
- Add real-time search indicator (e.g. "Searching..." during filter)
- Show result count with query: "Found 12 profiles matching 'john'"
- Make it clear this searches only names (current behaviour)
- Add search results summary below search bar

### 2.2 Grammar Error in Result Summary (JSX line 149)

**Problem:** `"There currently {searchedProfiles.length} profiles."` is missing the word "are".

**Fix:**
```jsx
`Showing ${searchedProfiles.length} profile${searchedProfiles.length !== 1 ? 's' : ''}`
```

### 2.3 window.confirm() for Critical Actions (JSX lines 47, 54, 61)

**Problem:** Using native browser `window.confirm()` for destructive actions (delete profile, delete review) is:
- Unstyled and inconsistent with app design
- Not accessible (browser default, limited ARIA support)
- No clear action labelling (message: "Are you sure you want to update this [ID]" for deletes)
- Messages expose technical IDs instead of user-friendly names

**Recommendation:** Create a custom `ConfirmationModal` component with:
- Clear question: "Delete profile for [User Name]?"
- Warning about consequences: "This will permanently remove all reviews and profile data"
- Two clear buttons: "Cancel" (secondary) | "Delete" (danger/red)
- Proper ARIA labels and focus management

Apply at JSX lines 47, 54, 61.

### 2.4 Incorrect Confirmation Message (JSX line 54)

**Problem:** For verification action: `"Are you sure you want to update this ${id}"` should say "verify" not "update", and should use the profile name not the raw ID.

### 2.5 Misleading Button Text for Review Deletion (JSX line 61)

**Problem:** Message says "Are you sure you want to update this" when actually deleting a review. Completely misleading.

---

## 3. Interaction Patterns (Loading States, Error Handling, Feedback)

### 3.1 No Loading State for Async Actions (JSX lines 45-64)

**Problem:** When users click "Delete Profile", "Verify Qualifications", or "Delete Review", there is no feedback. Button remains clickable, no spinner, no disabled state.

**Recommendation:**
- Track action-specific loading state in component
- Disable all buttons for that profile while processing
- Show inline spinner or change button text: "Deleting..."
- Add clear completion feedback

### 3.2 Error Message Display Timing (JSX lines 124, 126-127)

**Problem:** Success/error messages display but have no clear dismissal pattern. Success message auto-closes (4000ms) but timing may not be obvious.

**Recommendation:**
- Make auto-close duration longer (6000ms for important actions)
- Ensure close button is always visible
- Use `aria-live="assertive"` for error messages

### 3.3 Loading Spinner Has No Accessible Label (JSX lines 128-129)

**Problem:** `<LoadingSpinner />` renders without `role="status"` or aria-label.

**Fix:** Update LoadingSpinner to include `role="status"` and `aria-label="Loading profiles, please wait"`.

### 3.4 Review Expansion State Not Obvious (JSX lines 244-264)

**Problem:** The "SHOW Reviews" / "HIDE Reviews" toggle has no visual indicator (chevron icon) showing if the section is expanded. Button text changes dynamically but is not semantically correct for accessibility.

**Recommendation:**
```jsx
<button
  onClick={() => toggleReviews(profile._id)}
  aria-expanded={showReviewsId === profile._id}
  aria-label={`${showReviewsId === profile._id ? 'Hide' : 'Show'} reviews for ${profile.name}`}
>
  {showReviewsId === profile._id ? '▼ Hide Reviews' : '▶ Show Reviews'}
</button>
```

### 3.5 Pagination Usability Issues (JSX lines 299-345)

**Problem:**
- Inline styles instead of SCSS (lines 300-343) makes maintenance difficult
- No keyboard navigation (arrow keys to change page)
- No "jump to page" input for large datasets
- Page count display is good but navigation is basic

**Recommendation:**
- Move inline pagination styles to SCSS
- Add keyboard support (ArrowLeft/ArrowRight)
- Consider "Go to page" input field for datasets > 20 pages
- Add page number buttons (1, 2, 3... 10)

---

## 4. Accessibility (WCAG 2.1 AA Compliance)

### 4.1 Missing Form Labels (JSX line 133-138)

**Problem:** SearchInput has a label "SEARCH A NAME" but it is not properly associated with the input via `htmlFor`. The label element in `SearchInput.jsx` (line 30) does not have a matching ID on the input.

**Fix:**
```jsx
<SearchInput id="profile-search" ... />
// In SearchInput.jsx:
<label htmlFor={id}>{label}</label>
<input id={id} ... />
```

### 4.2 Sort Arrows Not Keyboard Accessible (JSX lines 156-176)

**Problem:** Sort arrows are `<span>` elements with `onClick` handlers, with no `role="button"`, no `aria-label`, no keyboard support.

**Fix:**
```jsx
// Replace:
<span onClick={() => handleSort('ratingUp')}>
  <i className="arrow fas fa-arrow-up" ...></i>
</span>

// With:
<button
  onClick={() => handleSort('ratingUp')}
  aria-label="Sort profiles by rating ascending"
  className="sort-button"
  title="Sort ascending"
>
  <i className="arrow fas fa-arrow-up" aria-hidden="true"></i>
</button>
```

### 4.3 Colour-Only Status Indicators (JSX lines 216-228)

**Problem:** Verification status only uses colour (green checkmark or red X) with no text alternative. Violates WCAG 1.4.1.

**Fix:**
```jsx
{profile.isQualificationsVerified ? (
  <span className="status-badge verified">
    <i className="fa fa-check" aria-hidden="true"></i> Verified
  </span>
) : (
  <span className="status-badge unverified">
    <i className="fa fa-times" aria-hidden="true"></i> Unverified
  </span>
)}
```

### 4.4 Insufficient Contrast on Disabled Buttons (Button.scss lines 16-19)

**Problem:** Disabled buttons use `opacity: 0.4` on text with dark background. Likely fails WCAG AA contrast ratio (4.5:1).

**Fix:** Use explicit colour values instead of opacity reduction, e.g. `color: rgba(100, 100, 100, 0.6)` with verified contrast ratio >= 4.5:1.

### 4.5 Non-Semantic Table Markup (JSX lines 122, 150-182)

**Problem:** Using `<fieldset>` and `<div>` elements for a table-like structure instead of semantic `<table>` with `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`.

**Fix:**
```jsx
<table className="admin-profile-table">
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Verified</th>
      <th scope="col">Description</th>
      <th scope="col">
        Rating
        <button aria-label="Sort ascending">↑</button>
        <button aria-label="Sort descending">↓</button>
      </th>
      <th scope="col">Reviews</th>
      <th scope="col">Actions</th>
    </tr>
  </thead>
  <tbody>
    {searchedProfiles.map(profile => (
      <tr key={profile._id}>
        <td>{profile.name}</td>
        ...
      </tr>
    ))}
  </tbody>
</table>
```

### 4.6 Missing Focus Indicators on Interactive Elements

**Problem:** Custom buttons and pagination buttons lack clear focus indicators beyond hover state.

**Fix:** Ensure all interactive elements have explicit focus styles, e.g.:
```css
button:focus-visible {
  outline: 2px solid var(--burnt-orange);
  outline-offset: 2px;
}
```

### 4.7 Fieldset Legend Not Descriptive (JSX line 123)

**Problem:** Legend just says "Profiles" with no context about available admin actions.

**Fix:** Change to: "Profile Management - View, Verify, and Delete Profiles"

---

## 5. Responsiveness and Mobile Experience

### 5.1 Table Layout Breaks on Mobile (SCSS lines 75-90)

**Problem:** At `max-width: 812px`, the heading is completely hidden and items become full-width column layout. Each "item" is a complex div with buttons, name, image, email, phone. Stacking vertically creates massive scroll with no visual separation between profiles.

**Recommendation:** Redesign mobile view as a card-based layout:
```jsx
<div className="profile-card">
  <img className="profile-avatar" src={profile.profileImage} alt={profile.name} />
  <h3>{profile.name}</h3>
  <p className="contact">{profile.email}</p>
  <p className="contact">{profile.telephoneNumber}</p>
  <div className="status">
    <span className="status-badge">Verified / Unverified</span>
  </div>
  <div className="actions">
    <Button text="Delete" ... />
    <Button text="Verify" ... />
    <Button text="Reviews" ... />
  </div>
</div>
```

### 5.2 Image Size on Mobile (JSX lines 195-199)

**Problem:** Profile images are fixed 80px diameter, tiny on mobile.

**Fix:** Make responsive: `width: min(100px, 20vw)`. Use 60px mobile, 80px tablet, 100px desktop.

### 5.3 Text Size Below Mobile Minimum (SCSS line 54)

**Problem:** Font size is `0.8em` (~14.4px), below recommended 16px minimum for mobile. May trigger iOS zoom-on-focus.

**Fix:** Mobile: 1rem (16px) base, Desktop: 0.9rem via media queries.

### 5.4 Pagination Not Mobile Friendly (JSX lines 299-345)

**Problem:** Pagination controls displayed horizontally with fixed spacing. On screens < 480px, "Page X of Y" text wraps awkwardly.

**Fix:** Stack pagination vertically on mobile. Use shorter text: "3/12" instead of "Page 3 of 12".

### 5.5 Touch Targets Below WCAG Minimum (JSX lines 309-343)

**Problem:** Pagination buttons have `padding: 10px 20px` which may be below 44x44px minimum.

**Fix:** Ensure minimum 44x44px touch targets: `min-height: 44px; min-width: 44px; padding: 12px 20px`.

### 5.6 No Search Debouncing (JSX lines 66-72)

**Problem:** Search re-filters entire array on every keystroke. No debouncing.

**Fix:** Add 300ms debounce to `handleSearch`. Consider virtual scrolling for large profile lists.

---

## 6. Consistency with Common UI Patterns

### 6.1 Non-Standard Table Presentation

**Problem:** Custom flex layout disguised as a table breaks accessibility and usability expectations. Only rating is sortable (not name, not verified status).

**Recommendation:** Adopt semantic table or standard data grid with sortable column headers, filterable columns, and multi-select for bulk actions.

### 6.2 Inconsistent Interactive Elements

**Problem:** Some interactive elements are `<Button>` components, others are `<span>` with click handlers (sort arrows). Inconsistent visual treatment.

**Fix:** Convert all interactive spans to buttons. Establish button variants: primary (standard), danger (destructive), tertiary (sort/filter).

### 6.3 Missing Visual Feedback for Completed Actions

**Problem:** No specific feedback on which profile was affected. Success message is generic ("Profile has been successfully deleted").

**Fix:** Show specific feedback: "Profile for John Smith has been deleted". Consider undo option where applicable.

### 6.4 Non-Standard Review Expansion

**Problem:** Expanding reviews inline is non-standard. Large profile rows become even larger when expanded.

**Recommendation:** Use a slide-out detail panel on desktop, separate page on mobile, or a modal. Show review count badge with preview of first review.

---

## 7. UX Anti-Patterns and Pain Points

### 7.1 State Management Issues (JSX lines 29, 82, 100-116)

**Problem:**
- `showReviews` (line 29) is initialised with `let` — should be `const` with `useState`
- Line 111 creates `newProfilesAdmin` array but does not use it properly
- Line 115 dependency array includes `newProfilesAdmin` but effect just sets the same value

**Fix:**
```jsx
const [expandedProfileId, setExpandedProfileId] = useState(null);
const [sortOrder, setSortOrder] = useState('default'); // 'default' | 'ratingUp' | 'ratingDown'

const sortedProfiles = useMemo(() => {
  if (sortOrder === 'ratingUp') {
    return [...profilesAdmin].sort((a, b) => a.rating - b.rating);
  }
  if (sortOrder === 'ratingDown') {
    return [...profilesAdmin].sort((a, b) => b.rating - a.rating);
  }
  return profilesAdmin;
}, [profilesAdmin, sortOrder]);
```

### 7.2 Broken Review Toggle Logic (JSX lines 253-257)

**Problem:** `setShowReviewsId(profile._id, setShowReviews((showReviews = !showReviews)))` passes two arguments to a single-arg setter. Assignment in function argument is an anti-pattern.

**Fix:**
```jsx
const toggleReviews = (profileId) => {
  setShowReviewsId(prev => prev === profileId ? null : profileId);
};

<Button
  text={showReviewsId === profile._id ? 'Hide Reviews' : 'Show Reviews'}
  onClick={() => toggleReviews(profile._id)}
/>
```

### 7.3 Missing Empty States

**Problem:** No handling for:
- No profiles found after search
- No reviews for a profile

**Fix:**
```jsx
{searchedProfiles.length === 0 ? (
  <div className="empty-state">
    <p>No profiles found matching "{keyword}"</p>
    <Button text="Clear search" onClick={handleSearchClear} />
  </div>
) : (
  // existing table
)}

{profile.reviews.length === 0 && (
  <p className="empty-reviews">No reviews for this profile</p>
)}
```

### 7.4 No State Persistence Across Navigation

**Problem:** If a user searches for "john", navigates away, then comes back, the search is cleared.

**Fix:** Use URL query params: `?search=john&page=2&sort=ratingDown` to preserve state across navigation.

### 7.5 Profile Image Error Not Handled (JSX lines 195-199)

**Problem:** Broken image URLs show the browser's broken-image icon. No alt text.

**Fix:**
```jsx
<img
  className="image"
  src={profile.profileImage}
  alt={`Profile photo for ${profile.name}`}
  onError={(e) => { e.target.src = '/placeholder-profile.png'; }}
/>
```

---

## Priority Summary

| Priority | Issue | Section | Effort |
|----------|-------|---------|--------|
| **CRITICAL** | Replace `window.confirm()` with custom modal | 2.3-2.5 | Medium |
| **CRITICAL** | Semantic table markup | 4.5 | High |
| **CRITICAL** | Keyboard-accessible sort buttons | 4.2 | Low |
| **HIGH** | Mobile card-based layout | 5.1 | High |
| **HIGH** | Loading states for async actions | 3.1 | Medium |
| **HIGH** | Colour-only status indicators | 4.3 | Low |
| **MEDIUM** | Fix grammar in result summary | 2.2 | Trivial |
| **MEDIUM** | Refactor state management | 7.1 | Medium |
| **MEDIUM** | Fix review toggle logic | 7.2 | Low |
| **MEDIUM** | Add empty states | 7.3 | Low |
| **LOW** | Image error handling | 7.5 | Low |
| **LOW** | Search debouncing | 5.6 | Low |
| **LOW** | Pagination mobile styling | 5.4 | Low |
| **LOW** | URL-based state persistence | 7.4 | Medium |

## Implementation Phases

### Phase 1 — Critical Accessibility and Safety
- Create custom `ConfirmationModal` component (replaces `window.confirm()` at JSX lines 47, 54, 61)
- Refactor to semantic `<table>` markup (JSX lines 150-182, SCSS lines 5-60)
- Convert sort `<span>` to `<button>` with `aria-label` (JSX lines 156-176)
- Add `htmlFor`/`id` association to SearchInput (JSX lines 133-138)

### Phase 2 — Mobile and Feedback
- Card-based mobile layout (SCSS lines 75-90)
- Add loading/disabled state to action buttons (JSX lines 45-64)
- Add focus-visible indicators (SCSS)
- Add text to verification status badges (JSX lines 216-228)

### Phase 3 — State and Polish
- Refactor state: replace `showReviews` + `showReviewsId` with single `expandedProfileId` (JSX lines 29, 244-264)
- Refactor sort: use `useMemo` derived state (JSX lines 82, 100-116)
- Fix grammar in profile count (JSX line 149)
- Add empty states for zero search results and zero reviews (JSX lines 149, 264)

### Phase 4 — Enhancements
- URL-based state persistence for search/page/sort
- Search debouncing (300ms)
- Image `onError` fallback and proper `alt` text
- Pagination mobile styling and keyboard nav
