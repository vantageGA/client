/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { profileAIDraftAction, profilesAction } from './profileActions';
import {
  PROFILE_AI_DRAFT_FAILURE,
  PROFILE_AI_DRAFT_REQUEST,
  PROFILE_REQUEST,
  PROFILE_SUCCESS,
} from '../constants/profileConstants';

vi.mock('axios');

describe('profilesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes search filters to the public profiles API', async () => {
    const dispatch = vi.fn();
    axios.get.mockResolvedValue({
      data: {
        profiles: [{ _id: 'profile-1', name: 'Jane Barber' }],
        page: 1,
        pages: 1,
        total: 1,
      },
    });

    await profilesAction(1, 20, { search: 'barber' })(dispatch);

    expect(axios.get).toHaveBeenCalledWith(
      '/api/profiles?page=1&limit=20&search=barber',
    );
    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: PROFILE_REQUEST,
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: PROFILE_SUCCESS,
      payload: {
        profiles: [{ _id: 'profile-1', name: 'Jane Barber' }],
        page: 1,
        pages: 1,
        total: 1,
      },
    });
  });
});

describe('profileAIDraftAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the API message when profile draft generation fails', async () => {
    const dispatch = vi.fn();
    const getState = vi.fn(() => ({
      userLogin: {
        userInfo: {
          token: 'test-token',
        },
      },
    }));

    axios.post.mockRejectedValue({
      response: {
        data: {
          message: 'Too many profile draft requests. Please try again after an hour.',
        },
      },
    });

    await profileAIDraftAction({
      input:
        'I am a Level 3 personal trainer in Manchester specialising in strength training and weight management.',
      currentProfile: {
        location: 'Manchester',
      },
    })(dispatch, getState);

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: PROFILE_AI_DRAFT_REQUEST,
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: PROFILE_AI_DRAFT_FAILURE,
      payload: 'Too many profile draft requests. Please try again after an hour.',
    });
  });
});
