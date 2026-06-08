import axios from 'axios';
import {
  STRIPE_CHECKOUT_REQUEST,
  STRIPE_CHECKOUT_SUCCESS,
  STRIPE_CHECKOUT_FAILURE,
  STRIPE_CHECKOUT_VERIFY_REQUEST,
  STRIPE_CHECKOUT_VERIFY_SUCCESS,
  STRIPE_CHECKOUT_VERIFY_FAILURE,
  STRIPE_SUBSCRIPTION_REQUEST,
  STRIPE_SUBSCRIPTION_SUCCESS,
  STRIPE_SUBSCRIPTION_FAILURE,
} from '../constants/stripeConstants';
import { USER_LOGIN_SUCCESS } from '../constants/userConstants';

export const createCheckoutSessionAction = (userData) => async (dispatch, getState) => {
  try {
    dispatch({ type: STRIPE_CHECKOUT_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : {}),
      },
    };

    const { data } = await axios.post('/api/checkout-session', userData, config);

    dispatch({ type: STRIPE_CHECKOUT_SUCCESS, payload: data });
    window.location.href = data.url;
  } catch (error) {
    dispatch({
      type: STRIPE_CHECKOUT_FAILURE,
      payload: error.response?.data?.error || error.message,
    });
  }
};

export const verifyCheckoutSessionAction = (sessionId) => async (dispatch) => {
  try {
    dispatch({ type: STRIPE_CHECKOUT_VERIFY_REQUEST });

    const { data } = await axios.get(`/api/checkout-session/${sessionId}`);

    if (data.user) {
      dispatch({ type: USER_LOGIN_SUCCESS, payload: data.user });
      localStorage.setItem('userInfo', JSON.stringify(data.user));
    }

    dispatch({ type: STRIPE_CHECKOUT_VERIFY_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: STRIPE_CHECKOUT_VERIFY_FAILURE,
      payload: error.response?.data?.error || error.message,
    });
  }
};

export const createSubscriptionAction = (plan, paymentMethodId) => async (dispatch) => {
  try {
    dispatch({ type: STRIPE_SUBSCRIPTION_REQUEST });

    const { data } = await axios.post('/api/create-subscription', {
      plan,
      paymentMethodId,
    });

    dispatch({ type: STRIPE_SUBSCRIPTION_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: STRIPE_SUBSCRIPTION_FAILURE,
      payload: error.response?.data?.error || error.message,
    });
  }
};
