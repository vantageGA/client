# Quick Reference - Frontend API Changes

## Redux Action Updates

### Get All Profiles (Public)
```javascript
// OLD
dispatch(profilesAction());

// NEW - with pagination
dispatch(profilesAction(page, limit, filters));
// Example:
dispatch(profilesAction(1, 20, { location: 'London' }));
```

### Get All Profiles (Admin)
```javascript
// OLD
dispatch(profilesAdminAction());

// NEW - with pagination
dispatch(profilesAdminAction(page, limit));
// Example:
dispatch(profilesAdminAction(1, 50));
```

### Update Profile
```javascript
// OLD - passed user ID
dispatch(profileUpdateAction(userId, profileData));

// NEW - no user ID needed
dispatch(profileUpdateAction(profileData));
```

### Delete Review
```javascript
// OLD route
dispatch(deleteReviewProfileAction(profileId, reviewId));

// NEW - same call, different route internally
dispatch(deleteReviewProfileAction(profileId, reviewId));
```

### Profile Click Counter
```javascript
// OLD - passed counter value
dispatch(profileClickCounterAction(profileId, 1));

// NEW - server auto-increments
dispatch(profileClickCounterAction(profileId));
```

### Get Profile Images (Authenticated)
```javascript
// OLD
dispatch(profileImagesAction());

// NEW - with pagination
dispatch(profileImagesAction(page, limit));
// Example:
dispatch(profileImagesAction(1, 20));
```

### Get Profile Images (Public)
```javascript
// OLD
dispatch(profileImagesPublicAction(userId));

// NEW - with pagination
dispatch(profileImagesPublicAction(userId, page, limit));
// Example:
dispatch(profileImagesPublicAction(userId, 1, 20));
```

## Redux State Structure Updates

### Profiles State
```javascript
// OLD
{
  loading: false,
  profiles: [...]
}

// NEW
{
  loading: false,
  profiles: [...],
  page: 1,
  pages: 5,
  total: 100
}
```

### Profile Images State
```javascript
// OLD
{
  loading: false,
  profileImages: [...]
}

// NEW
{
  loading: false,
  profileImages: [...],
  page: 1,
  pages: 3,
  total: 45
}
```

## Component Usage Examples

### Using Pagination in Components
```javascript
const MyComponent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { profiles, page, pages, total } = useSelector(state => state.profiles);

  useEffect(() => {
    dispatch(profilesAction(currentPage, 20));
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Your content */}
      {pages > 1 && (
        <div>
          <button onClick={() => handlePageChange(currentPage - 1)}>
            Previous
          </button>
          <span>Page {page} of {pages}</span>
          <button onClick={() => handlePageChange(currentPage + 1)}>
            Next
          </button>
        </div>
      )}
    </>
  );
};
```

### Review Submission with Boolean Validation
```javascript
const ReviewForm = () => {
  const [acceptConditions, setAcceptConditions] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // IMPORTANT: Validate as strict boolean
    if (acceptConditions !== true) {
      alert('You must accept the conditions');
      return;
    }

    // Always send boolean true
    dispatch(createReviewAction({
      rating,
      comment,
      showName,
      userProfileId,
      acceptConditions: true // Boolean, not string!
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="checkbox"
        checked={acceptConditions}
        onChange={(e) => setAcceptConditions(e.target.checked)} // Boolean
      />
      {/* Rest of form */}
    </form>
  );
};
```

### Null-Safe Array Operations
```javascript
// ALWAYS check for null/undefined before filtering
const MyComponent = () => {
  const { profiles } = useSelector(state => state.profiles);

  // BAD - will crash if profiles is null/undefined
  const filtered = profiles.filter(p => p.name.includes('test'));

  // GOOD - safe with fallback
  const filtered = (profiles || []).filter(p => p.name.includes('test'));

  return <div>{/* render */}</div>;
};
```

## API Routes Reference

| Action | Old Route | New Route |
|--------|-----------|-----------|
| Update Profile | `PUT /api/profile/:id` | `PUT /api/profile` |
| Delete Review | `DELETE /api/profile/review/admin/:id` | `DELETE /api/profiles/:id/reviews` |
| Get Public Images | `GET /api/profile-images/:id` | `GET /api/profile-images-public/:id` |
| Get Profiles | `GET /api/profiles` | `GET /api/profiles?page=1&limit=20` |
| Get Admin Profiles | `GET /api/profiles/admin` | `GET /api/profiles/admin?page=1&limit=50` |

## Common Pitfalls to Avoid

### 1. Don't Send Protected Fields
```javascript
// BAD - sending protected fields
dispatch(profileUpdateAction({
  name: 'John',
  rating: 5,           // Protected! Don't send
  numReviews: 100,     // Protected! Don't send
  isQualificationsVerified: true // Protected! Don't send
}));

// GOOD - only send editable fields
dispatch(profileUpdateAction({
  name: 'John',
  description: 'Bio...',
  location: 'London',
  // ... other editable fields
}));
```

### 2. Don't Pass User ID to Update
```javascript
// BAD - old way
const userId = userInfo._id;
dispatch(profileUpdateAction(userId, profileData));

// GOOD - new way
dispatch(profileUpdateAction(profileData));
```

### 3. Don't Send String for acceptConditions
```javascript
// BAD
acceptConditions: 'true' // String

// GOOD
acceptConditions: true // Boolean
```

### 4. Don't Forget Null Checks
```javascript
// BAD
profiles.map(p => <Card {...p} />)

// GOOD
(profiles || []).map(p => <Card {...p} />)
```

### 5. Don't Try to Manipulate Click Counter
```javascript
// BAD - trying to set counter value
dispatch(profileClickCounterAction(profileId, 100));

// GOOD - let server increment by 1
dispatch(profileClickCounterAction(profileId));
```

## Quick Testing Checklist

- [ ] Profiles load with pagination
- [ ] Can navigate between pages
- [ ] Profile updates work without passing ID
- [ ] Review submission validates boolean acceptConditions
- [ ] Click counter increments on profile view
- [ ] Admin pagination works
- [ ] Images load correctly
- [ ] Error states display properly
- [ ] Loading spinners show during requests
- [ ] Pagination controls disable appropriately

## Need Help?

Refer to:
- `FRONTEND_MIGRATION_COMPLETE.md` - Full migration documentation
- `FRONTEND_BREAKING_CHANGES.md` - Original breaking changes guide
- Backend API documentation for endpoint details
