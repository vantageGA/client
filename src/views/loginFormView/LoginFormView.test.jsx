/* @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LoginFormView, { hasActiveSubscription } from './LoginFormView';

const mockedLoginAction = vi.hoisted(() =>
  vi.fn((email, password) => ({
    type: 'LOGIN_ACTION',
    payload: { email, password },
  })),
);

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock('../../store/actions/userActions', () => ({
  loginAction: mockedLoginAction,
}));

vi.mock('../../components/loadingSpinner/LoadingSpinner', () => ({
  default: () => <div>Loading...</div>,
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <LoginFormView />
    </MemoryRouter>,
  );

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('LoginFormView', () => {
  it('treats failed or expired subscriptions as inactive for login routing', () => {
    expect(
      hasActiveSubscription({
        isAdmin: false,
        isSubscribed: true,
        paymentStatus: 'failed',
        currentPeriodEnd: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      }),
    ).toBe(false);

    expect(
      hasActiveSubscription({
        isAdmin: false,
        isSubscribed: true,
        paymentStatus: 'active',
        currentPeriodEnd: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      }),
    ).toBe(false);

    expect(
      hasActiveSubscription({
        isAdmin: false,
        isSubscribed: true,
        paymentStatus: 'pending',
        currentPeriodEnd: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      }),
    ).toBe(false);
  });

  it('treats active subscriptions and admin users as active for login routing', () => {
    expect(
      hasActiveSubscription({
        isAdmin: false,
        isSubscribed: true,
        paymentStatus: 'active',
        currentPeriodEnd: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      }),
    ).toBe(true);

    expect(
      hasActiveSubscription({
        isAdmin: true,
        isSubscribed: false,
        paymentStatus: 'pending',
      }),
    ).toBe(true);
  });

  it('submits valid credentials when the login button is clicked', () => {
    const dispatch = vi.fn();
    useDispatch.mockReturnValue(dispatch);
    useSelector.mockReturnValue({
      loading: false,
      error: null,
      userInfo: null,
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText(/Email/), {
      target: { value: 'member@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(mockedLoginAction).toHaveBeenCalledWith(
      'member@example.com',
      'password123',
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: 'LOGIN_ACTION',
      payload: {
        email: 'member@example.com',
        password: 'password123',
      },
    });
  });
});
