# Bug Fix: "Not authorised as an ADMIN" Error on Login

## Problem Description

When users tried to login, they received the error:
```
"Not authorised as an ADMIN"
```

## Root Cause

The issue was in `/client/src/store/actions/userActions.js` line 159.

The `getUserDetailsAction` function was calling the wrong API endpoint:

```javascript
// WRONG - This endpoint requires admin privileges
const { data } = await axios.get(`/api/users/${id}`, config);
```

### Why This Caused the Error

1. User logs in successfully → receives auth token
2. Frontend redirects to `/user-profile-edit`
3. `UserProfileEditView` component mounts
4. Component calls `getUserDetailsAction(userInfo._id)` in useEffect
5. This action calls `GET /api/users/:id`
6. Backend routes show this endpoint requires admin middleware:
   ```javascript
   router.route('/users/:id')
     .get(protect, admin, getUserProfileById) // ← Requires admin!
   ```
7. Regular user doesn't have admin privileges → Error!

## Solution

Changed the endpoint to use the self-profile endpoint which is available to authenticated users:

```javascript
// CORRECT - Self-profile endpoint for authenticated users
const { data } = await axios.get(`/api/users/profile`, config);
```

### Backend Routes Reference

```javascript
// Self profile - Available to any authenticated user
router.route('/users/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// User by ID - Admin only
router.route('/users/:id')
  .get(protect, admin, getUserProfileById)
  .delete(protect, admin, deleteUser);
```

## Files Changed

**File:** `/client/src/store/actions/userActions.js`
**Line:** 159-160
**Change:**
```diff
- const { data } = await axios.get(`/api/users/${id}`, config);
+ // Use the self-profile endpoint instead of the admin-protected user by ID endpoint
+ const { data } = await axios.get(`/api/users/profile`, config);
```

## Testing

After this fix:
1. ✅ Regular users can login successfully
2. ✅ Users are redirected to their profile edit page
3. ✅ User details load correctly
4. ✅ No admin errors for regular users
5. ✅ Admin endpoints still protected

## Prevention

To prevent similar issues in the future:

1. **Always check route protection** before calling an API endpoint
2. **Use self-profile endpoints** when users access their own data
3. **Use ID-based endpoints only for admin operations** viewing other users
4. **Review route definitions** when implementing new features

## API Endpoint Guide

### For Users Accessing Their Own Data
```javascript
GET    /api/users/profile        // Get own profile
PUT    /api/users/profile        // Update own profile
POST   /api/users/login          // Login
POST   /api/users                // Register
```

### For Admin Operations
```javascript
GET    /api/users                // List all users (admin)
GET    /api/users/:id            // Get any user by ID (admin)
DELETE /api/users/:id            // Delete any user (admin)
PUT    /user/profile/:id         // Update admin status (admin)
```

### For Public Access
```javascript
GET    /user/profile/:id         // View public profile
GET    /api/verify               // Email verification
POST   /api/user-forgot-password // Password reset request
PUT    /api/user-update-password // Complete password reset
```

## Related Documentation

- Security implementation: `SECURITY_IMPROVEMENTS.md`
- Frontend changes: `FRONTEND_SECURITY_IMPLEMENTATION.md`
- Environment config: `ENV_CONFIGURATION.md`

---

**Fixed:** 2025-12-31
**Status:** ✅ Resolved
