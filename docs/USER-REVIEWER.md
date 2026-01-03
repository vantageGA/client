# User Reviewer Flow (Registration + Review Submission)

This document summarizes how a user registers to write a review, confirms their email, logs in, and submits a review.

## Screen Flow + UI Fields

### 1) Trainer Profile (Public)
**Route:** `/fullProfile/:id`
**File:** `client/src/views/fullProfile/FullProfileView.jsx`

Behavior:
- Displays the trainer profile.
- Shows a link to write a review (`/reviewer-login`).
- Stores the trainer's user id for the review flow via `userReviewIdAction(profile.user)`.

### 2) Reviewer Login
**Route:** `/reviewer-login`
**File:** `client/src/views/reviewerLoginView/ReviewerLoginView.jsx`

Fields:
- `email`
- `password`

Behavior:
- If no reviewer account, the page links to `/reviewer-register`.
- After login, shows review guidelines and the review form.

### 3) Reviewer Registration
**Route:** `/reviewer-register`
**File:** `client/src/views/reviewerRegisterView/ReviewerRegisterView.jsx`

Fields:
- `name`
- `email`
- `password`
- `confirmPassword`

Behavior:
- Client-side validation via regex for name/email/password.
- On success, user receives a verification email.

## API Requests + Payloads

### Register Reviewer
**Client action:** `reviewerRegisterAction`
**File:** `client/src/store/actions/userReviewActions.js`
**Endpoint:** `POST /api/users-review`
**Server route:** `api/routes/userReviewRoutes.js`
**Controller:** `api/controllers/userReviewsController.js`

Payload:
```json
{
  "name": "<name>",
  "email": "<email>",
  "password": "<password>",
  "userProfileId": "<trainerUserId>"
}
```

Response:
- Reviewer info + token is returned and stored in `localStorage` as `userReviewInfo`.

### Confirm Reviewer Email
**Endpoint:** `GET /api/verifyReviewer?token=<jwt>`
**Route:** `api/routes/confirmEmailRoutes.js`
**Controller:** `api/controllers/confirmEmailController.js`

Behavior:
- Confirms the reviewer (`isConfirmed = true`).

### Reviewer Login
**Client action:** `userReviewLoginAction`
**File:** `client/src/store/actions/userReviewActions.js`
**Endpoint:** `POST /api/users-review/login`

Payload:
```json
{
  "email": "<email>",
  "password": "<password>",
  "userProfileId": "<trainerUserId>"
}
```

Response:
- Reviewer info + token returned and stored in `localStorage` as `userReviewInfo`.

### Submit Review
**Client action:** `createUserReviewAction`
**File:** `client/src/store/actions/userReviewActions.js`
**Endpoint:** `POST /api/profiles/:reviewerId/reviews`
**Server route:** `api/routes/profileRoutes.js`
**Controller:** `api/controllers/profileController.js`

Payload (from reviewer login view):
```json
{
  "rating": 5,
  "comment": "<text>",
  "showName": false,
  "userProfileId": "<trainerUserId>",
  "acceptConditions": true
}
```

## Server-Side Validation (Review Submission)
**File:** `api/controllers/profileController.js`

Rules enforced:
- `acceptConditions` must be boolean `true`.
- Reviewer cannot review their own profile.
- Reviewer cannot submit multiple reviews for the same profile.
- Reviewer and target profile ids must be valid.
- `isConfirmed` is **not** enforced server-side for review submission (UI gates acceptance instead).

## Redux State + Action Flow

### State Slices (Store)
**File:** `client/src/store/store.js`
- `userReviewLogin` (logged-in reviewer info + token)
- `userReviewId` (trainer user id to be reviewed)
- `userReviewerRegistration` (registration status + response)
- `userReviewersDetails` (reviewer profile details)
- `createReview` (review submission status)

### Actions + Reducers
**Actions:** `client/src/store/actions/userReviewActions.js`
**Reducers:** `client/src/store/reducers/userReviewReducer.js`
**Constants:** `client/src/store/constants/userReviewConstants.js`

Key actions:
- `userReviewIdAction(userProfileId)`
- `reviewerRegisterAction(name, email, password, userProfileId)`
- `userReviewLoginAction(email, password, userProfileId)`
- `userReviewersDetailsAction(reviewerId)`
- `createUserReviewAction(reviewerId, reviewPayload)`
- `reviewLogoutAction()`

### Sequence (Happy Path)
1. `FullProfileView` dispatches `userReviewIdAction(profile.user)` to store the trainer id.
2. On `/reviewer-register`, submit dispatches `reviewerRegisterAction(...)` and stores reviewer info in `userReviewerRegistration` (and `localStorage`).
3. Reviewer confirms email via `/api/verifyReviewer?token=...` (server marks `isConfirmed = true`).
4. On `/reviewer-login`, submit dispatches `userReviewLoginAction(...)` and stores reviewer info in `userReviewLogin` (and `localStorage`).
5. Clicking "Accept Review Guidelines" dispatches `userReviewersDetailsAction(reviewerId)` and sets `acceptConditions = true` if confirmed.
6. Submitting the review dispatches `createUserReviewAction(reviewerId, payload)` and updates `createReview` state.

### Sequence (Common Blocks)
- If `isConfirmed === false`, UI shows warning and review submission is blocked.
- If `acceptConditions !== true`, API rejects the review with a 400 error.

## Relevant Routes (Frontend)
**File:** `client/src/App.jsx`
- `/fullProfile/:id`
- `/reviewer-login`
- `/reviewer-register`

---

## Database Schema

### UserReviewer Model
**File:** `api/models/userReviewerModel.js`

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed with bcrypt),
  isConfirmed: Boolean (default: false),
  hasSubmittedReview: Boolean (default: false),
  createdAt: Timestamp (auto),
  updatedAt: Timestamp (auto)
}
```

**Key Features:**
- **Password Hashing**: Bcrypt pre-save hook with salt rounds of 10 (line 38-45)
- **Email Uniqueness**: Enforced at database level
- **matchPassword()**: Instance method for secure password comparison using `bcrypt.compare()`
- **Timestamps**: Automatically tracks creation and last update

**Business Logic:**
- `isConfirmed` must be `true` before user can submit a review (enforced in UI)
- `hasSubmittedReview` is set to `true` after first review submission (line 393 in profileController.js)

### Review Schema (Embedded in Profile)
**File:** `api/models/profileModel.js` (lines 3-38)

```javascript
{
  user: ObjectId (ref: 'UserReviewer'),
  name: String (required, reviewer name),
  rating: Number (required, 1-5),
  comment: String (required),
  showName: Boolean (required, default: false),
  userProfileId: String (trainer being reviewed),
  hasAccepted: Boolean (default: false),
  createdAt: Timestamp (auto),
  updatedAt: Timestamp (auto)
}
```

**Key Features:**
- **Embedded Schema**: Reviews are stored as an array in the Profile document (line 147)
- **Privacy Control**: `showName` determines if reviewer name is public or shows "ANONYMOUS"
- **Reference**: `user` field references UserReviewer collection
- **Audit Trail**: `hasAccepted` confirms conditions were accepted

**Profile Stats** (calculated from reviews array):
- `rating`: Average of all review ratings (line 149-151)
- `numReviews`: Total count of reviews (line 154-156)
- Updated automatically via `updateProfileStats()` helper function (profileController.js:301, 388)

---

## Error Handling and Validation

### Client-Side Validation

#### Reviewer Registration (`client/src/views/reviewerRegisterView/ReviewerRegisterView.jsx`)

**Validation Rules:**
1. **Name** (line 93-96):
   - Regex: `/^[A-Z][A-Za-z]{2,}$/`
   - Must start with uppercase letter
   - Minimum 3 letters total
   - No whitespace allowed
   - Error message: "Name field must start with an uppercase letter and contain at least 3 letters and have no white space."

2. **Email** (line 109-112):
   - Regex: `/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/`
   - Standard email format validation
   - Error message: "Invalid email address."

3. **Password** (line 123-126):
   - Regex: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/`
   - Minimum 6 characters
   - At least 1 uppercase letter
   - At least 1 lowercase letter
   - At least 1 number
   - At least 1 special character
   - Error message: "Password must contain at least 1 Capital letter, 1 number and 1 special character."

4. **Confirm Password** (line 143-145):
   - Must match password exactly
   - Error message: "Passwords do not match."

**UI Feedback:**
- Fields show red border (`invalid` class) when validation fails
- Error messages display below invalid fields
- Submit button disabled until all validations pass

#### Reviewer Login (`client/src/views/reviewerLoginView/ReviewerLoginView.jsx`)

**Validation Rules:**
1. **Email** (line 124-128):
   - Same regex as registration
   - Error message: "Invalid email address."

2. **Password** (line 140-144):
   - Regex: `/([^\s])/` (not empty, no whitespace-only)
   - Error message: "Password can not be empty"

**Review Submission Validation** (line 79-100):
1. **Accept Conditions** (line 83-86):
   - Must be strict boolean `true` (not truthy)
   - Alert shown if not accepted: "You must accept the review conditions before submitting."

2. **Comment Length** (line 377-381):
   - Minimum 10 characters required
   - Real-time validation with error display
   - Error message: "Comment must contain at least 10 characters"

3. **Rating**:
   - Required field (1-5 stars, defaults to 5)
   - Dropdown selection enforces valid values

**UI State Management:**
- `showWarning` state controls display of review guidelines vs. review form
- After accepting conditions, `acceptConditions` is set to `true` (line 63)
- Email confirmation warning shown if `reviewer.isConfirmed === false` (line 172-174)

### Server-Side Validation

#### Registration Endpoint (`api/controllers/userReviewsController.js:63-138`)

**Validations:**
1. **Duplicate Email Check** (line 65-70):
   - Error (400): "User already exists"

2. **Required Fields**:
   - `name`, `email`, `password` must be provided
   - MongoDB schema enforces required fields

**Response:**
- Success (201): Returns reviewer object with JWT token
- Verification email sent immediately after registration

#### Login Endpoint (`api/controllers/userReviewsController.js:43-58`)

**Validations:**
1. **Email Exists** (line 45):
   - Check if reviewer with email exists

2. **Password Match** (line 46):
   - Uses `bcrypt.compare()` via `matchPassword()` method
   - Error (401): "Invalid user name or password."

**Response:**
- Success (200): Returns reviewer info + JWT token
- Failure: Generic error to prevent email enumeration

#### Review Submission (`api/controllers/profileController.js:313-405`)

**Validation Sequence:**

1. **ObjectId Format Validation** (line 318-327):
   - Validates `reviewerId` format
   - Validates `userProfileId` format
   - Error (400): "Invalid reviewer ID format" or "Invalid user profile ID format"

2. **Entity Existence Checks** (line 330-348):
   - Reviewer must exist (404: "Reviewer profile not found")
   - Target profile must exist (404: "Profile not found")
   - Target user must exist (404: "User not found")

3. **Business Logic Validation**:
   - **Self-Review Prevention** (line 350-357):
     - Error (400): "You cannot review your own profile"

   - **Duplicate Review Prevention** (line 359-367):
     - Checks if reviewer already reviewed this profile
     - Error (400): "You have already reviewed this profile"

   - **Conditions Acceptance** (line 370-373):
     - Must be strict boolean `true`
     - Error (400): "You must accept the review conditions"

4. **Data Integrity**:
   - Rating converted to Number (line 379)
   - Stats recalculated using atomic `updateProfileStats()` helper (line 388)

**Success Response:**
- Status 201: "Review added successfully"
- Reviewer marked as `hasSubmittedReview = true`
- Email notification sent to profile owner (non-blocking)

#### Email Verification (`api/controllers/confirmEmailController.js:51-78`)

**Validations:**
1. **Token Required** (line 52-56):
   - Error (400): "Verification token is required"

2. **JWT Verification** (line 58-64):
   - Token must be valid and not expired
   - Error (401): "Invalid or expired verification token"

3. **Reviewer Exists** (line 66-71):
   - Error (404): "No Reviewer found"

**Success:**
- Sets `isConfirmed = true`
- Redirects to frontend (uses `CONFIRM_REDIRECT_URL` or `RESET_PASSWORD_LOCAL_URL`)

### Error Response Format

All API errors follow this pattern:
```json
{
  "message": "Error description string"
}
```

**HTTP Status Codes Used:**
- `400 Bad Request`: Validation failures, business logic violations
- `401 Unauthorized`: Authentication failures, invalid tokens
- `404 Not Found`: Entity does not exist
- `201 Created`: Successful review creation
- `200 OK`: Successful operations

### Redux Error Handling

**Files:** `client/src/store/reducers/userReviewReducer.js`

**Error States:**
- `USER_REVIEW_REGISTER_FAIL`: Registration errors
- `USER_REVIEW_LOGIN_FAIL`: Login errors
- `CREATE_REVIEW_FAIL`: Review submission errors
- `USER_REVIEWERS_DETAILS_FAIL`: Reviewer details fetch errors

**Error Display:**
- Errors stored in Redux state and displayed via `<Message>` component
- Component automatically shows/hides based on error state
- Variant prop controls styling (default error red, warning yellow, success green)

---

## Email Flows and Templates

### Email Service Architecture

**Primary Service:** `api/services/emailService.js` (modern, secure implementation)
**Legacy Service:** `api/utils/emailService.js` (review notifications)

**Transporter Configuration:**
- **Host**: `process.env.MAILER_HOST`
- **Port**: 587 (STARTTLS)
- **Security**: TLS 1.2+ enforced (line 18)
- **Auth**: SMTP credentials from environment variables
- **Certificate Validation**: Enabled in production (`rejectUnauthorized: true`)

### 1. Reviewer Verification Email

**Triggered By:** Reviewer registration (`userReviewsController.js:109-126`)
**Template:** Inline HTML in controller (legacy implementation)
**Alternative:** `sendVerificationEmail()` in `emailService.js:39-75` (not currently used for reviewers)

**Email Details:**
- **From**: `"Body Vantage" <info@bodyvantage.co.uk>`
- **To**: Reviewer's email
- **BCC**: `info@bodyvantage.co.uk`
- **Subject**: "Body Vantage Reviewer Registration"

**Content:**
```html
<h1>Hi {reviewer.name}</h1>
<p>You have successfully registered to write a review for a client with Body Vantage</p>
<p>Please Click on the link to verify your email.</p>
<br>
<h4>Please note, in order to get full functionality you must confirm your mail address with the link below.</h4>
<a href={verificationLink}>Click here to verify</a>
<p>Thank you. Body Vantage management</p>
```

**Verification Link Format:**
```
{MAILER_LOCAL_URL}/api/verifyReviewer?token={JWT}
```

**JWT Token:**
- Generated using `generateEmailVerificationToken(userReviewer._id)`
- Contains reviewer ID in payload
- Expires after 24 hours (`generateEmailVerificationToken` uses `expiresIn = '24h'`)

**Security Notes:**
- HTML is inline (no XSS risk from user input in template)
- Link uses query parameter (not path parameter) for better logging
- No user-provided content in email (name is from registration, not malicious)

### 2. Review Notification Email (to Profile Owner)

**Triggered By:** Successful review submission (`profileController.js:398`)
**Function:** `sendReviewNotification()` in `api/utils/emailService.js:53-121`

**Email Details:**
- **From**: `process.env.MAILER_FROM` or `"Body Vantage" <info@bodyvantage.co.uk>`
- **To**: Profile owner's email
- **BCC**: `info@bodyvantage.co.uk`
- **Subject**: "Body Vantage - New Review Notification"

**Content (styled HTML):**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
  <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1>Hi {recipientName}</h1>
    <p>{reviewerName} has submitted the following review about your service:</p>

    <blockquote style="border-left: 4px solid #4CAF50; padding-left: 16px; margin: 20px 0; color: #555; font-style: italic; background-color: #f5f5f5; padding: 15px; border-radius: 4px;">
      "{reviewComment}"
    </blockquote>

    <p>This review has been published and will show on your profile page.</p>

    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="color: #856404; margin: 0; font-weight: bold;">
        If you feel that this review is unrelated or fake, please contact BodyVantage management immediately.
      </p>
    </div>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    <p style="color: #888; font-size: 14px; margin: 0;">
      Thank you,<br>
      <strong>Body Vantage Management</strong>
    </p>
  </div>
</div>
```

**Security Features:**
1. **Input Sanitization** (line 39-42):
   - All user input escaped using `validator.escape()`
   - Prevents XSS in email content
   ```javascript
   const sanitizeForEmail = (text) => {
     if (!text) return '';
     return validator.escape(text.toString());
   };
   ```

2. **Email Validation** (line 64-66):
   - Profile owner email validated before sending
   - Uses `validator.isEmail()`

3. **Non-Blocking Send** (line 396-402 in profileController.js):
   - Email failure does NOT fail review creation
   - Errors logged but request returns success
   - Review is saved before email is attempted

**Error Handling:**
- Logs full error server-side (line 112-116)
- Throws generic error to client (line 119)
- Email service errors don't expose internal details

### 3. Other Email Templates (Not Reviewer-Specific)

**Available in `api/services/emailService.js`:**

1. **User Verification Email** (`sendVerificationEmail`, line 39-75):
   - For main user (trainer) registration
   - Link format: `{MAILER_LOCAL_URL}/api/verify?token={JWT}`

2. **Password Reset Email** (`sendPasswordResetEmail`, line 78-113):
   - For forgotten passwords
   - Link format: `{RESET_PASSWORD_LOCAL_URL}/reset-password/{token}`
   - Includes security warning to delete email after use

3. **Password Changed Confirmation** (`sendPasswordChangedEmail`, line 116-148):
   - Sent after successful password change
   - Security alert if change was unauthorized

4. **Email Change Verification** (`sendEmailChangeVerification`, line 151-185):
   - For changing email address
   - Sent to new email address for confirmation

### Email Service Initialization

**File:** `api/utils/emailService.js:10-31`

**Singleton Pattern:**
- Transporter created once via `initEmailTransporter()`
- Reused across all email operations
- Must be called during application startup

**Environment Variables Required:**
```bash
MAILER_HOST=smtp.example.com
MAILER_PORT=587  # Optional, defaults to 587
MAILER_USER=username@example.com
MAILER_PW=password
MAILER_LOCAL_URL=https://yourdomain.com  # For verification links
MAILER_FROM="Body Vantage" <info@bodyvantage.co.uk>  # Optional
MAILER_BCC=info@bodyvantage.co.uk  # Optional
```

### Email Flow Sequence Diagram

```
Reviewer Registration Flow:
1. User submits registration form
   ↓
2. Server creates UserReviewer record (isConfirmed: false)
   ↓
3. Server generates JWT token with reviewer._id
   ↓
4. Server sends verification email with link
   ↓
5. User clicks link in email → GET /api/verifyReviewer?token={JWT}
   ↓
6. Server verifies JWT and sets isConfirmed: true
   ↓
7. User redirected to frontend

Review Notification Flow:
1. Reviewer submits review (acceptConditions: true, isConfirmed: true)
   ↓
2. Server validates and saves review to profile.reviews[]
   ↓
3. Server updates profile stats (rating, numReviews)
   ↓
4. Server marks reviewer.hasSubmittedReview = true
   ↓
5. Server sends notification email to profile owner (non-blocking)
   ↓
6. Response sent to client (success even if email fails)
```

### Development vs Production

**Development Mode** (`NODE_ENV !== 'production'`):
- Preview URLs logged to console (line 67, 105, 139 in emailService.js)
- Ethereal email test links available
- TLS certificate validation may be relaxed

**Production Mode**:
- TLS validation enforced (`rejectUnauthorized: true`)
- No preview URLs logged
- HTTPS required for all links (`MAILER_LOCAL_URL` must use https://)

---

## Review Display and Moderation

### Public Review Display

#### Trainer Profile Page (`client/src/views/fullProfile/FullProfileView.jsx`)

**Display Location:** Line 253-290

**Features:**
1. **Conditional Rendering**:
   - Shows reviews section if `profile.reviews.length > 0`
   - Shows "no reviews" message if empty array

2. **Review Component** (line 258-264):
   ```jsx
   <Review
     reviewer={review.showName ? review.name : 'ANONYMOUS'}
     review={review.comment}
     reviewedOn={moment(review.createdAt).fromNow()}
   />
   ```

3. **Privacy Control**:
   - `showName` flag determines display name
   - If `true`: Shows reviewer's actual name
   - If `false`: Shows "ANONYMOUS" (line 260)

4. **Aggregate Stats** (line 267-270):
   - Average rating displayed with stars
   - Total review count shown
   - Format: "★★★★★ from 12 reviews"

5. **Call-to-Action** (line 271-274, 284-287):
   - Link to `/reviewer-login` to write a review
   - Personalized text with trainer name

**Content Sanitization:**
- Profile description/bio sanitized using DOMPurify (line 24-40, 166)
- Allowed HTML tags: `b`, `i`, `em`, `strong`, `p`, `br`, `ul`, `ol`, `li`, `a`, `span`
- Allowed attributes: `href`, `target`, `rel`
- Prevents XSS attacks from malicious profile content

#### Reviewer Login Page Display

**File:** `client/src/views/reviewerLoginView/ReviewerLoginView.jsx`
**Location:** Line 233-258

**Purpose:** Shows existing reviews on the profile being reviewed

**Features:**
1. **Read-Only Display**:
   - Shows all reviews with reviewer names (not "ANONYMOUS")
   - Displays comment and relative timestamp
   - No delete/edit functionality for public reviewers

2. **Context for New Reviewers**:
   - Helps reviewers see what others have said
   - Provides context before writing their own review

### Admin Review Moderation

#### Admin Profile View (`client/src/views/adminProfileView/AdminProfileView.jsx`)

**Capabilities:**
1. **View All Reviews**: Admin can see reviews for each trainer profile
2. **Delete Reviews**: Admin can remove inappropriate or fake reviews

**Delete Review Function** (line 58-63):
```javascript
const handleDeleteReview = (profileId, reviewId) => {
  if (window.confirm(`Are you sure you want to update this ${profileId}`)) {
    dispatch(deleteReviewProfileAction(profileId, reviewId));
  }
}
```

**UI Workflow:**
1. Admin navigates to admin profile dashboard
2. Views list of all trainer profiles with reviews
3. Clicks to expand reviews for a specific profile
4. Confirmation dialog appears before deletion
5. Review is permanently removed from database

#### Admin Review Deletion API

**Endpoint:** `DELETE /api/profiles/:id/reviews`
**Controller:** `api/controllers/profileController.js:271-307`
**Access:** Admin only (middleware protected)

**Request:**
- **URL Parameter**: `id` = Profile ID
- **Body**: `{ reviewId: "..." }` (MongoDB ObjectId)

**Validation:**
1. **ObjectId Format** (line 275-278):
   - Validates both profile ID and review ID
   - Error (400): "Invalid ID format"

2. **Profile Exists** (line 281-286):
   - Error (404): "Profile not found"

3. **Review Exists** (line 289-296):
   - Finds review by ID in profile.reviews array
   - Error (404): "Review not found"

**Deletion Process:**
1. Locate review in `profile.reviews` array (line 289-291)
2. Remove review using `splice()` (line 298)
3. Recalculate profile stats with `updateProfileStats()` (line 301):
   - Recalculates average rating
   - Updates `numReviews` count
4. Save profile (atomic operation, line 304)

**Response:**
- Success (200): `{ message: "Review successfully removed" }`

**Business Logic:**
- No notification sent to reviewer when deleted
- No notification sent to profile owner
- Stats automatically updated (rating may change significantly)

#### Stats Recalculation Helper

**Function:** `updateProfileStats()` in `api/controllers/profileController.js`

**Called When:**
1. Review is created (line 388)
2. Review is deleted (line 301)

**Logic:**
```javascript
if (profile.reviews.length === 0) {
  profile.rating = 0;
  profile.numReviews = 0;
} else {
  profile.numReviews = profile.reviews.length;
  profile.rating = profile.reviews.reduce((acc, review) => acc + review.rating, 0) / profile.reviews.length;
}
```

**Benefits:**
- Prevents stale stats
- No race conditions (single atomic save)
- Consistent data integrity

### Review Limitations and Business Rules

**One Review Per Profile:**
- Enforced in `createProfileReview` (line 359-367)
- Check: `profile.reviews.some(r => r.user.toString() === req.params.id)`
- Prevents spam and multiple reviews from same reviewer

**No Self-Reviews:**
- Enforced in `createProfileReview` (line 350-357)
- Checks if `reviewerProfile.userProfileId === userProfileId`
- Maintains review credibility

**Email Confirmation Required:**
- UI blocks review submission if `reviewer.isConfirmed === false` by not allowing acceptance of review guidelines
- Shows warning message: "PLEASE CONFIRM YOUR EMAIL ADDRESS" (line 172-174)
- Prevents anonymous/unverified reviews

**UI Gating Detail:**
- "Accept Review Guidelines" only sets `acceptConditions = true` when `reviewer?.isConfirmed` is true, so unconfirmed users cannot reach a valid submit state.

**Review Permanence:**
- Reviewers cannot edit their own reviews (no edit endpoint exists)
- Reviewers cannot delete their own reviews (no delete permission)
- Only admins can remove reviews (moderation)

### Future Moderation Enhancements

**Potential Features** (not currently implemented):
1. **Review Flagging**: Allow profile owners to flag reviews as inappropriate
2. **Review Responses**: Allow trainers to respond to reviews
3. **Review Editing**: Time-limited edit window for reviewers
4. **Review Approval Queue**: Require admin approval before publishing
5. **Automated Moderation**: Content filtering for profanity/spam
6. **Review Helpfulness**: Upvote/downvote system for helpful reviews
7. **Review Verification**: Badge for verified purchases/sessions

---

## Security Analysis

### Current Security Implementation

#### ✅ Strong Security Features
1. **Password Hashing** (`api/models/userReviewerModel.js:38-45`)
   - Uses bcrypt with salt rounds of 10
   - Passwords are hashed before storage in MongoDB
   - Secure password comparison using `bcrypt.compare()`

2. **HTTPS Enforcement** (`api/server.js:49-63`)
   - Helmet middleware with HSTS enabled (31536000s = 1 year)
   - Forces HTTPS connections with `includeSubDomains` and `preload`
   - Content Security Policy (CSP) headers configured

3. **NoSQL Injection Prevention** (`api/server.js:90-95`)
   - `express-mongo-sanitize` middleware sanitizes user input
   - Prevents MongoDB operator injection attacks
   - Logs sanitization attempts for security monitoring

4. **Rate Limiting** (`api/server.js:98`)
   - API-wide rate limiting middleware
   - Prevents brute force attacks on login/registration endpoints

5. **Email Verification** (`api/controllers/userReviewsController.js:63-138`)
   - JWT-based email verification system
   - Users must verify email before submitting reviews
   - `isConfirmed` flag enforced in UI and API

6. **Business Logic Validation** (`api/controllers/profileController.js:313-405`)
   - Prevents self-reviews (line 350-357)
   - Prevents duplicate reviews (line 359-367)
   - Enforces `acceptConditions === true` (line 370-373)
   - ObjectId validation for all user-provided IDs

7. **CORS Configuration** (`api/server.js:64-83`)
   - Whitelisted origins only
   - Credentials support enabled for cross-origin requests
   - Pre-flight request handling

#### ⚠️ Security Considerations

1. **Token Storage in localStorage** (`client/src/store/actions/userReviewActions.js:143,182`)
   - **Current Implementation**: JWT tokens stored in `localStorage` as `userReviewInfo`
   - **Risk**: Vulnerable to XSS attacks - malicious JavaScript can access localStorage
   - **Recommendation**: Migrate to httpOnly cookies for enhanced XSS protection
   - **Trade-off**: localStorage works across subdomains; cookies require careful configuration

2. **Password Transmission**
   - **Current Implementation**: Passwords sent over POST requests
   - **Status**: ✅ Protected by HSTS enforcement (HTTPS required)
   - **Verification**: Ensure production deployment uses valid TLS certificates
   - **Environment**: Check that `MAILER_LOCAL_URL` uses HTTPS in production

3. **UserProfileId Redundancy**
   - **Current Implementation**: `userProfileId` passed in both registration and login payloads
   - **Design Note**: Could be derived from Redux state (`userReviewId`) or URL context
   - **Impact**: Low security risk; more of an API design consideration
   - **Benefit**: Explicit association reduces state management complexity

### Security Best Practices Currently Implemented

| Security Measure | Status | Location |
|------------------|--------|----------|
| Password Hashing (bcrypt) | ✅ Implemented | `userReviewerModel.js:38-45` |
| HTTPS/TLS Enforcement (HSTS) | ✅ Implemented | `server.js:58-62` |
| Email Verification | ✅ Implemented | `userReviewsController.js:103-126` |
| NoSQL Injection Prevention | ✅ Implemented | `server.js:90-95` |
| CORS Whitelist | ✅ Implemented | `server.js:64-83` |
| Rate Limiting | ✅ Implemented | `server.js:98` |
| Input Validation | ✅ Implemented | `profileController.js:115-328` |
| JWT Token Authentication | ✅ Implemented | `generateToken.js` |
| HttpOnly Cookie Storage | ❌ Not Implemented | *Recommendation* |
| CSRF Protection | ⚠️ Review Needed | *For cookie-based auth* |

### Recommended Security Enhancements

#### Priority 1: Critical (High Impact)
1. **Migrate to HttpOnly Cookies**
   ```javascript
   // Server-side (in authUserReview and registerUserReviewer)
   res.cookie('userReviewToken', token, {
     httpOnly: true,        // Prevents JavaScript access
     secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
     sameSite: 'strict',    // CSRF protection
     maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
   });

   // Client-side: Remove localStorage calls
   // Token automatically sent with requests via cookies
   ```

2. **Add CSRF Protection** (if implementing cookie-based auth)
   - Install `csurf` middleware
   - Generate CSRF tokens for state-changing operations
   - Validate tokens on POST/PUT/DELETE requests

3. **Content Security Policy Enhancements**
   - Review CSP directives to prevent inline script execution
   - Consider using nonces for legitimate inline scripts
   - Add `frame-ancestors` directive to prevent clickjacking

#### Priority 2: Important (Medium Impact)
4. **Session Management**
   - Implement token rotation on sensitive actions
   - Add session invalidation on password change
   - Track active sessions with Redis or database

5. **Audit Logging**
   - Log all authentication attempts (success/failure)
   - Track review submissions with IP and timestamp
   - Monitor for suspicious patterns (multiple failed logins)

6. **Enhanced Validation**
   - Strengthen client-side regex validation
   - Add server-side validation for name/email format
   - Implement password strength requirements (min length, complexity)

#### Priority 3: Nice-to-Have (Low Impact)
7. **Two-Factor Authentication (2FA)**
   - Optional 2FA for reviewer accounts
   - TOTP-based (Google Authenticator, Authy)

8. **Account Lockout Policy**
   - Lock account after N failed login attempts
   - Temporary lockout with exponential backoff
   - Email notification on lockout events

### Security Testing Checklist

- [ ] Verify HTTPS is enforced in production (check Render.com/deployment config)
- [ ] Test password reset flow for vulnerabilities
- [ ] Validate JWT secret strength in production environment
- [ ] Review Cloudinary upload permissions and access controls
- [ ] Test rate limiting thresholds under load
- [ ] Verify email verification links expire appropriately
- [ ] Test CORS configuration with different origins
- [ ] Audit all user input sanitization points
- [ ] Review MongoDB connection string security (no hardcoded credentials)
- [ ] Validate environment variables are not exposed in client bundle

### Compliance Notes

**GDPR Considerations:**
- Reviewer email addresses are PII (Personally Identifiable Information)
- Ensure data retention policies are documented
- Implement data deletion/export on user request
- Add privacy policy link in registration flow

**Data Minimization:**
- Only collect necessary information (name, email, password)
- `showName` flag provides user control over public display
- Review passwords are never logged or stored in review objects

---

## Environment Variables Required

Ensure these are configured securely in production:

```bash
# JWT Configuration
JWT_SECRET=<strong-random-secret>  # Use cryptographically secure random string

# Email Service
MAILER_HOST=<smtp-server>
MAILER_USER=<smtp-username>
MAILER_PW=<smtp-password>
MAILER_LOCAL_URL=<https-frontend-url>  # Must use HTTPS in production

# CORS Configuration
FRONTEND_URL=<https-frontend-url>
RESET_PASSWORD_LOCAL_URL=<https-frontend-url>

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=<cloudinary-account>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_SECRET=<api-secret>

# Database
MONGO_URI=<mongodb-connection-string>  # Use MongoDB Atlas or secure cluster

# Server
NODE_ENV=production  # Critical for security middleware activation
PORT=5000
SERVE_FRONTEND=true  # Optional: serve frontend from Express
```

**Security Notes:**
- Never commit `.env` files to version control
- Use environment variable management tools (Render.com secrets, Heroku config vars)
- Rotate secrets regularly (quarterly recommended)
- Use different secrets for development/staging/production environments
