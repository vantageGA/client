import { describe, it, expect } from 'vitest';
import {
  profileByIdReducer,
  profileImagesPublicReducer,
  profileOnboardingTutorialUpdateReducer,
  profileOfLoggedInUserReducer,
  profilesAdminReducer,
  profilesReducer,
  profileUpdateReducer,
} from './profileReducers';
import {
  PROFILE_IMAGES__PUBLIC_FAILURE,
  PROFILE_IMAGES__PUBLIC_SUCCESS,
  PROFILE_IMAGES_PUBLIC_REQUEST,
  PROFILE_ONBOARDING_TUTORIAL_UPDATE_FAILURE,
  PROFILE_ONBOARDING_TUTORIAL_UPDATE_REQUEST,
  PROFILE_ONBOARDING_TUTORIAL_UPDATE_SUCCESS,
  PROFILE_UPDATE_FAILURE,
  PROFILE_UPDATE_SUCCESS,
} from '../constants/profileConstants';

const updatedProfile = {
  _id: 'profile-1',
  name: 'Updated Name',
  location: 'Updated Location',
};

describe('profileOnboardingTutorialUpdateReducer', () => {
  it('handles request state', () => {
    const state = profileOnboardingTutorialUpdateReducer(undefined, {
      type: PROFILE_ONBOARDING_TUTORIAL_UPDATE_REQUEST,
    });

    expect(state.loading).toBe(true);
  });

  it('stores onboarding tutorial payload on success', () => {
    const payload = { isCompleted: true, watchProgressPercent: 96 };
    const state = profileOnboardingTutorialUpdateReducer(undefined, {
      type: PROFILE_ONBOARDING_TUTORIAL_UPDATE_SUCCESS,
      payload,
    });

    expect(state.loading).toBe(false);
    expect(state.success).toBe(true);
    expect(state.onboardingTutorial).toEqual(payload);
  });

  it('stores error on failure', () => {
    const state = profileOnboardingTutorialUpdateReducer(undefined, {
      type: PROFILE_ONBOARDING_TUTORIAL_UPDATE_FAILURE,
      payload: 'Request failed',
    });

    expect(state.loading).toBe(false);
    expect(state.error).toBe('Request failed');
  });
});

describe('profileUpdateReducer', () => {
  it('captures server gate code for onboarding requirement', () => {
    const state = profileUpdateReducer(undefined, {
      type: PROFILE_UPDATE_FAILURE,
      payload: 'Onboarding tutorial interaction is required before profile submission.',
      code: 'ONBOARDING_TUTORIAL_REQUIRED',
      status: 403,
    });

    expect(state.error).toBe(
      'Onboarding tutorial interaction is required before profile submission.',
    );
    expect(state.errorCode).toBe('ONBOARDING_TUTORIAL_REQUIRED');
    expect(state.errorStatus).toBe(403);
  });
});

describe('profile cache reducers', () => {
  it('updates the public profile-by-id cache after a successful profile save', () => {
    const state = profileByIdReducer(
      {
        profile: {
          _id: 'profile-1',
          name: 'Old Name',
          location: 'Old Location',
        },
      },
      {
        type: PROFILE_UPDATE_SUCCESS,
        payload: updatedProfile,
      },
    );

    expect(state.profile).toEqual(updatedProfile);
    expect(state.loading).toBe(false);
  });

  it('updates the logged-in profile cache after a successful profile save', () => {
    const state = profileOfLoggedInUserReducer(
      {
        profile: {
          _id: 'profile-1',
          name: 'Old Name',
        },
      },
      {
        type: PROFILE_UPDATE_SUCCESS,
        payload: updatedProfile,
      },
    );

    expect(state.profile).toEqual(updatedProfile);
    expect(state.loading).toBe(false);
  });

  it('replaces matching profiles in public and admin lists after a profile save', () => {
    const publicState = profilesReducer(
      {
        profiles: [
          { _id: 'profile-1', name: 'Old Name', rating: 4 },
          { _id: 'profile-2', name: 'Other Name' },
        ],
        page: 1,
        pages: 1,
        total: 2,
      },
      {
        type: PROFILE_UPDATE_SUCCESS,
        payload: updatedProfile,
      },
    );
    const adminState = profilesAdminReducer(
      {
        profilesAdmin: [
          { _id: 'profile-1', name: 'Old Name', rating: 4 },
          { _id: 'profile-2', name: 'Other Name' },
        ],
        page: 1,
        pages: 1,
        total: 2,
      },
      {
        type: PROFILE_UPDATE_SUCCESS,
        payload: updatedProfile,
      },
    );

    expect(publicState.profiles[0]).toEqual({
      _id: 'profile-1',
      name: 'Updated Name',
      rating: 4,
      location: 'Updated Location',
    });
    expect(publicState.profiles[1].name).toBe('Other Name');
    expect(adminState.profilesAdmin[0].name).toBe('Updated Name');
    expect(adminState.profilesAdmin[1].name).toBe('Other Name');
  });
});

describe('profileImagesPublicReducer', () => {
  it('clears stale images and errors while fetching a new profile', () => {
    const state = profileImagesPublicReducer(
      {
        profileImages: [{ _id: 'old-image' }],
        page: 3,
        pages: 4,
        total: 80,
        error: 'Previous request failed',
      },
      {
        type: PROFILE_IMAGES_PUBLIC_REQUEST,
      },
    );

    expect(state.loading).toBe(true);
    expect(state.profileImages).toEqual([]);
    expect(state.page).toBe(1);
    expect(state.pages).toBe(1);
    expect(state.total).toBe(0);
    expect(state.error).toBeNull();
  });

  it('stores the public payload on success', () => {
    const payload = {
      images: [{ _id: 'image-1', avatar: 'https://example.test/profile.jpg' }],
      page: 1,
      pages: 1,
      total: 1,
    };

    const state = profileImagesPublicReducer(undefined, {
      type: PROFILE_IMAGES__PUBLIC_SUCCESS,
      payload,
    });

    expect(state.loading).toBe(false);
    expect(state.profileImages).toEqual(payload.images);
    expect(state.page).toBe(1);
    expect(state.pages).toBe(1);
    expect(state.total).toBe(1);
    expect(state.error).toBeNull();
  });

  it('drops stale images on failure', () => {
    const state = profileImagesPublicReducer(
      {
        profileImages: [{ _id: 'old-image' }],
        page: 2,
        pages: 2,
        total: 40,
      },
      {
        type: PROFILE_IMAGES__PUBLIC_FAILURE,
        payload: 'Image request failed',
      },
    );

    expect(state.loading).toBe(false);
    expect(state.profileImages).toEqual([]);
    expect(state.page).toBe(1);
    expect(state.pages).toBe(1);
    expect(state.total).toBe(0);
    expect(state.error).toBe('Image request failed');
  });
});
