import { describe, it, expect } from 'vitest';
import {
  profileOnboardingTutorialUpdateReducer,
  profileUpdateReducer,
} from './profileReducers';
import {
  PROFILE_ONBOARDING_TUTORIAL_UPDATE_FAILURE,
  PROFILE_ONBOARDING_TUTORIAL_UPDATE_REQUEST,
  PROFILE_ONBOARDING_TUTORIAL_UPDATE_SUCCESS,
  PROFILE_UPDATE_FAILURE,
} from '../constants/profileConstants';

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
