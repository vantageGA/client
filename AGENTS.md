# AGENTS.md - BodyVantage Client

This file summarizes local documentation and skills for agents working in
`/home/gary/Documents/WebApps/dev/bodyVantage/client`.

## Quick Index
- Project stack and scripts
- Project structure
- Frontend migration + security updates
- Frontend API quick reference
- Message component refactor
- UI/UX review summaries
- Troubleshooting and bug fix notes
- Reviewer flow (user reviews)
- Pre-registration page spec
- About / notes (docs extracts)
- Docs index
- Local skills

## Project Stack and Scripts
- React 18 + Vite (ESM, Vite 7) with Sass and Redux.
- Testing via Vitest (`jsdom`) with Testing Library.
- Linting via ESLint.
- Scripts:
  - `npm run dev` (Vite dev server)
  - `npm run build` (production build)
  - `npm run preview` (local preview)
  - `npm run lint` (ESLint)
  - `npm run test` (Vitest)

## Project Structure
- `src/App.jsx`, `src/main.jsx`: app entry and routing shell.
- `src/views/`: page-level views (profile edit, admin views, login, registration).
- `src/components/`: reusable UI components (Message, Button, InputField, etc.).
- `src/store/`: Redux actions, reducers, constants, store setup.
- `src/utils/`: shared utilities (validation, helpers).
- `src/styles/`, `src/css/`, `src/index.scss`: global styles and theme.

## Project Overview (High Level)
- BodyVantage is a professional platform for fitness, beauty, rehab, and
  wellbeing practitioners. The app emphasizes credibility, verified expertise,
  and clear professional communication (not just marketing visibility).

## Key Routes and Views (from App.jsx)
- `/` -> `HomeView`
- `/fullProfile/:id` -> `FullProfileView`
- `/user-profile-edit` -> `UserProfileEditView`
- `/profile-edit` -> `ProfileEditView`
- `/contact` -> `ContactFormView`
- `/about` -> `AboutView`
- `/pre-registration` -> `PreRegistrationView`
- `/faq` -> `FaqsView`
- `/cookies` -> `CookiesView`
- `/privacy` -> `PrivacyView`
- `/login` -> `LoginFormView`
- `/forgot-password` -> `ForgotPassword`
- `/registration` -> `RegistrationView`
- `/reset-password/:token` -> `ResetPassword`
- `/verify-email` -> `VerifyEmail`
- `/verify-email-change` -> `VerifyEmailChange`
- `/admin-users` -> `AdminUserView`
- `/admin-profiles` -> `AdminProfileView`
- `/admin-reviewers` -> `AdminReviewersView`
- `/reviewer-login` -> `ReviewerLoginView`
- `/reviewer-register` -> `ReviewerRegisterView`
- `/reviewer-forgot-password` -> `ReviewerForgotPassword`
- `/reviewer-reset-password/:token` -> `ReviewerResetPassword`
- `/subscribe` -> `SubscriptionOptions`
- `/subscribe/success` -> `SubscriptionSuccess`
- `/subscribe/cancel` -> `SubscriptionCancel`
- `*` -> `ErrorView`

## Redux Store Map (from src/store/store.js)
- Core slices:
  - Users/auth: `users`, `userLogin`, `userRegistration`, `userDetails`,
    `userUpdateProfile`, `userProfileById`, `userDelete`, `userAddRemoveAdmin`,
    `userForgotPassword`, `userUpdatePassword`, `userEmailVerify`,
    `userEmailChangeVerify`
  - Profiles: `profiles`, `profilesAdmin`, `profileById`,
    `profileOfLoggedInUser`, `profileCreate`, `profileUpdate`,
    `profileDelete`, `profileVerifyQualification`, `profileDeleteReview`
  - Profile images: `profileImage`, `profileImages`, `profileImagesPublic`,
    `profileImageDelete`, `userProfileImage`
  - Reviewer flow: `userReviewLogin`, `userReviewId`,
    `userReviewerRegistration`, `reviewerForgotPassword`,
    `reviewerUpdatePassword`, `userAdminReviewersDetails`,
    `userReviewersDetails`, `adminReviewerDelete`, `createReview`
  - Other: `cookies`, `contactForm`, `stripeCheckout`, `stripeSubscription`

## Component Inventory (src/components)
- `accordion`, `formSectionAccordion`: collapsible section UI.
- `bodyVantage`: brand component used in headings.
- `button`, `inputField`, `message`, `linkComp`: core UI atoms.
- `card`, `review`, `rating`: profile/review display.
- `header`, `footer`, `cookies`: global shell components.
- `loadingSpinner`, `info`, `dateTime`: utility UI.
- `login-out`: auth control UI.
- `membershipProposition`, `betaRelease`: marketing/info blocks.
- `passwordStrength`: password meter and checklist.
- `quillEditor`: rich text editor wrapper.
- `searchInput`: search field component.
- `socialLinks`, `socialMedia`: social components.

## Key Data Flows (Actions -> Reducers -> Views)

### Auth (User)
- Login: `loginAction` -> `userLogin` -> `LoginFormView`.
  - POST `/api/users/login`, stores `userInfo` in localStorage.
- Register: `registerAction` -> `userRegistration` -> `RegistrationView`.
  - POST `/api/users`, stores `userInfo`, email verification required.
- Email verify: `verifyEmailAction` -> `userEmailVerify` -> `VerifyEmail`.
- Email change verify: `verifyEmailChangeAction` -> `userEmailChangeVerify` -> `VerifyEmailChange`.
- Logout: `logoutAction` clears localStorage and `userLogin`.

### User Profile (Self)
- Fetch self profile: `getUserDetailsAction` -> `userDetails`.
  - GET `/api/users/profile` (note: not admin-only `/api/users/:id`).
- Update self profile: `updateUserProfileAction` -> `userUpdateProfile`.
  - PUT `/api/users/profile`, refreshes `userDetails`.
- Forgot/reset password: `userForgotPasswordAction` -> `userForgotPassword`,
  `updateUserPasswordAction` -> `userUpdatePassword`.

### Trainer Profile (Profiles)
- Public profiles list: `profilesAction` -> `profiles` -> `HomeView`.
  - GET `/api/profiles` with pagination params.
- Admin profiles list: `profilesAdminAction` -> `profilesAdmin` -> `AdminProfileView`.
  - GET `/api/profiles/admin` with pagination.
- Profile details: `profileByIdAction` -> `profileById` -> `FullProfileView`.
- Logged-in profile: `profileOfLoggedInUserAction` -> `profileOfLoggedInUser`.
- Create profile: `createProfileAction` -> `profileCreate` then refreshes
  `profileOfLoggedInUser`.
- Update profile: `profileUpdateAction` -> `profileUpdate` then refreshes
  `profileOfLoggedInUser` (PUT `/api/profile`).
- Delete profile (admin): `deleteProfileAction` -> `profileDelete` then refreshes admin list.
- Verify qualification (admin): `profileVerifyQualificationAction` -> `profileVerifyQualification`.
- Delete review (admin): `deleteReviewProfileAction` -> `profileDeleteReview`.
- Profile clicks: `profileClickCounterAction` -> `profileClickCounter`.
- Profile images:
  - Auth: `profileImagesAction` -> `profileImages`
  - Public: `profileImagesPublicAction` -> `profileImagesPublic`

### Reviewer Flow (User Reviews)
- Reviewer register: `reviewerRegisterAction` -> `userReviewerRegistration`.
  - POST `/api/users-review`.
- Reviewer login: `userReviewLoginAction` -> `userReviewLogin`.
  - POST `/api/users-review/login`, stores `userReviewInfo`.
- Reviewer details: `userReviewersDetailsAction` -> `userReviewersDetails`.
  - GET `/api/reviewer/public/:id`.
- Set trainer id to review: `userReviewIdAction` -> `userReviewId`.
- Create review: `createUserReviewAction` -> `createReview`.
  - POST `/api/profiles/:reviewerId/reviews` (requires `acceptConditions: true`).
- Reviewer forgot/reset: `reviewerForgotPasswordAction`, `reviewerUpdatePasswordAction`.
- Reviewer logout: `reviewLogoutAction`.

## Risk Checklist (Known Hotspots)
- ProfileEditView: 8 critical issues (message stacking, DOM manipulation, missing
  validation, missing InputField props, accessibility gaps, unprofessional labels).
- UserProfileEditView: 5 critical issues (regex mismatch, message stacking,
  DOM manipulation, missing pre-submit validation, checkbox a11y failure).
- AdminUserView: non-semantic table layout (WCAG 1.3.1), layout shift from
  border-width animations, action hierarchy issues.
- AdminProfileView: misleading confirm messages, missing loading states,
  accessibility gaps (labels, keyboard support), inline styling.
- Message component usage: ensure `variant` prop and unified message state to
  avoid stacking and unclear messaging.
- Validation rules: front-end must match backend (use `src/utils/validation.js`).

## Testing Quickstart
- `npm run dev` to run the Vite dev server.
- `npm run lint` to check ESLint issues.
- `npm run test` to run Vitest (jsdom + Testing Library).
- `npm run build` for production build validation.
- `npm run preview` to verify production bundle locally.

## Critical Endpoints Cheat Sheet (Client-Side Usage)
- Auth:
  - POST `/api/users/login`
  - POST `/api/users`
  - GET `/api/verify?token=...`
  - GET `/api/verify-email-change?token=...`
  - POST `/api/user-forgot-password`
  - PUT `/api/user-update-password`
  - GET/PUT `/api/users/profile`
- Profiles:
  - GET `/api/profiles` (pagination + filters)
  - GET `/api/profiles/admin` (admin, pagination)
  - GET `/api/profile/:id` (public profile details)
  - GET `/api/profile` (logged-in user profile)
  - POST `/api/profiles` (create profile)
  - PUT `/api/profile` (update profile; id from token)
  - DELETE `/api/profiles/admin/:id` (admin delete)
  - PUT `/api/profiles/admin/:id` (verify qualification)
  - DELETE `/api/profiles/:id/reviews` (admin delete review; `reviewId` in body)
  - PUT `/api/profile-clicks` (click counter; body `{ _id }`)
- Profile images:
  - GET `/api/profile-images` (auth, pagination)
  - GET `/api/profile-images-public/:id` (public, pagination)
- Reviewers:
  - POST `/api/users-review`
  - POST `/api/users-review/login`
  - GET `/api/reviewer/public/:id`
  - GET `/api/reviewers/admin` (admin)
  - DELETE `/api/reviewer/admin/:id` (admin)
  - POST `/api/reviewer-forgot-password`
  - PUT `/api/reviewer-update-password`
  - POST `/api/profiles/:reviewerId/reviews` (create review)

## Permissions Matrix (Public vs Auth vs Admin)
- Public endpoints:
  - GET `/api/profiles`
  - GET `/api/profile/:id`
  - GET `/api/profile-images-public/:id`
  - POST `/api/users` (register)
  - POST `/api/users/login`
  - GET `/api/verify?token=...`
  - GET `/api/verify-email-change?token=...`
  - POST `/api/users-review`
  - POST `/api/users-review/login`
  - POST `/api/user-forgot-password`
  - PUT `/api/user-update-password`
  - POST `/api/reviewer-forgot-password`
  - PUT `/api/reviewer-update-password`
- Authenticated user endpoints:
  - GET/PUT `/api/users/profile`
  - GET `/api/profile`
  - POST `/api/profiles`
  - PUT `/api/profile`
  - GET `/api/profile-images`
  - PUT `/api/profile-clicks`
  - GET `/api/reviewer/public/:id` (requires reviewer token)
  - POST `/api/profiles/:reviewerId/reviews` (requires reviewer token)
- Admin endpoints:
  - GET `/api/users`
  - DELETE `/api/users/:id`
  - PUT `/api/user/profile/:id` (admin add/remove)
  - GET `/api/profiles/admin`
  - DELETE `/api/profiles/admin/:id`
  - PUT `/api/profiles/admin/:id` (verify qualification)
  - DELETE `/api/profiles/:id/reviews`
  - GET `/api/reviewers/admin`
  - DELETE `/api/reviewer/admin/:id`

## Env/Config Knobs
- Stripe:
  - `VITE_STRIPE_PUBLISHABLE_KEY` in `src/config/stripe.js`
  - Fallback: `pk_test_placeholder` used if env var is missing (dev only).
- API base URL:
  - `VITE_API_BASE_URL` in `src/main.jsx` sets Axios default base URL.
- Build version label:
  - `VITE_BUILD_VERSION` in `src/components/footer/Footer.jsx` shows build info
    in the footer when provided.

## Local Dev Setup (Env Files)
- `.env`:
  - `VITE_STRIPE_PUBLISHABLE_KEY`
  - `VITE_BUILD_VERSION=local`
- `.env.development`:
  - `VITE_API_BASE_URL=http://127.0.0.1:5000`
  - `VITE_STRIPE_PUBLISHABLE_KEY`
  - `VITE_BUILD_VERSION=dev`
- `.env.production`:
  - `VITE_API_BASE_URL=https://api-cllf.onrender.com`
  - `VITE_STRIPE_PUBLISHABLE_KEY`
  - `VITE_BUILD_VERSION=prod`

## Style Conventions
- Global theme variables live in `src/styles/_theme.scss` (dark base palette,
  gold/orange accents, `whitesmoke` text).
- Global base styles and resets live in `src/index.scss`.
- Most component/view SCSS files `@use '../../index.scss'` and often
  `@use '../../scssMixIn.scss'` for shared mixins.
- Typography: headings use `Bebas Neue`; body uses `Comfortaa` (see `index.scss`).

## Design Tokens Snapshot (src/styles/_theme.scss)
- Backgrounds:
  - `$main-bg-colour: rgba(12, 12, 12, 1)`
  - `$secondary-bg-colour: hsl(23, 100%, 50%)`
  - `$fieldSet-bg-colour: rgba(34, 35, 39, 1)`
- Accents:
  - `$light-orange: rgba(212, 181, 51, 1)`
  - `$burnt-orange: rgba(196, 165, 35, 1)` (logo gold)
  - `$rating-colour: rgba(196, 166, 36, 1)`
- Status:
  - `$success: rgba(92, 184, 92, 1)`
  - `$warning: rgba(240, 173, 78, 1)`
  - `$danger: crimson`
- Text/links/borders:
  - `$main-font-colour: whitesmoke`
  - `$link-colour: lightblue`
  - `$border-colour: rgba(200, 200, 200, 0.5)`
  - `$border-colour-light: hsla(0, 0%, 78%, 0.2)`
- Layout:
  - `$header-height: 80px`
  - `$footer-height: 40px`

## Known Tech Debt / Priority Fixes (from docs)
- ProfileEditView (trainer edit):
  - Replace DOM manipulation with `useRef` for file input.
  - Consolidate message state with `variant`, avoid stacking.
  - Add pre-submit validation and InputField props (id, hint, onBlur, aria-*).
  - Fix textarea error rendering and accessible delete button.
  - Remove inline icon styles; use CSS classes + text labels.
- UserProfileEditView (user edit):
  - Fix password regex mismatch messaging.
  - Add pre-submit validation.
  - Replace DOM manipulation with refs.
  - Fix checkbox accessibility (aria-controls/expanded/labels).
  - Consolidate Message usage with `variant` and auto-close.
- AdminUserView:
  - Replace flexbox grid with semantic table for accessibility.
  - Fix layout shift caused by border-width animation.
  - Improve action hierarchy and destructive action styling.
- AdminProfileView:
  - Replace `window.confirm` with custom modal + clear copy.
  - Add loading states and a11y labels (SearchInput, sorting).
  - Remove inline styles; improve pagination UX and keyboard support.

## Project Context (from docs)

### Frontend Migration + Security (Jan 2026)
- Migration completed on 2026-01-01 to match backend v2.0.0 security updates.
- Core changes: pagination for list endpoints, updated API routes, new response
  formats, stricter validation, and general security best practices.
- Redux actions/reducers updated for pagination and new response shapes.
- Profile update route now uses `PUT /api/profile` with user ID from JWT.
- Delete review route now uses `DELETE /api/profiles/:id/reviews` with
  `reviewId` in request body.
- Click counter no longer takes a count parameter (server auto-increments).

### Frontend API Quick Reference
- `profilesAction(page, limit, filters)` and `profilesAdminAction(page, limit)`
  now accept pagination params.
- `profileUpdateAction(profileData)` no longer takes a user ID param.
- `profileImagesAction(page, limit)` and `profileImagesPublicAction(userId, page, limit)`
  now return `{ images, page, pages, total }`.
- Redux state for profiles/images includes `page`, `pages`, `total`.
- Review submission must send `acceptConditions: true` as a strict boolean.
- Always null-guard arrays before `filter/map` (e.g., `(profiles || []).filter(...)`).

### Frontend Security Implementation
- Validation utilities added at `src/utils/validation.js` (email, name, password,
  password strength, password match) aligned with backend rules.
- Password strength component added at
  `src/components/passwordStrength/PasswordStrength.jsx`.
- Email verification views added:
  - `/verify-email` -> `VerifyEmail.jsx`
  - `/verify-email-change` -> `VerifyEmailChange.jsx`
- Login/registration/reset flows updated to use validation utilities and new
  messaging rules (generic success messages to prevent enumeration).
- UserProfileEditView updated with current password requirement for password
  changes and email-change messaging.

### Message Component Refactor
- Message component refactored for WCAG 2.1 compliance and better API.
- New props: `variant` (success|error|warning), `autoClose`, `onDismiss`,
  `isVisible`.
- Deprecated `success` boolean is still supported but should be replaced.
- Updated views include reset/registration/reviewer/admin/contact components.

## UI/UX Review Summaries

### ProfileEditView (Trainer profile edit)
- Component: `src/views/profileEditView/ProfileEditView.jsx` (910 lines)
- Review date: 2025-12-31
- Issues: 43 total, 8 critical
- Primary pattern mismatch: fixes already applied to UserProfileEditView were
  not applied here.
- Critical fixes include:
  - Replace `document.querySelector` with `useRef` for file input.
  - Consolidate message handling with a single notification state + `variant`.
  - Replace unprofessional image upload button labels.
  - Remove inline icon styles and use CSS classes + text labels.
  - Fix textarea error rendering.
  - Add pre-submit validation.
  - Add missing InputField props (id, hint, onBlur, aria-*).
  - Make delete image button accessible (use `<button>` + ARIA).
- Quick references:
  - `docs/REVIEW_EXECUTIVE_SUMMARY.md`
  - `docs/PROFILEEDITVIEW_QUICK_REFERENCE.md`
  - `docs/IMPLEMENTATION_GUIDE_ProfileEditView.md`
  - `docs/PATTERN_COMPARISON.md`
  - `docs/UIUX_REVIEW_ProfileEditView.md`
  - `docs/PROFILEEDITVIEW_REVIEW_INDEX.md`

### UserProfileEditView (User profile edit)
- Component: `src/views/userProfileEditView/UserProfileEditView.jsx` (373 lines)
- Review date: 2025-12-31
- Issues: 39 total, 5 critical
- Key critical issues:
  - Password regex mismatch and unclear error messaging.
  - Message stacking without variant handling.
  - DOM manipulation anti-pattern.
  - No pre-submit validation.
  - Checkbox accessibility failures.
- Quick references:
  - `docs/REVIEW_SUMMARY.txt`
  - `docs/QUICK_REFERENCE_GUIDE.md`
  - `docs/UI_UX_REVIEW_INDEX.md`
  - `docs/REMEDIATION_CODE_EXAMPLES.md`
  - `docs/LINE_BY_LINE_ANNOTATIONS.md`
  - `docs/UIUX_REVIEW_UserProfileEditView.md`

### Admin Views UI/UX Reviews (Jan 2026)
- AdminUserView (`src/views/adminUserView/AdminUserView.jsx`):
  - Critical issue: non-semantic flexbox grid should be replaced with a
    semantic table for accessibility.
  - Visual hierarchy issues, destructive action styling, and layout shift due
    to border-width animation.
- AdminProfileView (`src/views/adminProfileView/AdminProfileView.jsx`):
  - Issues with table layout hierarchy, search UX, misleading confirm text,
    missing loading state, and accessibility gaps (labels, keyboard support).
  - Recommendation: custom confirmation modal and proper semantic structure.

## Troubleshooting and Bug Fix Notes

- Login admin error fix: `getUserDetailsAction` must use `/api/users/profile`
  instead of admin-only `/api/users/:id`.
- Login troubleshooting checklist:
  - Clear local/session storage.
  - Ensure login endpoint is `POST /api/users/login` with no Authorization header.
  - Verify route config does not protect `/users/login`.
  - Check `isConfirmed` for email verification requirements.

## Reviewer Flow (User Reviews)
- Public profile -> reviewer login -> reviewer register -> email confirm ->
  reviewer login -> submit review.
- Frontend routes: `/fullProfile/:id`, `/reviewer-login`, `/reviewer-register`.
- Key actions live in `src/store/actions/userReviewActions.js`.
- Server enforces `acceptConditions === true` for review submission.

## Pre-Registration Page Spec
- Component: `src/views/preRegistrationView/PreRegistrationView.jsx`
- Structure: fieldset with sections (who membership is for, benefits, includes,
  timeline, commitment, CTA buttons). No complex UI elements.

## About / Notes (Docs Extracts)

### About Us (docs/About Us.docx)
- BodyVantage supports professionals in fitness, beauty, rehab, and wellbeing.
- Emphasis on credibility, clear communication, and professional trust.
- Registered members receive recognition and support to present expertise.

### BodyVantage Notes (docs/Bodyvantage Notes.odt)
- Main page feedback: move privacy to bottom; center branding and search.
- Profile layout: move photo below name; adjust name/bio/review sizes; add
  arrows for photo carousel; move reviews below photo.
- Contact page: set up an email address; change label to "Full Name".
- Client settings issues: new clients not saving or appearing in search.

## Docs Index (for navigation)
- `docs/README.md` is the primary index of all client docs.

## Local Skills (from .git/skills)

### frontend-design
- Purpose: produce distinctive, production-grade UI design work.
- Emphasis: bold, intentional aesthetics; avoid generic layouts and fonts.
- Requires: strong typography, color direction, atmospheric backgrounds, and
  meaningful motion.

### front-end-developer
- Purpose: implement or review frontend code with enterprise-grade practices.
- Covers: React patterns, architecture, TypeScript, state management, a11y,
  performance, testing, and documentation.

### pr-reviewer
- Purpose: review PR diffs for functionality, style, security, tests,
  and maintainability with structured feedback.

### prd
- Purpose: generate PRDs with clarifying questions and structured sections.
- Output path: `tasks/prd-[feature-name].md`.

### ui-ux-expert
- Purpose: review UI/UX work across layout, hierarchy, interaction, a11y,
  responsiveness, and provide structured feedback.
