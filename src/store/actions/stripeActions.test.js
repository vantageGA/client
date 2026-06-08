/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import {
  createCheckoutSessionAction,
  verifyCheckoutSessionAction,
} from './stripeActions';
import {
  STRIPE_CHECKOUT_REQUEST,
  STRIPE_CHECKOUT_SUCCESS,
  STRIPE_CHECKOUT_VERIFY_REQUEST,
  STRIPE_CHECKOUT_VERIFY_SUCCESS,
} from '../constants/stripeConstants';
import { USER_LOGIN_SUCCESS } from '../constants/userConstants';

vi.mock('axios');

describe('createCheckoutSessionAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('starts checkout without hydrating login state before payment succeeds', async () => {
    const dispatch = vi.fn();
    const getState = vi.fn(() => ({
      userLogin: {
        userInfo: null,
      },
    }));

    axios.post.mockResolvedValue({
      data: {
        url: '#stripe-checkout',
      },
    });

    await createCheckoutSessionAction({
      plan: 'monthly',
      name: 'Ben Smith',
      email: 'member@example.com',
      password: 'Password1!',
    })(dispatch, getState);

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: STRIPE_CHECKOUT_REQUEST,
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: STRIPE_CHECKOUT_SUCCESS,
      payload: {
        url: '#stripe-checkout',
      },
    });
    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: USER_LOGIN_SUCCESS }),
    );
    expect(localStorage.getItem('userInfo')).toBeNull();
  });

  it('hydrates login state after checkout session verification succeeds', async () => {
    const dispatch = vi.fn();
    const checkoutUser = {
      _id: 'user-1',
      name: 'Ben Smith',
      email: 'member@example.com',
      isAdmin: false,
      isConfirmed: true,
      isSubscribed: true,
      paymentStatus: 'active',
      token: 'auth-token',
    };

    axios.get.mockResolvedValue({
      data: {
        user: checkoutUser,
      },
    });

    await verifyCheckoutSessionAction('cs_test_123')(dispatch);

    expect(dispatch).toHaveBeenNthCalledWith(1, {
      type: STRIPE_CHECKOUT_VERIFY_REQUEST,
    });
    expect(dispatch).toHaveBeenNthCalledWith(2, {
      type: USER_LOGIN_SUCCESS,
      payload: checkoutUser,
    });
    expect(dispatch).toHaveBeenNthCalledWith(3, {
      type: STRIPE_CHECKOUT_VERIFY_SUCCESS,
      payload: {
        user: checkoutUser,
      },
    });
    expect(JSON.parse(localStorage.getItem('userInfo'))).toEqual(checkoutUser);
  });
});
