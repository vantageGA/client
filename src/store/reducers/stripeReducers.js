import {
  STRIPE_CHECKOUT_REQUEST,
  STRIPE_CHECKOUT_SUCCESS,
  STRIPE_CHECKOUT_FAILURE,
  STRIPE_SUBSCRIPTION_REQUEST,
  STRIPE_SUBSCRIPTION_SUCCESS,
  STRIPE_SUBSCRIPTION_FAILURE,
} from '../constants/stripeConstants';

export const stripeCheckoutReducer = (state = {}, action) => {
  switch (action.type) {
    case STRIPE_CHECKOUT_REQUEST:
      return { ...state, loading: true, error: null };
    case STRIPE_CHECKOUT_SUCCESS:
      return { ...state, loading: false, success: true, error: null };
    case STRIPE_CHECKOUT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const stripeSubscriptionReducer = (state = {}, action) => {
  switch (action.type) {
    case STRIPE_SUBSCRIPTION_REQUEST:
      return { ...state, loading: true, error: null };
    case STRIPE_SUBSCRIPTION_SUCCESS:
      return { ...state, loading: false, success: true, data: action.payload, error: null };
    case STRIPE_SUBSCRIPTION_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
