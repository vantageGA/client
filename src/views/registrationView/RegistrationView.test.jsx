/* @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import RegistrationView from './RegistrationView';

const mockedCreateCheckoutSessionAction = vi.hoisted(() =>
  vi.fn((payload) => ({
    type: 'CREATE_CHECKOUT_SESSION',
    payload,
  })),
);

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock('../../store/actions/stripeActions', () => ({
  createCheckoutSessionAction: mockedCreateCheckoutSessionAction,
}));

vi.mock('../../components/loadingSpinner/LoadingSpinner', () => ({
  default: () => <div>Loading...</div>,
}));

vi.mock('../../components/membershipProposition/MembershipProposition', () => ({
  default: () => <div>Membership details</div>,
}));

const renderRegistration = () => render(<RegistrationView />);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('RegistrationView', () => {
  it('starts checkout with valid registration details when Subscribe Now is clicked', () => {
    const dispatch = vi.fn();
    useDispatch.mockReturnValue(dispatch);
    useSelector.mockImplementation((selector) =>
      selector({
        userRegistration: {
          loading: false,
          error: null,
          success: false,
          userInfo: null,
        },
        stripeCheckout: {
          loading: false,
          error: null,
        },
      }),
    );

    renderRegistration();

    fireEvent.change(screen.getByLabelText(/Name/), {
      target: { value: 'Ben Smith' },
    });
    fireEvent.change(screen.getByLabelText(/Email/), {
      target: { value: 'member@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/), {
      target: { value: 'Password1!' },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/), {
      target: { value: 'Password1!' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Subscribe Now' }));

    expect(mockedCreateCheckoutSessionAction).toHaveBeenCalledWith({
      plan: 'monthly',
      email: 'member@example.com',
      name: 'Ben Smith',
      password: 'Password1!',
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'CREATE_CHECKOUT_SESSION',
      payload: {
        plan: 'monthly',
        email: 'member@example.com',
        name: 'Ben Smith',
        password: 'Password1!',
      },
    });
  });
});
