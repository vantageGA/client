import axios from 'axios';
import {
  PROFILE_ADMIN_FAILURE,
  PROFILE_ADMIN_REQUEST,
  PROFILE_ADMIN_SUCCESS,
  PROFILE_BY_ID_FAILURE,
  PROFILE_BY_ID_REQUEST,
  PROFILE_BY_ID_SUCCESS,
  PROFILE_CLICK_COUNTER_FAILURE,
  PROFILE_CLICK_COUNTER_REQUEST,
  PROFILE_CLICK_COUNTER_SUCCESS,
  PROFILE_CREATE_FAILURE,
  PROFILE_CREATE_REQUEST,
  PROFILE_CREATE_SUCCESS,
  PROFILE_DELETE_FAILURE,
  PROFILE_DELETE_REQUEST,
  PROFILE_DELETE_REVIEW_FAILURE,
  PROFILE_DELETE_REVIEW_REQUEST,
  PROFILE_DELETE_REVIEW_SUCCESS,
  PROFILE_DELETE_SUCCESS,
  PROFILE_FAILURE,
  PROFILE_IMAGES_FAILURE,
  PROFILE_IMAGES_PUBLIC_REQUEST,
  PROFILE_IMAGES_REQUEST,
  PROFILE_IMAGES_SUCCESS,
  PROFILE_IMAGES__PUBLIC_FAILURE,
  PROFILE_IMAGES__PUBLIC_SUCCESS,
  PROFILE_OF_LOGGED_IN_USER_FAILURE,
  PROFILE_OF_LOGGED_IN_USER_REQUEST,
  PROFILE_OF_LOGGED_IN_USER_SUCCESS,
  PROFILE_REQUEST,
  PROFILE_SUCCESS,
  PROFILE_UPDATE_FAILURE,
  PROFILE_UPDATE_REQUEST,
  PROFILE_UPDATE_SUCCESS,
  PROFILE_VERIFY_QUALIFICATION_FAILURE,
  PROFILE_VERIFY_QUALIFICATION_REQUEST,
  PROFILE_VERIFY_QUALIFICATION_SUCCESS,
} from '../constants/profileConstants';

// Get all profiles public - with pagination support
export const profilesAction = (page = 1, limit = 20, filters = {}) => async (dispatch, getState) => {
  try {
    dispatch({
      type: PROFILE_REQUEST,
    });

    const params = new URLSearchParams({
      page,
      limit,
      ...(filters.location && { location: filters.location }),
      ...(filters.specialisation && { specialisation: filters.specialisation })
    });

    const { data } = await axios.get(`/api/profiles?${params}`);

    dispatch({
      type: PROFILE_SUCCESS,
      payload: {
        profiles: data.profiles,
        page: data.page,
        pages: data.pages,
        total: data.total
      }
    });
  } catch (error) {
    dispatch({
      type: PROFILE_FAILURE,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
// Get all profiles ADMIN - with pagination support
export const profilesAdminAction = (page = 1, limit = 50) => async (dispatch, getState) => {
  try {
    dispatch({
      type: PROFILE_ADMIN_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const params = new URLSearchParams({ page, limit });

    const { data } = await axios.get(`/api/profiles/admin?${params}`, config);

    dispatch({
      type: PROFILE_ADMIN_SUCCESS,
      payload: {
        profiles: data.profiles,
        page: data.page,
        pages: data.pages,
        total: data.total
      }
    });
  } catch (error) {
    dispatch({
      type: PROFILE_ADMIN_FAILURE,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
// Get profile by ID
export const profileByIdAction = (id) => async (dispatch) => {
  try {
    dispatch({ type: PROFILE_BY_ID_REQUEST });
    const { data } = await axios.get(`/api/profile/${id}`);

    dispatch({ type: PROFILE_BY_ID_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: PROFILE_BY_ID_FAILURE,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
// Get profile of logging user
export const profileOfLoggedInUserAction = () => async (dispatch, getState) => {
  try {
    dispatch({ type: PROFILE_OF_LOGGED_IN_USER_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`/api/profile`, config);

    // Backend now returns null if profile doesn't exist (instead of 404)
    dispatch({ type: PROFILE_OF_LOGGED_IN_USER_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: PROFILE_OF_LOGGED_IN_USER_FAILURE,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
// Create a profile
export const createProfileAction = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: PROFILE_CREATE_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post(`/api/profiles`, {}, config);
    dispatch({ type: PROFILE_CREATE_SUCCESS, payload: data });

    // Fetch the newly created profile to update the logged-in user's profile state
    dispatch(profileOfLoggedInUserAction());
  } catch (error) {
    dispatch({
      type: PROFILE_CREATE_FAILURE,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Update Profile action - user ID now taken from token, not URL
export const profileUpdateAction = (profile) => async (dispatch, getState) => {
  try {
    dispatch({
      type: PROFILE_UPDATE_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    // Route changed from /api/profile/:id to /api/profile (ID from token)
    const { data } = await axios.put(
      `/api/profile`,
      profile,
      config,
    );

    dispatch({ type: PROFILE_UPDATE_SUCCESS, payload: data });

    dispatch(profileOfLoggedInUserAction());
  } catch (error) {
    dispatch({
      type: PROFILE_UPDATE_FAILURE,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
// Delete profile ADMIN
export const deleteProfileAction = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: PROFILE_DELETE_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.delete(`/api/profiles/admin/${id}`, config);
    dispatch({ type: PROFILE_DELETE_SUCCESS });
    dispatch(profilesAdminAction());
  } catch (error) {
    dispatch({
      type: PROFILE_DELETE_FAILURE,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
// Delete REVIEW ADMIN - route changed to /api/profiles/:id/reviews
export const deleteReviewProfileAction =
  (id, reviewId) => async (dispatch, getState) => {
    try {
      dispatch({
        type: PROFILE_DELETE_REVIEW_REQUEST,
      });

      const {
        userLogin: { userInfo },
      } = getState();

      // Route changed from /api/profile/review/admin/:id to /api/profiles/:id/reviews
      // reviewId stays in body as before

      await axios.delete(`/api/profiles/${id}/reviews`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        data: {
          reviewId: reviewId,
        },
      });
      dispatch({ type: PROFILE_DELETE_REVIEW_SUCCESS });
      dispatch(profilesAdminAction());
    } catch (error) {
      dispatch({
        type: PROFILE_DELETE_REVIEW_FAILURE,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

// Verify Profile qualification action
export const profileVerifyQualificationAction =
  (id) => async (dispatch, getState) => {
    try {
      dispatch({
        type: PROFILE_VERIFY_QUALIFICATION_REQUEST,
      });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.put(`/api/profiles/admin/${id}`, {}, config);

      dispatch({ type: PROFILE_VERIFY_QUALIFICATION_SUCCESS });
      dispatch(profilesAdminAction());
    } catch (error) {
      dispatch({
        type: PROFILE_VERIFY_QUALIFICATION_FAILURE,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

// Profile click counter action - server auto-increments by 1, returns minimal response
export const profileClickCounterAction =
  (_id) => async (dispatch) => {
    try {
      dispatch({
        type: PROFILE_CLICK_COUNTER_REQUEST,
      });

      // Only send _id, server auto-increments by 1
      // Response format changed to { success: true, clickCount: 42 }
      const { data } = await axios.put(`/api/profile-clicks`, { _id });

      dispatch({
        type: PROFILE_CLICK_COUNTER_SUCCESS,
        payload: data.clickCount // Changed from full profile to just clickCount
      });
    } catch (error) {
      dispatch({
        type: PROFILE_CLICK_COUNTER_FAILURE,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

// Get Profile Images for ProfileImage model - with pagination support
export const profileImagesAction = (page = 1, limit = 20) => async (dispatch, getState) => {
  try {
    dispatch({
      type: PROFILE_IMAGES_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const params = new URLSearchParams({ page, limit });

    const { data } = await axios.get(`/api/profile-images?${params}`, config);

    dispatch({
      type: PROFILE_IMAGES_SUCCESS,
      payload: {
        images: data.images,
        page: data.page,
        pages: data.pages,
        total: data.total
      }
    });
  } catch (error) {
    dispatch({
      type: PROFILE_IMAGES_FAILURE,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Get Profile Images for ProfileImage model 'PUBLIC' - route changed, pagination added
export const profileImagesPublicAction = (id, page = 1, limit = 20) => async (dispatch, getState) => {
  try {
    dispatch({
      type: PROFILE_IMAGES_PUBLIC_REQUEST,
    });

    // Route changed from /api/profile-images/:id to /api/profile-images-public/:id
    const params = new URLSearchParams({ page, limit });

    const { data } = await axios.get(`/api/profile-images-public/${id}?${params}`);

    dispatch({
      type: PROFILE_IMAGES__PUBLIC_SUCCESS,
      payload: {
        images: data.images,
        page: data.page,
        pages: data.pages,
        total: data.total
      }
    });
  } catch (error) {
    dispatch({
      type: PROFILE_IMAGES__PUBLIC_FAILURE,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
