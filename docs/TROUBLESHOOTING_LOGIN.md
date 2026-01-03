# Troubleshooting Login "Not authorised as an ADMIN" Error

## Quick Fix - Try This First

### Clear Browser Storage
```javascript
// Open Browser Console (F12)and run:
localStorage.clear();
sessionStorage.clear();
// Then refresh the page and try logging in again
```

## Diagnostic Steps

### Step 1: Check What Endpoint is Being Called

1. Open Browser Developer Tools (F12)
2. Go to the **Network** tab
3. Try to login
4. Look for the failed request (it will be red)
5. Click on it and check:
   - **Request URL** - Should be: `http://localhost:5000/api/users/login`
   - **Request Method** - Should be: `POST`
   - **Status Code** - What is it?

### Step 2: Check the Error Response

In the Network tab, click on the failed request and go to the **Response** tab.
What does it say?

Expected:
```json
{
  "message": "Not authorised as an ADMIN"
}
```

### Step 3: Check Request Headers

In the Network tab, go to **Headers** tab and check:
- Is there an `Authorization` header?
- If yes, what does it contain?

## Common Causes & Solutions

### Cause 1: Frontend Calling Wrong Endpoint

**Symptom:** Request URL is NOT `/api/users/login`

**Solution:** The frontend might be calling:
- `/api/users` (GET) - This is an admin-only endpoint
- `/api/users/profile` - This requires authentication
- `/api/users/:id` - This is admin-only

Check the frontend login component and ensure it's calling:
```javascript
POST /api/users/login
```

### Cause 2: Old Token in LocalStorage

**Symptom:** There's an Authorization header in the login request

**Solution:**
```javascript
// Clear localStorage
localStorage.clear();
```

The login endpoint should NOT send an Authorization header.

### Cause 3: Auto-redirect After Login Calling Admin Endpoint

**Symptom:** Login succeeds but immediately gets admin error

**Solution:** Check if the frontend redirects to an admin page after login.
Look for code that runs after `USER_LOGIN_SUCCESS` is dispatched.

### Cause 4: User Account Doesn't Have isConfirmed

**Symptom:** Login works but error occurs immediately

**Solution:** This is the new security feature - users must verify their email first.
Check if the error message is actually:
```
"Please verify your email before logging in"
```

If so, check the user's email for the verification link.

## Debug Mode - Add Console Logs

### Backend (api/controllers/userController.js)

Add this to the `authUser` function:

```javascript
const authUser = asyncHandler(async (req, res) => {
  console.log('=== LOGIN ATTEMPT ===');
  console.log('Email:', req.body.email);
  console.log('Has Authorization header:', !!req.headers.authorization);

  // ... rest of the function
});
```

### Frontend (client/src/store/actions/userActions.js)

Add this to the `loginAction`:

```javascript
export const loginAction = (email, password) => async (dispatch) => {
  try {
    console.log('=== CALLING LOGIN API ===');
    console.log('Email:', email);

    dispatch({
      type: USER_LOGIN_REQUEST,
    });

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    console.log('Request config:', config);
    console.log('URL:', '/api/users/login');

    const { data } = await axios.post(
      '/api/users/login',
      { email: email, password: password },
      config,
    );

    console.log('Login successful:', data);
    // ... rest
  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Full error:', error);
    console.error('Response:', error.response);
    // ... rest
  }
};
```

## Check User in Database

If you have access to MongoDB, check the user:

```javascript
// In MongoDB Shell or Compass
db.users.findOne({ email: "user@example.com" })
```

Check:
- Is `isAdmin` false or missing?
- Is `isConfirmed` false or missing?

## Verify Route Configuration

Check `/api/routes/userRoutes.js` line 27:

```javascript
// Should be:
router.post('/users/login', loginLimiter, authUser);

// Should NOT have 'protect' or 'admin' middleware
```

## Check for Route Conflicts

Multiple route files mount to `/api`. Check server.js:

```javascript
app.use('/api', confirmEmailRoutes);  // First
app.use('/api', contactFormRoutes);   // Second
app.use('/api', userRoutes);          // Third - login is here
```

If `confirmEmailRoutes` or another route file has a conflicting `/users/login` route, it would be hit first.

## Still Not Working?

Provide this information:

1. **Network Tab Screenshot** - Show the failed request
2. **Console Errors** - Any errors in browser console?
3. **Request Details:**
   - URL
   - Method
   - Headers
   - Request Body
   - Response
4. **User Data** - Is user in database? Is isAdmin set?
5. **Server Logs** - What does the server console show?

## Quick Test - Create Admin User

If you need to test admin functionality:

```javascript
// In MongoDB Shell
db.users.updateOne(
  { email: "yournewemail@example.com" },
  { $set: { isAdmin: true, isConfirmed: true } }
)
```

Then try logging in with that user.
