# Frontend Breaking Changes - Profile API Security Updates

## Overview
The backend profile API has been updated with critical security fixes. These changes require corresponding updates to the frontend Redux actions, API calls, and component logic.

---

## 🔴 CRITICAL BREAKING CHANGES

### 1. **Pagination Implemented - Response Format Changed**

#### Affected Endpoints:
- `GET /api/profiles`
- `GET /api/profiles/admin`
- `GET /api/profile-images`
- `GET /api/profile-images-public/:id`

#### Old Response Format:
```javascript
// Just an array of profiles/images
[{ profile1 }, { profile2 }, ...]
```

#### New Response Format:
```javascript
{
  profiles: [{ profile1 }, { profile2 }, ...], // or "images" for image endpoints
  page: 1,
  pages: 5,
  total: 100
}
```

#### Frontend Changes Required:

**File**: `client/src/store/actions/profileActions.js`

```javascript
// OLD CODE:
export const profilesAction = () => async (dispatch) => {
  const { data } = await axios.get('/api/profiles');
  dispatch({ type: PROFILES_LIST_SUCCESS, payload: data });
};

// NEW CODE:
export const profilesAction = (page = 1, limit = 20, filters = {}) => async (dispatch) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...(filters.location && { location: filters.location }),
    ...(filters.specialisation && { specialisation: filters.specialisation })
  });

  const { data } = await axios.get(`/api/profiles?${params}`);

  dispatch({
    type: PROFILES_LIST_SUCCESS,
    payload: {
      profiles: data.profiles,
      page: data.page,
      pages: data.pages,
      total: data.total
    }
  });
};
```

**Update Reducers**:
```javascript
// client/src/store/reducers/profileReducers.js

case PROFILES_LIST_SUCCESS:
  return {
    loading: false,
    profiles: action.payload.profiles, // Changed from action.payload
    page: action.payload.page,
    pages: action.payload.pages,
    total: action.payload.total
  };
```

**Update Components**:
```javascript
// Add pagination controls to components
import Pagination from '@mui/material/Pagination'; // or your pagination component

const ProfileListView = () => {
  const [page, setPage] = useState(1);
  const { profiles, pages, loading } = useSelector(state => state.profileList);

  useEffect(() => {
    dispatch(profilesAction(page));
  }, [page]);

  return (
    <>
      {/* Profile list */}
      <Pagination
        count={pages}
        page={page}
        onChange={(e, value) => setPage(value)}
      />
    </>
  );
};
```

---

### 2. **Update Profile Route Changed**

#### Old Route:
```
PUT /api/profile/:id
```

#### New Route:
```
PUT /api/profile
```

**The user ID is now taken from the authenticated token, not from URL params.**

#### Frontend Changes Required:

**File**: `client/src/store/actions/profileActions.js`

```javascript
// OLD CODE:
export const updateProfileAction = (id, profile) => async (dispatch, getState) => {
  const { data } = await axios.put(`/api/profile/${id}`, profile, config);
};

// NEW CODE (remove id parameter):
export const updateProfileAction = (profile) => async (dispatch, getState) => {
  // No ID needed - server uses authenticated user's ID
  const { data } = await axios.put('/api/profile', profile, config);
};
```

**Update Component Calls**:
```javascript
// OLD:
dispatch(updateProfileAction(userId, profileData));

// NEW:
dispatch(updateProfileAction(profileData));
```

---

### 3. **Delete Review Route Changed**

#### Old Route:
```
DELETE /api/profile/review/admin/:id
```
With `reviewId` in URL params

#### New Route:
```
DELETE /api/profiles/:id/reviews
```
With `reviewId` in request body

#### Frontend Changes Required:

**File**: `client/src/store/actions/profileActions.js`

```javascript
// OLD CODE:
export const deleteProfileReviewAction = (profileId, reviewId) => async (dispatch, getState) => {
  await axios.delete(`/api/profile/review/admin/${profileId}`, {
    data: { reviewId }
  }, config);
};

// NEW CODE:
export const deleteProfileReviewAction = (profileId, reviewId) => async (dispatch, getState) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userInfo.token}`
    },
    data: { reviewId } // reviewId now in body
  };

  await axios.delete(`/api/profiles/${profileId}/reviews`, config);
};
```

---

### 4. **Profile Clicks Update Response Changed**

#### Old Response:
```javascript
// Full profile object returned
{
  _id: '...',
  name: '...',
  profileClickCounter: 42,
  // ... all other fields
}
```

#### New Response:
```javascript
{
  success: true,
  clickCount: 42
}
```

**Also, the `profileClickCounter` value is no longer sent from frontend - server auto-increments by 1**

#### Frontend Changes Required:

**File**: `client/src/store/actions/profileActions.js`

```javascript
// OLD CODE:
export const profileClickCounterAction = (id, counter) => async (dispatch) => {
  const { data } = await axios.put('/api/profile-clicks', {
    _id: id,
    profileClickCounter: counter // This is no longer needed
  });
};

// NEW CODE:
export const profileClickCounterAction = (id) => async (dispatch) => {
  // Only send ID, server increments by 1
  const { data } = await axios.put('/api/profile-clicks', { _id: id });

  // Response is now minimal
  dispatch({
    type: PROFILE_CLICK_UPDATE_SUCCESS,
    payload: data.clickCount // Changed from full profile
  });
};
```

**Update Component**:
```javascript
// OLD:
dispatch(profileClickCounterAction(profileId, 1));

// NEW:
dispatch(profileClickCounterAction(profileId));
```

---

### 5. **Review Submission - Stricter Validation**

#### Changes:
- `acceptConditions` must be **exactly `true`** (boolean), not truthy value
- Validation errors are now more detailed
- Self-review prevention implemented server-side

#### Frontend Changes Required:

**File**: Review form component

```javascript
// OLD:
<input
  type="checkbox"
  onChange={(e) => setAcceptConditions(e.target.checked ? 'true' : 'false')}
/>

// NEW (ensure boolean):
<input
  type="checkbox"
  onChange={(e) => setAcceptConditions(e.target.checked)} // Boolean, not string
/>

// Form submission:
const submitReview = async () => {
  // Ensure acceptConditions is boolean true
  if (acceptConditions !== true) {
    alert('You must accept the conditions');
    return;
  }

  await dispatch(createReviewAction({
    rating,
    comment,
    showName,
    userProfileId,
    acceptConditions: true // Always boolean true
  }));
};
```

---

### 6. **Error Response Format Changed**

#### Old Format:
```javascript
{
  message: "Error message",
  stack: "..." // in development
}
```

#### New Format:
```javascript
{
  success: false,
  message: "Error message",
  stack: "...", // in development only
  details: {...} // in development only
}
```

#### Frontend Changes Required:

**File**: Redux reducers and error handling

```javascript
// Update error handling in reducers
case PROFILE_UPDATE_FAIL:
  return {
    loading: false,
    error: action.payload.message || action.payload // Handle both formats
  };

// Update axios error interceptor
axios.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.message || error.message;
    return Promise.reject(message);
  }
);
```

---

### 7. **Profile Images Endpoints - Route Changes**

#### Route Changes:
```
OLD: GET /api/profile-images/:id (public images by user ID)
NEW: GET /api/profile-images-public/:id
```

#### Frontend Changes Required:

**File**: `client/src/store/actions/profileActions.js`

```javascript
// OLD CODE:
export const getAllProfileImagesPublicAction = (id) => async (dispatch) => {
  const { data } = await axios.get(`/api/profile-images/${id}`);
};

// NEW CODE:
export const getAllProfileImagesPublicAction = (id, page = 1) => async (dispatch) => {
  const { data } = await axios.get(`/api/profile-images-public/${id}?page=${page}`);

  dispatch({
    type: PROFILE_IMAGES_PUBLIC_SUCCESS,
    payload: {
      images: data.images, // Changed from array to object
      page: data.page,
      pages: data.pages,
      total: data.total
    }
  });
};
```

---

## 📋 CHECKLIST: Frontend Files to Update

### Redux Actions (`client/src/store/actions/profileActions.js`)
- [ ] `profilesAction` - Add pagination params, handle new response
- [ ] `profilesAdminAction` - Add pagination params, handle new response
- [ ] `updateProfileAction` - Remove ID parameter from function signature and API call
- [ ] `deleteProfileReviewAction` - Change route, move reviewId to body
- [ ] `profileClickCounterAction` - Remove counter param, handle new response
- [ ] `getAllProfileImagesAction` - Add pagination, handle new response
- [ ] `getAllProfileImagesPublicAction` - Change route, add pagination

### Redux Reducers (`client/src/store/reducers/profileReducers.js`)
- [ ] Update all success cases to handle paginated responses
- [ ] Update error handling to use new error format
- [ ] Add page/pages/total state fields

### Redux Constants (`client/src/store/constants/profileConstants.js`)
- [ ] May need to add pagination-related constants

### Components
- [ ] **ProfileListView** - Add pagination controls
- [ ] **AdminProfileView** - Add pagination controls
- [ ] **ProfileEditView** - Update to not pass user ID to update action
- [ ] **UserProfileEditView** - Update to not pass user ID to update action
- [ ] **FullProfileView** - Update click tracking (no counter value)
- [ ] **ReviewForm** - Ensure `acceptConditions` is boolean
- [ ] **ProfileImagesGallery** - Add pagination controls

---

## 🔍 Testing Checklist

After making frontend changes, test:

### Pagination
- [ ] Profile list loads with default pagination
- [ ] Page navigation works
- [ ] Filter by location works with pagination
- [ ] Filter by specialisation works with pagination
- [ ] Admin profile list pagination works
- [ ] Profile images pagination works

### Profile Updates
- [ ] Users can update their own profile
- [ ] Users cannot update other profiles (should get 403)
- [ ] Protected fields (rating, numReviews) are not modified even if sent

### Reviews
- [ ] Create review works with boolean `acceptConditions`
- [ ] Cannot review same profile twice
- [ ] Cannot review own profile
- [ ] Delete review works (admin only)
- [ ] Rate limiting kicks in after 5 reviews per day

### Profile Clicks
- [ ] Click counter increments by 1 on profile view
- [ ] Cannot manipulate counter value from frontend

### Error Handling
- [ ] Validation errors display properly
- [ ] Network errors are caught
- [ ] 400/404/500 errors show appropriate messages

---

## 🛠️ Migration Script

Run this search-and-replace across your frontend codebase:

```bash
# From project root
cd client/src

# Find all usages of old API endpoints
grep -r "/api/profile/:id" .
grep -r "/api/profile-images/\${" .
grep -r "profile/review/admin" .

# Check for pagination assumptions
grep -r "payload.profiles" .
grep -r "payload.images" .
```

---

## 🚨 Security Notes for Frontend

1. **Never send protected fields** in update requests:
   - `rating`, `numReviews`, `isQualificationsVerified`, `reviews`, `profileClickCounter`
   - Backend will ignore them, but don't send them

2. **Always use boolean for `acceptConditions`**:
   - Use `true` (boolean), not `"true"` (string)

3. **Don't manipulate click counters**:
   - Server auto-increments by 1
   - Don't try to send custom values

4. **Handle validation errors gracefully**:
   - Backend now returns detailed validation errors
   - Display them to users appropriately

---

## ⚡ Performance Improvements

The backend changes also include performance improvements:

1. **Pagination** reduces data transfer
2. **Field projection** - public endpoints only return necessary fields
3. **Lean queries** - faster MongoDB queries
4. **Parallel queries** - page data and total count fetched simultaneously

Frontend should leverage these by:
- Implementing virtual scrolling for long lists
- Only fetching data when needed
- Caching paginated results

---

## 📞 Need Help?

If you encounter issues with these changes:

1. Check browser console for detailed error messages
2. Check network tab to see actual request/response
3. Verify Redux DevTools to see state changes
4. Backend validation errors are now very detailed - read them carefully

---

## Summary of Route Changes

| Old Route | New Route | Change Type |
|-----------|-----------|-------------|
| `PUT /api/profile/:id` | `PUT /api/profile` | BREAKING - Remove :id |
| `DELETE /api/profile/review/admin/:id` | `DELETE /api/profiles/:id/reviews` | BREAKING - Different path |
| `GET /api/profile-images/:id` | `GET /api/profile-images-public/:id` | BREAKING - Renamed |
| `GET /api/profiles` | `GET /api/profiles` | NON-BREAKING - Now supports pagination |
| `GET /api/profiles/admin` | `GET /api/profiles/admin` | NON-BREAKING - Now supports pagination |
| `GET /api/profile-images` | `GET /api/profile-images` | NON-BREAKING - Now supports pagination |
| `PUT /api/profile-clicks` | `PUT /api/profile-clicks` | BREAKING - Response format changed |

---

**Last Updated**: 2026-01-01
**Backend Version**: v2.0.0 (Security Hardened)
**Frontend Migration Status**: ⏳ Pending
