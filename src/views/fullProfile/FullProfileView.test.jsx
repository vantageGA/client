/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import FullProfileView from './FullProfileView';

const mockedActions = vi.hoisted(() => ({
  profileByIdAction: vi.fn(() => ({ type: 'PROFILE_BY_ID_ACTION' })),
  profileImagesPublicAction: vi.fn(() => ({
    type: 'PROFILE_IMAGES_PUBLIC_ACTION',
  })),
  userReviewIdAction: vi.fn(() => ({ type: 'USER_REVIEW_ID_ACTION' })),
}));

vi.mock('../../store/actions/profileActions', () => ({
  profileByIdAction: mockedActions.profileByIdAction,
  profileImagesPublicAction: mockedActions.profileImagesPublicAction,
}));

vi.mock('../../store/actions/userReviewActions', () => ({
  userReviewIdAction: mockedActions.userReviewIdAction,
}));

vi.mock('../../components/loadingSpinner/LoadingSpinner', () => ({
  default: () => <div>Loading...</div>,
}));

vi.mock('../../components/message/Message', () => ({
  default: ({ message }) => <div>{message}</div>,
}));

vi.mock('../../components/rating/Rating', () => ({
  default: ({ text }) => <div>{text}</div>,
}));

vi.mock('../../components/review/Review', () => ({
  default: ({ reviewer, review, reviewedOn }) => (
    <div>
      <span>{reviewer}</span>
      <span>{review}</span>
      <span>{reviewedOn}</span>
    </div>
  ),
}));

vi.mock('../../components/socialMedia/faceBook/FaceBookComponent', () => ({
  default: () => <div>Facebook</div>,
}));

vi.mock('../../components/socialMedia/Instagram/InstagramComponent', () => ({
  default: () => <div>Instagram</div>,
}));

const createStore = (state) => ({
  getState: () => state,
  subscribe: () => () => {},
  dispatch: vi.fn(),
});

const buildProfile = (overrides = {}) => ({
  _id: 'profile-1',
  user: 'user-1',
  name: 'Test Trainer',
  email: 'trainer@example.com',
  faceBook: '',
  instagram: '',
  websiteUrl: '',
  profileImage: '',
  description: '<p>Experienced trainer.</p>',
  specialisation: '<p>Strength coaching.</p>',
  qualifications: '<p>Level 3 PT.</p>',
  location: 'London',
  telephoneNumber: '07123 456789',
  specialisationOne: 'Strength',
  specialisationTwo: 'Mobility',
  specialisationThree: '',
  specialisationFour: '',
  profileClickCounter: 12,
  rating: 4.5,
  numReviews: 3,
  qualificationVerificationStatus: 'approved',
  reviews: undefined,
  ...overrides,
});

const renderView = (stateOverrides = {}) => {
  const baseState = {
    profileById: {
      loading: false,
      error: null,
      profile: buildProfile(),
    },
    profileImagesPublic: {
      loading: true,
      error: null,
      profileImages: [],
      page: 1,
      pages: 1,
      total: 0,
    },
    userReviewId: {
      userProfileId: null,
    },
  };

  const state = {
    ...baseState,
    ...stateOverrides,
    profileById: {
      ...baseState.profileById,
      ...(stateOverrides.profileById || {}),
    },
    profileImagesPublic: {
      ...baseState.profileImagesPublic,
      ...(stateOverrides.profileImagesPublic || {}),
    },
    userReviewId: {
      ...baseState.userReviewId,
      ...(stateOverrides.userReviewId || {}),
    },
  };

  const store = createStore(state);

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/fullProfile/profile-1']}>
        <Routes>
          <Route path="/fullProfile/:id" element={<FullProfileView />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('FullProfileView', () => {
  it('renders safely when reviews are missing and shows image loading state', async () => {
    renderView({
      profileById: {
        profile: buildProfile({ reviews: undefined }),
      },
      profileImagesPublic: {
        loading: true,
        error: null,
        profileImages: [],
      },
    });

    await waitFor(() => {
      expect(mockedActions.profileByIdAction).toHaveBeenCalledWith('profile-1');
      expect(mockedActions.profileImagesPublicAction).toHaveBeenCalledWith('user-1');
      expect(mockedActions.userReviewIdAction).toHaveBeenCalledWith('user-1');
    });

    expect(
      screen.getByText(/There is currently no reviews for Test Trainer\./i),
    ).toBeTruthy();
    expect(screen.getByText('CERTIFIED')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'CERTIFIED' })).toBeTruthy();
    expect(screen.getByText('Loading...')).toBeTruthy();
    expect(screen.getByAltText('Verified by Body Vantage')).toBeTruthy();
    expect(screen.queryByText('No images available')).toBeNull();
  });
});
