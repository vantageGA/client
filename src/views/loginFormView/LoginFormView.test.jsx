/* @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LoginFormView from './LoginFormView';

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
