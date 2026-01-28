import axios from 'axios';
import {
  STRIPE_CHECKOUT_REQUEST,
  STRIPE_CHECKOUT_SUCCESS,
  STRIPE_CHECKOUT_FAILURE,
  STRIPE_SUBSCRIPTION_REQUEST,
  STRIPE_SUBSCRIPTION_SUCCESS,
  STRIPE_SUBSCRIPTION_FAILURE,
} from '../constants/stripeConstants';

export const createCheckoutSessionAction = (userData) => async (dispatch) => {
  try {
    dispatch({ type: STRIPE_CHECKOUT_REQUEST });

    const { data } = await axios.post('/api/checkout-session', userData);
    
    dispatch({ type: STRIPE_CHECKOUT_SUCCESS, payload: data });
    window.location.href = data.url;
  } catch (error) {
    dispatch({
      type: STRIPE_CHECKOUT_FAILURE,
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
